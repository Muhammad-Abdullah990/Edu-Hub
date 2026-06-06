# Toppers Coaching Center (Edu-Hub) - Deployment Package

## Package Contents

```
deploy-package/
├── server.js                         # Main entry point (Node.js Selector)
├── .env.production                   # Environment variables (PRE-CONFIGURED)
├── dist/                             # Frontend static files (Vite build)
│   ├── index.html                    # Main SPA entry
│   ├── assets/                       # CSS, JS, images, fonts
│   └── favicon.*                     # Favicon files
├── server/                           # Backend API server (esbuild bundle)
│   ├── package.json                  # Runtime dependencies
│   ├── dist/                         # Built API server (index.mjs + worker files)
│   │   ├── index.mjs               # Main API bundle (~4.8MB)
│   │   ├── pino-worker.mjs         # Pino worker
│   │   ├── pino-file.mjs           # Pino file transport
│   │   └── pino-pretty.mjs         # Pino pretty transport
│   ├── automation-dist/              # Automation agent (TypeScript compiled)
│   ├── templates/                    # PDF/Email templates (automation)
│   ├── openapi/                      # OpenAPI schema files
│   └── storage/                      # Created at runtime (logs, reports)
├── db/                               # Database migrations
│   └── migrations/                   # All Drizzle SQL migrations
└── README.md                         # This file
```

## Modules & Functionality Included

### Frontend (dist/) - React SPA built with Vite
- **Marketing Website**: Landing pages, course info, testimonials, contact
- **Admin Dashboard** (embedded): Full ERP system with:
  - Student Management (CRUD, enrollment, fees tracking)
  - Attendance Management (daily records, leave tracking)
  - Fee Management (collections, dues, receipts)
  - Analytics Dashboard (charts, reports, metrics)
  - Parent Communication (WhatsApp integration)
  - User Management (roles, permissions)
- **Student Portal** (embedded): Student login, results, attendance view
- **Authentication System**: Login/register, JWT-based auth, role-based access
- **UI Components**: Tailwind CSS, Radix UI, Framer Motion animations
- **SEO**: Meta tags, sitemap.xml, robots.txt, OpenGraph tags

### Backend API (server/) - Express 5 + Drizzle ORM
- **REST API**: Full CRUD for all entities
- **Authentication**: JWT access + refresh tokens, Argon2 password hashing
- **Authorization**: Role-based access control (admin, teacher, student, parent)
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **Redis**: Upstash for caching and BullMQ job queues
- **Background Jobs**: BullMQ workers for email, SMS, analytics
- **PDF Generation**: Student reports, fee receipts, attendance sheets
- **WhatsApp Integration**: Cloud API for parent notifications
- **Analytics Engine**: Aggregated reports and dashboards
- **AI Features**: Open AI SDK integration (@ai-sdk)
- **Monitoring**: Health checks, Prometheus metrics, logging (Pino)
- **Security**: Helmet, rate limiting, CORS, input validation (Zod)

### Automation Agent (server/automation-dist/)
- **Scheduled Tasks**: Node-cron based schedulers
- **Workflows**: Monthly reports, attendance summaries, fee reminders
- **PDF Generator**: Automated report generation with Puppeteer
- **Templates**: HTML templates for emails and PDFs

---

## Deployment Steps (Hostinger Business Hosting)

### Prerequisites
- **Hostinger Business Plan** with Node.js Selector enabled
- **Supabase** PostgreSQL database (already configured)
- **Upstash** Redis database (already configured)
- **JWT Secrets** (already configured)

### 1. Upload Files
Upload the **entire contents** of this deploy-package folder to your Hostinger hosting root directory.

```
/home/yourusername/
├── server.js              # <-- Node.js Selector entry point
├── .env.production        # <-- Already configured with your credentials
├── dist/                  # <-- Frontend files
├── server/                # <-- Backend API + Automation
├── db/                    # <-- Database migrations
└── storage/               # <-- Created automatically at runtime
```

### 2. Install Dependencies
Connect via SSH or use Hostinger Terminal:
```bash
cd server
npm install --omit=dev
```

### 3. Configure Node.js in hPanel
1. Go to **hPanel → Advanced → Node.js Selector**
2. Select your domain
3. Set:
   - **Node.js Version**: 22.x
   - **Application Entry Point**: `server.js`
   - **Application Mode**: Production
   - **Package Manager**: npm
4. **Save**

### 4. Set Environment Variables (in hPanel)
In **Node.js Selector → Environment Variables**, add these 5 required variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres:Toppers%402026!@db.qxggcmjcrwhsueyrgizm.supabase.co:5432/postgres` |
| `REDIS_URL` | `redis://default:gQAAAAAAAgrBAAIgcDE1MWM0YzUyOGRhYzI0MTQ3ODBjYzkzZjRlYWQyYmVhNA@factual-raptor-133825.upstash.io:6379` |
| `JWT_ACCESS_SECRET` | `iQFCV3mwOzC151vNRVeWfNmwMM/jC4YevL18M6cBHz4=` |
| `JWT_REFRESH_SECRET` | `//y+9dqmdXWHyyVPRi8iAMMmOAxdwoSAsPJVpy+9o7g=` |
| `CORS_ORIGIN` | `https://topperscoachingcenter.com` |

> **Note**: These values are also pre-configured in `.env.production`. The server loads them automatically.

### 5. Run Database Migrations
Connect to your Supabase SQL Editor and run the migrations in `db/migrations/` folder **in order**.

### 6. Start the Application
Click **Start** in Node.js Selector.

### 7. Verify Deployment
- **Website**: https://topperscoachingcenter.com/
- **Health Check**: https://topperscoachingcenter.com/health
- **API**: https://topperscoachingcenter.com/api/
- **Dashboard**: https://topperscoachingcenter.com/admin/dashboard

### Default Admin Login
- **Email**: info@topperscoachingcenter.com
- **Password**: Admin@123

---

## Architecture

```
Browser
  │
  ▼
https://topperscoachingcenter.com
  │
  ▼
┌─────────────────────────────┐
│  Hostinger Node.js Server   │  server.js (port 3000)
│  ┌─────────────────────────┐│
│  │  Static File Server     ││  dist/ (Vite-built React SPA)
│  │  (/, /about, /contact...)│
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │  API Proxy              ││  /api/* → localhost:3001
│  │  (/api, /health, /admin)│
│  └─────────────────────────┘│
└─────────────────────────────┘
  │
  ▼ (internal, port 3001)
┌─────────────────────────────┐
│  Express 5 API Server       │  server/dist/index.mjs
│  ┌─────────────────────────┐│
│  │  Auth (JWT + Argon2)    ││
│  │  Students CRUD          ││
│  │  Attendance Tracking    ││
│  │  Fee Management         ││
│  │  Analytics Engine       ││
│  │  WhatsApp Integration   ││
│  │  PDF Generation         ││
│  │  AI Features            ││
│  └─────────────────────────┘│
└─────────────────────────────┘
  │           │
  ▼           ▼
┌─────────┐ ┌─────────┐
│Supabase │ │ Upstash │
│PostgreSQL│ │ Redis   │
└─────────┘ └─────────┘
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API server not found | Run `cd server && npm install --omit=dev` |
| Database connection failed | Verify DATABASE_URL in env vars |
| Redis connection failed | Verify REDIS_URL; system starts in degraded mode |
| Blank frontend | Check CORS_ORIGIN matches your domain |
| Port already in use | Change PORT in .env.production |