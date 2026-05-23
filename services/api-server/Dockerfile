# Multi-stage build for API server
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./

# Copy packages
COPY packages ./packages

# Copy services/api-server
COPY services/api-server ./services/api-server

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages and api-server
RUN pnpm run typecheck:packages
RUN pnpm --filter @toppers/api-server run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Install pnpm for production
RUN npm install -g pnpm

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application from builder
COPY --from=builder /app/services/api-server/dist ./dist
COPY --from=builder /app/services/api-server/package.json ./package.json

# Copy node_modules from builder (production dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
