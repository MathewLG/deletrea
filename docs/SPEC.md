# Deletrea: technical spec (v0.1)

Deletrea is a static web app for practising the manual alphabet of Mexican Sign Language (LSM). It shows a target letter as a drawn hand, tracks the user's hand with the camera, and says which finger to fix. All processing happens in the browser.

Read `DESIGN.md` for the visual direction and `docs/research/lsm-alfabeto.md` for the evidence behind each handshape.

## 1. Constraints

- No build step. Plain ES modules, `// @ts-check` with JSDoc types, served as static files. Must work from any sub-path (GitHub Pages serves at `/deletrea/`), so every URL is relative.
- No runtime dependencies except MediaPipe Tasks Vision, loaded lazily from a CDN only when the camera starts. Everything else, including the demo mode, works with zero network requests beyond the site's own files.
- Node 22 for tooling. Unit tests use `node:test` only.
- Code and comments in English. All user-facing text in Spanish, kept in `src/ui/strings.js`.
- No em dash character in any user-facing text.
- Comments explain why, not what. No decorative comments.

## 2. Privacy contract

- Video frames never leave the device. There is no backend.
- `index.html` carries a Content-Security-Policy meta tag:
  `default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'wasm-unsafe-eval'; connect-src 'self' https://cdn.jsdelivr.net https://storage.googleapis.com; img-src 'self' data: blob:; media-src 'self' blob: mediastream:; style-src 'self'; font-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'none'`
  This makes the promise checkable: the page cannot connect to any host other than the two that serve the library and the model. No inline scripts or inline style attributes anywhere (set styles through classes or CSSOM).
- MediaPipe is pinned to `@mediapipe/tasks-vision@0.10.33`. Later 1.x releases state that they send usage metrics to Google; 0.10.33 carries no such notice, and the CSP blocks other hosts regardless. Constants live in `src/sources/mediapipeConfig.js`:
  - module: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.33/vision_bundle.mjs`
  - wasm root: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.33/wasm`
  - model: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`
- A `securitypolicyviolation` listener records blocked URLs so the error screen can show them under "Detalles técnicos".

## 3. Coordinate conventions

Landmarks follow MediaPipe's 21-point order: 0 wrist; thumb 1 CMC, 2 MCP, 3 IP, 4 tip; index 5-8; middle 9-12; ring 13-16; pinky 17-20 (MCP, PIP, DIP, tip).

- **Camera frame** (what MediaPipe returns): x right, y down, z away from the camera.
- **View frame**: X right, Y up, Z toward the camera. `view = (x, -y, -z)`.
- **Hand frame** (canonical right hand, unit = palm length, the distance wrist to middle MCP): X radial (toward the thumb side), Y distal (wrist to middle MCP), Z palmar (out of the palm). Right-handed: X × Y = Z.
- A left hand is the mirror image: its canonical coordinates are obtained with palmar = -(radial × distal). After canonicalisation every feature is expressed as if the hand were a right hand.
- Sign orientation is given as two unit vectors in the view frame for a right hand: `palmar` and `distal`. For a left hand the target is mirrored in X.
- **Display is a mirror**: the camera image and the target hand are drawn flipped horizontally, so the screen behaves like a mirror. This is stated on screen.

## 4. Modules and ownership

```
src/core/       pure logic, no DOM            (core engineer)
src/signs/      alphabet data                 (core engineer)
tests/unit/     node:test                     (core engineer)
src/render/     canvas hand renderer          (interface engineer)
src/sources/    camera and synthetic sources  (interface engineer)
src/practice/   practice session controller   (interface engineer)
src/screens/    one module per screen         (interface engineer)
src/ui/         dom helpers, strings, router  (interface engineer)
styles/         css                           (interface engineer)
index.html                                    (interface engineer)
scripts/, package.json, eslint, tsconfig, .github/, README, tests/e2e  (tooling engineer)
```
Nobody edits another owner's files; report needed changes instead.

## 5. Core API (`src/core/index.js` re-exports all of this)

```js
/** @typedef {{x:number,y:number,z:number}} Vec3 */
/** @typedef {'thumb'|'index'|'middle'|'ring'|'pinky'} FingerName */
/** @typedef {{mcp:number,pip:number,dip:number,spread?:number}} FingerPose   degrees */
/** @typedef {{radial:number,palmar:number,mcp:number,ip:number,roll?:number}} ThumbPose  degrees */
/** @typedef {{thumb:ThumbPose,index:FingerPose,middle:FingerPose,ring:FingerPose,pinky:FingerPose}} HandPose */
/** @typedef {{palmar:Vec3,distal:Vec3}} Orientation   view frame, right hand */

