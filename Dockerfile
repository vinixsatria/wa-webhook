# syntax=docker/dockerfile:1

# ---------- 1. Dependencies (semua, termasuk dev untuk build) ----------
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ---------- 2. Build (kompilasi TypeScript ke dist/) ----------
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# ---------- 3. Production dependencies saja ----------
FROM oven/bun:1 AS prod-deps
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# ---------- 4. Runtime ----------
FROM oven/bun:1-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=15002

# Hanya salin kebutuhan runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json proxy.json ./

EXPOSE 15002

# Bun menjalankan hasil build CommonJS dari NestJS
CMD ["bun", "dist/main.js"]

