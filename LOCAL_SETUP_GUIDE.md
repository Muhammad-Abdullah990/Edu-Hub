# Local Development Setup Guide – Toppers Coaching Center

**Updated:** May 17, 2026  
**Platform:** Edu-OS – Complete Student Management & Automation System

---

## Prerequisites

### Required Software

| Software | Version | Purpose | Download |
|----------|---------|---------|----------|
| **Node.js** | 18.17+ | JavaScript runtime | https://nodejs.org |
| **pnpm** | 8.0+ | Workspace package manager | `npm install -g pnpm` |
| **Docker Desktop** | Latest | PostgreSQL & Redis containers | https://docker.com/products/docker-desktop |
| **Git** | Any | Version control | https://git-scm.com |
| **PostgreSQL** | 16+ | (Optional if using Docker) | https://postgresql.org |

### System Requirements

- **OS:** Windows 10/11, macOS 11+, Linux (Ubuntu 20.04+)
- **RAM:** Minimum 8GB (16GB recommended)
- **Disk Space:** 5GB free
- **CPU:** 2+ cores

### Skills Assumed

- Basic command-line (Terminal / PowerShell)
- Git operations (clone, commit, push)
- Understanding of environment variables

---

## Part 1: Environment Setup (Windows)

### 1.1 Install Node.js & pnpm

#### Step 1: Install Node.js (LTS)

1. Visit https://nodejs.org
2. Download **LTS version** (18.17 or newer)
3. Run installer, accept defaults, click "Install"
4. Restart PowerShell/Terminal

**Verify:**
```powershell
node --version     # Should output: v18.17.0 or higher
npm --version      # Should output: 9.x or higher
```

#### Step 2: Install pnpm

```powershell
npm install -g pnpm
pnpm --version     # Should output: 8.0 or higher
```

### 1.2 Install Docker Desktop

#### Step 1: Download & Install

1. Visit https://docker.com/products/docker-desktop
2. Download for **Windows**
3. Run installer, accept defaults
4. **Restart your computer**

#### Step 2: Enable WSL 2 (Windows Subsystem for Linux)

**If using Windows 10/11:**

```powershell
# Run as Administrator
wsl --install

# Restart computer when complete
wsl --list --verbose
```

#### Step 3: Verify Docker Installation

```powershell
docker --version    # Should output: Docker version 24.x.x
docker run hello-world  # Should output: "Hello from Docker!"
```

---

## Part 2: Clone & Install Project

### 2.1 Clone Repository

```powershell
cd $env:USERPROFILE\Downloads

git clone https://github.com/YOUR_REPO_URL.git "Edu-Hub"

cd Edu-Hub

ls    # Should show: package.json, pnpm-workspace.yaml, apps/, packages/, services/
```

**If already cloned:**
```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"
```

### 2.2 Install All Dependencies

```powershell
pnpm install
```

**Expected Output:**
```
...
 installed 500+ packages
```

**Troubleshooting:**
- If `pnpm install` fails with "EACCES", try: `pnpm install --no-verify`
- If workspace not recognized: `pnpm install --recursive`

### 2.3 Create Environment Files

#### .env.development (API Server)

Create file: `services/api-server/.env.development`

```env
# Core Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database Configuration
DATABASE_URL=postgres://toppers:changeme@localhost:5432/toppers_db

# Redis Configuration (optional for basic login)
REDIS_URL=redis://localhost:6379

# JWT Security (MUST be at least 32 characters)
JWT_ACCESS_SECRET=this-is-my-super-secret-access-token-key-that-is-32-chars
JWT_REFRESH_SECRET=this-is-my-super-secret-refresh-token-key-thats-32-chars

# Token Expiry
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# CORS Origins
CORS_ORIGIN=http://localhost:3001,http://localhost:4173,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMSITE=lax
```

#### .env.development (Frontend)

Create file: `apps/marketing-web/.env.development`

```env
# Frontend API Configuration
VITE_API_BASE_URL=http://localhost:3000
```

---

## Part 3: Start Services

### 3.1 Start PostgreSQL & Redis (Docker)

**Option A: Using Docker Compose (Recommended)**

```powershell
# Start both services in the background
docker compose up -d postgres redis

# Check status
docker compose ps

# Expected output:
# NAME                 STATUS
# toppers-postgres     Up (healthy)
# toppers-redis        Up (healthy)
```

**Option B: Start Individually**

