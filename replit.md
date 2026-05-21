# Workspace

## Overview

pnpm workspace monorepo using TypeScript. The repo is now organized around `apps`, `services`, and `packages` so each surface can scale independently.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval from the API service OpenAPI contract
- **Build**: Vite for frontend apps, esbuild for the API service

## Apps

### Marketing Web (`apps/marketing-web`)
- **Type**: React + Vite
- **Preview Path**: `/`
- **Tech**: React, Tailwind CSS v4, Framer Motion, Recharts, Wouter

### API Service (`services/api-server`)
- **Type**: Express service
- **Base Path**: `/api`
- **Contract**: `services/api-server/openapi/openapi.yaml`

## Key Commands

- `pnpm run typecheck` - full workspace typecheck
- `pnpm run build` - typecheck and build every workspace that exposes a build script
- `pnpm run codegen` - regenerate the API client and validation schemas from the service OpenAPI contract
- `pnpm --filter @toppers/db run push` - push database schema changes in development
- `pnpm --filter @toppers/api-server run dev` - build and start the API service
