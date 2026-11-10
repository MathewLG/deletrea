# Deletrea

Deletrea es una aplicación web para practicar el alfabeto manual de la Lengua de Señas Mexicana (LSM). Te muestra una letra como una mano dibujada, sigue tu mano con la cámara y te dice qué dedo corregir.

Sitio publicado: https://mathewlg.github.io/deletrea/ (pendiente de activar).

## Estado del proyecto

**Léelo antes de usarla para aprender.**

- Las señas **no han sido validadas por personas Sordas usuarias de LSM**. Salen de fuentes publicadas y pueden tener errores. Ver [`docs/VALIDATION.md`](docs/VALIDATION.md).
- Los umbrales de reconocimiento se ajustaron con un modelo de mano sintético, **no con grabaciones de manos reales**.
- Las letras con movimiento se muestran, pero **no se reconocen**.
- Una mano abierta y relajada, con los dedos un poco separados, puede pasar como B.
- Una mano plana que muestra el dorso a la cámara, hecha con la otra mano, también puede pasar como B: con la mano plana no se puede saber por la forma qué mano es, así que se prueban las dos.
- El rastreador de manos y su modelo se descargan de una CDN la primera vez que se usa la cámara.
- El alfabeto manual no es la lengua. La LSM es mucho más que deletrear.

## Privacidad

- Los cuadros de video no salen de tu dispositivo. No hay servidor propio.
- `index.html` incluye una Content-Security-Policy que limita a qué hosts puede conectarse la página: solo al propio sitio, a `cdn.jsdelivr.net` (la biblioteca) y a `storage.googleapis.com` (el modelo). Puedes comprobarlo tú mismo.
- MediaPipe está fijado en `@mediapipe/tasks-vision@0.10.33`. Las versiones 1.x posteriores indican que envían métricas de uso a Google; la 0.10.33 no trae ese aviso, y la CSP bloquea otros hosts de todos modos. Ver sección 2 de [`docs/SPEC.md`](docs/SPEC.md).
- No hay scripts ni estilos en línea.

## Cómo ejecutarla

```
npm run serve
```

Abre http://localhost:4173/ (cambia el puerto con la variable `PORT`). La cámara solo funciona en `localhost` o por HTTPS. Sin cámara puedes usar el modo demostración. No hace falta instalar nada para servir el sitio.

## Cómo probarla

```
npm install        # la primera vez
npm run check      # lint, typecheck, pruebas unitarias y contraste
npm run test:e2e   # pruebas en navegador (Chromium, tamaño de teléfono)
```

Si ya tienes Chrome, `CHROME_PATH=/ruta/a/chrome npm run test:e2e` lo usa en lugar del Chromium de Playwright.

Todavía no hay `package-lock.json`. La primera vez que alguien ejecute `npm install` en local debe generarlo y subirlo al repositorio. Mientras tanto, la integración continua usa `npm install`.

## Publicación

El sitio se publica en GitHub Pages con `.github/workflows/pages.yml`, que corre solo cuando la integración continua pasa en `main` y publica ese mismo commit. Antes de la primera publicación hay que hacer un paso a mano, una sola vez: en el repositorio, Settings, Pages, Source, elige "GitHub Actions".

## Estructura

```
index.html        página única, con la CSP
src/core/         lógica pura (modelo de mano, rasgos, comparación)
src/signs/        datos del alfabeto
src/render/       dibujo de la mano en canvas
src/sources/      cámara y fuente sintética
src/practice/     controlador de la práctica
src/screens/      una pantalla por módulo
src/ui/           ayudas del DOM, textos, rutas
styles/           CSS
assets/           tipografía
scripts/          servidor local y revisión de contraste
tests/unit/       pruebas con node:test
tests/e2e/        pruebas con Playwright
docs/             plan, especificación, investigación y validación
```

## Cómo se hizo

Claude Fable 5.2 planeó, especificó y diseñó el proyecto. Agentes Opus y Sonnet lo implementaron, y el dueño del repositorio lo dirigió. El plan está en [`docs/PLAN.md`](docs/PLAN.md) y la especificación técnica en [`docs/SPEC.md`](docs/SPEC.md).

## Ayuda a validar las señas

Si usas la LSM o eres intérprete certificado, tu revisión es lo que más necesita este proyecto. Mira [`docs/VALIDATION.md`](docs/VALIDATION.md).

## Licencias

- Código: MIT, ver [`LICENSE`](LICENSE).
- Atkinson Hyperlegible Next: SIL Open Font License, ver [`assets/fonts/OFL.txt`](assets/fonts/OFL.txt).
- MediaPipe: Apache 2.0.

---

# English

Deletrea is a web app for practising the manual alphabet of Mexican Sign Language (LSM). It shows a letter as a drawn hand, tracks your hand with the camera and tells you which finger to fix. Live URL: https://mathewlg.github.io/deletrea/ (not yet enabled).

**Status, please read:**

- The signs have **not been validated by Deaf LSM users**. They come from published sources and may be wrong. See [`docs/VALIDATION.md`](docs/VALIDATION.md) (in Spanish).
- Matching thresholds were tuned on a synthetic hand model, not on recordings of real hands.
- Letters with movement are shown but not recognised.
- The hand tracker and its model load from a CDN the first time the camera is used.
- The manual alphabet is not the language.

**Privacy:** there is no backend, video frames stay on your device, and the Content-Security-Policy in `index.html` only allows connections to the site itself, `cdn.jsdelivr.net` and `storage.googleapis.com`. MediaPipe is pinned to 0.10.33 (see `docs/SPEC.md` section 2).

**Run:** `npm run serve`, then open http://localhost:4173/. The camera needs `localhost` or HTTPS.

**Test:** `npm install`, then `npm run check` and `npm run test:e2e`. No lockfile is committed yet: generate and commit `package-lock.json` the first time you run `npm install` locally.

**How it was built:** planned, specified and designed by Claude Fable 5.2, implemented by Opus and Sonnet agents, directed by the repository owner. See [`docs/PLAN.md`](docs/PLAN.md), [`docs/SPEC.md`](docs/SPEC.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

**Licences:** code MIT; Atkinson Hyperlegible Next under the SIL Open Font License; MediaPipe under Apache 2.0.
