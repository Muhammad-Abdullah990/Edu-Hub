# 🚀 Hostinger Deployment Guide - Toppers Coaching System

## Overview

This guide walks you through deploying the Toppers Coaching educational management system to **Hostinger Business Web Hosting** using:
- **Supabase** (free PostgreSQL database)
- **Upstash** (free Redis for background jobs)
- **Hostinger Node.js Selector** (for API server)
- **Hostinger File Manager** (for frontend static files)

---

## 📋 Prerequisites

| Item | Where to Get It |
|------|----------------|
| **Hostinger Business Web Hosting** | Already purchased ✅ |
| **Supabase Account** (free) | [https://supabase.com](https://supabase.com) |
| **Upstash Account** (free) | [https://upstash.com](https://upstash.com) |
| **Your Domain** | Already configured ✅ |
| **JWT Secrets** | Generate below |

---

## 📦 Deployment Package Contents

This folder (`deploy/hostinger/`) contains everything you need:

```
deploy/hostinger/
├── server.js                  ← Main entry point (handles frontend + API proxy)
├── start-production.js        ← Lightweight alternative (API-only, no frontend)
├── .env.production            ← Environment configuration (fill with your values)
├── database/
│   └── setup.sql              ← Run this on Supabase SQL Editor
└── DEPLOYMENT_GUIDE.md        ← This file
```

> **Which entry point to use?**
> - **`server.js`** (recommended): Handles both frontend static files AND API proxying on a single port. Simplest setup.
> - **`start-production.js`**: API-only mode. Use if Hostinger's Apache handles your frontend files directly.

---

## Step 1: Set Up External Services

### 1.1 Create Supabase Database (PostgreSQL)

1. Go to [https://supabase.com](https://supabase.com) and sign up (or log in)
2. Click **"New project"**
3. Enter:
   - **Name**: `toppers-coaching`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Mumbai or Singapore)
4. Wait 1-2 minutes for the database to provision
5. In the Supabase dashboard, go to **Project Settings** → **Database**
6. Find the **Connection string** (URI format): `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
7. **COPY THIS** - you'll need it for `.env.production`

### 1.2 Create Upstash Redis

1. Go to [https://upstash.com](https://upstash.com) and sign up (or log in)
2. Click **"Create Database"**
3. Enter:
   - **Database Name**: `toppers-queue`
   - **Region**: Same as Supabase region
   - **Tier**: Free (30MB - enough for this system)
4. Once created, click on the database
5. Copy the **UPSTASH_REDIS_REST_URL** — format: `redis://default:[PASSWORD]@[REGION].[ID].upstash.io:6379`
6. **COPY THIS** - you'll need it for `.env.production`

### 1.3 Generate JWT Secrets

Run this command in your terminal (or use an online generator):

```bash
# On Windows (PowerShell):
$bytes = [byte[]]::new(32); [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); [Convert]::ToBase64String($bytes)

# Or use any password generator that creates 32+ character strings
```

Save these values:
- `JWT_ACCESS_SECRET` = (32+ random characters)
- `JWT_REFRESH_SECRET` = (32+ random characters, different from above)

---

## Step 2: Run Database Migrations

1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Open the file `deploy/hostinger/database/setup.sql` from this package
5. **Copy and paste** the entire contents into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. **Verify success**: You should see no errors. The SQL uses `IF NOT EXISTS` so it's safe to run multiple times.

> **Note**: The core schema (users, students, attendance, etc.) will be auto-created the first time the API server starts using Drizzle ORM's schema push.

---

## Step 3: Configure Environment Variables

1. Open `deploy/hostinger/.env.production` in a text editor
2. Replace each placeholder value:

| Variable | Replace With |
|----------|-------------|
| `postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DATABASE_NAME]` | Your Supabase connection string from Step 1.1 |
| `[REPLACE_WITH_SUPABASE_DB_USER]` | Usually `postgres` |
| `[REPLACE_WITH_SUPABASE_DB_PASSWORD]` | The password you set for Supabase |
| `[REPLACE_WITH_SUPABASE_DB_NAME]` | Usually `postgres` |
| `redis://[USERNAME]:[PASSWORD]@[HOST]:6379` | Your Upstash Redis URL from Step 1.2 |
| `[REPLACE_WITH_32_CHAR_ACCESS_SECRET]` | JWT Access Secret from Step 1.3 |
| `[REPLACE_WITH_32_CHAR_REFRESH_SECRET]` | JWT Refresh Secret from Step 1.3 |
| `https://yourdomain.com` | Your actual domain (e.g., `https://topperscoachingcenter.com`) |
| `https://admin.yourdomain.com` | Optional: admin subdomain |

---

## Step 4: Upload Files to Hostinger

### 4.1 Connect to Hostinger via FTP/SFTP

1. Log into your **Hostinger hPanel**
2. Go to **Files** → **FTP Accounts**
3. Create a new FTP account or use the default one
4. Connect using an FTP client like **FileZilla** or **WinSCP**

### 4.2 Upload Frontend Files

#### Main Website (Marketing Site)
1. Locate the `apps/marketing-web/dist/` folder in the project
2. Upload **all contents** of this folder to `public_html/`
3. Confirm `public_html/index.html` exists

#### Admin Dashboard
1. The admin dashboard is embedded in the marketing web app
2. No separate upload needed ✅

#### Student Portal
1. The student portal is embedded in the marketing web app
2. No separate upload needed ✅

### 4.3 Upload API Server

1. Upload the entire `services/api-server/` folder to a directory OUTSIDE public_html (e.g., `api-server/` or `node-app/api-server/`)
2. Upload `deploy/hostinger/start-production.js` to the root (same level as `public_html/`)
3. Upload `deploy/hostinger/.env.production` to the same directory as `start-production.js`

**Final file structure on Hostinger:**
```
/home/youruser/
├── public_html/                  ← Frontend files
│   ├── index.html
│   ├── assets/
│   ├── .htaccess                 ← Already included (SPA routing)
│   └── ...
├── api-server/                   ← Backend API
│   ├── dist/
│   │   ├── index.mjs
│   │   └── ...
│   ├── node_modules/             ← Install via SSH or upload
│   ├── package.json
│   └── ...
├── start-production.js           ← Node.js entry point
├── .env.production               ← Environment config
└── storage/                      ← Created automatically
    ├── logs/
    └── reports/
```

---

## Step 5: Configure Hostinger Node.js

### 5.1 Enable Node.js

1. Log into **Hostinger hPanel**
2. Go to **Advanced** → **Node.js Selector**
3. Click **"Select"** next to your domain
4. Choose:
   - **Node.js Version**: 20.x or 22.x (latest LTS)
   - **Application Path**: `/` (or the directory where you uploaded `start-production.js`)
   - **Application Entry Point**: `start-production.js`
   - **Application Mode**: **Production**
5. Click **"Save"**

### 5.2 Install Dependencies (if needed)

If the API server node_modules weren't uploaded, you need to install them:

1. Hostinger provides SSH access
2. Go to **Advanced** → **SSH Access** in hPanel, enable it
3. Connect via SSH:
   ```bash
   ssh youruser@yourdomain.com
   cd api-server
   npm install --omit=dev
   ```
4. Or use Hostinger's **Node.js Selector** → **Install Dependencies** button

### 5.3 Set Environment Variables

Some variables can be set via hPanel:
1. In **Node.js Selector**, look for **Environment Variables** section
2. Add each required variable from `.env.production`
3. Save

---

## Step 6: Start the Application

1. In Hostinger **Node.js Selector**, click **"Start"** or **"Restart"**
2. Wait 10-15 seconds
3. Check the **Application Log** for any errors

### 6.1 Verify the API is Running

Open your browser and visit:
```
https://yourdomain.com/health
```

You should see a JSON response like:
```json
{"status":"ok","timestamp":"2026-05-22T..."}
```

### 6.2 Verify the Frontend

Visit your domain:
```
https://yourdomain.com
```

The marketing website should load properly.

---

## Step 7: Create Initial Admin User (Seeding)

The API server will auto-create the database schema on first run. To seed initial data:

1. SSH into Hostinger (or use Node.js Selector console)
2. Run:
   ```bash
   cd api-server
   npm run seed:all
   ```

Or execute the seed SQL via Supabase SQL Editor (open `packages/db/src/seeds/auth.ts` and `packages/db/src/seeds/students.ts` to see the data).

---

## 🔄 Setting Up Cron Jobs (Background Tasks)

Hostinger Business Web Hosting supports cron jobs:

1. Go to **Advanced** → **Cron Jobs**
2. Add a new cron job:
   - **Command**: `cd /home/youruser/api-server && node dist/cron/analytics.mjs`
   - **Schedule**: Daily at 2:00 AM (`0 2 * * *`)

> **Note**: BullMQ (background job queue) works with the Upstash Redis connection. If Redis is configured, the queue system runs automatically when the API server starts. The cron job above is for analytics aggregation as a fallback.

---

## 🔒 SSL/HTTPS Setup

Hostinger automatically provides free SSL via Let's Encrypt:

1. Go to **SSL** in hPanel
2. Click **"Install"** next to your domain
3. Wait 1-2 minutes for the certificate to be issued
4. Force HTTPS redirect:
   - Go to **Hosting Settings** → **Force HTTPS** → **Enable**

---

## 📊 Monitoring & Maintenance

### Health Endpoints
| Endpoint | Purpose |
|----------|---------|
| `https://yourdomain.com/health` | Full system health check |
| `https://yourdomain.com/ready` | Readiness probe |
| `https://yourdomain.com/live` | Liveness probe |
| `https://yourdomain.com/metrics` | Prometheus metrics |
| `https://yourdomain.com/admin/dashboard` | Operational dashboard |

### Logs
- View logs in Hostinger **Node.js Selector** → **Logs**
- Or connect via SSH and check: `cat storage/logs/*.log`

### Updating the Application
1. Make changes locally
2. Rebuild: `pnpm build`
3. Upload updated files via FTP/SSH
4. Restart via **Node.js Selector** → **Restart**

---

## ❌ Troubleshooting

### "Cannot find module" error
- Run `npm install --omit=dev` in the api-server directory
- Make sure `node_modules` exists

### Database connection refused
- Check Supabase: go to **Project Settings** → **Database** → ensure connection is active
- Verify the `DATABASE_URL` in `.env.production` is correct
- Check if the Supabase project has **IPv4** connectivity enabled (Settings → Database → Connection pooling)

### Redis connection failed
- Check Upstash: ensure the database is running
- Verify `REDIS_URL` is correct
- The system will start in degraded mode (no background jobs) if Redis is down

### Frontend shows blank page
- Check browser console for errors
- Verify `.htaccess` exists in `public_html/`
- Ensure CORS_ORIGIN in `.env.production` matches your domain

### Port already in use
- Change `PORT` in `.env.production` to a different value (e.g., 3001)
- Update the Node.js Selector application entry point

---

## 🎯 Summary Checklist

- [ ] Supabase project created and database running
- [ ] Upstash Redis database created
- [ ] JWT secrets generated (32+ chars each)
- [ ] `.env.production` filled with real values
- [ ] Database migrations run on Supabase SQL Editor
- [ ] Frontend files uploaded to `public_html/`
- [ ] API server uploaded to `api-server/`
- [ ] Dependencies installed (`npm install --omit=dev`)
- [ ] Node.js configured in hPanel
- [ ] Application started successfully
- [ ] Health endpoint responding (`/health`)
- [ ] SSL certificate installed
- [ ] Website loads in browser

---

## 📞 Need Help?

If you encounter any issues during deployment:
1. Check the **Application Logs** in Hostinger Node.js Selector
2. Run `node start-production.js` via SSH to see detailed error output
3. Contact me for assistance with specific error messages