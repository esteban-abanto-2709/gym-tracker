# Gym Tracker — API

Gym Tracker's REST API. NestJS on Express, Prisma as the ORM and PostgreSQL.
It stands on its own: any client that speaks HTTP + cookies can use it.

## Stack

| Piece           | Version                                                                        |
| --------------- | ------------------------------------------------------------------------------ |
| Runtime         | Node.js 22                                                                     |
| Framework       | NestJS 11 (Express 5)                                                          |
| ORM             | Prisma 7 with `@prisma/adapter-pg` (`pg` pool)                                 |
| Database        | PostgreSQL 16                                                                  |
| Auth            | JWT (`@nestjs/jwt`) in an httpOnly cookie · `google-auth-library` · `bcryptjs` |
| Validation      | `class-validator` + `class-transformer`                                        |
| Tests           | Jest + Supertest                                                               |
| Package manager | pnpm 11 (pinned in `package.json`, via corepack)                               |

## Getting started

```bash
corepack enable                   # enables the pinned pnpm
pnpm install
cp .env.example .env              # and fill in the values
pnpm exec prisma migrate deploy   # applies the migrations
pnpm run start:dev                # http://localhost:4000
```

For a local Postgres without installing anything:
`docker compose up -d postgres` from `apps/docker/`.

## Environment variables

| Variable           | Required         | Purpose                                               |
| ------------------ | ---------------- | ----------------------------------------------------- |
| `DATABASE_URL`     | Yes              | Runtime connection (used by the `PrismaService` pool) |
| `DIRECT_URL`       | Yes              | Migration connection (read by `prisma.config.ts`)     |
| `JWT_SECRET`       | Yes              | Signs the session tokens                              |
| `FRONTEND_URL`     | Yes              | Origin allowed by CORS                                |
| `GOOGLE_CLIENT_ID` | Only with Google | Expected audience when verifying the Google ID token  |
| `PORT`             | No               | HTTP port (defaults to `4000`)                        |
| `NODE_ENV`         | No               | In `production` the session cookie is marked `secure` |

`DATABASE_URL` and `DIRECT_URL` can point to the same database; Prisma asks
for them separately to support a pooler in front.

## Commands

```bash
pnpm run start:dev    # development with reload
pnpm run build        # prisma generate + compile to dist/
pnpm run start:prod   # node dist/main (requires build)
pnpm run lint         # ESLint, check only
pnpm run lint:fix     # ESLint and fix what it can
pnpm run format       # Prettier
pnpm run test:unit    # Jest, specs next to the code (src/**/*.spec.ts)
pnpm run test:e2e     # Jest + Supertest (test/*.e2e-spec.ts)
pnpm run test:cov     # coverage
pnpm run seed:bench   # benchmark test data (dev only, see bench/)
```

```bash
pnpm exec prisma migrate dev     # create and apply a new migration
pnpm exec prisma migrate deploy  # apply the existing ones
pnpm exec prisma generate        # regenerate the client
pnpm exec prisma studio          # browse the database
```

In Prisma 7, `migrate dev` no longer regenerates the client: run
`prisma generate` afterwards, or the tests and the editor keep seeing the old
schema.

## Architecture

```
src/
├── main.ts               # bootstrap: cookie-parser, ValidationPipe, CORS, port
├── app.module.ts         # domain modules + global JwtAuthGuard (APP_GUARD)
├── app.controller.ts     # GET /healthz
├── common/
│   ├── decorators/       # @Public() and @CurrentUser()
│   ├── guards/           # JwtAuthGuard: reads the `token` cookie
│   ├── interceptors/     # ExerciseNamesInterceptor: names in the user's language
│   ├── date-only.ts      # dates without time (YYYY-MM-DD) and their validator
│   ├── locale.ts         # picks the name by language and normalizes searches
│   ├── slugify.ts        # exercise and user slugs
│   └── timezone.util.ts  # local date from the client's tz and time zone validation
├── modules/
│   ├── auth/             # register, login, Google, logout, /me
│   ├── exercises/        # global exercise catalog and the official ones (official-exercises.ts)
│   ├── equipment/        # global equipment catalog
│   ├── workouts/         # logged sets, last set and streak
│   ├── sessions/         # training sessions, cursor-paginated
│   ├── routines/         # routines and their typed blocks
│   ├── programs/         # programs and the active program
│   ├── measurements/     # optional dated body measurements
│   └── publications/     # publish routines and programs as a frozen snapshot
├── providers/prisma/     # PrismaService on top of a pg.Pool
├── scripts/seed.ts       # loads or updates the official exercises
└── types/                # Express types (req.user)
```

Each module follows the Nest `controller` + `service` + `dto/` pattern.
Controllers hold no logic: they validate with DTOs and delegate to the service.

**Cross-cutting rules:**

- **Everything requires a session** except what's marked `@Public()` (register,
  login, Google, `/healthz`). The guard is global, so a new endpoint is born
  protected.
- **User data is always filtered by `userId`** (`@CurrentUser()`). Workouts,
  routines and programs are private; exercises and equipment are a shared
  catalog.
