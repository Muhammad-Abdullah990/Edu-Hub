# Multi-stage build for admin dashboard
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./

# Copy packages
COPY packages ./packages

# Copy apps/admin-dashboard
COPY apps/admin-dashboard ./apps/admin-dashboard

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build admin dashboard
RUN pnpm --filter @toppers/admin-dashboard run typecheck

# Stage 2: Serve with Node
FROM node:20-alpine

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder /app/apps/admin-dashboard/dist ./public
COPY --from=builder /app/apps/admin-dashboard/package.json ./package.json

# Simple Node HTTP server for static files
RUN npm install express compression

# Create server script
RUN echo 'const express = require("express");\nconst compression = require("compression");\nconst app = express();\napp.use(compression());\napp.use(express.static("/app/public"));\napp.get("*", (req, res) => res.sendFile("/app/public/index.html"));\napp.listen(3001, "0.0.0.0", () => console.log("Dashboard listening on :3001"));' > server.js

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001 || exit 1

# Expose port
EXPOSE 3001

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["node", "server.js"]
