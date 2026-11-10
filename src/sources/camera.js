// @ts-check
/**
 * Camera source: getUserMedia plus MediaPipe Hand Landmarker, loaded lazily from the pinned CDN
 * only when the user starts the camera (SPEC sections 2 and 8).
 */
import { HAND_MODEL_URL, MEDIAPIPE_MODULE_URL, MEDIAPIPE_WASM_ROOT } from './mediapipeConfig.js';

/** @typedef {import('../core/index.js').Vec3} Vec3 */
/**
 * @typedef {Object} HandFrame
 * @property {number} t
 * @property {Vec3[]|null} world
 * @property {Vec3[]|null} image
 * @property {'right'|'left'|null} handedness
 */
/** @typedef {'idle'|'requesting'|'loading'|'running'|'denied'|'no-camera'|'unsupported'|'load-error'|'stopped'} SourceState */
/** @typedef {{name?: string, message?: string, stage?: string}} SourceErrorInfo */

/**
 * Minimal shape of the parts of @mediapipe/tasks-vision this file uses.
 * @typedef {{landmarks?: Vec3[][], worldLandmarks?: Vec3[][], handedness?: {categoryName: string}[][], handednesses?: {categoryName: string}[][]}} LandmarkerResult
 * @typedef {{detectForVideo(video: HTMLVideoElement, t: number): LandmarkerResult, close(): void}} Landmarker
 * @typedef {{
 *   FilesetResolver: {forVisionTasks(root: string): Promise<unknown>},
 *   HandLandmarker: {createFromOptions(fileset: unknown, opts: unknown): Promise<Landmarker>}
 * }} VisionModule
 */

/** Map a getUserMedia failure to a state (SPEC section 8). @param {unknown} err @returns {SourceState} */
export function mapMediaError(err) {
  const name = /** @type {{name?: string}} */ (err)?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') return 'denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') return 'no-camera';
  // NotReadableError: the device exists but another app holds it.
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') return 'no-camera';
  if (name === 'TypeError' || name === 'NotSupportedError') return 'unsupported';
  return 'no-camera';
}

/** @param {unknown} err @param {string} stage @returns {SourceErrorInfo} */
function describe(err, stage) {
  const e = /** @type {{name?: string, message?: string}} */ (err ?? {});
  return { name: e.name ?? typeof err, message: e.message ?? String(err), stage };
}

/**
 * iOS Safari plays inline, muted video reliably only when these are set as attributes as well as properties.
 * @param {HTMLVideoElement} video
 */
export function prepareVideo(video) {
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('autoplay', '');
}

/** @param {{x:number,y:number,z:number}[]|undefined} pts @returns {Vec3[]|null} */
const copyPoints = (pts) =>
  Array.isArray(pts) && pts.length === 21 ? pts.map((p) => ({ x: p.x, y: p.y, z: p.z })) : null;

/**
 * @param {{
 *   video: HTMLVideoElement,
 *   onFrame: (f: HandFrame) => void,
 *   onState: (s: SourceState, info?: SourceErrorInfo) => void,
 *   importModule?: (url: string) => Promise<unknown>,
 * }} opts
 */
export function createCameraSource({ video, onFrame, onState, importModule }) {
  /** @type {MediaStream|null} */
  let stream = null;
  /** @type {Landmarker|null} */
  let landmarker = null;
  let raf = 0;
  let lastVideoTime = -1;
  let running = false;
  // Bumped by start() and stop() so an in-flight start() can tell it was cancelled or superseded.
  let generation = 0;

  const load = importModule ?? ((/** @type {string} */ url) => import(url));

  function onVisibility() {
    if (!running) return;
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      raf = requestAnimationFrame(loop);
    }
  }

  function loop() {
    raf = 0;
    if (!running || !landmarker) return;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      const t = performance.now();
      try {
        const r = landmarker.detectForVideo(video, t);
        const world = copyPoints(r.worldLandmarks?.[0]);
        const image = copyPoints(r.landmarks?.[0]);
        const label = (r.handedness ?? r.handednesses)?.[0]?.[0]?.categoryName;
        /** @type {'right'|'left'|null} */
        const handedness = label === 'Right' ? 'right' : label === 'Left' ? 'left' : null;
        onFrame({ t, world: world && image ? world : null, image: world && image ? image : null, handedness });
      } catch (err) {
        stopInternal();
        onState('load-error', describe(err, 'detect'));
        return;
      }
    }
    if (!document.hidden) raf = requestAnimationFrame(loop);
  }

  function stopInternal() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    document.removeEventListener('visibilitychange', onVisibility);
    if (stream) for (const track of stream.getTracks()) track.stop();
    stream = null;
    try {
      video.pause();
    } catch {
      // A video that never started has nothing to pause.
    }
    video.srcObject = null;
    if (landmarker) {
      try {
        landmarker.close();
      } catch {
        // Closing twice or after a failed init throws; the instance is discarded either way.
      }
    }
    landmarker = null;
  }

  return {
    async start() {
      const gen = ++generation;
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        onState('unsupported', {
          name: 'Unsupported',
          message: window.isSecureContext ? 'navigator.mediaDevices.getUserMedia no está disponible' : 'Contexto no seguro (se necesita https o localhost)',
          stage: 'camera',
        });
        return;
      }
      onState('requesting');
      const cancelled = () => gen !== generation;
      /** @type {MediaStream} */
      let media;
      try {
        media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (err) {
        if (cancelled()) return;
        onState(mapMediaError(err), describe(err, 'camera'));
        return;
      }
      if (cancelled()) {
        // This stream belongs to a start() that was stopped or replaced while the prompt was open.
        for (const t of media.getTracks()) t.stop();
        return;
      }
      stream = media;
      try {
        // iOS Safari refuses play() on a detached element.
        if (!video.isConnected) throw new Error('El video no está en la página');
        prepareVideo(video);
        video.srcObject = media;
        await video.play();
      } catch (err) {
        if (cancelled()) return;
        stopInternal();
        onState('no-camera', describe(err, 'video'));
        return;
      }
      if (cancelled()) return;

      onState('loading');
      try {
        const vision = /** @type {VisionModule} */ (await load(MEDIAPIPE_MODULE_URL));
        if (cancelled()) return;
        if (!vision?.FilesetResolver || !vision?.HandLandmarker) throw new Error('El módulo de MediaPipe no tiene la forma esperada');
        const fileset = await vision.FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_ROOT);
        if (cancelled()) return;
        /** @param {'GPU'|'CPU'} delegate */
        const create = (delegate) =>
          vision.HandLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate },
            runningMode: 'VIDEO',
            numHands: 1,
          });
        let lm;
        try {
          lm = await create('GPU');
        } catch {
          if (cancelled()) return;
          // Some devices lack a usable WebGL context; the CPU path is slower but works.
          lm = await create('CPU');
        }
        if (cancelled()) {
          lm.close();
          return;
        }
        landmarker = lm;
      } catch (err) {
        if (cancelled()) return;
        stopInternal();
        onState('load-error', describe(err, 'model'));
        return;
      }

      running = true;
      lastVideoTime = -1;
      document.addEventListener('visibilitychange', onVisibility);
      onState('running');
      raf = requestAnimationFrame(loop);
    },
    stop() {
      generation++;
      const was = running || stream !== null;
      stopInternal();
      if (was) onState('stopped');
    },
    /** Video aspect ratio for the overlay, once known. */
    aspect() {
      return video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 4 / 3;
    },
  };
}
