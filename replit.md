# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Toppers Coaching Center (`artifacts/toppers-coaching`)
- **Type**: React + Vite (frontend-only, no backend)
- **Preview Path**: `/`
- **Tech**: React, Tailwind CSS v4, Framer Motion, Recharts, Wouter (routing)
- **Pages**: Home, About, Faculty, Results, Student Success, Testimonials, Programs, Contact
- **Brand Colors**: Blue #1E3A8A, Red #E53935, Yellow #FFD54F→#FFB300, Sky Blue #2196F3, Green #43A047
- **Design**: Glassmorphism header, animated hero with floating icons, animated counters, results charts

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
