# Build stage
FROM --platform=$BUILDPLATFORM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lock ./

# Install dependencies (ignore-scripts to skip native builds in builder)
RUN bun install --frozen-lockfile --ignore-scripts

# Copy source files
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN bun run build

# Production stage
FROM --platform=$TARGETPLATFORM oven/bun:1-alpine

WORKDIR /app

# Install build tools and npm (needed for rebuilding native modules)
RUN apk add --no-cache python3 make g++ npm

# Copy package files
COPY package.json ./
COPY bun.lock ./

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Install dependencies and rebuild native modules for target platform
RUN bun install --frozen-lockfile && \
    npm rebuild bcrypt --build-from-source

EXPOSE 8080

CMD ["bun", "run", "dist/app.js"]