- **Strict validation:** `ValidationPipe` with `whitelist` and
  `forbidNonWhitelisted`; a field not in the DTO returns 400.
- **Name conflicts** (Prisma `P2002`) on programs are translated to 409.
- **Exercise names by language:** services return exercises with all their
  names, and `ExerciseNamesInterceptor` leaves in each response only the one in
  the user's exercise language (`User.exerciseLocale`, English by default). No
  endpoint picks the language on its own.

## Authentication

- Register and login with email + password (bcrypt hash), or with a Google ID
  token verified against `GOOGLE_CLIENT_ID`; if the email already exists, the
  account is linked.
- The session is a JWT (`sub` = user id, 30 days) in the `token` cookie:
  `httpOnly`, `sameSite=lax`, `secure` in production.

## Endpoints

| Method      | Path                                       | Description                                                                                                                                   |
| ----------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| GET         | `/healthz`                                 | Service health (public)                                                                                                                       |
| POST        | `/auth/register`                           | Creates the account and opens a session (public)                                                                                              |
| POST        | `/auth/login`                              | Opens a session (public)                                                                                                                      |
| POST        | `/auth/google`                             | Login or register with a Google ID token (public)                                                                                             |
| POST        | `/auth/logout`                             | Closes the session                                                                                                                            |
| GET         | `/auth/me`                                 | Current user                                                                                                                                  |
| PATCH       | `/auth/me`                                 | Changes the birth date (or clears it with `null`), the exercise language, the theme (`system`, `light` or `dark`) and the opened or seen news |
| GET         | `/exercises`                               | Exercise catalog, with the name in the user's language                                                                                        |
| POST        | `/exercises`                               | Creates a custom exercise, with the name in the user's language                                                                               |
| GET         | `/equipment`                               | Equipment catalog                                                                                                                             |
| GET         | `/workouts?from=&to=`                      | Sets in a date range, with exercise, equipment and routine name (the client groups them by day)                                               |
| POST        | `/workouts`                                | Logs a set in its session (`sessionId`, `performedAt` and `timeZone` from the client). With `clientId`, resending doesn't duplicate it        |
| GET         | `/sessions?before=&limit=`                 | The user's sessions, newest first (20 per page, 50 max), with their set count, the `next` cursor and `first`                                  |
| GET         | `/sessions/:id`                            | A session with its sets                                                                                                                       |
| PATCH       | `/workouts/:id`                            | Edits a set                                                                                                                                   |
| DELETE      | `/workouts/:id`                            | Deletes a set                                                                                                                                 |
| GET         | `/workouts/recommendation`                 | Last set, to prefill the form (see below)                                                                                                     |
| GET         | `/workouts/progress`                       | Streak and history of an exercise (see below)                                                                                                 |
| GET         | `/routines`                                | The user's routines                                                                                                                           |
| POST        | `/routines`                                | Creates a routine                                                                                                                             |
| GET         | `/routines/:id`                            | A routine with its items                                                                                                                      |
| PATCH       | `/routines/:id`                            | Edits name, items and blocks                                                                                                                  |
| DELETE      | `/routines/:id`                            | Deletes a routine                                                                                                                             |
| GET         | `/programs`                                | The user's programs                                                                                                                           |
| POST        | `/programs`                                | Creates a program                                                                                                                             |
| GET         | `/programs/active`                         | Active program and today's routine                                                                                                            |
| PUT         | `/programs/active`                         | Changes or clears the active program                                                                                                          |
| GET         | `/programs/:id`                            | A program                                                                                                                                     |
| PATCH       | `/programs/:id`                            | Edits a program                                                                                                                               |
| DELETE      | `/programs/:id`                            | Deletes a program                                                                                                                             |
| GET         | `/measurements`                            | The user's body measurements, newest first                                                                                                    |
| PUT         | `/measurements`                            | Creates or replaces the measurement for a date                                                                                                |
| DELETE      | `/measurements/:date`                      | Deletes the measurement for a date                                                                                                            |
| POST        | `/routines/:id/publish`                    | Publishes one of your routines with a slug (frozen snapshot)                                                                                  |
| POST        | `/programs/:id/publish`                    | Publishes one of your programs with its routines (frozen snapshot)                                                                            |
| GET         | `/publications/slug-available`             | `?kind=ROUTINE\|PROGRAM&slug=`: whether the slug is free                                                                                      |
| GET         | `/publications/mine`                       | Your publications of both kinds, newest first, with their counters                                                                            |
| PATCH       | `/publications/:id`                        | Renames your publication (`{ name }`); the slug doesn't change                                                                                |
| DELETE      | `/publications/:id`                        | Deletes your publication with its likes; other people's copies stay                                                                           |
| GET         | `/explore/routines`, `/explore/programs`   | Publications (`?sort=likes\|copies\|recent`, 50 max) with author (`username` and `slug`), likes, copies, `likedByMe` and `isMine`             |
| GET         | `/explore/{routines\|programs}/:slug`      | A publication with its routines and exercises                                                                                                 |
| POST        | `/explore/routines/:slug/copy`             | Copies the routine as a standalone routine                                                                                                    |
| PUT, DELETE | `/explore/{routines\|programs}/:slug/like` | Adds or removes your like (idempotent; liking your own returns 403). Returns `likeCount` and `likedByMe`                                      |
| POST        | `/explore/programs/:slug/copy`             | Copies the whole program (activates it if you had none) or, with `routinePosition`, only that routine                                         |

