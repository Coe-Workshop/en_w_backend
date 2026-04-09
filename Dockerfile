FROM oven/bun:1-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ npm

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile && \
    npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 8080

CMD ["bun", "run", "src/app.ts"]