# CLAUDE.md

Guidance for Claude Code when working in this repository. Read this first; the
per-app READMEs hold the technical detail.

## What this is

Gym Tracker: a strength-training logger meant to be used **between sets without
thinking** — you see what you did last time, repeat it or go up, log it and put
the phone away. The owner uses it every week; friends are next.

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

- **Deployment:** the prod compose runs on an always-on server, exposed through
  a Cloudflare tunnel, with a daily `backup.sh` copied off the machine. Every
  push to `main` deploys itself (see **CD**). Self-hosting stays possible but is
  not a selling point.
- **Priorities:** `docs/logbook/roadmap.md` is ordered by priority; the product
  logic behind it is in `docs/product-vision.md`.
- **Reference research:** five reports comparing this app against open-source
  trackers (Liftosaur, LiftLog, wger, workout-cool) and two exercise datasets
  live outside the repo in `../references/reports/` (start with `SUMMARY.md`).
  Liftosaur, LiftLog and wger are AGPL: take ideas, never code.
- **CD:** `.github/workflows/cd.yml` runs on every push to `main`: it calls
  `ci.yml`, builds the `api` and `web` images for ARM64, pushes them to GHCR
  (`latest` + commit SHA) and tells the prod server to `git pull` and run
  `apps/docker/scripts/update.sh` (backup, pull images, `up -d`). Whatever lands
  on `main` reaches prod, migrations included.
- **CI:** `.github/workflows/ci.yml` runs lint, unit tests and build for both
  apps, plus the API e2e suites against a Postgres service, on every PR to
  `main` and inside `cd.yml`. Lint is at zero problems; keep it there.

## Repository layout

| Path | What | Detail |
|---|---|---|
| `apps/api` | NestJS 11 REST API, Prisma 7, PostgreSQL | [`apps/api/README.md`](./apps/api/README.md) |
| `apps/web` | Next.js 16 App Router, React 19, Tailwind 4, shadcn/ui | [`apps/web/README.md`](./apps/web/README.md) |
| `apps/docker` | Compose stacks `prod/` and `dev/`, backup/restore scripts | [`apps/docker/README.md`](./apps/docker/README.md) |
| `docs/` | Product vision, UX foundations, in-app news | |
| `docs/logbook/` | Technical debt, roadmap, wishlist, changelog | |

The two apps are **independent**: no workspace, each has its own `package.json`,
lockfile and `node_modules`. Run every command from inside its app folder.
Node 22 and pnpm via corepack in both.

## Commands

