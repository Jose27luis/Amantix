import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, resolve } from 'node:path';
import bootstrap from './src/main.server';

const SIN_CACHE = 'no-cache';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.disable('x-powered-by');
  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.get('**', (req, res, next) => {
    if (req.path.length > 1 && req.path.endsWith('/')) {
      const consulta = req.originalUrl.slice(req.path.length);
      res.redirect(301, req.path.replace(/\/+$/, '') + consulta);
      return;
    }
    next();
  });

  server.get(
    '**',
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
      redirect: false,
      setHeaders: (respuesta, ruta) => {
        if (ruta.endsWith('.html') || ruta.endsWith('robots.txt')) {
          respuesta.setHeader('Cache-Control', SIN_CACHE);
        }
      },
    }),
  );

  server.get('**', (req, res, next) => {
    const prerenderizada = normalize(join(browserDistFolder, req.path, 'index.html'));

    if (prerenderizada.startsWith(browserDistFolder) && existsSync(prerenderizada)) {
      res.setHeader('Cache-Control', SIN_CACHE);
      res.sendFile(prerenderizada);
      return;
    }

    next();
  });

  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => {
        res.setHeader('Cache-Control', SIN_CACHE);
        res.send(html);
      })
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
