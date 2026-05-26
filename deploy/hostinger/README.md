# Hostinger Deployment — Frontend (Static Files Only)

## What Goes on Hostinger

Hostinger hosts the static frontend files. The API backend runs separately on Render.

## Deployment Steps

### 1. Build the Frontend (Run on your local machine)

```bash
# Build marketing website
cd apps/marketing-web
pnpm run build

# The output is in: apps/marketing-web/dist/
```

### 2. Upload to Hostinger (via FTP or File Manager)

Upload the contents of `apps/marketing-web/dist/` to Hostinger's `public_html/` directory.

### 3. Configure API Proxy

Create or edit `public_html/.htaccess` with the provided `.htaccess` file content.

### 4. Set Environment Variables on Render Dashboard

Go to https://dashboard.render.com -> your-api-service -> Environment

Set these secret values:
- `DATABASE_URL` = Your Supabase PostgreSQL connection string
- `REDIS_URL` = Your Upstash Redis connection string
- `JWT_ACCESS_SECRET` = A random 32+ character string
- `JWT_REFRESH_SECRET` = A different random 32+ character string

### 5. Architecture

```
Browser → https://topperscoachingcenter.com
              ↓
         Hostinger (static HTML)
              ↓
    Frontend JS calls /api/*  (via .htaccess proxy)
              ↓
    .htaccess proxies to Render
              ↓
    https://toppers-api.onrender.com/api/*
              ↓
         Express API Server
              ↓
    ┌────────┴────────┐
  Supabase          Upstash
 (PostgreSQL)       (Redis)
```

### Important Notes

- The frontend is a Single Page Application (SPA) — Hostinger needs the `.htaccess` to rewrite all routes to `index.html`
- API calls from the frontend are proxied through `.htaccess` to the Render API
- The Automation Agent runs as a separate background worker on Render