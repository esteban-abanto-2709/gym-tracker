# Gym Tracker — Web

Gym Tracker's interface. Next.js (App Router) built for a phone held upright
and one hand. It talks to the [API](../api/README.md) through a proxy in the
Next server itself.

## Stack

| Piece           | Version                                                    |
| --------------- | ---------------------------------------------------------- |
| Runtime         | Node.js 22                                                 |
| Framework       | Next.js 16 (App Router, `standalone` output) + React 19    |
| UI              | Tailwind CSS 4 · shadcn/ui on Radix · `lucide-react` icons |
| Interaction     | `@dnd-kit` (reorder exercises) · `sonner` (toasts)         |
| Google auth     | `@react-oauth/google`                                      |
| Tests           | Vitest + Testing Library on jsdom                          |
| Package manager | pnpm (pinned in `package.json`, via corepack)              |

## Getting started

```bash
corepack enable
pnpm install
cp .env.example .env.local   # optional if the API is on localhost:4000
pnpm dev                     # http://localhost:3000
```

It needs the API running (by default on `http://localhost:4000`).

## Environment variables

| Variable                       | When it's read              | Purpose                                                                                      |
| ------------------------------ | --------------------------- | -------------------------------------------------------------------------------------------- |
| `API_INTERNAL_URL`             | At build (`next.config.ts`) | Target of the `/api/*` proxy. Defaults to `http://localhost:4000`. Never reaches the browser |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | At build                    | Embedded in the bundle for the Google button. Empty = no Google login                        |

Both are fixed at compile time: changing them requires a new build. In Docker
they arrive as build args.

## Commands

```bash
pnpm dev      # development
pnpm build    # production build (standalone)
pnpm start    # serves the build
pnpm lint     # ESLint
pnpm test     # Vitest, tests next to the code (src/**/*.test.ts[x])
pnpm format   # Prettier
pnpm test:e2e # Playwright (see below)
```

## End-to-end tests

`e2e/` runs full journeys in WebKit at iPhone 13 size against a web that's
already up: the `apps/docker` stack on `http://localhost:3000`, or the URL
in `E2E_BASE_URL`. Never against prod. Each run registers a throwaway user
(`e2e-…@example.test`) and creates its own routine through the API.

```bash
pnpm exec playwright install webkit   # once
pnpm test:e2e
```

Screenshots of the key moments land in `e2e-screenshots/` for reviewing the
UX; if a test fails, the trace lands in `e2e-results/` and the report in
`e2e-report/`. All three folders are ignored by git.

`a11y.spec.ts` runs axe (`expectAccessible` in `e2e/axe.ts`) on every main
page and its bottom sheets, in the light and dark themes. Call
`expectAccessible(page)` on any new page or sheet. `PENDING` lists the rules
still being fixed; once one is fixed, remove it from the list so it can't come
back. CI runs the whole suite against the docker stack, and a failure blocks
the deploy.

## How it talks to the API

- The browser **only calls its own origin**: `lib/api.ts` requests `/api/...`
  and `next.config.ts` rewrites those routes to `API_INTERNAL_URL`. The API's
  real URL never shows up in the client and there's no CORS to configure.
- The session is the httpOnly `token` cookie set by the API; it travels on its
  own with each request (`credentials: "include"`).
- A `401` on a data call sends you to `/login`. `AuthProvider`
  (`lib/auth-context.tsx`) queries `/auth/me` on mount and protects every route
  except `/login` and `/register`.
- **Sets don't wait for the network.** In guided training, each set is marked
  instantly and queued in `localStorage` (`lib/pendingSets.ts`) with its own
  `clientId`; it's sent in the background and, if it fails, retried without
  duplicating because the API recognizes the `clientId`. When finishing with
  pending sets, the app offers to retry or discard.
- Other failed writes show a toast with "Reintentar" (`lib/notify.ts`).

## Data fetching

Reads go through TanStack Query; lint enforces rules 1 and 2.

1. **Every read is defined once in `lib/queries.ts`**: its key, its `api.get`
   call and the `meta.errorMessage` shown if it fails. Components and hooks use
   it with `useQuery(routinesQuery)`, never with `useEffect` + `fetch`. Keys
   are never written by hand outside that file.
2. **Nothing calls `fetch` directly**: the browser uses `api` (`lib/api.ts`),
   whose errors are an `ApiError` with the HTTP status; server components use
   `lib/server-api.ts`.
3. **After a write, update the cache**: `setQueryData` when the new value is
   known, otherwise invalidate the affected queries with `refetchAll` or
   `invalidateQueries({ queryKey: xQuery.queryKey })`. Writes are plain
   `async` functions with `try/catch` + `notifyError`.