## Data model

The source of truth is [`prisma/schema.prisma`](./prisma/schema.prisma). What
isn't obvious at a glance:

- **`Workout` is one set**, not a session. It holds weight, reps or duration,
  equipment, `setType` (`WORKING`, `WARMUP`, `RAMP`) and `step` (the ramp
  step). Without `weight` or `durationSec` it's a reps-only set. `clientId` is
  optional and unique per user: the web generates it to retry a submission
  without duplicating the set. `createdAt` is when the set was done: the client
  sends it (`performedAt`) and it's accepted if it's no more than 7 days old
  and not in the future.
- **`Session`** groups the sets of one workout, with `startedAt`, `endedAt`,
  `timeZone` and the routine if there was one. Its `clientId` is the id the web
  generates; a set without one joins the last session if that session's last
  set is less than 3 hours old, or opens a new one
  (`modules/workouts/session-rules.ts`). Deleting a session's last set deletes
  the session. The `sessions` migration grouped the earlier sets with that rule.
- **`RoutineItem.blocks`** is a JSON list of blocks typed by `kind`:
  `weight_reps`, `reps`, `time`, `warmup` and `ramp`. In the database it's free
  JSON; its shape is guaranteed by `modules/routines/blocks.ts` and
  `dto/routine-block.dto.ts`.
- **`Program`** groups routines in order (`programPosition`). The user has an
  `activeProgram`; today's routine is derived from the last logged set.
  `copiedFromId` only exists on copies made with the Explore that predates
  publications; it's no longer written.
- **`Publication`** is a frozen snapshot: publishing copies the routine or
  program into `PublicationRoutine` and `PublicationRoutineItem`, with no link
  to the original, so editing or deleting it doesn't change what was published.
  The slug is unique per `kind` (`ROUTINE` or `PROGRAM`); `PublicationLike` and
  `PublicationCopy` hold one row per user. Deleting the account deletes its
  publications. Copying your own publication isn't recorded in
  `PublicationCopy`, so it doesn't count.
- **`BodyMeasurement`** is an optional body measurement: one per user and date,
  with optional weight, body fat % and height. A `CHECK` in the database
  requires at least one. `User.birthDate` is a single value; age is computed.
- **`Exercise`** holds `slug`, primary and secondary muscles and `mechanic`
  (compound or isolation). Its names live in **`ExerciseName`**, one per
  language (`en`, `es`), with a `searchName` without accents or uppercase for
  search. Official exercises have no `createdById`; user-created ones do. How
  an exercise is measured lives in the routine block, not in the exercise.
- **`User.newsOpened` / `newsSeen`** store which in-app news each user opened
  or saw.

## Last set

`GET /workouts/recommendation?exerciseId=&equipmentId=&setType=&step=`

- Returns the last set of the **same exercise, equipment and `setType`** (weight
  isn't comparable between a machine and a dumbbell) to prefill the form. It
  doesn't suggest weights.
- With `setType=RAMP` and `step` it also returns `workingWeight`, from which the
  client computes each step's weight.

## Exercise streak and history

`GET /workouts/progress?exerciseId=&routineId=&tz=`

- **Session:** the working sets (`WORKING`) of one session (`sessionId`) with
  the same equipment, keeping routine sets apart from free-day ones. Its date is
  that of its first set in the `tz` zone.
- **Target:** the exercise's first `weight_reps` block in `routineId`. Without a
  routine or without that block, `streak` is `null` (no streak).
- **Streak:** consecutive routine sessions, from the most recent backwards, with
  every set the target asks for, all at the top (`repsMax`, or `reps` if
  there's no range) and with the same weight and equipment. It counts sets from
  any routine; the free day neither adds nor breaks it. An open session (with a
  set less than 3 hours ago) that's still incomplete and at the top doesn't
  break the streak, even if it started before midnight.
- **Suggestion:** `down` if any set of the last session fell below the floor
  (range minimum minus 2); otherwise `up` with a streak. The client decides how
  to show it; it never proposes a weight.
- `sessions` returns the sessions of the last 300 working sets, including
  free-day ones, with their equipment. The client paginates them. The logic
  lives in `modules/workouts/streak.ts`.

## Docker

Multi-stage `Dockerfile` on `node:22-alpine`. Production dependencies are
installed in their own stage with the pnpm store in a cache mount, and the
final image copies only that `node_modules`, `dist/` and the Prisma client: no
pnpm or store inside. On start it runs `prisma migrate deploy`, then the
official exercise seed (`dist/scripts/seed`; if it fails, the API starts
anyway) and finally `node dist/main`. The orchestration with the web and the
database lives in [`apps/docker/`](../docker/README.md).