export const FINGERS;                       // ['thumb','index','middle','ring','pinky']
export const FINGER_LANDMARKS;              // {thumb:[1,2,3,4], index:[5,6,7,8], ...}

// handModel.js
poseToLandmarks(pose: HandPose): Vec3[]     // 21 points, hand frame, right hand
placeHand(local: Vec3[], o: Orientation, opts?: {handedness?: 'right'|'left'}): Vec3[]  // view frame
viewToCamera(points: Vec3[], opts?: {scale?: number}): Vec3[]   // (x,-y,-z) * scale, default scale 0.09 (metres per palm)
lerpPose(a: HandPose, b: HandPose, t: number): HandPose

// features.js
extractFeatures(world: Vec3[], handednessHint?: 'right'|'left'|null, opts?: {force?: 'right'|'left'}): Features | null
// world = 21 landmarks in the camera frame. Returns null when the input is not 21 finite points.
// The hint is used only when the shape is inconclusive; `force` skips the inference.

// match.js
buildTarget(sign: Sign): Target             // precomputed features of the sign's own pose
matchSign(features: Features, target: Target): MatchResult

// filter.js
createLandmarkSmoother(opts?): { push(points: Vec3[], tMs: number): Vec3[], reset(): void }   // One Euro filter per coordinate

// hold.js
createHoldDetector(opts?: {holdMs?: number, graceMs?: number}): { update(ok: boolean, tMs: number): {progress: number, done: boolean}, reset(): void }
```

### 5.1 Hand model

Skeleton in palm units (right hand): wrist (0,0,0); thumb CMC (0.24, 0.18, 0.08); MCPs: index (0.26, 0.93, 0), middle (0.04, 1.00, 0), ring (-0.17, 0.94, 0), pinky (-0.36, 0.82, 0). Bone lengths (proximal, middle, distal): thumb 0.42, 0.33, 0.27; index 0.42, 0.25, 0.20; middle 0.46, 0.29, 0.21; ring 0.43, 0.27, 0.20; pinky 0.33, 0.20, 0.18.

Fingers: base direction `d0 = (sin s, cos s, 0)` with `s = spread` (positive toward the thumb side). With cumulative flexion φ (mcp, then mcp+pip, then mcp+pip+dip) a bone points along `cos φ · d0 + sin φ · (0,0,1)`.

Thumb: metacarpal direction `dm = (sin r · cos p, cos r · cos p, sin p)` with r = radial, p = palmar. Bend direction `b`: take `b0 = cos(roll) · (-1,0,0) + sin(roll) · (0,0,1)`, remove its component along `dm`, normalise (fall back to (0,0,1) if degenerate). Proximal bone along `cos(mcp) · dm + sin(mcp) · b`, distal along the same with `mcp + ip`.

Bone lengths must be identical in every pose (tested).

### 5.2 Features

`extractFeatures` converts to the view frame, then:
1. `distal = normalize(P9 - P0)`; `radial = normalize((P5 - P17) minus its component along distal)`; `n = radial × distal`.
2. Handedness: compute, assuming a right hand, the canonical z of each non-thumb finger's PIP, DIP and tip minus its MCP, plus the thumb IP and tip. Sum them (palm units). If the sum is above +0.6 the hand is right, below -0.6 left, and `handednessConfident` is true. Fingers can only curl toward the palm, so a curled hand shows its side by its shape. Inside the margin (a flat or nearly flat hand) the shape cannot tell a right palm from a left back, so `handednessConfident` is false and the side falls back to the hint (default right). The margin is 0.6, not the 0.15 first planned, because a flat hand with slightly hyperextended fingers sums below zero and the noise tests (section 7, test 5) flipped near-flat hands at 0.15.
   The tracker's Left/Right label is not trusted: the docs disagree on whether it assumes a mirrored image, and it could not be checked on a real camera. The practice session passes no hint. When `handednessConfident` is false it extracts features for both sides (`opts.force`), matches both against the target and keeps the better result (an `ok` result wins, then the higher score). When confident it uses the geometric answer. The tracker's label appears only in the `?debug=1` overlay, next to the side actually used. The cost of this is in section 14: a flat hand cannot be told from the mirror image of the other hand.
3. `palmar = n` for right, `-n` for left. Canonical point = `((p-P0)·radial, (p-P0)·distal, (p-P0)·palmar) / palmLength`.
4. Joint angles in degrees, each the angle between consecutive bone vectors: non-thumb `mcp` (wrist→MCP vs MCP→PIP), `pip`, `dip`; thumb `mcp` (CMC→MCP vs MCP→IP), `ip`.
5. Orientation for comparison: `palmar` and `distal` in the view frame, with X negated for a left hand.

```js
/** @typedef {Object} Features
 * @property {'right'|'left'} handedness
 * @property {boolean} handednessConfident     false when the hand is too flat for its shape to show its side
 * @property {number} palmLength
 * @property {Vec3[]} local                     canonical right-hand points, palm units
 * @property {{index:{mcp:number,pip:number,dip:number}, middle:..., ring:..., pinky:..., thumb:{mcp:number,ip:number}}} angles
 * @property {Orientation} orientation
 */
