# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Dependencias para better-sqlite3 (módulo nativo)
RUN apk add --no-cache python3 make g++

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/data

RUN addgroup -g 1001 -S app && \
    adduser -S app -u 1001 && \
    chown -R app:app /app

USER app

CMD ["node", "src/index.js"]
