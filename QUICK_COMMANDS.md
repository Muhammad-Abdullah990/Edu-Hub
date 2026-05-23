# Quick Command Reference – Toppers Coaching Center

**Copy-paste commands for common development tasks.**

---

## 🚀 Quick Start (First Time)

```powershell
# 1. Navigate to project
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"

# 2. Start Docker services
docker compose up -d postgres redis

# 3. Install dependencies
pnpm install

# 4. Initialize database
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
pnpm --filter @toppers/db push
pnpm --filter @toppers/db seed:auth

# 5. Start API server (open new terminal tab)
pnpm --filter @toppers/api-server dev

# 6. Start frontend (open another new terminal tab)
pnpm --filter @toppers/marketing-web dev

# 7. Open browser
# http://localhost:5173
# Login: info@topperscoachingcenter.com / ChangeMe123!
```

---

## 🔄 Daily Startup (Services Already Installed)

### Terminal 1: Docker Services

```powershell
docker compose up -d postgres redis
docker compose ps
```

### Terminal 2: API Server

```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
pnpm --filter @toppers/api-server dev
```

### Terminal 3: Frontend

```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"
pnpm --filter @toppers/marketing-web dev
```

---

## 🛑 Shutdown

```powershell
# Stop all services
docker compose down

# Stop just containers (keep data)
docker compose stop

# Remove Docker containers & volumes (⚠️ deletes data)
docker compose down -v
```

---

## 🗄️ Database Operations

### Initialize New Database

```powershell
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
pnpm --filter @toppers/db push
pnpm --filter @toppers/db seed:auth
```

### View All Tables

```powershell
psql -U toppers -h localhost -d toppers_db -c "\dt"
```

### Count Users

```powershell
psql -U toppers -h localhost -d toppers_db -c "SELECT COUNT(*) FROM users;"
```

### View Admin User

```powershell
psql -U toppers -h localhost -d toppers_db -c "SELECT id, name, email, status FROM users LIMIT 5;"
```

### Reset Database (⚠️ DESTRUCTIVE)

```powershell
pnpm --filter @toppers/db drop
pnpm --filter @toppers/db push
pnpm --filter @toppers/db seed:auth
```

### Push Schema Changes After Editing Schema Files

```powershell
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
pnpm --filter @toppers/db push
```

---

## 🧪 Testing & Validation

### Run Auth Tests

```powershell
pnpm --filter @toppers/auth test
```

### Run Validation Tests

```powershell
pnpm --filter @toppers/validations test
```

### Type Check API Server

```powershell
pnpm --filter @toppers/api-server typecheck
```

### Lint All Code

```powershell
pnpm lint
```

---

## 🏗️ Building for Production

### Build API Server

```powershell
pnpm --filter @toppers/api-server build
# Output: services/api-server/dist/index.mjs
```

### Build Frontend

```powershell
pnpm --filter @toppers/marketing-web build
# Output: apps/marketing-web/dist/
```

### Build Admin Dashboard

```powershell
pnpm --filter @toppers/admin-dashboard build
# Output: apps/admin-dashboard/dist/
```

---

## 🔍 Monitoring & Debugging

### Check API Health

```powershell
curl http://localhost:3000/api/health
# Or in PowerShell:
Invoke-WebRequest http://localhost:3000/api/health | ConvertFrom-Json
```

### View API Logs (Container)

```powershell
docker logs toppers-api --tail 50
docker logs -f toppers-api  # Follow in real-time
```

### View Database Logs

```powershell
docker logs toppers-postgres --tail 30
```

### View Redis Logs

```powershell
docker logs toppers-redis --tail 20
```

### Connect to PostgreSQL Directly

```powershell
psql -U toppers -h localhost -d toppers_db
# Then type SQL commands:
# \dt              - list tables
# SELECT * FROM users;
# \q               - quit
```

---

## 📦 Dependency Management

### Install New Package (API Server)

```powershell
pnpm --filter @toppers/api-server add express-validator
```

### Install Dev Dependency

```powershell
pnpm --filter @toppers/api-server add -D @types/express
```

### Install in All Workspaces

```powershell
pnpm add lodash --recursive
```

### Update All Dependencies

```powershell
pnpm update --recursive
```

### View Dependency Tree

```powershell
pnpm ls --depth 2
```

---

## 🔐 Environment Variables

### Set DATABASE_URL for Current Session

```powershell
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
```

### View All Environment Variables

```powershell
Get-ChildItem Env: | Sort-Object Name
```

### Unset Environment Variable

```powershell
Remove-Item Env:DATABASE_URL
```

---

## 🎯 Common Workflows

### Test Login After Changes

