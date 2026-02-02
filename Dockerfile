# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Dependencias para better-sqlite3 (módulo nativo) + gosu para entrypoint
RUN apk add --no-cache python3 make g++ wget && \
    wget -q -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/1.16/gosu-amd64" && \
    chmod +x /usr/local/bin/gosu && \
    apk del wget

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/data && \
    addgroup -g 1001 -S app && \
    adduser -S app -u 1001 && \
    chown -R app:app /app

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
