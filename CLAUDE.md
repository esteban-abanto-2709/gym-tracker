# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack gym tracking app: a NestJS REST API (`apps/api`) backed by PostgreSQL via Prisma, and a Next.js 16 frontend (`apps/web`). The two apps are **independently managed** — each has its own `package.json` and `node_modules`. Docker Compose (`apps/docker/`) orchestrates them together.

## Development Commands

All commands must be run from within the respective app directory.

### API (`apps/api`)

Uses **pnpm 11** (pinned via `packageManager` in `package.json`, managed by corepack). Requires Node.js 22+.

```bash
pnpm run start:dev     # start with file watching
pnpm run build         # compile TS → dist/
pnpm run lint          # eslint --fix
pnpm run test:unit     # jest unit tests
pnpm run test:e2e      # jest e2e tests
pnpm run test:cov      # jest with coverage
```

### Web (`apps/web`)

```bash
pnpm dev               # next dev
pnpm build             # next build
pnpm lint              # eslint check
pnpm format            # prettier --write
```

### Docker (local full-stack)

```bash
# from apps/docker/
docker compose up --build   # start postgres + api + web
docker compose down -v      # stop and remove volumes
```

Copy `apps/docker/.env.example` → `apps/docker/.env` before first run.

### Database (Prisma)

```bash
# from apps/api/
pnpm exec prisma migrate dev       # create and apply a new migration
pnpm exec prisma migrate deploy    # apply existing migrations (used in prod)
pnpm exec prisma studio            # open Prisma Studio UI
pnpm exec prisma generate          # regenerate client after schema changes
```

## Environment Variables

**API** (`apps/api/.env`):
- `DATABASE_URL` — pooled Postgres connection string
- `DIRECT_URL` — direct Postgres connection (used by Prisma for migrations)
- `FRONTEND_URL` — CORS allowed origin
- `JWT_SECRET` — secret used to sign auth JWTs (required)
- `PORT` — defaults to `4000`
- `APP_TIMEZONE` — IANA timezone for grouping/filtering workouts by local day (defaults to `America/Lima`)

**Web** (`apps/web/.env.local`):
- `API_INTERNAL_URL` — server-side target for the `/api/*` rewrite proxy (defaults to `http://localhost:4000`). The browser only ever calls the web's own origin; the Next server forwards `/api/*` to this URL, so no API URL is exposed to the client bundle.

## Architecture

### Backend (NestJS)

```
apps/api/src/
├── main.ts                 # bootstrap: ValidationPipe, cookie-parser, CORS, port
├── app.module.ts           # root module — global JwtAuthGuard + feature modules
├── modules/
│   ├── auth/               # register/login/logout/me — JWT in httpOnly cookie
│   ├── exercises/          # ExercisesController + ExercisesService (global catalog)
│   ├── workouts/           # WorkoutsController + WorkoutsService (per-user)
│   └── routines/           # RoutinesController + RoutinesService (per-user)
├── common/                 # @Public / @CurrentUser decorators, JwtAuthGuard
└── providers/prisma/       # PrismaService with pg.Pool connection pooling
```

The Prisma service uses `@prisma/adapter-pg` with a `pg.Pool` for connection pooling. Both `DATABASE_URL` and `DIRECT_URL` are required in the schema; in this self-hosted setup they point to the same in-network Postgres container.

**Auth:** every endpoint requires a valid JWT (global `JwtAuthGuard`) except those marked `@Public()` (register, login, healthz). The token rides in an httpOnly cookie; handlers read the caller via `@CurrentUser()` and scope all `Workout`/`Routine` queries to that `userId`. Exercises are a shared global catalog.

### Database Schema

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  username     String
  slug         String    @unique
  passwordHash String
  workouts     Workout[]
  routines     Routine[]
  createdAt    DateTime  @default(now())
}

model Exercise {
  id        String    @id @default(uuid())   // global shared catalog (no userId)
  name      String    @unique
  equipment String
  workouts  Workout[]
  createdAt DateTime  @default(now())
}