```

### 5.3 Matching

`ramp(e, full, zero)` is 1 when e ≤ full, 0 when e ≥ zero, linear between. A part is `ok` when its score ≥ 0.5.

- **Finger curl** (index to pinky): `e = sqrt((Δmcp² + Δpip² + 0.5·Δdip²) / 2.5)`; score `ramp(e, 18, 48)`.
- **Adjacent pairs** (index-middle, middle-ring, ring-pinky), only when both fingers are extended in the target (target mcp + pip < 60): compare the signed gap `tipA.x - tipB.x` (canonical), score `ramp(|Δgap|, 0.15, 0.35)`. The first plan was 0.12/0.30; the noise tests (section 7, test 5) failed with fingers together at that width, so it was widened. The cost is in section 14: a relaxed hand with slightly spread fingers can pass as B. This separates together, apart and crossed. A pair score lowers both fingers' scores (take the minimum).
- **Thumb**: position error of the thumb tip in canonical coordinates, `ramp(e, 0.20, 0.50)`; and for the fingertip nearest the thumb tip in the target, the difference in thumb-tip-to-fingertip distance, `ramp(|Δ|, 0.22, 0.50)`. Thumb score is the minimum.
- **Orientation**: `min(ramp(angle between palmars, 50, 85), ramp(angle between distals, 40, 75))`. A sign may set `looseOrientation: true`, which widens both ramps by 25 degrees.
- Per-sign overrides: `sign.tolerance` may relax a part, for example `{thumb: 1.5}` multiplies both thumb ramp bounds. Used where the research shows accepted variation (A, E).

```js
/** @typedef {Object} MatchResult
 * @property {boolean} ok                       all five fingers and orientation ok
 * @property {number} score                     0..1, mean of the six part scores
 * @property {Record<FingerName,{score:number, ok:boolean}>} fingers
 * @property {{score:number, ok:boolean}} orientation
 * @property {Hint|null} hint                   the one most useful correction, null when ok
 */
