#!/usr/bin/env node

/**
 * Production server for Hostinger Business Web Hosting
 * 
 * This is a unified HTTP server that:
 * 1. Serves the frontend static files (marketing site)
 * 2. Proxies /api/* requests to the API server (running on internal port 3001)
 * 3. Handles health checks, metrics, and dashboard endpoints
 * 
 * HOW TO USE:
 * 1. Upload this file to your Hostinger hosting root (alongside .env.production)
 * 2. In hPanel → Node.js Selector → Set main file to this script
 * 3. Ensure environment variables are set in .env.production
 * 4. Start the application
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

// Configuration
const ROOT_DIR = __dirname;
const FRONTEND_DIR = path.join(ROOT_DIR, 'public_html');
const API_SERVER_DIR = path.join(ROOT_DIR, 'api-server');
const ENV_FILE = path.join(ROOT_DIR, '.env.production');

// --- Load environment file if it exists ---
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const eqIndex = trimmed.indexOf('=');
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// --- Validate required environment variables ---
const REQUIRED_VARS = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'CORS_ORIGIN'];
const missing = REQUIRED_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('ERROR: Missing required environment variables:');
  missing.forEach(v => console.error(`  - ${v}`));
  console.error('Set them in .env.production or hPanel environment variables.');
  process.exit(1);
}

// --- Set defaults ---
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'warn';

const PORT = process.env.PORT;
const INTERNAL_API_PORT = 3001;

console.log('==========================================');
console.log('  Toppers Coaching - Production Server');
console.log('==========================================');
console.log(`  NODE_ENV:        ${process.env.NODE_ENV}`);
console.log(`  Public Port:     ${PORT}`);
console.log(`  Internal API:    ${INTERNAL_API_PORT}`);
console.log(`  LOG_LEVEL:       ${process.env.LOG_LEVEL}`);
console.log(`  Frontend:        ${FRONTEND_DIR}`);
console.log(`  API Server:      ${API_SERVER_DIR}`);
console.log('==========================================\n');

// --- Start the API server as a child process on internal port ---
const candidates = [
  path.join(API_SERVER_DIR, 'dist', 'index.mjs'),
  path.join(API_SERVER_DIR, 'dist', 'index.js'),
];

let apiEntry = candidates.find(c => fs.existsSync(c));

if (!apiEntry) {
  console.error('ERROR: API server entry point not found.');
  console.error('Looked in:');
  candidates.forEach(c => console.error(`  ${c}`));
  process.exit(1);
}

const apiProcess = spawn('node', [apiEntry], {
  cwd: API_SERVER_DIR,
  env: { ...process.env, PORT: String(INTERNAL_API_PORT) },
  stdio: ['pipe', 'inherit', 'inherit'],
});

apiProcess.on('error', (err) => {
  console.error('ERROR: Failed to start API server:', err);
});

// --- MIME types for static files ---
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
};

function serveStaticFile(res, filePath) {
  return new Promise((resolve) => {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
      if (err) {
        resolve(false);
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
      resolve(true);
    });
  });
}

function serve404(res) {
  const custom404 = path.join(FRONTEND_DIR, '404.html');
  if (fs.existsSync(custom404)) {
    serveStaticFile(res, custom404);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
}

function serveIndexHtml(res) {
  const indexPath = path.join(FRONTEND_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    serveStaticFile(res, indexPath);
  } else {
    serve404(res);
  }
}

/**
 * Proxy request to the internal API server
 */
function proxyToAPI(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: INTERNAL_API_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers },
  };

  // Remove hop-by-hop headers
  delete options.headers['host'];
  delete options.headers['connection'];

  const proxyReq = http.request(options, (proxyRes) => {
    // Build response headers with CORS
    const responseHeaders = { ...proxyRes.headers };
    responseHeaders['Access-Control-Allow-Origin'] = process.env.CORS_ORIGIN || '*';
    responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    responseHeaders['Access-Control-Allow-Credentials'] = 'true';

    res.writeHead(proxyRes.statusCode, responseHeaders);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API server unavailable', status: 'degraded' }));
  });

  req.pipe(proxyReq);
}

// --- Create the main unified HTTP server ---
const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }

  // Route: Proxy API and system endpoints to the API server
  if (req.url.startsWith('/api') || 
      req.url === '/health' || 
      req.url === '/ready' || 
      req.url === '/live' ||
      req.url === '/metrics' || 
      req.url.startsWith('/admin/')) {
    return proxyToAPI(req, res);
  }

  // Route: Serve static frontend files
  const requestedPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(FRONTEND_DIR, requestedPath);

  fs.stat(filePath, async (err, stats) => {
    if (!err && stats.isFile()) {
      const served = await serveStaticFile(res, filePath);
      if (!served) serve404(res);
    } else {
      // SPA fallback: serve index.html for all other routes
      serveIndexHtml(res);
    }
  });
});

// --- Start the server ---
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server is running!`);
  console.log(`  → Website:  http://localhost:${PORT}/`);
  console.log(`  → API:      http://localhost:${PORT}/api/`);
  console.log(`  → Health:   http://localhost:${PORT}/health`);
  console.log(`  → Metrics:  http://localhost:${PORT}/metrics`);
  console.log(`  → Dashboard: http://localhost:${PORT}/admin/dashboard`);
  console.log('');
  console.log('NOTE: The API server is started as a child process on internal');
  console.log(`port ${INTERNAL_API_PORT}. This server handles both static files`);
  console.log('and API proxying on a single port. Configure your domain DNS to');
  console.log('point to Hostinger.\n');
});

// --- Graceful shutdown ---
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}, shutting down...`);
  if (apiProcess && !apiProcess.killed) {
    apiProcess.kill('SIGTERM');
  }
  server.close(() => {
    console.log('Server closed gracefully.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced exit after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));