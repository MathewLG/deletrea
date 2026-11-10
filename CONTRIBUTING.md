# Contributing

Deletrea is a static site with plain ES modules and no build step. Code and comments are in English; user-facing text is in Spanish (kept in `src/ui/strings.js`).

## Setup

Node 22 is required.

```
npm install
npm run serve     # http://localhost:4173/
```

The first `npm install` creates `package-lock.json`. Commit it.

## Checks

Run before opening a pull request:

```
npm run check     # lint, typecheck, unit tests, contrast
npm run test:e2e  # browser tests (Chromium, phone viewport)
```

For e2e you need Playwright's Chromium (`npx playwright install chromium`), or set `CHROME_PATH` to an existing Chrome binary.

## Who owns what

From `docs/SPEC.md` section 4:

```
src/core/       pure logic, no DOM
src/signs/      alphabet data
tests/unit/     node:test
src/render/     canvas hand renderer
src/sources/    camera and synthetic sources
src/practice/   practice session controller
src/screens/    one module per screen
src/ui/         dom helpers, strings, router
styles/         css
index.html
scripts/, package.json, eslint, tsconfig, .github/, README, tests/e2e
```

Keep changes inside the area you are working on, and say so in the pull request when a change needs to touch another one.

## Handshapes

Handshapes change only with a cited source or a validator's review. Include the reference (or a link to the issue where a Deaf LSM user or certified interpreter reviewed it) in the pull request. See `docs/VALIDATION.md`.

## Rules of the house

- No runtime dependencies. MediaPipe loads from a CDN only when the camera starts, and the Content-Security-Policy in `index.html` limits what the page can reach.
- No inline scripts or inline style attributes.
- No em dash in user-facing text.
- Comments explain why, not what.
