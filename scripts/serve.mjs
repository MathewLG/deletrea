import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {Record<string, string>} */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.task': 'application/octet-stream',
};

const defaultRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

/**
 * @param {{port?: number, root?: string}} [options]
 * @returns {import('node:http').Server}
 */
export function startServer({ port = 4173, root = defaultRoot } = {}) {
  const base = resolve(root);

  const server = createServer(async (req, res) => {
    /** @param {number} status @param {string} text */
    const fail = (status, text) => {
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(text);
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') return fail(405, 'Method not allowed');

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    } catch {
      return fail(400, 'Bad request');
    }
    if (pathname.includes('\0')) return fail(400, 'Bad request');

    // Resolve against the root and require the result to stay inside it.
    let file = resolve(join(base, normalize(pathname)));
    if (file !== base && !file.startsWith(base + sep)) return fail(403, 'Forbidden');

    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, {
        'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
        'Content-Length': body.length,
        'Cache-Control': 'no-store',
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      fail(404, 'Not found');
    }
  });

  server.listen(port);
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 4173;
  const server = startServer({ port });
  server.on('listening', () => console.log(`Deletrea: http://localhost:${port}/`));
  server.on('error', (err) => {
    console.error(err.message);
    process.exit(1);
  });
}
