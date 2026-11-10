// @ts-check
import { createHandView } from '../render/handView.js';
import { signView } from '../render/signPose.js';
import { wordToSigns } from '../signs/alphabet.js';
import { h, uniqueId } from '../ui/dom.js';
import { S, listJoin } from '../ui/strings.js';
import { practiceHref, screenTitle } from './shared.js';

/** @type {import('./shared.js').Screen} */
export function spellScreen(root, ctx) {
  const inputId = uniqueId('spell');
  const helpId = uniqueId('spell-help');
  const errId = uniqueId('spell-err');
  const input = h('input', {
    id: inputId,
    class: 'text-input',
    type: 'text',
    autocomplete: 'off',
    autocapitalize: 'characters',
    spellcheck: 'false',
    maxlength: '40',
    'aria-describedby': `${helpId} ${errId}`,
    'data-testid': 'spell-input',
  });
  const preview = h('ul', { class: 'spell-preview', 'aria-label': S.spell.previewLabel });
  const status = h('p', { class: 'quiet', 'aria-live': 'polite' });
  const error = h('p', { id: errId, class: 'form-error', 'aria-live': 'assertive' });
  const go = h('button', { type: 'submit', class: 'btn btn--primary btn--wide', 'data-testid': 'spell-go', text: S.spell.go });
  /** @type {ReturnType<typeof createHandView>[]} */
  let views = [];

  const initial = ctx.route.query.get('texto') ?? '';
  input.value = initial;

  function render() {
    for (const v of views) v.destroy();
    views = [];
    preview.replaceChildren();
    error.textContent = '';
    const items = wordToSigns(input.value);
    const known = items.filter((it) => it.sign);
    const unknown = [...new Set(items.filter((it) => !it.sign).map((it) => it.char))];
    // Characters dropped by wordToSigns (digits, punctuation) are reported too.
    const dropped = [...new Set([...input.value].filter((ch) => ch.trim() && !/\p{L}/u.test(ch)))];

    if (!known.length) {
      preview.hidden = true;
      status.textContent = S.spell.empty;
    } else {
      preview.hidden = false;
      const hasMoving = known.some((it) => it.sign?.kind === 'dynamic');
      status.textContent = hasMoving ? S.spell.moving : '';
      for (const it of known) {
        const sign = /** @type {import('../signs/alphabet.js').Sign} */ (it.sign);
        const canvas = h('canvas', { class: 'spell-cell__hand', 'aria-hidden': 'true' });
        preview.append(
          h(
            'li',
            { class: 'spell-cell' },
            h('span', { class: 'spell-cell__letter', text: sign.letter }),
            canvas,
          ),
        );
        const v = createHandView(canvas, { mirror: true, minBox: 2.2 });
        v.setLandmarks(signView(sign));
        views.push(v);
      }
    }
    const skipped = [...unknown, ...dropped];
    if (skipped.length) status.textContent = `${status.textContent ? status.textContent + ' ' : ''}${S.spell.skipped(listJoin(skipped))}`;
  }

  const form = h(
    'form',
    { class: 'cell spell-form', novalidate: true },
    h('label', { for: inputId, class: 'field-label', text: S.spell.label }),
    input,
    h('p', { id: helpId, class: 'quiet', text: S.spell.help }),
    error,
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ids = wordToSigns(input.value)
      .map((it) => it.sign?.id)
      .filter((x) => typeof x === 'string');
    if (!ids.length) {
      error.textContent = S.spell.needLetters;
      input.focus();
      return;
    }
    ctx.navigate(practiceHref(ids));
  });
  input.addEventListener('input', render);

  form.append(h('div', { class: 'spell-preview-wrap' }, preview, status), go);

  root.append(
    h(
      'div',
      { class: 'cells' },
      h('div', { class: 'cell cell--title' }, screenTitle(S.spell.h1), h('p', { class: 'lead', text: S.spell.lead })),
      form,
    ),
  );
  render();

  return {
    title: S.titles.spell,
    destroy() {
      for (const v of views) v.destroy();
    },
  };
}