model Workout {
  id         String   @id @default(uuid())
  userId     String                          // owner; queries scoped to it
  user       User     @relation(fields: [userId], references: [id])
  exerciseId String
  exercise   Exercise @relation(fields: [exerciseId], references: [id])
  weight     Float
  reps       Int
  opinion    String
  createdAt  DateTime @default(now())
}
```

`Routine` also carries `userId` and is unique per `[userId, name]` (so two users can each have a "Push"). Some fields on `Workout`/`Routine` (e.g. `routineId`, `isApproximation`) are omitted here for brevity — see `apps/api/prisma/schema.prisma`.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account, set auth cookie (public) |
| POST | `/auth/login` | Log in, set auth cookie (public) |
| POST | `/auth/logout` | Clear auth cookie |
| GET | `/auth/me` | Current user |
| GET | `/exercises` | All exercises (ordered by name) |
| POST | `/exercises` | Create exercise |
| GET | `/workouts` | All workouts (optional `?date=YYYY-MM-DD` filter) |
| POST | `/workouts` | Create workout |
| PATCH | `/workouts/:id` | Update workout |
| DELETE | `/workouts/:id` | Delete workout |
| GET | `/workouts/dates` | Distinct dates that have workouts |

### Frontend (Next.js App Router)

```
apps/web/src/
├── app/
│   ├── page.tsx            # Home: hub (start routine / free day / create)
│   ├── login/, register/   # Auth pages
│   ├── history/page.tsx    # History: view/edit/delete past workouts by date
│   ├── success/            # Post-submit confirmation
│   └── layout.tsx          # wraps the app in <AuthProvider>
├── components/
│   ├── auth/               # AccountMenu (username + logout)
│   ├── exercises/          # ExerciseCombobox, CreateExerciseModal
│   ├── history/            # WorkoutCard, EditWorkoutDialog, DeleteWorkoutDialog
│   ├── layout/             # PageShell, AppHeader
│   └── ui/                 # shadcn/ui primitives (do not modify these directly)
├── hooks/
│   ├── useExercises.ts     # fetches and manages exercise list
│   ├── useWorkoutForm.ts   # form state for creating a workout
│   └── useWorkoutHistory.ts # workout history state and date filtering
└── lib/
    ├── api.ts              # ApiClient singleton (get/post/patch/delete)
    ├── auth-context.tsx    # AuthProvider + useAuth; route guard, session state
    ├── types.ts            # shared TS types: AuthUser, Exercise, Workout, Equipment
    └── routes.ts           # API route constants
```

State management is handled exclusively via custom hooks — no global state library. The `ApiClient` in `lib/api.ts` is the single point of contact with the backend. Auth lives in `lib/auth-context.tsx`: `AuthProvider` checks `/auth/me` on mount, redirects to `/login` when there's no session, and the httpOnly cookie is sent automatically on every same-origin `/api/*` call.

## Deployment Targets

The whole stack is **self-hosted** via Docker Compose on a single machine; the only thing exposed to the internet is the `web` service, through a Cloudflare Tunnel (`cloudflared` service). `api` and `postgres` stay private inside the `gym-tracker-network`.

- **API + Web + Database** → Docker Compose (`apps/docker/docker-compose.yml`)
- **Public access** → Cloudflare Tunnel (currently a quick tunnel with a random `trycloudflare.com` URL; no custom domain yet)

There is no managed cloud provider (previously Render/Vercel/Supabase — dropped). `DATABASE_URL` and `DIRECT_URL` both point to the in-network Postgres container; they are kept as two separate vars because Prisma's schema requires both, even though here they resolve to the same instance.

## Roadmap Context

The project is actively evolving:
- **v1.5** — routine system (log multiple exercises per session)
- **v2.0** — user accounts + data isolation ✅ (self-hosted JWT auth, **not** Supabase)
- **v2.5** — analytics dashboards, social features
- **v3.0** — AI-powered progressive overload suggestions
