#!/usr/bin/env node

/**
 * TOPPERS COACHING - PRODUCTION SERVER
 * Serves frontend static files + proxies /api/* to the API bundle
 *
 * CRITICAL: Must listen immediately (no top-level await!)
 */

import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Load .env.production
try {
  const envFile = path.join(__dirname, '.env.production');
  if (fs.existsSync(envFile)) {
    const text = fs.readFileSync(envFile, 'utf-8');
    for (const line of text.split('\n')) {
      const s = line.trim();
      if (s && !s.startsWith('#') && s.includes('=')) {
        const i = s.indexOf('=');
        const k = s.slice(0, i).trim();
        let v = s.slice(i + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
} catch {}

const PORT = parseInt(process.env.PORT || '3000', 10);
const FRONTEND_DIR = path.join(__dirname, 'public_html');
const API_ENTRY = path.join(__dirname, 'dist', 'index.mjs');

let apiHandler = null;
let apiReady = false;

// Try to import the API module directly
async function loadAPI() {
  try {
    if (fs.existsSync(API_ENTRY)) {
      // Set API to run on a different internal port
      process.env.PORT = String(PORT + 1);
      const mod = await import(API_ENTRY);
      // Wait a moment for the API to start
      await new Promise(r => setTimeout(r, 1000));
      apiReady = true;
      console.log('[server] API module loaded successfully');
    }
  } catch (e) {
    console.warn('[server] API module could not be loaded:', e.message);
    console.warn('[server] Running in frontend-only mode');
  }
}

// Start loading API in background
loadAPI().catch(() => {
  console.warn('[server] API load failed, running frontend-only');
});

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  const r = req.url || '/';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    });
    return res.end();
  }

  // Health check — ALWAYS responds immediately
  if (r === '/health' || r === '/live' || r === '/ready') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'toppers-coaching',
      api: apiReady ? 'running' : 'starting',
    }));
  }

  // API proxy
  if (r.startsWith('/api/') || r === '/api' || r.startsWith('/metrics') || r.startsWith('/admin/')) {
    if (!apiReady) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'API starting', retryIn: 3 }));
    }
    const opts = {
      hostname: '127.0.0.1', port: PORT + 1, path: r, method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${PORT + 1}` },
    };
    delete opts.headers.connection;
    const proxy = http.request(opts, (pr) => {
      const h = { ...pr.headers };
      h['Access-Control-Allow-Origin'] = '*';
      res.writeHead(pr.statusCode || 200, h);
      pr.pipe(res);
    });
    proxy.on('error', () => { if (!res.headersSent) { res.writeHead(502); res.end('API proxy error'); } });
    return req.pipe(proxy);
  }

  // Static files
  const filePath = r === '/' ? '/index.html' : r.split('?')[0];
  const fullPath = path.join(FRONTEND_DIR, filePath);

  if (!fullPath.startsWith(FRONTEND_DIR)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.stat(fullPath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public,max-age=3600' });
      fs.createReadStream(fullPath).pipe(res);
    } else {
      // SPA fallback
      const indexPath = path.join(FRONTEND_DIR, 'index.html');
      fs.stat(indexPath, (err2) => {
        if (err2) { res.writeHead(404); return res.end('Page not found'); }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(indexPath).pipe(res);
      });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] HTTP listening on port ${PORT}`);
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});