```bash
# apps/api
pnpm run start:dev            # API on :4000
pnpm run build                # prisma generate + nest build
pnpm run lint                 # check only; lint:fix to autofix
pnpm run test:unit            # jest (src/**/*.spec.ts)
pnpm run test:e2e             # jest + supertest (test/)
pnpm exec prisma migrate dev  # new migration (Prisma 7: does not regenerate the client)
pnpm exec prisma generate     # run after migrate dev, or tests see the old schema

# apps/web
pnpm dev                      # web on :3000
pnpm build
pnpm lint
pnpm test                     # vitest + testing library (src/**/*.test.ts[x])

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

- **A `Workout` row is one set**; sets belong to a **`Session`** (`sessionId`).
  The browser creates the session id (a UUID, like the set's `clientId`) and
  sends it with each set, plus `performedAt` (when the set was done, so offline
  sets keep their real time) and its timezone. A session closes after 3 hours
  without sets (`session-rules.ts`); a set without a session id joins the last
  session under that same rule. History pages through sessions
  (`GET /sessions`), never through every day at once.
- **The guided session lives in the browser** (`apps/web/src/lib/activeSession.ts`,
  localStorage) and expires after 3 hours without sets, not at midnight. It
  does not sync across devices. Free sets join the open guided session, or a
  free session with the same 3-hour rule.
- **`RoutineItem.blocks`** is a JSON list of typed blocks (`weight_reps`,
  `reps`, `time`, `warmup`, `ramp`). Free-form JSON in the DB; its shape is
  enforced by `apps/api/src/modules/routines/blocks.ts` + `dto/routine-block.dto.ts`
  and mirrored in `apps/web/src/lib/types.ts` and `apps/web/src/lib/blocks.ts`.
- **Publications** are frozen snapshots: publishing copies a routine or
  program into `Publication` → `PublicationRoutine` → `PublicationRoutineItem`
  with no link back to the source, so editing or deleting the original never
  changes what was published. The slug is unique per kind.
- **Programs** order routines; the user's active program decides "today's
  routine" by rotating from the last logged set.
- **Last set** (`GET /workouts/recommendation`) only prefills the set form; it
  never suggests a weight.
- **Streak** (`GET /workouts/progress`): sessions (by `sessionId`) in a row
  with every planned set at the top of the routine's rep range, same weight and
  equipment. Counts
  routine sets from any routine; free-day sets never add or break it. Logic in
  `apps/api/src/modules/workouts/streak.ts`.
- Weights are stored in **kg**; the UI lets you enter lb and converts.

## Conventions

- **All code is English**: identifiers, enums, slugs, seed data, log
  messages, test names. Only what the user sees is Spanish; reference data
  shown to users (like exercise names) is translated in a language layer, not
  stored in Spanish in seeds.
- UI copy is **Spanish**, short and direct. Icons come from `lucide-react`;
  `components/ui/` (shadcn) is not edited by hand.
- Before adding or changing any web UI, read `docs/design-system.md` and
  follow it; lint enforces its main rules.
- Schema changes go through `prisma migrate dev`; containers run
  `prisma migrate deploy` on start, so every migration must be safe on real
  data in `prod`.
- Backend modules follow controller + service + `dto/`; controllers stay thin.
- When the owner asks to register something as a novedad (in-app news), read
  `docs/news.md` first. Never add one unasked.

## Environments

`apps/docker/prod/` holds the owner's **real training data** (volume
`gym-tracker_postgres_data`); `apps/docker/dev/` is the same stack with its own
database. Each has its own Cloudflare tunnel and subdomain, so both can run at
once; never put prod's `TUNNEL_TOKEN` in `dev/.env`. Never run
destructive commands (`down -v`, resets, restores) against prod without the
owner asking.

<!-- logbook:start — written by the logbook skill (init); replaced whole when it runs again -->
## Logbook (`docs/logbook/`)

Logbook language: English

Every project records its work in four git-versioned files under
`docs/logbook/`. `docs/` itself stays for conceptual material (vision,
definition); the operational record lives under `docs/logbook/`.

| File | Prefix | Holds |
|---|---|---|
| `technical-debt.md` | `TD-###` | Something **wrong now** in existing code. |
| `roadmap.md` | `RM-###` | **Committed** work that will be done. |
| `wishlist.md` | `WL-###` | Ideas, **maybe never**. |
| `changelog.md` | — | **Permanent** record of everything finished. |

**Passive rules (always on, no command):**

- **Language:** logbook entries are written in the logbook language above; the
  conversation stays in the user's language. Code, product text and quotes stay
  literal. If the existing files are in another language, keep theirs (never
  mix) and mention that `init` can translate them.
- **Technical debt:** if you notice it while working, record it in
  `technical-debt.md` (never as a code comment). Entry format:

  ```markdown
  ## [TD-001] Short title
  - **Location:** `path/to/file.ext:line`
  - **Risk:** N/10  (1-3 cosmetic · 4-6 slows down/moderate · 7-9 latent bug or security · 10 critical)
  - **Problem:** what's wrong, condensed.
  - **Future impact:** what it can cause if left alone.
  - **Date:** YYYY-MM-DD · **Status:** Open
  ```

- **Task lifecycle:** when **starting** a task (`RM`, `TD` or `WL`) mark it
  `In progress (YYYY-MM-DD)` in its file; when **finishing**, move it to
  `changelog.md` keeping its prefix and delete it from its file. Changelog
  format (reverse order): `## [CODE] Title (YYYY-MM-DD HH:MM)` + summary in ≤2
  lines. **The date/time is the local clock at finish; never query git for
  it.**
- **Codes:** never reused; the next one = highest used +1 looking at the open
  file + changelog. Executing a task doesn't change its code: a `WL` is worked
  on directly and goes into the changelog as `WL`. Promoting `WL → RM` is only
  a priority decision the user asks for, never a prior step.
- **Files on demand:** don't create empty files; each one is born the first
  time there is something real to put in it.

**Heavy mechanics → `logbook` skill:** to set up or migrate the system
(`init`), recommend a task (`next`) or audit debt (`audit`), use the skill. It
holds the full formats, special cases (WL→RM promotion, wontfix) and
procedures.
<!-- logbook:end -->
