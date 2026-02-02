# Build stage: instalar dependencias (better-sqlite3 compila nativo)
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Herramientas para compilar better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* bun.lock* ./
RUN bun install

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/data

RUN addgroup -g 1001 -S app && \
    adduser -S app -u 1001 && \
    chown -R app:app /app

USER app

CMD ["bun", "run", "src/index.js"]