```powershell
# PostgreSQL only
docker compose up -d postgres

# Redis only (later)
docker compose up -d redis
```

**Verify PostgreSQL is Running:**

```powershell
docker logs toppers-postgres
# Should show: "database system is ready to accept connections"
```

### 3.2 Initialize Database Schema

```powershell
# Set environment variable for this session
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"

# Create database (may already exist)
psql -U toppers -h localhost -c "CREATE DATABASE toppers_db;" 2>$null

# Push schema to database
pnpm --filter @toppers/db push

# Seed default roles, permissions, and admin user
pnpm --filter @toppers/db seed:auth
```

**Expected Output:**
```
✓ Created table: roles
✓ Created table: permissions
✓ Created table: users
... (30+ more tables)
✓ Seed complete
✓ Admin user created: info@topperscoachingcenter.com
```

### 3.3 Start API Server

**In a NEW PowerShell terminal:**

```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"

$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
$env:NODE_ENV = "development"
$env:PORT = 3000

pnpm --filter @toppers/api-server dev
```

**Expected Startup Logs:**
```
[12:34:56.789] INFO (PID): Initializing background jobs...
[12:34:57.123] WARN: Redis unavailable - background job queue disabled
[12:34:57.456] INFO: Server listening on port 3000
[12:34:57.789] INFO: Health checks completed
```

**Verify Health:**
```powershell
# In another terminal
curl http://localhost:3000/api/health | ConvertFrom-Json | ConvertTo-Json

# Expected response:
{
  "status": "degraded",
  "checks": {
    "database": { "status": "ok" },
    "redis": { "status": "warning" },
    "process": { "status": "ok" }
  }
}
```

### 3.4 Start Frontend Development Server

**In a NEW PowerShell terminal:**

```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"

pnpm --filter @toppers/marketing-web dev
```

**Expected Output:**
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Verify:** Open browser to `http://localhost:5173`

---

## Part 4: Test Login

### Step 1: Navigate to Login Page

```
http://localhost:5173/auth/login
```

### Step 2: Enter Credentials

- **Email:** `info@topperscoachingcenter.com`
- **Password:** `ChangeMe123!`

### Step 3: Expected Behavior

✅ Login succeeds  
✅ Redirected to dashboard  
✅ Welcome message displayed  
✅ Session created  

### Step 4: Troubleshooting Login

**Error: "Service Unavailable (503)"**
```
→ PostgreSQL not running: docker compose up -d postgres
→ Database not initialized: pnpm --filter @toppers/db push
```

**Error: "Invalid Credentials"**
```
→ Email address incorrect (case-sensitive)
→ Password: Check if seed ran: pnpm --filter @toppers/db seed:auth
→ Admin table empty: Run seed again
```

**Error: "Cannot reach API"**
```
→ API server not running: Check terminal where pnpm dev is running
→ Wrong port: Verify .env.development has PORT=3000
→ Network issue: Try http://127.0.0.1:3000/api/health directly
```

---

## Part 5: Complete Terminal Command Reference

### Quick Start (All-in-One)

```powershell
# 1. Navigate to project
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"

# 2. Set environment
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"

# 3. Start Docker services
docker compose up -d postgres redis

# 4. Install dependencies
pnpm install

# 5. Initialize database
pnpm --filter @toppers/db push
pnpm --filter @toppers/db seed:auth

# 6. Start API (in new terminal)
pnpm --filter @toppers/api-server dev

# 7. Start Frontend (in another new terminal)
pnpm --filter @toppers/marketing-web dev

# 8. Open browser
# → http://localhost:5173
# → Login: info@topperscoachingcenter.com / ChangeMe123!
```

### Daily Development Startup

**Terminal 1 (Services):**
```powershell
docker compose up -d postgres redis
docker compose ps
```

**Terminal 2 (API Server):**
```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
pnpm --filter @toppers/api-server dev
```

**Terminal 3 (Frontend):**
```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"
pnpm --filter @toppers/marketing-web dev
```

**Terminal 4 (Optional: Automation Agent):**
```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
pnpm --filter @toppers/automation-agent dev
```

### Useful Commands

```powershell
# Database Operations
pnpm --filter @toppers/db push              # Apply schema changes
pnpm --filter @toppers/db seed:auth         # Seed default data
pnpm --filter @toppers/db drop              # ⚠️ DESTRUCTIVE: Delete all tables

# Testing
pnpm --filter @toppers/auth test            # Run auth package tests
pnpm --filter @toppers/validations test     # Run validation tests

# Building
pnpm --filter @toppers/api-server build     # Build for production
pnpm --filter @toppers/marketing-web build  # Build frontend

# Type Checking
pnpm --filter @toppers/api-server typecheck

# Linting
pnpm lint

# Clean All
pnpm clean:all
```

