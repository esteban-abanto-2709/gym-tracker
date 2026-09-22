# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack (uses version pinned in package.json)
RUN corepack enable

# Copy manifest + lockfile + pnpm settings first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and config files
COPY . .

# Build the application (generates the Prisma Client first; dummy URLs only satisfy prisma.config.ts)
RUN DIRECT_URL="postgresql://dummy:5432/dummy" DATABASE_URL="postgresql://dummy:5432/dummy" pnpm run build


# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Enable pnpm via corepack (uses version pinned in package.json)
RUN corepack enable

# Copy manifest + lockfile + pnpm settings
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built assets and prisma from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Start the application with automatic migrations (local prisma CLI, no network needed)
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
