# Multi-stage Dockerfile for Tinga Tinga Safari
# Target: Google Cloud Run (Containerized Node.js 20 on port 3000)

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy application source code
COPY . .

# Build Vite client SPA and bundle server.ts to dist/server.cjs
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy runtime manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built assets and server bundle from builder
COPY --from=builder /app/dist ./dist

# Expose standard Cloud Run port
EXPOSE 3000

# Start compiled server
CMD ["node", "dist/server.cjs"]
