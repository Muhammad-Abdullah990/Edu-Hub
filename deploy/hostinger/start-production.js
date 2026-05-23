#!/usr/bin/env node

/**
 * Production start script for Hostinger Business Web Hosting
 * 
 * HOW TO USE:
 * 1. Upload this file to your Hostinger hosting root
 * 2. In hPanel → Node.js Selector → Set main file to this script
 * 3. Ensure environment variables are set (use .env or hPanel env vars)
 * 
 * This script:
 * - Loads environment from .env.production or process env vars
 * - Verifies all required env vars are present
 * - Starts the production API server
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Configuration
const API_SERVER_DIR = path.join(__dirname, 'api-server');
const ENV_FILE = path.join(__dirname, '.env.production');

// Load environment file if it exists
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const eqIndex = trimmed.indexOf('=');
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      
      // Remove surrounding quotes if present
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

// Validate required environment variables
const REQUIRED_VARS = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CORS_ORIGIN',
];

const missing = REQUIRED_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('ERROR: Missing required environment variables:');
  missing.forEach(v => console.error(`  - ${v}`));
  console.error('\nSet them in .env.production or in hPanel environment variables.');
  process.exit(1);
}

// Set defaults if not provided
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'warn';

// Process REDIS_URL compatibility: Upstash may return REST-style URLs
// Convert if needed (Upstash REST URL to Redis protocol)
if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('https://')) {
  console.warn('WARNING: REDIS_URL appears to be an HTTPS REST URL, not a Redis protocol URL.');
  console.warn('Please use the format: redis://default:PASSWORD@HOST:6379');
  console.warn('You can find this in Upstash Console → Redis Details → UPSTASH_REDIS_URL');
}

// Verify API server directory exists
if (!fs.existsSync(API_SERVER_DIR)) {
  console.error(`ERROR: API server directory not found at ${API_SERVER_DIR}`);
  console.error('Make sure you have extracted the api-server folder in the deployment root.');
  process.exit(1);
}

console.log('==========================================');
console.log('  Toppers Coaching - Production Server');
console.log('==========================================');
console.log(`  NODE_ENV:      ${process.env.NODE_ENV}`);
console.log(`  PORT:          ${process.env.PORT}`);
console.log(`  LOG_LEVEL:     ${process.env.LOG_LEVEL}`);
console.log(`  API Server:    ${API_SERVER_DIR}`);
console.log('==========================================\n');

// Find the API server entry point (esbuild outputs .mjs files)
const candidates = [
  path.join(API_SERVER_DIR, 'dist', 'index.mjs'),
  path.join(API_SERVER_DIR, 'dist', 'index.js'),
  path.join(API_SERVER_DIR, 'dist', 'src', 'index.js'),
];

let entryPoint = candidates.find(candidate => fs.existsSync(candidate));

if (!entryPoint) {
  console.error('ERROR: Could not find API server entry point.');
  console.error('Looked for:');
  candidates.forEach(c => console.error(`  - ${c}`));
  console.error('\nPlease ensure the API server has been built with:');
  console.error('  cd api-server && npm run build');
  process.exit(1);
}

console.log(`Starting API server from: ${entryPoint}\n`);

const server = spawn('node', [entryPoint], {
  cwd: API_SERVER_DIR,
  env: process.env,
  stdio: ['pipe', 'inherit', 'inherit'],
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  console.log(`Server exited with code ${code}, signal ${signal}`);
  process.exit(code || 0);
});

// Handle shutdown signals
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  server.kill('SIGTERM');
});