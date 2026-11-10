# Deletrea: plan

## Goal

A phone-first web app where someone can practise the LSM manual alphabet with their camera and get per-finger feedback, with video that never leaves the device. It doubles as a showcase: striking to look at, and sound underneath (tests, CI, accessibility, a privacy promise the browser enforces).

## Principles

1. **Do not teach wrong signs.** Handshapes come from the research file, each with its sources and confidence. The app says the signs are not yet validated by Deaf LSM users, and `docs/VALIDATION.md` gives them a way to correct it.
2. **The alphabet is not the language.** The app says so.
3. **Privacy is enforced, not promised.** No backend; a Content-Security-Policy limits where the page can connect.
4. **One source of truth per sign.** A pose drives the drawing, the matching target and the tests.
5. **No streaks, no nagging.** A tool, not a habit trap.

## How the work is organised

Planning, spec and design are done by the lead (Claude Fable 5.2). Implementation is delegated to smaller models, each owning a set of files defined in `docs/SPEC.md` section 4:

| role | owns | model |
|---|---|---|
| Researcher | `docs/research/` | Fable 5.2 |
| Core engineer | `src/core`, `src/signs`, `tests/unit`, `scripts/render-poses.mjs` | Opus |
| Interface engineer | `index.html`, `styles`, `src/render`, `src/sources`, `src/practice`, `src/screens`, `src/ui` | Opus |
| Tooling engineer | `package.json`, lint, typecheck, CI, `scripts/serve.mjs`, `scripts/contrast.mjs`, README, docs | Sonnet |
| Test engineer | `tests/e2e` | Opus |
| Reviewer | read-only audit against the spec | Opus, fresh context |

The lead reviews each handoff, checks the handshapes by eye against the research images, and runs the delivery gate from the anti-slop rules before anything ships.

## Milestones

- **M0 Research and spec.** Done: alphabet research, spec, design direction.
- **M1 Engine.** Hand model, features, matching, sign data, unit tests including the confusion matrix and noise tests.
- **M2 Interface.** Renderer, screens, synthetic source, camera source, practice flow.
- **M3 Quality.** Lint, typecheck, contrast check, browser tests, CI, Pages deploy.
- **M4 Review and fixes.** Independent audit, handshape check, delivery gate.
- **M5 First real-hand session.** The owner tries it on a phone with `?debug=1`; thresholds get tuned from what real hands produce.

## After v0.1

- Validation by Deaf LSM users, recorded per letter.
- Self-host the tracker and model so the page makes no third-party requests and works offline.
- Recognise the six letters with movement.
- An evaluation set of real recordings in CI.
