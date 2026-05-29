# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack gym tracking app: a NestJS REST API (`apps/api`) backed by PostgreSQL via Prisma, and a Next.js 16 frontend (`apps/web`). The two apps are **independently managed** — each has its own `package.json` and `node_modules`. Docker Compose (`apps/docker/`) orchestrates them together.

## Development Commands

All commands must be run from within the respective app directory.

### API (`apps/api`)

```bash
npm run start:dev      # start with file watching
npm run build          # compile TS → dist/
npm run lint           # eslint --fix
npm run test:unit      # jest unit tests
npm run test:e2e       # jest e2e tests
npm run test:cov       # jest with coverage
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
npx prisma migrate dev       # create and apply a new migration
npx prisma migrate deploy    # apply existing migrations (used in prod)
npx prisma studio            # open Prisma Studio UI
npx prisma generate          # regenerate client after schema changes
```

## Environment Variables

**API** (`apps/api/.env`):
- `DATABASE_URL` — pooled Postgres connection string
- `DIRECT_URL` — direct Postgres connection (used by Prisma for migrations)
- `FRONTEND_URL` — CORS allowed origin
- `PORT` — defaults to `4000`

**Web** (`apps/web/.env.local`):
- `NEXT_PUBLIC_API_URL` — base URL for the API (defaults to `http://localhost:4000`)

## Architecture

### Backend (NestJS)

```
apps/api/src/
├── main.ts                 # bootstrap: CORS, global prefix, port
├── app.module.ts           # root module — imports PrismaModule, ExercisesModule, WorkoutsModule
├── modules/
│   ├── exercises/          # ExercisesController + ExercisesService (CRUD)
│   └── workouts/           # WorkoutsController + WorkoutsService (CRUD + date aggregation)
└── providers/prisma/       # PrismaService with pg.Pool connection pooling
```

The Prisma service uses `@prisma/adapter-pg` with a `pg.Pool` for connection pooling — important for serverless/Render deployments. Both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) are required in the schema.

### Database Schema

```prisma
model Exercise {
  id        String    @id @default(uuid())
  name      String    @unique
  equipment String
  workouts  Workout[]
  createdAt DateTime  @default(now())
}

model Workout {
  id         String   @id @default(uuid())
  exerciseId String
  exercise   Exercise @relation(fields: [exerciseId], references: [id])
  weight     Float
  reps       Int
  opinion    String
  createdAt  DateTime @default(now())
}
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
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
│   ├── page.tsx            # Home: log a new workout
│   ├── history/page.tsx    # History: view/edit/delete past workouts by date
│   ├── success/            # Post-submit confirmation
│   └── layout.tsx
├── components/
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
    ├── types.ts            # shared TS types: Exercise, Workout, Equipment
    └── routes.ts           # API route constants
```

State management is handled exclusively via custom hooks — no global state library. The `ApiClient` in `lib/api.ts` is the single point of contact with the backend.

## Deployment Targets

- **API** → Render (containerized)
- **Web** → Vercel (Next.js standalone output)
- **Database** → Supabase (PostgreSQL)

In production, `DIRECT_URL` must point to a direct (non-pooled) connection for migrations to work; `DATABASE_URL` uses the pooled connection for runtime queries.

## Roadmap Context

The project is actively evolving:
- **v1.5** — routine system (log multiple exercises per session)
- **v2.0** — Supabase auth + user isolation
- **v2.5** — analytics dashboards, social features
- **v3.0** — AI-powered progressive overload suggestions
