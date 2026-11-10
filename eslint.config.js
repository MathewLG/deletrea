// No imports on purpose: the rule set and globals are declared by hand so the
// config works without @eslint/js or globals installed.

const browserGlobals = Object.fromEntries(
  [
    'window', 'document', 'navigator', 'location', 'history', 'console',
    'localStorage', 'sessionStorage', 'setTimeout', 'clearTimeout',
    'setInterval', 'clearInterval', 'requestAnimationFrame',
    'cancelAnimationFrame', 'queueMicrotask', 'structuredClone', 'fetch',
    'URL', 'URLSearchParams', 'Request', 'Response', 'Headers', 'Blob',
    'AbortController', 'AbortSignal', 'Event', 'EventTarget', 'CustomEvent',
    'KeyboardEvent', 'MouseEvent', 'PointerEvent', 'TouchEvent',
    'SecurityPolicyViolationEvent', 'HTMLElement', 'HTMLCanvasElement',
    'HTMLVideoElement', 'HTMLInputElement', 'HTMLButtonElement', 'Element',
    'Node', 'NodeList', 'DocumentFragment', 'ShadowRoot', 'SVGElement',
    'CanvasRenderingContext2D', 'Path2D', 'OffscreenCanvas', 'ImageBitmap',
    'ImageData', 'MediaStream', 'MediaStreamTrack', 'ResizeObserver',
    'IntersectionObserver', 'MutationObserver', 'matchMedia', 'getComputedStyle',
    'performance', 'devicePixelRatio', 'addEventListener', 'removeEventListener',
    'TextEncoder', 'TextDecoder', 'atob', 'btoa', 'Worker', 'WebAssembly',
    'DOMException', 'DOMRect', 'DOMParser', 'FontFace', 'alert', 'self',
  ].map((name) => [name, 'readonly']),
);

const nodeGlobals = Object.fromEntries(
  [
    'process', 'console', 'Buffer', 'setTimeout', 'clearTimeout',
    'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate',
    'queueMicrotask', 'structuredClone', 'fetch', 'URL', 'URLSearchParams',
    'AbortController', 'AbortSignal', 'TextEncoder', 'TextDecoder', 'Event',
    'EventTarget', 'performance', 'atob', 'btoa',
  ].map((name) => [name, 'readonly']),
);

const rules = {
  'no-undef': 'error',
  'no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
  ],
  eqeqeq: ['error', 'always'],
  'prefer-const': 'error',
  'no-var': 'error',
  'no-implicit-globals': 'error',
  'no-redeclare': 'error',
  'no-shadow-restricted-names': 'error',
  'no-dupe-keys': 'error',
  'no-dupe-args': 'error',
  'no-dupe-else-if': 'error',
  'no-duplicate-case': 'error',
  'no-unreachable': 'error',
  'no-unsafe-negation': 'error',
  'no-self-assign': 'error',
  'no-self-compare': 'error',
  'no-const-assign': 'error',
  'no-class-assign': 'error',
  'no-func-assign': 'error',
  'no-import-assign': 'error',
  'no-this-before-super': 'error',
  'no-setter-return': 'error',
  'no-sparse-arrays': 'error',
  'no-fallthrough': 'error',
  'no-empty': ['error', { allowEmptyCatch: false }],
  'no-cond-assign': ['error', 'except-parens'],
  'no-constant-condition': ['error', { checkLoops: false }],
  'no-loss-of-precision': 'error',
  'no-misleading-character-class': 'error',
  'no-prototype-builtins': 'error',
  'no-useless-catch': 'error',
  'no-unsafe-finally': 'error',
  'use-isnan': 'error',
  'valid-typeof': 'error',
  'require-yield': 'error',
  'getter-return': 'error',
  'for-direction': 'error',
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  'no-throw-literal': 'error',
  'no-unused-labels': 'error',
  'no-extra-boolean-cast': 'error',
};

const base = {
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
  linterOptions: { reportUnusedDisableDirectives: 'error' },
  rules,
};

export default [
  { ignores: ['node_modules/**', 'tmp/**', 'playwright-report/**', 'test-results/**', '_site/**'] },
  { ...base, files: ['**/*.js', '**/*.mjs'] },
  {
    files: ['src/**/*.js', 'src/**/*.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: browserGlobals },
  },
  {
    files: ['scripts/**', 'tests/**', '*.config.js', '*.config.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: nodeGlobals },
  },
  {
    // page.evaluate callbacks run in the browser.
    files: ['tests/e2e/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...nodeGlobals, ...browserGlobals },
    },
  },
];
