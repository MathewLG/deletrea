# DESIGN.md: Deletrea

## Direction (from the owner, verbatim)

> Aztec/mayan inspired. Drawing looking like "codices" but in a modern way. It must be visually appealing yet very clear and readable.

Everything below is derived from that sentence. Derivations were written by the planning model and are open to the owner's correction.

## Design Read

Reading this as: a phone-first practice tool for Spanish-speaking people learning the LSM manual alphabet, in a modern codex style (flat mineral pigments, one uniform contour line, framed compartments), dial ENERGY 2 / RHYTHM 2 / MOTION 2.

## What "codex, but modern" means here

Take the drawing system of Mesoamerican painted books, not their imagery.

Use:
- **Contour line.** Every figure has one dark outline of constant weight around flat color. No gradients, no shadows, no glow, no blur.
- **Flat pigments on a paper ground.** A warm amate-paper background with a small set of mineral colors.
- **Compartments.** Codex pages divide into framed cells with red rules. Screens are built from framed cells with a 2px ink or red rule, not floating cards.
- **Stepped fret (greca escalonada).** One geometric band, used once per screen at most, as the header rule.
- **Speech scroll (voluta).** In codices a curl leaving the mouth means speech. Here one small curl leaves the hand on the home screen and on success. It is the identity motif: hands that speak.
- **Bar and dot numerals.** Progress counts are drawn as Maya-style bars (5) and dots (1), always next to the ordinary number, never alone.

Do not use: deities, calendar signs, real glyphs, feathers, pyramids, skulls, "tribal" fonts, textures imitating aged paper, or any figure copied from a codex. Nothing sacred, nothing whose meaning we cannot vouch for.

## Color

Pigment names are the reason for each color. Neutrals do not count toward the palette limit.

| token | value | role | reason |
|---|---|---|---|
| `--paper` | `#F3EADA` | page ground | amate / gessoed page |
| `--paper-deep` | `#E7DAC0` | cell fill, stage ground | second paper tone to separate cells without shadows |
| `--ink` | `#1E1916` | text, every contour line | carbon black |
| `--ink-soft` | `#574B41` | secondary text | diluted ink |
| `--red` | `#A3271F` | rules, primary action | cochineal red, the frame color of codex pages |
| `--turquoise` | `#14656A` (text/line), `--turquoise-fill` `#3FA9A6` (fills) | "correct" state only | turquoise and jade marked what is precious |
| `--ochre` | `#D39A2C` | single accent: the speech scroll and the hold ring | yellow ochre |
| `--bone` | `#FBF6EA` | hand fill in neutral state, text on red | unpainted gesso |

Rules:
- Core colors: red and turquoise. Accent: ochre. Nothing else.
- Turquoise means "this part is right" and is used for nothing else.
- Ochre appears at one moment per screen.
- Fills (turquoise-fill, ochre, bone) are always enclosed by an ink contour, so their edge contrast is ink against the ground; they are never the only boundary of a shape.
- Every text pairing must pass WCAG AA. The implementer verifies each pair with `scripts/contrast.mjs` and may darken a value within the same hue to pass; record the final values here.
- One fixed light theme. Reason: the paper ground is the identity; a dark variant would be a different product. No theme toggle.

## Typography

One family: **Atkinson Hyperlegible Next** (variable, self-hosted, OFL), weights 400, 600, 800.
Reason: it was drawn so that similar characters stay distinguishable, which is the job of an alphabet tool, and it keeps the page readable while the drawing carries the character.

- Target letter: weight 800, very large (clamp(6rem, 34vw, 12rem)), ink, tight leading. It is the focal point of practice and letter screens.
- Headings: 800. Body: 400, 1.0625rem minimum, line-height 1.5. UI labels: 600.
- No uppercase tracking labels, no monospace.
- Fallback stack: `"Atkinson Hyperlegible Next", system-ui, sans-serif`.

## Shape

- Contour weight: 2px for UI frames, scaled stroke for drawings.
- Radius: 0 for cells and frames (codex compartments are square), 6px for buttons and inputs so they read as touchable. No pills.
- No shadows anywhere. Depth is shown by overlap and outline only.

## The hand drawing

The hand is the hero of every screen.

- Built from the 21 landmarks: a palm polygon and five fingers, each finger one round-capped stroke along its bones.
- Each part is drawn twice: first in ink at width w + 2 × contour, then in its fill color at width w. That produces a constant outline around flat color.
- Parts are painted far to near (painter's order by depth), so a thumb crossing in front of the fingers overlaps them with its outline intact.
- Neutral fill: bone. A finger that matches the target fills turquoise and gains a small ink bead at its tip, so the state is not carried by color alone.
- A wrist cuff: two flat bands (red, ochre) across a short forearm stub. It anchors the hand and is the one ornamental element on the figure.
- Target hand and live hand use the same renderer.

## Layout

- Phone first, single column, max content width 34rem, centered on larger screens.
- Screens are stacks of framed cells. Cells differ in size by importance: the cell holding the hand is the largest thing on screen.
- The alphabet is a grid of square cells (3 columns on phones, more on wide screens), each with a letter and a small hand. Letters with movement carry a small text tag "con movimiento".
- Bottom navigation with text labels: Practicar, Alfabeto, Deletrear, Acerca. The wordmark links home.
- Logo: the word "Deletrea" set in the type family at weight 800. No drawn logo.

## Motion

- The hand moving is the content. UI motion is limited to: the target hand easing between letters (300ms), the hold ring filling, one speech scroll drawing itself on success (400ms).
- No looping animation except the home hand slowly spelling a word, which pauses when off screen and stops under `prefers-reduced-motion`.
- Under `prefers-reduced-motion`, transitions become instant.

## Voice (Spanish, tuteo)

Short, plain, warm. Says what to do next. Examples: "Muestra tu mano a la cámara", "Dobla más el anular", "Esa es la A". No exclamation chains, no emoji, no em dashes, no marketing words.

## Honest states

Every screen that depends on the camera or the model has written empty, loading and error states that say what happened and what to do. The app says on screen that the signs are not yet validated by Deaf LSM users.