---

## Part 6: Project Structure

### Quick Navigation

```
Edu-Hub/
├── services/
│   └── api-server/           ← API backend (Express, port 3000)
│       ├── src/
│       │   ├── index.ts       ← Server entry point
│       │   ├── modules/       ← Feature modules (auth, students, etc.)
│       │   └── lib/           ← Shared services
│       └── .env.development
│
├── apps/
│   ├── marketing-web/         ← Frontend (React/Vite, port 5173)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   └── pages/
│   │   └── .env.development
│   ├── admin-dashboard/       ← Admin interface
│   ├── automation-agent/      ← Background jobs & WhatsApp
│   └── student-portal/
│
├── packages/
│   ├── db/                    ← Database schema & seeds
│   │   ├── src/schema/        ← Table definitions
│   │   │   ├── auth.ts
│   │   │   ├── school.ts
│   │   │   ├── analytics.ts
│   │   │   └── automation.ts
│   │   └── src/seeds/         ← Data seeding
│   ├── api-client/            ← Generated API client
│   ├── auth/                  ← Auth logic & types
│   ├── validations/           ← Zod schemas
│   ├── configs/               ← Shared configs
│   └── ui/                    ← Shared UI components
│
├── docker-compose.yml         ← Service orchestration
├── pnpm-workspace.yaml        ← Workspace config
└── DATABASE_SETUP_REPORT.md   ← Full database documentation
```

---

## Part 7: Backend Architecture Overview

### Request Flow

```
1. Client (Browser)
   ↓
2. Frontend App (http://localhost:5173)
   ↓ HTTP POST /api/auth/login
3. Vite Dev Proxy → Routes to http://localhost:3000
   ↓
4. Express Server (http://localhost:3000)
   ↓
5. Auth Controller → Auth Service → Auth Repository
   ↓
6. Drizzle ORM Query Builder
   ↓
7. PostgreSQL Database
   ↓ JSON Response
8. Frontend displays result
```

### Service Architecture

```
API Server (services/api-server/)
├── Auth Module
│   ├── Controller (route handlers)
│   ├── Service (business logic)
│   ├── Repository (database queries)
│   └── Middleware (JWT verification)
│
├── Students Module
├── Performance Module
├── Analytics Module
├── PDF Generation Service
│
├── Background Jobs (Queue Service)
│   └── Redis-backed Bull Queue
│
├── Health Check Service
│   └── Database, Redis, filesystem status
│
└── Error Handling
    └── Global error middleware
```

---

## Part 8: Frontend Architecture Overview

### Frontend Structure

```
apps/marketing-web/
├── src/
│   ├── main.tsx              ← Entry point + API base URL setup
│   ├── App.tsx               ← Root component
│   ├── pages/
│   │   ├── login.tsx         ← Login page (Toppers branding)
│   │   ├── dashboard.tsx
│   │   └── ...
│   ├── components/           ← Reusable UI components
│   ├── hooks/                ← Custom React hooks
│   ├── lib/                  ← Utilities
│   ├── auth/                 ← Auth context & utilities
│   └── data/                 ← Seed data, config
│
├── vite.config.ts            ← Vite config (includes API proxy)
├── .env.development          ← VITE_API_BASE_URL
└── tsconfig.json
```

### Key Components

- **Login Page:** Password field with visibility toggle (eye icon)
- **Navbar:** WhatsApp contact button (z-index fixed)
- **Branding:** "Toppers Sign In" heading
- **API Integration:** Configured base URL pointing to API server

---

## Part 9: Troubleshooting

### Issue: "Docker daemon not running"

```powershell
# Solution: Start Docker Desktop app manually or via terminal
docker start  # Not a valid command; use Docker Desktop app

# Or check if running
docker info   # If fails, Docker isn't running
```

### Issue: "pnpm: command not found"

```powershell
# Solution: Reinstall pnpm globally
npm uninstall -g pnpm
npm install -g pnpm
pnpm --version
```

### Issue: "PostgreSQL connection refused"

```powershell
# Check if container is running
docker ps | grep postgres

# If not running, start it
docker compose up -d postgres

# Check logs
docker compose logs postgres

# Verify port 5432 is listening
netstat -an | findstr 5432
```