```powershell
# 1. Make changes to auth code
# 2. Save and wait for hot reload
# 3. Browser: http://localhost:5173/auth/login
# 4. Email: info@topperscoachingcenter.com
# 5. Password: ChangeMe123!
# 6. Check console for errors
```

### Add New Table to Schema

```powershell
# 1. Edit packages/db/src/schema/school.ts (or appropriate file)
# 2. Add new table definition
# 3. Export from packages/db/src/schema/index.ts
# 4. Run push:
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
pnpm --filter @toppers/db push
# 5. Verify table exists:
psql -U toppers -h localhost -d toppers_db -c "\dt"
```

### Debug API Endpoint

```powershell
# 1. Check API logs in terminal running pnpm dev
# 2. Add console.log() statements in service/controller
# 3. Use curl to test endpoint:
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"info@topperscoachingcenter.com","password":"ChangeMe123!"}'
```

### Verify Docker Services

```powershell
# See all running containers
docker ps

# See all images
docker images

# Inspect specific container
docker inspect toppers-postgres

# Get container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' toppers-postgres
```

---

## 🧹 Clean & Rebuild

### Clean Build Artifacts

```powershell
pnpm clean
```

### Clean All (Remove node_modules)

```powershell
pnpm clean:all
```

### Fresh Rebuild

```powershell
pnpm install
pnpm --filter @toppers/api-server build
pnpm --filter @toppers/marketing-web build
```

---

## 💾 Backup & Restore

### Backup PostgreSQL Database

```powershell
docker exec toppers-postgres pg_dump -U toppers toppers_db > backup.sql
```

### Restore from Backup

```powershell
docker exec -i toppers-postgres psql -U toppers toppers_db < backup.sql
```

### Export Database as CSV

```powershell
psql -U toppers -h localhost -d toppers_db -c "COPY users TO STDOUT WITH CSV HEADER" > users.csv
```

---

## 🐛 Troubleshooting Quick Fixes

### API Won't Start: "Cannot find module"

```powershell
pnpm install --recursive
pnpm --filter @toppers/api-server install
```

### Frontend Won't Start: "ENOENT: no such file"

```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"
pnpm install
```

### Login Fails: "Service Unavailable"

```powershell
# Check database is running
docker compose ps

# Check schema exists
psql -U toppers -h localhost -d toppers_db -c "SELECT COUNT(*) FROM users;"

# If error "relation does not exist", run:
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
pnpm --filter @toppers/db push
```

### Port Already in Use

```powershell
# Find process using port 3000
Get-Process | Where-Object {$_.Port -eq 3000}

# Or kill port:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Docker Daemon Not Running

```powershell
# Start Docker Desktop app, or:
wsl --install  # Then restart computer
```

---

## 📋 Useful Command Combinations

### Full Clean Start

```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"
docker compose down -v
docker compose up -d postgres redis
pnpm install
$env:DATABASE_URL = "postgres://toppers:changeme@localhost:5432/toppers_db"
pnpm --filter @toppers/db push
pnpm --filter @toppers/db seed:auth
pnpm --filter @toppers/api-server dev
# In new terminal:
pnpm --filter @toppers/marketing-web dev
```

### Verify All Systems

```powershell
# Check Node
node --version
pnpm --version

# Check Docker
docker --version
docker compose ps

# Check Database
psql -U toppers -h localhost -d toppers_db -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public';"

# Check API
curl http://localhost:3000/api/health
```

### Full Rebuild Everything

```powershell
cd "C:\Users\abdul\Downloads\ReplitExport-topperscoaching (1)\Edu-Hub"
pnpm clean:all
pnpm install
pnpm --filter @toppers/api-server build
pnpm --filter @toppers/marketing-web build
```

---

## 🔗 Useful URLs (When Running Locally)

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Login & main app |
| **API Health** | http://localhost:3000/api/health | Server status |
| **API Docs** | http://localhost:3000/api/openapi.json | OpenAPI spec |
| **Admin Dashboard** | http://localhost:3001 | Admin panel (if running) |
| **PostgreSQL** | localhost:5432 | Database |
| **Redis** | localhost:6379 | Cache & queues |
| **Docker Desktop** | http://localhost:6443 | Kubernetes (if enabled) |

---

## 📞 Support

**For errors:**
1. Check `DATABASE_SETUP_REPORT.md` for database issues
2. Check `LOCAL_SETUP_GUIDE.md` for full setup troubleshooting
3. Check API logs: `docker logs toppers-api`
4. Check terminal output where pnpm dev is running

**For code issues:**
1. Check TypeScript errors: `pnpm --filter @toppers/api-server typecheck`
2. Check lint errors: `pnpm lint`
3. Check test output: `pnpm test`

---

**Last Updated:** May 17, 2026

