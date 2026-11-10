// @ts-check
import { FINGERS } from '../core/index.js';
import { createSession } from '../practice/session.js';
import { createHandView } from '../render/handView.js';
import { createPoseTween, signView } from '../render/signPose.js';
import { STATIC_IDS, getSign } from '../signs/alphabet.js';
import { createCameraSource, prepareVideo } from '../sources/camera.js';
import { createSyntheticSource } from '../sources/synthetic.js';
import { h, prefersReducedMotion } from '../ui/dom.js';
import { anchorScroll, barDotNumeral, holdRing, speechScroll } from '../ui/motifs.js';
import { pageParam } from '../ui/router.js';
import { getViolations } from '../ui/security.js';
import { FINGER_NAMES, S, hintText, listJoin } from '../ui/strings.js';
import { letterHref, screenTitle } from './shared.js';

/** @typedef {import('../signs/alphabet.js').Sign} Sign */
/** @typedef {import('../practice/session.js').SessionView} SessionView */
/** @typedef {import('../sources/camera.js').HandFrame} HandFrame */
/** @typedef {import('../sources/camera.js').SourceState} SourceState */
/** @typedef {import('../sources/camera.js').SourceErrorInfo} SourceErrorInfo */
/** @typedef {'denied'|'no-camera'|'unsupported'|'load-error'} ErrorState */

const HINT_INTERVAL_MS = 800;
const SUCCESS_MS = 1400;

/** @param {URLSearchParams} query @returns {Sign[]} */
function selectSigns(query) {
  const raw = query.get('letras');
  const ids = raw ? raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : STATIC_IDS;
  const signs = ids.map((id) => getSign(id === 'ñ' ? 'enie' : id)).filter((s) => s !== undefined);
  return signs.length ? signs : STATIC_IDS.map((id) => /** @type {Sign} */ (getSign(id)));
}