### Issue: "Cannot find module '@toppers/db'"

```powershell
# Solution: Reinstall with workspace resolution
pnpm install --recursive
pnpm --filter @toppers/api-server install
```

### Issue: "JWT secret must be at least 32 characters"

```powershell
# Solution: Update .env.development file
# Ensure JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are ≥32 chars

# Example:
JWT_ACCESS_SECRET=this-is-a-32-character-secret-key-minimum
JWT_REFRESH_SECRET=another-32-character-secret-key-minimum
```

### Issue: "Relations not found when logging in"

```powershell
# Solution: Schema not pushed to database
pnpm --filter @toppers/db push

# Then verify
psql -U toppers -h localhost -d toppers_db -c "\dt"
# Should list 30+ tables
```

---

## Part 10: Monitoring & Logs

### View API Server Logs

```powershell
# While running in terminal:
# Logs display in real-time

# View logs after container restart:
docker logs toppers-api --tail 100

# Follow logs in real-time:
docker logs -f toppers-api
```

### View Database Logs

```powershell
docker logs toppers-postgres --tail 50
```

### Check Health Endpoint

```powershell
# Terminal or browser
curl http://localhost:3000/api/health | ConvertFrom-Json | ConvertTo-Json

# PowerShell formatted output
Invoke-WebRequest http://localhost:3000/api/health | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

### Database Query Monitor

```powershell
# Connect to PostgreSQL directly
psql -U toppers -h localhost -d toppers_db

# Useful queries:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM audit_logs;
SELECT * FROM users WHERE email = 'info@topperscoachingcenter.com';
SELECT * FROM roles;
```

---

## Part 11: Hot Reload & Development Features

### Frontend Hot Module Replacement (HMR)

- Save any `.tsx` or `.css` file in `apps/marketing-web/src/`
- Browser auto-reloads immediately
- State is preserved when possible

### API Server Hot Reload

- Requires `tsx` watcher (included in dev setup)
- Save `.ts` file in `services/api-server/src/`
- Server automatically restarts
- Long-running processes may not fully restart

### Database Schema Hot Sync

```powershell
# After modifying packages/db/src/schema/*.ts:
pnpm --filter @toppers/db push
# Changes applied immediately to local database
```

---

## Part 12: Production Deployment Notes

### Environment Variables for Production

```bash
# .env.production
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn

DATABASE_URL=postgres://prod_user:strong_password@prod-db.example.com:5432/toppers_db
REDIS_URL=redis://prod-redis.example.com:6379

JWT_ACCESS_SECRET=a-different-very-long-secret-key-for-production-min-32-chars
JWT_REFRESH_SECRET=another-different-very-long-secret-key-for-prod-min-32-chars

CORS_ORIGIN=https://app.topperscoaching.com,https://admin.topperscoaching.com
```

### Build Commands

```bash
# API Server
pnpm --filter @toppers/api-server build
# Output: dist/index.mjs (~4.7MB)

# Frontend
pnpm --filter @toppers/marketing-web build
# Output: dist/ (static files)
```

### Docker Deployment

```bash
# Use existing Dockerfile configs:
docker build -f services/api-server/Dockerfile -t toppers-api:1.0.0 .
docker build -f apps/marketing-web/Dockerfile -t toppers-web:1.0.0 .

# Or use docker-compose for multi-service deploy:
docker compose -f docker-compose.prod.yml up -d
```

---

## Conclusion

You now have a **fully functional development environment** for the Toppers Coaching Center platform.

### What You Can Do

✅ Log in to the system  
✅ Manage student data  
✅ View attendance and performance  
✅ Generate reports  
✅ Automate WhatsApp communications  
✅ Analyze analytics  

### Next Steps

1. **Explore the Admin Dashboard** → `http://localhost:3001`
2. **Test Student Portal** → `http://localhost:5173/student`
3. **Review Database Schema** → See `DATABASE_SETUP_REPORT.md`
4. **Read API Documentation** → See `services/api-server/openapi/`
5. **Check Sample Data** → Run `pnpm --filter @toppers/db seed:sample` (when available)

### Need Help?

- **Database Issues:** See `DATABASE_SETUP_REPORT.md`
- **API Errors:** Check `services/api-server/src/` logs
- **Frontend Issues:** Check browser console + browser DevTools
- **Docker Issues:** `docker compose logs <service>`

---

**Happy coding! 🚀**