/** @typedef {{code: string, finger?: FingerName, other?: FingerName}} Hint */
```

Hint selection: if orientation is not ok, the hint is about orientation; otherwise the lowest-scoring finger. Codes (text lives in the UI):
`palm_to_camera`, `palm_to_self`, `palm_sideways`, `point_up`, `point_down`, `point_side`,
`curl_more`, `curl_less`, `bend_knuckle`, `straighten_knuckle`, `bend_tip`, `straighten_tip`,
`together`, `apart`, `cross`,
`thumb_toward_palm`, `thumb_away`, `thumb_front`, `thumb_back`, `thumb_up`, `thumb_down`, `thumb_touch`.
For curl hints, pick the joint with the largest difference: mcp gives the knuckle codes, pip gives `curl_more` / `curl_less`, dip gives the tip codes. For the thumb, pick the canonical axis with the largest error: x gives `thumb_away` (needs more +x) or `thumb_toward_palm`, y gives up/down, z gives front/back; if the contact term is the limiting one because the thumb is too far, `thumb_touch` with `other` set. If the contact term is limiting because the contact distance is smaller than the target's (another finger moved toward the thumb, as a curled pinky does in B), the thumb is ranked by its position score when choosing the hint, so the hint goes to the finger that moved. `ok` and `score` still use the full thumb score.

### 5.4 Smoothing and hold

- One Euro filter per coordinate, defaults `minCutoff 1.2`, `beta 0.02`, `dCutoff 1.0`. Resets when the hand disappears.
- Hold: held time accumulates only between consecutive `ok` frames, each step capped at 100 ms, so a slow camera (5 fps) still completes but cannot finish in a few frames. `done` when held time reaches `holdMs` (default 700). During a gap of not-ok frames shorter than `graceMs` (default 180, measured from the last ok frame) progress pauses; the gap itself is never credited. A longer gap resets held time to 0. Silence between two ok frames longer than the 100 ms step plus the grace (for example a hidden page) also resets it. `progress = held / holdMs`.

## 6. Sign data (`src/signs/alphabet.js`)

```js
/** @typedef {Object} Sign
 * @property {string} id                 'a' … 'z', 'ñ' stored as 'enie'
 * @property {string} letter             'A' … 'Ñ'
 * @property {'static'|'dynamic'} kind
 * @property {HandPose} pose             for dynamic letters, the starting handshape
 * @property {Orientation} orientation
 * @property {boolean} [looseOrientation]
 * @property {Partial<Record<FingerName|'orientation', number>>} [tolerance]
 * @property {string} description        Spanish, one or two sentences, how to form it
 * @property {string} [movement]         Spanish, dynamic letters only
 * @property {'alta'|'media'|'baja'} confidence   from the research table
 * @property {string} [confidenceNote]   replaces the generic confidence sentence when the rating needs explaining
 * @property {string[]} sources          keys from the research file, e.g. ['DAK','CRUZ']
 * @property {string[]} [confusable]     ids this engine cannot reliably tell apart from this one
 */
