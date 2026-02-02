# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Dependencias para better-sqlite3
RUN apk add --no-cache python3 make g++

COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Directorio para la base de datos SQLite
RUN mkdir -p /app/data

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

CMD ["node", "src/index.js"]