/** @type {import('./shared.js').Screen} */
export function practiceScreen(root, ctx) {
  const signs = selectSigns(ctx.route.query);
  const synthetic = pageParam('fuente') === 'sintetica';
  const fast = pageParam('rapido') === '1';
  const debug = pageParam('debug') === '1';
  const session = createSession({ signs });

  const title = screenTitle(S.practice.h1);
  const body = h('div', { class: 'cells__group' });
  const progressText = h('span', { class: 'progress__text' });
  const progressGlyph = h('span', { class: 'progress__glyph' });
  const progress = h('p', { class: 'progress', hidden: true }, progressText, progressGlyph);
  // Holds the video while the stage is not on the page: iOS Safari only plays an element that is in the document.
  const videoDock = h('div', { class: 'video-dock', 'aria-hidden': 'true' });
  root.append(h('div', { class: 'cells' }, h('div', { class: 'cell cell--title cell--compact practice-head' }, title, progress), body), videoDock);

  /* ---------- running view (built once, reused) ---------- */
  const video = h('video', { class: 'stage__video', 'aria-hidden': 'true' });
  prepareVideo(video);
  const stageCanvas = h('canvas', { class: 'stage__hand', role: 'img', 'aria-label': S.practice.stageLabel });
  const stageNote = h('p', { class: 'stage__note' });
  const scrollSlot = h('div', { class: 'stage__scroll' });
  const stage = h('div', { class: 'stage', 'data-testid': 'stage' }, video, h('div', { class: 'stage__tint' }), stageCanvas, scrollSlot, stageNote);

  const ring = holdRing();
  ring.setAttribute('data-testid', 'hold-ring');
  const targetLetter = h('span', { class: 'target-letter', 'data-testid': 'target-letter' });
  const targetCanvas = h('canvas', { class: 'target__hand', role: 'img' });
  const howTo = h('a', { class: 'target__how', text: S.practice.howTo });
  const target = h(
    'div',
    { class: 'cell target' },
    h('div', { class: 'target__ring' }, ring, targetLetter),
    h('div', { class: 'target__side' }, h('p', { class: 'target__label', text: S.practice.target }), targetCanvas, howTo),
  );

  const hint = h('p', { class: 'hint', 'data-testid': 'hint', 'aria-live': 'polite', tabindex: '-1' });
  const movement = h('p', { class: 'movement quiet' });
  const hintCell = h('div', { class: 'cell hint-cell' }, hint, movement);


  const skipBtn = h('button', { type: 'button', class: 'btn btn--secondary', 'data-testid': 'btn-skip', text: S.practice.skip });
  const nextBtn = h('button', { type: 'button', class: 'btn btn--primary', 'data-testid': 'btn-next', hidden: true });
  const finishBtn = h('button', { type: 'button', class: 'btn btn--quiet', 'data-testid': 'btn-finish', text: S.practice.finish });
  const hideVideoBtn = h('button', { type: 'button', class: 'btn btn--quiet', 'aria-pressed': 'false', text: S.practice.hideVideo });
  const controls = h('div', { class: 'cell controls' }, nextBtn, skipBtn, finishBtn, hideVideoBtn);

  const debugOut = debug ? h('pre', { class: 'debug', 'aria-label': S.practice.debug.title }) : null;
  const running = h('div', { class: 'cells__group running' }, h('div', { class: 'cell cell--stage stage-cell' }, stage), target, hintCell, controls, debugOut);

  /** @type {ReturnType<typeof createHandView>|null} */
  let stageView = null;
  /** @type {ReturnType<typeof createHandView>|null} */
  let targetView = null;
  /** @type {ReturnType<typeof createPoseTween>|null} */
  let targetTween = null;
  /** @type {{start(): Promise<void>, stop(): void, aspect(): number}|null} */
  let source = null;
  /** @type {'intro'|'requesting'|'loading'|'running'|'error'|'finished'} */
  let mode = 'intro';
  /** @type {SessionView['phase']|null} */
  let lastPhase = null;
  let hintShownAt = -Infinity;
  let pendingHint = '';
  let hintTimer = 0;
  let successTimer = 0;
  let destroyed = false;
  /** @type {import('../render/handView.js').TipAnchor|null} */
  let lastAnchor = null;

  /* ---------- helpers ---------- */

  /** Replace the body and move focus so screen readers hear the new state. @param {HTMLElement} el @param {HTMLElement|null} focusEl */
  function showBody(el, focusEl) {
    body.replaceChildren(el);
    (focusEl ?? title).focus({ preventScroll: false });
  }

  /**
   * Hiding the focused button would drop focus to <body>; hand it to the hint, which says what changed.
   * @param {HTMLElement} el @param {boolean} hidden
   */
  function setHidden(el, hidden) {
    if (hidden && el.contains(document.activeElement)) hint.focus({ preventScroll: true });
    el.hidden = hidden;
  }

  /** @param {string} text @param {boolean} [now] */
  function setHint(text, now = false) {
    pendingHint = text;
    const t = performance.now();
    // One change per 800 ms at most, so the live region stays readable.
    if (now || t - hintShownAt >= HINT_INTERVAL_MS) {
      clearTimeout(hintTimer);
      hintTimer = 0;
      if (hint.textContent !== text) hint.textContent = text;
      hintShownAt = t;
    } else if (!hintTimer) {
      hintTimer = window.setTimeout(() => {
        hintTimer = 0;
        setHint(pendingHint, true);
      }, HINT_INTERVAL_MS - (t - hintShownAt));
    }
  }

  /** @param {number} v */
  function setHold(v) {
    ring.style.setProperty('--hold', String(Math.max(0, Math.min(1, v))));
  }

  function updateTarget() {
    const { index, total, sign } = session.current();
    targetLetter.textContent = sign.letter;
    targetCanvas.setAttribute('aria-label', `${S.practice.targetHandLabel(sign.letter)}. ${sign.description}`);
    howTo.setAttribute('href', letterHref(sign.id));
    progressText.textContent = S.practice.progress(index + 1, total);
    progressGlyph.replaceChildren(barDotNumeral(index + 1));
    targetTween?.to(sign.pose, sign.orientation);
    scrollSlot.replaceChildren();
    target.classList.remove('is-success');
    setHold(0);
    lastPhase = null;
    const v = session.peek();
    applyPhase(v);
    if (v.phase !== 'observe') setHint(S.practice.noHand, true);
  }

  /** @param {SessionView} v */
  function applyPhase(v) {
    if (v.phase === lastPhase) return;
    const prev = lastPhase;
    lastPhase = v.phase;
    const { sign } = session.current();
    running.classList.toggle('is-observe', v.phase === 'observe');
    clearTimeout(successTimer);

    if (v.phase === 'observe') {
      stageView?.setLandmarks(signView(sign));
      stageNote.textContent = S.practice.observe.title(sign.letter);
      setHint(sign.movement ?? S.practice.observe.body, true);
      movement.textContent = S.practice.observe.body;
      nextBtn.textContent = S.practice.observe.cont;
      setHidden(nextBtn, false);
      setHidden(skipBtn, true);
      return;
    }
    movement.textContent = '';
    stageNote.textContent = sourceKind === 'synthetic' ? S.practice.synthetic : S.practice.mirror;
    setHidden(skipBtn, false);

    if (v.phase === 'success') {
      setHold(1);
      target.classList.add('is-success');
      // The curl leaves the user's own hand: the hand that just spoke the letter.
      const scroll = speechScroll({ draw: !prefersReducedMotion() });
      scroll.classList.add('voluta--anchored');
      scrollSlot.replaceChildren(scroll);
      anchorScroll(scroll, lastAnchor);
      setHint(S.practice.success(sign.letter), true);
      const last = session.current().index === session.current().total - 1;
      nextBtn.textContent = last ? S.practice.seeSummary : S.practice.nextLetter;
      setHidden(nextBtn, false);
      setHidden(skipBtn, true);
      successTimer = window.setTimeout(goNext, SUCCESS_MS);
      return;
    }
    setHidden(nextBtn, true);
    if (prev === 'success') scrollSlot.replaceChildren();
  }

  function goNext() {
    clearTimeout(successTimer);
    session.next();
    afterAdvance();
  }

  function afterAdvance() {
    if (session.isFinished()) showFinished();
    else updateTarget();
  }

  /** @param {HandFrame} frame */
  function onFrame(frame) {
    if (mode !== 'running' || destroyed) return;
    const v = session.onFrame(frame);
    if (v.phase === 'finished') {
      showFinished();
      return;
    }
    applyPhase(v);
    if (v.phase === 'observe') return;

    /** @type {Partial<Record<import('../core/index.js').FingerName, boolean>>} */
    const fingers = {};
    if (v.match) for (const f of FINGERS) fingers[f] = v.match.fingers[f].ok;
    stageView?.setImageLandmarks(frame.image, { fingers, aspect: source?.aspect() ?? 4 / 3 });
    if (v.phase !== 'success') setHold(v.hold);

    if (v.phase === 'no-hand') setHint(S.practice.noHand);
    else if (v.phase === 'holding') setHint(S.practice.hold);
    else if (v.phase === 'adjusting') setHint(hintText(v.hint));

    if (debugOut) renderDebug(v, frame);
  }

  /** @param {SessionView} v @param {HandFrame} frame */
  function renderDebug(v, frame) {
    if (!debugOut) return;
    if (!v.match) {
      debugOut.textContent = S.practice.debug.none;
      return;
    }
    const m = v.match;
    const lines = [
      `${S.practice.debug.hand}: ${frame.handedness ?? '?'}`,
      `${S.practice.debug.side}: ${v.features ? `${v.features.handedness} (${v.features.handednessConfident ? S.practice.debug.sideByShape : S.practice.debug.sideBest})` : '?'}`,
      ...FINGERS.map((f) => `${FINGER_NAMES[f].padEnd(8)} ${m.fingers[f].score.toFixed(2)} ${m.fingers[f].ok ? 'ok' : '--'}`),
      `${S.practice.debug.orientation.padEnd(8)} ${m.orientation.score.toFixed(2)} ${m.orientation.ok ? 'ok' : '--'}`,
      `score    ${m.score.toFixed(2)}  hint ${v.hint?.code ?? '-'}`,
    ];
    const ang = v.features?.angles;
    if (ang) {
      for (const f of /** @type {const} */ (['index', 'middle', 'ring', 'pinky'])) {
        lines.push(`${f.padEnd(7)} ${ang[f].mcp.toFixed(0)}/${ang[f].pip.toFixed(0)}/${ang[f].dip.toFixed(0)}`);
      }
      lines.push(`thumb   ${ang.thumb.mcp.toFixed(0)}/${ang.thumb.ip.toFixed(0)}`);
    }
    debugOut.textContent = lines.join('\n');
  }

  /** @param {SourceState} s @param {SourceErrorInfo} [info] */
  function onState(s, info) {
    if (destroyed) return;
    if (s === 'requesting') showStatus(S.practice.requesting.title, S.practice.requesting.body, 'requesting');
    else if (s === 'loading') showStatus(S.practice.loading.title, S.practice.loading.body, 'loading');
    else if (s === 'running') showRunning();
    else if (s === 'denied' || s === 'no-camera' || s === 'unsupported' || s === 'load-error') showError(s, info);
  }

  /* ---------- states ---------- */

  function showIntro() {
    mode = 'intro';
    progress.hidden = true;
    const startBtn = h('button', { type: 'button', class: 'btn btn--primary btn--wide', 'data-testid': 'btn-start-camera', text: S.practice.intro.start });
    const demoBtn = h('button', { type: 'button', class: 'btn btn--secondary btn--wide', 'data-testid': 'btn-demo', text: S.practice.intro.demo });
    startBtn.addEventListener('click', () => startSource('camera'));
    demoBtn.addEventListener('click', () => startSource('synthetic'));
    const heading = h('h2', { tabindex: '-1', text: S.practice.intro.title });
    showBody(
      h(
        'div',
        { class: 'cells__group' },
        h(
          'div',
          { class: 'cell prose' },
          heading,
          h('p', { text: S.practice.intro.why }),
          h('p', { text: S.practice.intro.privacy }),
          h('p', { class: 'quiet', text: S.practice.intro.download }),
          h('p', { class: 'letters-line', text: S.practice.letters(listJoin(signs.map((s) => s.letter))) }),
        ),
        h(
          'div',
          { class: 'cell cell--actions' },
          startBtn,
          demoBtn,
          h('p', { class: 'quiet', text: S.practice.intro.demoHelp }),
        ),
      ),
      title,
    );
  }

  /** @param {string} heading @param {string} text @param {'requesting'|'loading'} m */
  function showStatus(heading, text, m) {
    mode = m;
    const hEl = h('h2', { tabindex: '-1', text: heading });
    showBody(h('div', { class: 'cell prose status', role: 'status' }, hEl, h('p', { text })), hEl);
  }

  /** @param {ErrorState} s @param {SourceErrorInfo} [info] */
  function showError(s, info) {
    mode = 'error';
    progress.hidden = true;
    const copy = S.practice.errors[s];
    const heading = h('h2', { tabindex: '-1', text: copy.title });
    const retry = h('button', { type: 'button', class: 'btn btn--primary btn--wide', text: S.practice.retry });
    retry.addEventListener('click', () => startSource('camera'));
    const demo = h('button', { type: 'button', class: 'btn btn--secondary btn--wide', 'data-testid': 'btn-demo', text: S.practice.intro.demo });
    demo.addEventListener('click', () => startSource('synthetic'));
    const blocked = getViolations();
    const detailLines = [
      info?.stage ? `etapa: ${info.stage}` : '',
      info?.name ? `error: ${info.name}` : '',
      info?.message ? `mensaje: ${info.message}` : '',
    ].filter(Boolean);
    showBody(
      h(
        'div',
        { class: 'cells__group' },
        h(
          'div',
          { class: 'cell prose error', role: 'alert' },
          heading,
          h('p', { text: copy.body }),
          h(
            'details',
            { class: 'details' },
            h('summary', { text: S.practice.details }),
            h('pre', { class: 'details__body', text: detailLines.length ? detailLines.join('\n') : S.practice.noDetails }),
            blocked.length
              ? [h('p', { text: S.practice.blocked }), h('pre', { class: 'details__body', text: blocked.map((b) => `${b.directive}: ${b.uri}`).join('\n') })]
              : null,
          ),
        ),
        h('div', { class: 'cell cell--actions' }, s === 'unsupported' ? null : retry, demo),
      ),
      heading,
    );
  }

  function showRunning() {
    mode = 'running';
    progress.hidden = false;
    body.replaceChildren(running);
    // Moved within the same task, so the playing video is not paused by the move.
    if (video.parentElement !== stage) stage.prepend(video);
    running.classList.toggle('is-synthetic', sourceKind === 'synthetic');
    if (!stageView) stageView = createHandView(stageCanvas, { mirror: true, onDraw: (a) => (lastAnchor = a) });
    if (!targetView) {
      targetView = createHandView(targetCanvas, { mirror: true, minBox: 2.2 });
      targetTween = createPoseTween(targetView);
    }
    stageView.resize();
    targetView.resize();
    updateTarget();
    title.focus();
  }

  function showFinished() {
    mode = 'finished';
    progress.hidden = true;
    clearTimeout(successTimer);
    source?.stop();
    const v = session.peek();
    const letters = (/** @type {string[]} */ ids) => {
      const l = ids.map((id) => getSign(id)?.letter ?? id);
      return l.length ? listJoin(l) : S.practice.finished.none;
    };
    const heading = h('h2', { tabindex: '-1', text: S.practice.finished.title });
    const again = h('button', { type: 'button', class: 'btn btn--primary btn--wide', text: S.practice.finished.again });
    again.addEventListener('click', () => {
      session.restart();
      startSource(sourceKind);
    });
    /** @param {string} label @param {string[]} ids */
    const row = (label, ids) => [h('dt', { text: label }), h('dd', { text: letters(ids) })];
    showBody(
      h(
        'div',
        { class: 'cells__group' },
        h(
          'div',
          { class: 'cell prose', 'data-testid': 'practice-finished' },
          heading,
          h(
            'dl',
            { class: 'tally' },
            row(S.practice.finished.done, v.tally.done),
            row(S.practice.finished.skipped, v.tally.skipped),
            v.tally.observed.length ? row(S.practice.finished.observed, v.tally.observed) : null,
          ),
          h('p', { class: 'tally__count' }, h('span', { text: `${v.tally.done.length} / ${signs.length}` }), barDotNumeral(v.tally.done.length)),
        ),
        h('div', { class: 'cell cell--actions' }, again, h('a', { class: 'btn btn--secondary btn--wide', href: '#/alfabeto', text: S.practice.finished.alphabet })),
      ),
      heading,
    );
  }

  /** @type {'camera'|'synthetic'} */
  let sourceKind = synthetic ? 'synthetic' : 'camera';

  /** @param {'camera'|'synthetic'} kind */
  function startSource(kind) {
    source?.stop();
    sourceKind = kind;
    running.classList.toggle('is-synthetic', kind === 'synthetic');
    // No video to hide in the simulated mode, so the toggle would do nothing there.
    setHidden(hideVideoBtn, kind === 'synthetic');
    if (kind === 'synthetic') {
      source = createSyntheticSource({
        getTarget: () => (session.isFinished() ? null : session.current().sign),
        onFrame,
        onState,
        fast,
      });
    } else {
      if (!video.isConnected) videoDock.append(video);
      source = createCameraSource({ video, onFrame, onState });
    }
    source.start().catch((err) => onState('load-error', { name: err?.name, message: String(err?.message ?? err), stage: 'start' }));
  }

  /* ---------- controls ---------- */

  skipBtn.addEventListener('click', () => {
    clearTimeout(successTimer);
    session.skip();
    afterAdvance();
  });
  nextBtn.addEventListener('click', goNext);
  finishBtn.addEventListener('click', () => {
    session.finish();
    showFinished();
  });
  hideVideoBtn.addEventListener('click', () => {
    const on = hideVideoBtn.getAttribute('aria-pressed') !== 'true';
    hideVideoBtn.setAttribute('aria-pressed', String(on));
    stage.classList.toggle('is-video-hidden', on);
  });

  if (synthetic) startSource('synthetic');
  else showIntro();

  return {
    title: S.titles.practice,
    destroy() {
      destroyed = true;
      clearTimeout(successTimer);
      clearTimeout(hintTimer);
      source?.stop();
      targetTween?.stop();
      stageView?.destroy();
      targetView?.destroy();
    },
  };
}