4. **The global client (`lib/query.tsx`)** keeps data fresh for 30 s, retries
   once and shows a toast with the query's message when a read fails with
   nothing on screen; a `401` shows none, since `api` already redirects to
   `/login`.
5. **Not in the cache**: the offline set queue (`lib/pendingSets.ts`) and the
   guided session (`lib/activeSession.ts`) stay in `localStorage`; the queue
   only invalidates the active program and history after sending.

## Routes

| Route                                                  | Screen                                                                                                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                    | **Hoy** (today): hub to start or continue the routine, free day, active program and news                                                  |
| `/train`                                               | Guided training: set by set, session map, skip, replace, add; streak, exercise history and rest time                                      |
| `/log`                                                 | Free day: log a standalone set                                                                                                            |
| `/success`                                             | Confirmation after logging on a free day                                                                                                  |
| `/routines`, `/routines/new`, `/routines/[id]`         | List, create and edit routines                                                                                                            |
| `/programs`, `/programs/new`, `/programs/[id]`         | List, create and edit programs                                                                                                            |
| `/explore`                                             | Publications by tab (`?tab=programs\|routines\|mine`) and sort (popular, most copied, recent); "Mías" lets you rename and delete your own |
| `/explore/programs/[slug]`, `/explore/routines/[slug]` | A publication: copy it whole or, in a program, a single routine                                                                           |
| `/routines/[id]/publish`, `/programs/[id]/publish`     | Publish a routine or a program with its slug                                                                                              |
| `/history`                                             | History by session, loaded in pages: repeat, edit and delete sets; export a range for your AI (`.md`)                                     |
| `/perfil`                                              | Account, exercise language, birth date, body measurements and logout                                                                      |
| `/login`, `/register`                                  | Sign in with email or Google                                                                                                              |

The main navigation is the four-tab bottom bar
(`components/layout/BottomNav.tsx`): Hoy · Rutinas · Historial · Perfil.

## Architecture

```
src/
├── app/            # routes (App Router), root layout, manifest and icons
├── components/
│   ├── ui/         # shadcn/ui primitives
│   ├── base/       # own design system: Button, heading(), Spinner, BottomSheet
│   ├── layout/     # PageShell, AppHeader, BottomNav
│   ├── train/      # training flow: SetForm, SaveOverlay, SessionMap, ExerciseProgress…
│   ├── routines/   # routine editor with drag & drop
│   ├── programs/   # program editor and explore detail
│   ├── history/    # history cards and dialogs, export for AI
│   ├── profile/    # language, birth date and measurements
│   ├── news/       # news button and panel
│   ├── exercises/  # exercise search and creation
│   ├── equipment/  # equipment picker
│   └── auth/       # Google button, password input
├── hooks/          # state and data per domain (useGuidedSession, useWorkoutForm…)
└── lib/            # HTTP client, auth, routes, types and pure logic
```

- **No global state library.** Server data lives in the TanStack Query cache
  (see **Data fetching**); each domain has its hook in `hooks/`, and
  `lib/api.ts` is the only point of contact with the API.
- **Centralized routes** in `lib/routes.ts`, both the app's and the API's.
- **News** in `lib/news.ts`: each entry has its id, and the API stores which
  ones each user opened or saw. How to add one: `docs/news.md`.
- **Pure logic in `lib/`**: `blocks.ts` flattens a routine's blocks into
  planned sets, `units.ts` converts kg/lb (everything is stored in kg),
  `setDisplay.ts` formats sets.
- **Local browser state** (`localStorage`):
  - `lib/activeSession.ts`: the ongoing guided session and the free session;
    they expire after 3 hours without sets.
  - `lib/pendingSets.ts`: logged sets that haven't reached the API yet, with
    their session, the time they were done and the time zone.
  - `lib/equipmentMemory.ts`: the last equipment used per exercise.
- **`components/ui/` isn't edited by hand**: it's adjusted with Tailwind from
  the parent component or by wrapping the primitive.
- **Design system in `components/base/` and `globals.css`**: brand colors
  (`from-brand-start`, `to-brand-end`) and small sizes (`text-2xs`…`text-5xs`)
  are `@theme` tokens; a repeated style goes into `base/` as a `cva` variant,
  not copied into each component.

## Installed app experience

`app/manifest.ts` declares `display: standalone` and portrait orientation, so
when added to the home screen it opens full screen.
`hooks/useVisualViewport.ts` fits the height to iOS's visible viewport
(keyboard and bars).

## Docker

Multi-stage `Dockerfile` on `node:22-alpine` that uses Next's `standalone`
output and runs as an unprivileged user. It receives `API_INTERNAL_URL` and
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` as build args. The orchestration lives in
[`apps/docker/`](../docker/README.md).
