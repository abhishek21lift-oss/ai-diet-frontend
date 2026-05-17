# ── Build stage ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ── Production stage ─────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
