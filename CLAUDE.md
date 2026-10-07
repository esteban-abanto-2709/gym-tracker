# CLAUDE.md

Guidance for Claude Code when working in this repository. Read this first; the
per-app READMEs hold the technical detail.

## What this is

Gym Tracker: a strength-training logger meant to be used **between sets without
thinking** — you see what you did last time, repeat it or go up, log it and put
the phone away. The owner uses it every week; friends are next, by invitation.

**Product certainties (judge every change against them):**

1. **No thinking.** Zero setup before training. The app does the math (last
   time, streak, suggestion to go up or down); the user decides. Nothing in the
   middle of a set should require leaving the screen.
2. **Character.** Aggressive, energetic look with identity — not a neutral
   notebook. The promise is "get in, train, get out", not that the gym is your
   life.

The full reasoning, including the progression rules, is in
`docs/product-vision.md`.

## Current state (2026-10)

- **Deployment:** Docker Compose on the owner's PC, exposed through a
  Cloudflare tunnel. Next step (`RM-051`): the same compose on an AWS EC2
  instance with backups to S3, so the app no longer depends on the home PC.
  Self-hosting stays possible but is not a selling point.
- **Priorities:** `docs/logbook/roadmap.md` is ordered by priority; the product
  logic behind it is in `docs/product-vision.md`.
- **Reference research:** five reports comparing this app against open-source
  trackers (Liftosaur, LiftLog, wger, workout-cool) and two exercise datasets
  live outside the repo in `../references/reports/` (start with `SUMMARY.md`).
  Liftosaur, LiftLog and wger are AGPL: take ideas, never code.
- **Lint is red** (`TD-010`, `TD-049`): `pnpm lint` fails in both apps before any
  change of yours.

## Repository layout

| Path | What | Detail |
|---|---|---|
| `apps/api` | NestJS 11 REST API, Prisma 7, PostgreSQL | [`apps/api/README.md`](./apps/api/README.md) |
| `apps/web` | Next.js 16 App Router, React 19, Tailwind 4, shadcn/ui | [`apps/web/README.md`](./apps/web/README.md) |
| `apps/docker` | Compose stacks `prod/` and `dev/`, backup/restore scripts | [`apps/docker/README.md`](./apps/docker/README.md) |
| `docs/` | Product vision, UX foundations | |
| `docs/logbook/` | Technical debt, roadmap, wishlist, changelog | |

The two apps are **independent**: no workspace, each has its own `package.json`,
lockfile and `node_modules`. Run every command from inside its app folder.
Node 22 and pnpm via corepack in both.

## Commands

```bash
# apps/api
pnpm run start:dev            # API on :4000
pnpm run build                # prisma generate + nest build
pnpm run test:unit            # jest (src/**/*.spec.ts)
pnpm run test:e2e             # jest + supertest (test/)
pnpm exec prisma migrate dev  # new migration

# apps/web
pnpm dev                      # web on :3000
pnpm build

# apps/docker/dev  (never prod while developing)
docker compose up -d postgres         # only the DB, for native pnpm dev
docker compose up -d --build          # full stack, ports 3000/4000/5432
```

To verify a change, prefer commands that finish on their own: `pnpm run build`
and the test suites.

## How it fits together

```
browser ──/api/*──▶ web (Next server, rewrite proxy) ──▶ api (Nest) ──▶ postgres
```

- The browser only calls its own origin; `next.config.ts` rewrites `/api/*` to
  `API_INTERNAL_URL`. No API URL reaches the client bundle.
- Session = JWT in the httpOnly cookie `token`. A global `JwtAuthGuard`
  protects every endpoint except those marked `@Public()`; services scope all
  user data by `userId` from `@CurrentUser()`.
- Exercises and equipment are a **shared global catalog**; workouts, routines
  and programs are private per user.

## Domain essentials

Source of truth: `apps/api/prisma/schema.prisma`. What the schema doesn't say:

- **A `Workout` row is one set**, not a session. There is no session entity;
  grouping by day happens on the client using the user's timezone.
- **The guided session lives in the browser** (`apps/web/src/lib/activeSession.ts`,
  localStorage) and expires at the end of the local day. It does not sync
  across devices.
- **`RoutineItem.blocks`** is a JSON list of typed blocks (`weight_reps`,
  `reps`, `time`, `warmup`, `ramp`). Free-form JSON in the DB; its shape is
  enforced by `apps/api/src/modules/routines/blocks.ts` + `dto/routine-block.dto.ts`
  and mirrored in `apps/web/src/lib/types.ts` and `apps/web/src/lib/blocks.ts`.
- **Programs** order routines; the user's active program decides "today's
  routine" by rotating from the last logged set.
- **Last set** (`GET /workouts/recommendation`) only prefills the set form; it
  never suggests a weight.
- **Streak** (`GET /workouts/progress`): sessions in a row with every planned
  set at the top of the routine's rep range, same weight and equipment. Counts
  routine sets from any routine; free-day sets never add or break it. Logic in
  `apps/api/src/modules/workouts/streak.ts`.
- Weights are stored in **kg**; the UI lets you enter lb and converts.

## Conventions

- UI copy is **Spanish**, short and direct. Icons come from `lucide-react`;
  `components/ui/` (shadcn) is not edited by hand.
- Schema changes go through `prisma migrate dev`; containers run
  `prisma migrate deploy` on start, so every migration must be safe on real
  data in `prod`.
- Backend modules follow controller + service + `dto/`; controllers stay thin.
- Track debt, roadmap and ideas in `docs/logbook/`, not in code comments.

## Environments

`apps/docker/prod/` holds the owner's **real training data** (volume
`gym-tracker_postgres_data`); `apps/docker/dev/` is the same stack with its own
database. They share one tunnel and never run at the same time. Never run
destructive commands (`down -v`, resets, restores) against prod without the
owner asking.