export const ALPHABET: Sign[];           // 27 entries in alphabetical order, Ñ after N
export const STATIC_IDS: string[];       // the 21 static letters
export function getSign(id: string): Sign | undefined;
export function wordToSigns(text: string): {char: string, sign: Sign|null}[];
// lowercases, strips accents except ñ, keeps letters only; unknown characters give sign null.
export const VALIDATION_STATUS = 'sin validar';   // shown in the UI
```

Handshapes come only from `docs/research/lsm-alfabeto.md`, section 3. Do not substitute ASL forms. Summary of what the research supports:

Static (21), orientation "front" = palmar (0,0,1), distal (0,1,0):
- A: fist, thumb extended away from the fist at the side. Front. Thumb position varies between sources: relax the thumb tolerance.
- B: four fingers extended together, thumb folded across the palm. Front.
- C: four fingers curved together, thumb curved opposite without touching. Palm turned sideways-diagonal: palmar ≈ normalize(0.7, 0, 0.7), distal up.
- D: index extended up; middle, ring, pinky curved with their tips on the thumb. Front.
- E: four fingers hooked together, thumb folded across the palm below the tips. Front. Relax thumb tolerance.
- F: index hooked over the thumb, thumb touching index; middle, ring, pinky extended together. Front.
- G: index extended pointing sideways (toward +X), thumb extended up, others closed. Palm toward the signer: palmar (0,0,-1), distal (1,0,0).
- H: as G with index and middle together.
- I: fist with pinky up, thumb over the fingers. Front.
- L: index up, thumb out sideways, others closed. Front.
- M: index, middle, ring extended together pointing down, pinky closed. The thumb is not visible in any source ("across the palm" is a reading of CRUZ's notation), so the description says so instead of placing it. Palm toward the signer: palmar (0,0,-1), distal (0,-1,0). Sources differ on whether the bend is at the wrist or the knuckles: judge mainly direction, relax finger tolerance.
- N: as M with index and middle only. Thumb as in M.
- O: all fingertips meet the thumb tip in a circle. Sideways-diagonal like C.
- P: index extended up, middle bent 90 degrees at the knuckle pointing forward, thumb touching the middle finger between them, ring and pinky closed. Palm sideways: palmar ≈ (1,0,0), distal up. Loose orientation.
- R: index and middle extended and crossed (middle over index), thumb over the closed ring and pinky. Front.
- S: fist, thumb across the front of the fingers. Front.
- T: fist, thumb between index and middle with the tip showing. Front.
- U: index and middle extended together, thumb over ring and pinky. Front.
- V: index and middle extended apart. Front.
- W: index, middle, ring extended apart, thumb holding the closed pinky. Front.
- Y: thumb and pinky extended in opposite directions, others closed. Hand sideways with palm toward the signer (thumb up, pinky toward +X); two sources show palm front. Loose orientation. Confidence `media` because its orientation is rated media; `confidenceNote` explains that the handshape is agreed and the orientation is not.

With movement (6): J (I handshape, pinky traces a J), K (P handshape with a wrist turn; sources disagree on the turn), Ñ (N handshape with a side-to-side sway), Q (hand hanging from the wrist, index and thumb pointing down, with a sway; index shape varies; no source states where the palm faces, so loose orientation and cautious wording), X (fist with hooked index, hand horizontal, palm sideways toward the body midline, knuckles forward, loose orientation; moves front to back), Z (index traces a Z). For these, `pose` is the starting handshape and `movement` describes the motion in Spanish. They are displayed but never scored in v0.1.

Double letters LL and RR are not separate entries: the letter screens for L and R note that some sources describe them as the same handshape sliding sideways, and that this is not yet confirmed.

Known engine limits to declare in `confusable` (decide from the tests, expected candidates): S/T/A/E fist variants, U/R, M/N is not one (finger count differs).

## 7. Unit tests (`tests/unit/*.test.js`, `node --test`)

Required, all deterministic (seeded PRNG):
1. Hand model: 21 points; bone lengths constant across 50 random poses; open hand has all angles under 5 degrees.
2. Features: invariant to random rotation, translation and uniform scale; a mirrored hand is detected as left and yields the same canonical points and angles as the original.
3. Self-match: every static sign's own pose, placed in its own orientation, converted to the camera frame, returns `ok` with score ≥ 0.95, for both right and left hands.
4. Discrimination: for every ordered pair of distinct static signs, B's pose scored against A is not `ok`, except pairs listed in `confusable`. Print the confusion list in the test output.
5. Noise: each static sign with joint noise up to ±8 degrees and landmark jitter 1.5% of palm length stays `ok` in at least 95% of 200 trials.
6. Hints: targeted cases (open hand against A gives a curl hint on some finger; V against U gives `together`; palm-away against a front sign gives `palm_to_camera`).
7. Hold detector and smoother timing behaviour.
8. Alphabet data: 27 entries, 21 static, ids unique, every entry has description, confidence, sources; `wordToSigns('Ñandú José')` handling.

`scripts/render-poses.mjs` writes `tmp/poses.png`, a contact sheet of all 27 poses drawn as simple outlined strokes in mirror view (SVG rasterised with `sharp` if available, otherwise leave the SVG). It is how handshapes get checked by eye against the research images.

## 8. Sources (`src/sources/`)

```js
/** @typedef {Object} HandFrame
 * @property {number} t                 ms
 * @property {Vec3[]|null} world        camera frame, null when no hand
 * @property {Vec3[]|null} image        normalised image coords (x,y in 0..1, unmirrored), z relative; null when no hand
 * @property {'right'|'left'|null} handedness
 */
/** @typedef {'idle'|'requesting'|'loading'|'running'|'denied'|'no-camera'|'unsupported'|'load-error'|'stopped'} SourceState */

