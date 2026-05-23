# Multi-stage build for automation agent
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./

# Copy packages
COPY packages ./packages

# Copy apps/automation-agent
COPY apps/automation-agent ./apps/automation-agent

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages
RUN pnpm run typecheck:packages

# Stage 2: Runtime with Playwright
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Install dumb-init and Node.js runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
  dumb-init \
  curl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Create non-root user
RUN groupadd -g 1001 nodejs
RUN useradd -r -u 1001 -g nodejs nodejs

# Copy built application from builder
COPY --from=builder /app/apps/automation-agent ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Create storage directory
RUN mkdir -p /app/storage/reports /app/storage/logs
RUN chown -R nodejs:nodejs /app

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check (curl to check if process is running)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:9999/health || exit 1 || true

# Expose metrics port
EXPOSE 9999

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "--import", "tsx", "./src/index.ts"]
