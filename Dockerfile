FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY bun.lock ./
RUN bun ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src

RUN bun run build

FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
COPY bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["bun", "run", "dist/app.js"]
