import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @param {string} hex "#rrggbb" or "#rgb" */
export function parseHex(hex) {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Invalid hex color: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** WCAG 2 relative luminance. @param {string} hex */
export function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio, 1 to 21. @param {string} a @param {string} b */
export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** @param {string} css @returns {Record<string, string>} */
export function parseTokens(css) {
  /** @type {Record<string, string>} */
  const tokens = {};
  for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/g)) tokens[m[1]] = m[2];
  return tokens;
}

/** @typedef {{fg: string, bg: string, min: number, label: string}} Pair */

/** @type {Pair[]} */
export const PAIRS = [
  { fg: '--ink', bg: '--paper', min: 4.5, label: 'text: ink on paper' },
  { fg: '--ink', bg: '--paper-deep', min: 4.5, label: 'text: ink on paper-deep' },
  { fg: '--ink-soft', bg: '--paper', min: 4.5, label: 'text: ink-soft on paper' },
  { fg: '--ink-soft', bg: '--paper-deep', min: 4.5, label: 'text: ink-soft on paper-deep' },
  { fg: '--red', bg: '--paper', min: 4.5, label: 'text: red on paper' },
  { fg: '--bone', bg: '--red', min: 4.5, label: 'text: bone on red' },
  { fg: '--turquoise', bg: '--paper', min: 4.5, label: 'text: turquoise on paper' },
  { fg: '--turquoise', bg: '--paper-deep', min: 4.5, label: 'text: turquoise on paper-deep' },
  { fg: '--ink', bg: '--bone', min: 4.5, label: 'text: ink on bone' },
  { fg: '--ink', bg: '--turquoise-fill', min: 4.5, label: 'text: ink on turquoise-fill' },
  { fg: '--ink', bg: '--ochre', min: 4.5, label: 'text: ink on ochre' },
  { fg: '--ink', bg: '--paper', min: 3, label: 'non-text: ink border on paper' },
  { fg: '--red', bg: '--paper', min: 3, label: 'non-text: red on paper' },
];

/**
 * @param {string} cssPath
 * @returns {{ok: boolean, rows: string[][], error?: string}}
 */
export function check(cssPath) {
  let css;
  try {
    css = readFileSync(cssPath, 'utf8');
  } catch {
    return { ok: false, rows: [], error: `Cannot read ${cssPath}. Expected design tokens in :root.` };
  }
  const tokens = parseTokens(css);
  const needed = [...new Set(PAIRS.flatMap((p) => [p.fg, p.bg]))];
  const missing = needed.filter((n) => !(n in tokens));
  if (missing.length) {
    return { ok: false, rows: [], error: `Missing token(s) in ${cssPath}: ${missing.join(', ')}` };
  }
  let ok = true;
  const rows = PAIRS.map((p) => {
    const ratio = contrastRatio(tokens[p.fg], tokens[p.bg]);
    const pass = ratio >= p.min;
    if (!pass) ok = false;
    return [p.label, `${tokens[p.fg]} / ${tokens[p.bg]}`, ratio.toFixed(2), `${p.min}:1`, pass ? 'PASS' : 'FAIL'];
  });
  return { ok, rows };
}

function main() {
  const cssPath = resolve(fileURLToPath(new URL('..', import.meta.url)), 'styles/tokens.css');
  const { ok, rows, error } = check(cssPath);
  if (error) {
    console.error(error);
    process.exit(1);
  }
  const header = ['pair', 'colors', 'ratio', 'needs', 'result'];
  const all = [header, ...rows];
  const widths = header.map((_, i) => Math.max(...all.map((r) => r[i].length)));
  for (const r of all) console.log(r.map((c, i) => c.padEnd(widths[i])).join('  '));
  if (!ok) {
    console.error('\nContrast check failed.');
    process.exit(1);
  }
  console.log('\nAll pairs pass.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
