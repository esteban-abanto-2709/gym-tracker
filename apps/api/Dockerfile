# Base: pnpm via corepack (uses version pinned in package.json)
FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./


# Build stage
FROM base AS builder

RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --frozen-lockfile --store-dir /var/cache/pnpm

# Copy source code and config files
COPY . .

# Build the application (generates the Prisma Client first; dummy URLs only satisfy prisma.config.ts)
RUN DIRECT_URL="postgresql://dummy:5432/dummy" DATABASE_URL="postgresql://dummy:5432/dummy" pnpm run build


# Production dependencies only (the pnpm store lives in a cache mount, never in a layer)
FROM base AS prod-deps

RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --prod --frozen-lockfile --store-dir /var/cache/pnpm


# Production stage: plain node, no pnpm, only what runs
FROM node:22-alpine AS runner

WORKDIR /app

COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Start the application with automatic migrations (local prisma CLI, no network needed)
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