createCameraSource({video: HTMLVideoElement, onFrame, onState}): {start(): Promise<void>, stop(): void}
createSyntheticSource({getTarget: () => Sign|null, onFrame, onState, script?}): {start(), stop()}
```

Camera source: `getUserMedia({video: {facingMode: 'user', width: {ideal: 640}, height: {ideal: 480}}, audio: false})`; dynamic `import()` of the MediaPipe module; `FilesetResolver.forVisionTasks(wasmRoot)`; `HandLandmarker.createFromOptions(fileset, {baseOptions: {modelAssetPath, delegate: 'GPU'}, runningMode: 'VIDEO', numHands: 1})`, retrying once with `delegate: 'CPU'` if creation throws; on each animation frame where `video.currentTime` changed, `detectForVideo(video, performance.now())`; read `result.landmarks[0]`, `result.worldLandmarks[0]`, and handedness from `(result.handedness ?? result.handednesses)?.[0]?.[0]?.categoryName`. Map errors: `NotAllowedError` → `denied`, `NotFoundError`/`OverconstrainedError` → `no-camera`, missing `navigator.mediaDevices` or insecure context → `unsupported`, anything during library or model load → `load-error` (keep the message for "Detalles técnicos"). `stop()` stops tracks, closes the landmarker, cancels the frame loop. Pause detection when the page is hidden. If the source is stopped or restarted while `start()` awaits the camera, the library or the model, the stale `start()` stops its own stream's tracks (or closes its landmarker) and returns. iOS Safari: the video has `playsinline`, `muted` and `autoplay` set as properties and attributes, is attached to the document before `play()` (a clipped, transparent dock holds it while the stage is off the page), and is never `display: none` (hidden with opacity instead).

Synthetic source: produces frames from the hand model with no camera. It plays a short loop per target: start from an open hand, move toward the target pose with a deliberately wrong finger for a moment, correct it, hold. Small noise for life. It emits the same `HandFrame` shape (world in the camera frame; image coords from a simple perspective projection centred in the frame). It powers "Probar sin cámara" and the browser tests. With `?fuente=sintetica` in the URL the practice screen uses it automatically; `&rapido=1` makes it reach the correct pose within 300 ms and hold.

## 9. Renderer (`src/render/handView.js`)

```js
createHandView(canvas: HTMLCanvasElement, opts?: {mirror?: boolean, interactive?: boolean, cuff?: boolean}): {
  setLandmarks(view: Vec3[] | null, state?: {fingers?: Partial<Record<FingerName, boolean>>}): void   // view frame, palm units or any scale; auto-fit
  setImageLandmarks(image: Vec3[] | null, state?): void   // normalised image coords for the overlay on video; no auto-fit
  setRotation(yawDeg: number, pitchDeg: number): void
  resize(): void     // handles devicePixelRatio
  destroy(): void
}
```
Drawing rules are in `DESIGN.md` ("The hand drawing"). `interactive` enables drag and arrow keys to rotate (canvas gets `tabindex="0"`, `role="img"` and an `aria-label` supplied by the caller). Colors come from CSS custom properties read once from `:root`. Rendering happens on demand, not in a permanent loop.

## 10. Practice session (`src/practice/session.js`)

Pure controller, no DOM, testable in Node:
```js
createSession({signs: Sign[], now?: () => number}): {
  current(): {index: number, total: number, sign: Sign},
  onFrame(frame: HandFrame): SessionView,
  skip(): void, next(): void, restart(): void,
}
/** @typedef {Object} SessionView
 * @property {'no-hand'|'adjusting'|'holding'|'success'|'observe'|'finished'} phase
 * @property {MatchResult|null} match
 * @property {number} hold            0..1
 * @property {Hint|null} hint
 * @property {{done: string[], skipped: string[]}} tally
 */
