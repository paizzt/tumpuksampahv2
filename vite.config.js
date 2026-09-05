import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

const plugins = [react()];
if (process.env.DISABLE_CLOUDFLARE !== 'true') {
  plugins.push(cloudflare());
}

// https://vite.dev/config/
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    ...plugins,
    {
      name: 'admin-route-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/admin' || req.url === '/admin/') {
            const html = fs.readFileSync(path.resolve('.', 'index.html'), 'utf-8');
            res.setHeader('Content-Type', 'text/html');
            server.transformIndexHtml(req.url, html).then(transformed => {
                res.end(transformed);
            });
            return;
          }
          next();
        });
      }
    }
  ],
})