```
Static letters: smooth → features (both sides when the shape is inconclusive, see 5.2) → match → hold. After `done`, phase `success` until `next()` (the screen calls it after 1.4 s or on the button). During success the session keeps smoothing and matching and returns the match with `hold: 1`, so the live hand keeps its finger colours. Dynamic letters: phase `observe`, never scored; the screen shows the movement text and a "Continuar" button.

## 11. Screens and routes (hash router, `src/ui/router.js`)

| route | screen | content |
|---|---|---|
| `#/` | Inicio | wordmark; one-line purpose; the home hand slowly spelling "HOLA" with the current letter beside it; primary button "Practicar con mi cámara" → `#/practica`; links "Ver el alfabeto", "Deletrear una palabra"; one line on privacy; the validation notice |
| `#/alfabeto` | Alfabeto | grid of 27 cells: letter, small hand, "con movimiento" tag where it applies; each links to `#/letra/<id>` |
| `#/letra/<id>` | Letra | large letter, large rotatable hand, description, movement text if any, mirror-view note, confidence and sources in plain words, double-letter note for L and R, button "Practicar esta letra" (static only) → `#/practica?letras=<id>`, previous/next letter links |
| `#/practica` | Práctica | see below; `?letras=a,b,c` selects letters, default is the 21 static letters in order |
| `#/deletrear` | Deletrear | text input (label "Escribe una palabra o tu nombre"), live preview of the letters as small cells, button "Practicar" → `#/practica?letras=...`; characters without a sign are listed as skipped |
| `#/acerca` | Acerca | what it is and is not (the alphabet is a small part of LSM, used mostly for names); privacy explained with the CSP guarantee; validation status and how to help (link to the repo's `docs/VALIDATION.md` on GitHub); sourced cultural notes from the research file, section 5; credits and licences |
| anything else | 404 cell with a link home |

Práctica states, each with its own text and next action:
1. Intro (before any permission prompt): why the camera is needed, that video stays on the device, buttons "Activar cámara" and "Probar sin cámara".
2. Requesting permission, then loading the model ("Preparando el reconocimiento de manos…", a real text status, no bare spinner).
3. Running: the stage (mirrored video dimmed under a paper tint, with the live hand drawn over it), the target cell (big letter, small target hand, "Ver cómo se hace" link to the letter screen), one hint line (`aria-live="polite"`, throttled to one change per 800 ms), the hold ring, progress as number plus bar-and-dot numeral, buttons "Saltar" and "Terminar", a toggle "Ocultar video".
4. Success: "Esa es la A", speech scroll, auto-advance.
5. Observe (dynamic letter): target hand, movement text, "Continuar".
6. Finished: which letters were done and which skipped, buttons "Practicar otra vez", "Ver el alfabeto".
7. Errors: denied (how to allow the camera, "Probar sin cámara"), no camera, unsupported, load error ("Reintentar", collapsible "Detalles técnicos"). Leaving the route stops the camera.
`?debug=1` adds a small overlay with handedness, the five scores, orientation score and angles, for tuning on a real phone.

Stable hooks for tests: `data-testid` on `nav`, `alphabet-grid`, `letter-cell-<id>`, `target-letter`, `hint`, `hold-ring`, `stage`, `btn-start-camera`, `btn-demo`, `btn-skip`, `btn-next`, `btn-finish`, `practice-finished`, `spell-input`, `spell-go`, `validation-notice`.

## 12. Accessibility

WCAG AA contrast for every text pair and 3:1 for control boundaries and focus rings. Everything reachable and operable by keyboard, visible `:focus-visible` (3px ink outline with a paper gap). Targets at least 44px. Route changes move focus to the new screen's `h1`. Canvases have text alternatives (the letter description). Feedback is never color alone: text hint plus fingertip bead. `prefers-reduced-motion` respected. Text reflows at 200% zoom and at 320px width with no horizontal scroll.

## 13. Tooling

- `npm test` → `node --test 'tests/unit/*.test.js'`; `npm run lint` → `eslint .`; `npm run typecheck` → `tsc -p tsconfig.json` (checkJs, noEmit); `npm run serve` → `node scripts/serve.mjs` (zero-dependency static server, port 4173); `npm run test:e2e` → `playwright test`; `npm run contrast` → `node scripts/contrast.mjs` (fails if any declared pair in `DESIGN.md`'s token table is under AA).
- CI (`.github/workflows/ci.yml`): lint, typecheck, unit tests, contrast, e2e in Chromium at a phone viewport. Pages deploy (`pages.yml`) runs on `workflow_run` of CI completing successfully for a push to `main` (plus `workflow_dispatch`), checks out the commit CI tested and publishes the site files. Pages must be set to "GitHub Actions" once in the repo settings before the first deploy.
- Browser tests use only the synthetic source: home loads with no console errors and no CSP violations; alphabet shows 27 cells; a letter screen opens; spelling "sol" leads to a practice of S, O, L; a full synthetic practice of two letters reaches the finished state; keyboard-only path through the home screen; no horizontal overflow at 320px.

## 14. Known limits of v0.1 (to state in the README and Acerca)

- Handshapes are not yet validated by Deaf LSM users.
- Matching thresholds were tuned on a synthetic hand model, not on recordings of real hands.
- Letters with movement are shown, not recognised.
- A relaxed open hand with slightly spread fingers can pass as B (the pair thresholds were widened to 0.15/0.35 for noise, section 5.3).
- A flat hand shown back-to-camera with the other hand can pass as B: for a flat hand the shape cannot tell the side, and the tracker's label is not trusted, so both sides are tried (section 5.2).
- The hand tracker and model load from a CDN on first camera use.
