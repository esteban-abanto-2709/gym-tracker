# Changelog

Permanent record of all finished work. Indexed by task code
(`TD-`, `RM-`, `WL-`). Reverse order: newest on top.

**Entry format:**

```
## [CODE] Title (YYYY-MM-DD HH:MM)
Summary in ≤2 lines of what was done.
```

---

## [RM-135] Enable React Compiler in the web (2026-10-28 13:49)
`reactCompiler: true` with `babel-plugin-react-compiler` 1.0.0 for the whole web; lint already enforced its rules. Files with `try/finally` (the guided session and the data hooks) are skipped and stay as they were, so the manual `useCallback`/`useMemo` stay too.

## [TD-141] Icon-only buttons without an accessible name (2026-10-27 20:57)
Every icon-only control has an `aria-label`, form labels are linked, headings are in order and the red token meets AA contrast in both themes (dark mode now puts dark text on red); `a11y.spec.ts` runs axe on every main page and sheet in both themes; the web e2e run locally or from a manual GitHub workflow, never blocking deploys.

## [TD-150] An unknown URL without a session lands on login, not the 404 (2026-10-27 19:47)
The proxy and `AuthProvider` now gate only an explicit list of private sections, so guests on unknown URLs get the 404; a test fails if a page is neither private, public nor listed as open.

## [TD-140] Route protection and loading states live in the client (2026-10-27 19:34)
`proxy.ts` sends guests on private pages to `/login?next=…` before rendering, sharing the open/public path lists with `AuthProvider`; root `error.tsx` and `not-found.tsx` replace the white screen and Next's default 404.

## [WL-082] Data cache in the browser (2026-10-27 13:35)
TanStack Query keeps routines, exercises, equipment, programs, measurements, explore and history between screens, so going back shows the last data at once and refreshes in the background.

## [TD-139] Web data fetching fails silently and isn't shared (2026-10-27 13:35)
Errors carry their HTTP status, auth goes through the shared client, failed loads and actions show a toast, and the shared cache replaces the per-hook fetch state; the cache is cleared when the account changes.

## [TD-148] Pending sets are sent with whichever account is signed in (2026-10-27 10:28)
The offline queue is now kept per account on the device: only the signed-in account's sets are sent, signing out leaves them waiting for their owner and deleting the account discards them. An older unowned queue goes to the first account that signs in.

## [TD-147] A set whose routine or equipment is gone blocks the offline queue (2026-10-27 10:01)
`POST /workouts` now saves a set whose routine was deleted as a free-day set and one whose equipment was deleted without equipment, instead of rejecting it; a routine owned by someone else is still a 404.

## [TD-142] The offline set queue has no test of its own (2026-10-27 08:32)
`pendingSets.test.ts` covers send order, drop only after the API accepts, a mid-queue failure keeping the rest, a single flush at a time and re-draining when asked mid-flush.
`PendingSet.body.setType` is now typed as `SetType`.

## [TD-146] Dev and prod repeat the same compose (2026-10-27 07:29)
`apps/docker/dev/` and `prod/` (two near-identical composes) become `compose.yaml` + `compose.override.yaml` (dev, loaded on its own) + `compose.prod.yaml` (server, via `COMPOSE_FILE`), with one `.env` per machine. The tunnel is a dev profile and `.env.example` works as is; prod's resolved config hashes are unchanged, so no container is recreated.

## [TD-144] The diagonal background pattern never renders (2026-10-26 18:04)
`PageShell` draws its stripes with `themeColors.foreground`, so the gradient is valid and the faint diagonal texture now shows on every screen, in both themes.

## [TD-145] Bottom sheets don't behave like modal dialogs (2026-10-26 16:55)
`BottomSheet` is built on Radix Dialog: Escape and a tap outside close it, focus moves in and is trapped, the page behind is locked and hidden from screen readers. The session map hides while its exercise picker is open instead of stacking under it.

## [TD-143] The shadcn CLI is a major version behind its registry (2026-10-26 14:42)
`shadcn` is pinned to 4.21.4 in devDependencies; re-adding `spinner` with it leaves `components/ui` and `components.json` unchanged, and `migrate cn` is now available locally.

## [TD-138] The web has no shared design system (2026-10-26 14:34)
Brand colors and small text sizes are `@theme` tokens, and `components/base/` holds `Button`, `heading()`, `Spinner`/`LoadingOverlay`, `fieldInputClass` and `BottomSheet`, used by every repeated case; `cn()` comes from the `cn` package and replaces all template-literal `className`s.

## [TD-126] Every bottom sheet copies its own scaffolding (2026-10-26 14:25)
The seven bottom sheets (Tema, Idioma, Medidas, Exportar, Novedades, DurationPicker, session map) now use `BottomSheet` + `SheetHeader` from `components/base/sheet.tsx`; the session map stays inline (no portal) so the sheets it opens keep stacking above it.

## [TD-094] Tailwind border colors aren't applied (2026-10-26 13:49)
The global border rule moved into `@layer base` and `kicker`/`hazard-bar` became `@utility`, so colored borders (`border-primary`, `border-transparent`…) now show; kicker labels on `Label` keep their bold with `font-bold`.

## [WL-125] View a publication without an account (2026-10-26 12:27)
Explore (list and detail) opens without a session: the detail is rendered on the server with Open Graph and a generated preview image (`/og/...`), exercise names follow the browser language, and copying or liking sends the guest to sign up and back (`?next=`). Public pages (`/`, `/privacidad`) now ship their content in the server HTML.

## [WL-137] Pick the time with minute and second wheels (2026-10-25 12:48)
The seconds fields (guided, free day, routine editor) show the time as a clock (`1:50`) and tapping them opens a panel with wheels (`@ncdai/react-wheel-picker`) that only applies with "Listo"; editing in the history shows the wheels in its dialog. `durationSec` is still what's stored.

## [TD-136] Dependencies with known vulnerabilities (2026-10-25 09:04)
Web: Next 16.2.3 → 16.4.3 (RCE in Image Optimization and `next/og`, middleware bypass, SSRF). API: `@nestjs/*` 11.2.8 and Prisma 7.10.1 within their major, `multer` ≥2.5.0 via override; `pnpm audit --prod` is at zero in the API.

## [TD-070] TikTok on Android with the app (2026-10-24 13:06)
The Android branch opens TikTok with its own scheme (`intent://search` with `scheme=snssdk1233` and the package), with no web fallback: the `https` link with a fallback loaded TikTok's website inside the PWA. Tested with the app installed; without the app it stays in `TD-135`.

## [RM-134] Training sessions (2026-10-24 11:05)
A workout is a `Session`: the web sends its session, the real time and the timezone with each set, a session closes after 3 hours without sets and the migration grouped the existing sets. The streak and the history go by session, with paginated `/sessions`; in the benchmark the API goes from 74 to ~995 requests/s.

## [TD-133] A workout that crosses midnight is split in two (2026-10-24 11:05)
Solved with RM-134: the guided session expires after 3 hours without sets instead of at midnight, and the streak and the history group by session; an e2e pins that a routine from 23:00 to 00:20 counts once in the streak.

## [TD-132] The history fetches every trained day at once (2026-10-24 11:05)
Solved with RM-134: the history fetches 20 sessions per page (`GET /sessions`, `before` cursor) and their sets when tapped; `GET /workouts/days` was deleted. Prisma's `_count` counted the whole table and was replaced by a count of the page.

## [TD-131] Trained days are grouped in Postgres (2026-10-24 09:07)
`getDays` groups by local date with `AT TIME ZONE` and `GROUP BY` instead of converting each set in JavaScript; an e2e pins the day boundary between Lima and UTC. In the benchmark the API goes from ~100 to ~720 requests/s with 10 users.

## [TD-108] The sets table has indexes (2026-10-23 19:26)
`Workout` gains `(userId, exerciseId, createdAt)` and `(userId, createdAt)`. In Postgres the last set goes from 1.37 to 0.05 ms and the days are read from the index without sorting; the benchmark capacity doesn't change because the limit is the API's CPU.

## [TD-107] "Last set" fetches only the last set (2026-10-23 19:21)
`getRecommendation` uses `findFirst` with `select` instead of loading the exercise's whole history. In the `apps/api/bench/` benchmark it drops from 9 to 3.8 ms with one user and the API serves 30% more; `getDays` stays separate in TD-131.

## [TD-129] API errors reach the interface in English (2026-10-23 10:55)
Login, sign-up, Google, change password and delete account show a Spanish text based on the HTTP code, no longer the API's message; adds a too-many-attempts notice (429). The API's Google exception stays in English.

## [TD-088] Code with parts in Spanish (2026-10-23 10:13)
API and web test names and test data moved to English; Spanish comments were deleted except four that explain something the code doesn't say, now in English. Left out: applied migrations, the interface text (TD-129) and the equipment ids (TD-130).

## [TD-128] The web has Prettier and it's checked in CI (2026-10-23 09:55)
Prettier pinned as a web dependency, `.prettierrc` with `endOfLine: auto`, `format:check` in CI and the web formatted once (without changing its double quotes). VS Code formats TS, JS and CSS on save with the Prettier extension, recommended in `.vscode/extensions.json`.

## [TD-068] The API's formatting is checked in CI (2026-10-23 09:40)
`prettier --check` runs in CI after lint (`pnpm run format:check`); `endOfLine: auto` and `.prettierignore` for the lockfile. The API was formatted once and `eslint-plugin-prettier`, which was turned off, was removed.

## [WL-127] Settings out of Profile (2026-10-21 12:13)
Profile keeps your identity and your measurements; theme, exercise names, birth date, password, privacy, sign out and delete account move to `/perfil/ajustes`, behind a gear.

## [RM-117] Choose light or dark mode (2026-10-21 11:18)
Sistema / Claro / Oscuro selector in Profile with `next-themes`, stored in `User.theme` and applied when signing in from any device; without a session it always follows the system. Toasts and the bar color follow the theme.

## [WL-039] Publish programs and standalone routines (2026-10-20 18:29)
Everything is private and is published as a frozen snapshot with its own slug (`/explore/routines/:slug`, `/explore/programs/:slug`). Explore by tabs and sort order, copy a whole program or a single routine, one like per account, copies per person, "Mías" to rename and delete, share the link and the `explore-programs-2` news item.

## [TD-041] Duplicate routine name answers 409 (2026-10-20 17:24)
Creating or renaming a routine with a name you already have answers 409 instead of 500 (`withUniqueName` moves to `common/` and is shared by routines and programs), and the editor warns "Ya tienes una rutina con ese nombre" and doesn't let you save.

## [TD-109] The API e2e tests run in CI (2026-10-20 17:14)
The `api` job starts a Postgres 16 service, applies the migrations, seeds the official catalog and runs `test:e2e` before the build: whatever reaches `main` goes through the suites against a real database.

## [WL-061] Change the password (2026-10-18 15:46)
Perfil → Contraseña (only on accounts with a password) asks for the current and the new one; `PATCH /auth/password` closes the other sessions and keeps the current one. Recovering it by email stays separate in WL-124.

## [RM-123] Public landing page (2026-10-18 15:28)
`treno.rocks/` without a session shows a landing page with the promise, a sample set as the app shows it and direct access to create an account or sign in; with a session it's still Hoy. It serves as the home page on Google's consent screen.

## [RM-121] Privacy notice (2026-10-18 15:09)
Public `/privacidad` page (opens with or without a session) with what is stored, what for, who sees it (programs show up in Explorar), the 90-day backups, how to delete the account and a contact email; linked from login, sign-up and profile. Still missing: setting it as the policy on the Google OAuth consent screen.

## [WL-119] Delete my account and my data (2026-10-18 10:38)
Perfil → "Borrar mi cuenta" confirms with the password or, on Google accounts, with the email, and deletes sets, routines, programs and measurements in one transaction. The exercises the user created are deleted if nobody else uses them; if someone does, they're left without an owner.

## [TD-118] A set can point to another user's routine (2026-10-18 10:13)
`POST /workouts` answers 404 if the `routineId` isn't one of the user's routines, same as `programs`. Cross-access e2e test with two accounts.

## [TD-113] Login doesn't limit attempts (2026-10-18 10:07)
Login and sign-up allow 5 attempts per minute per client with `@nestjs/throttler`; the client comes from `cf-connecting-ip` (behind the tunnel `req.ip` is the web container, the same for everyone). Past the limit, 429 with a message in Spanish. E2e test of the limit.

## [TD-112] Google links to an email account nobody verified (2026-10-18 09:58)
When linking Google to an account with a password, the password is deleted (Google becomes the owner of the email) and its open sessions are closed: whoever signed up earlier with someone else's email is locked out. E2e test with mocked Google.

## [TD-120] A signed-in session can't be closed from the server (2026-10-18 09:53)
`User.tokenVersion` travels in the token and the guard compares it: signing out bumps the version and closes the session on every device. Tokens without a version stay valid (nobody loses their session with the deploy); revocation e2e test.

## [TD-111] The email is case-sensitive (2026-10-18 09:49)
Sign-up, login and Google store and look up the email lowercased and trimmed; a migration lowercases the existing emails (there were no collisions in prod). E2e test of sign-up and login with different casing.

## [TD-105] The web build depends on Google Fonts over the network (2026-10-18 09:45)
Oswald, Space Grotesk and Space Mono live in `apps/web/src/app/fonts/` (Fontsource woff2, with their OFL license) and load with `next/font/local`: the build no longer downloads anything from Google.

## [TD-110] The deploy goes green even if the app doesn't start (2026-10-18 09:25)
`update.sh` waits with `up --wait` for the `api` and `web` healthchecks and turns the CD red if they don't end up healthy; a failed migration no longer leaves the API starting on the old schema, and `web` listens on `0.0.0.0`. Rollback documented in `apps/docker/README.md`.

## [RM-116] End-to-end tests for guided training (2026-10-16 15:29)
Playwright in `apps/web` (WebKit at iPhone size) against the dev stack: trains a routine jumping ahead to another exercise, checks it isn't marked complete with pending ones (TD-095 regression) and that the 6 sets reach the API. Leaves screenshots in `e2e-screenshots/`.

## [RM-114] Save sets without waiting for the network (2026-10-16 12:32)
The set is marked and moves on instantly: it goes into a pending list in `localStorage` and is sent in the background with a `clientId` the API uses to avoid duplicating it. Finishing with pending sets offers to retry or discard; the next set's recommendation waits until they're sent.

---

## [TD-106] The fire doesn't update between sets of the same exercise (2026-10-16 11:25)
Without the intermediate screen, the exercise card was no longer remounted and the fire was only fetched when reaching the exercise. Now it's fetched again after each saved set, without flickering: it shows the previous value until the new one arrives.

## [TD-085] The server's local backups are never deleted (2026-10-16 11:12)
After each backup, `backup.sh` deletes the `gym-prod_*.sql` files older than 14 days in its output folder; it covers the daily backup and the per-deploy one because both go through the script.

## [TD-102] No intermediate screen between sets (2026-10-13 17:13)
When logging, an overlay shows the set from the tap, the check pops when it's confirmed and it stays 1 s longer (with which exercise you move to); it blocks double taps and then the next set or the next pending exercise follows without tapping anything else. The saved-set screen stays only as "¡Rutina completada!"; a free exercise keeps a "Siguiente: X" below.

## [TD-101] The rest timer goes back to the exercise (2026-10-13 16:36)
Reverts TD-092 with another design: rest is a pill (clock and number) in the corner of the exercise card, mirroring the fire; the saved-set screen no longer shows it. When the routine is complete, "Terminar sesión" is the main button and "Una serie extra" lets you keep going on the same exercise.

## [TD-100] End the session from the map (without logging anything) (2026-10-13 16:21)
The session map has "Terminar sesión" at the bottom; a modal confirms and shows in large type how many exercises are left undone. Along the way, the theme defines `destructive`: the delete and error reds were never painted.

## [TD-095] The next exercise is the one you're missing (2026-10-13 15:50)
"Siguiente" looks for the first exercise not finished or skipped, forward and then from the start: it no longer recommends a done one or marks the routine complete with pending ones behind. A free exercise counts as done with one set.

## [RM-096] Novedades (2026-10-13 14:40)
An icon with a dot on Hoy that opens a panel of expandable cards with "Ir" to their screen; unseen ones first and what was opened/seen stored per user (`User.newsOpened`/`newsSeen`). 7 initial news items in `apps/web/src/lib/news.ts`; how to register them in `docs/news.md`.

## [RM-086] Exercise dictionary: language (2026-10-12 15:05)
Exercise names move to a per-language table (`es`, `en`); the official ones have both and the API serves the one in the user's exercise language, English by default.
It's chosen from the language button in the profile (panel with English/Español) and the search finds in any language, ignoring accents and casing.

## [TD-092] No rest timer above the exercise (2026-10-12 11:24)
Guided mode no longer shows the compact "Descansando" timer above the exercise to log; rest is only shown, large, on the saved-set screen.

## [RM-056] Exercise dictionary: the core (2026-10-12 09:49)
95 official exercises with slug and English name, muscles (19, deltoid split in three) and type, seeded on every API startup; creating asks only for the name and stays unofficial.
Existing exercises were merged with their official one (identical sets and routine items); the web marks the unofficial ones and lists them last.

## [TD-084] The backup copies the whole database (2026-10-10 13:43)
`backup.sh` stopped listing tables (`BodyMeasurement` was left out): it dumps schema, data and `_prisma_migrations`. `restore.sh` drops the schema, loads the dump and restarts the API, which applies the missing migrations; it rejects old data-only backups (the README explains how to use them).

## [TD-083] The history no longer downloads every set (2026-10-09 21:55)
`GET /workouts/days` brings the list of days and the last day (2 KB instead of 1 MB); each day and the AI export request their range with `GET /workouts?from&to`, now mandatory. The `.md` is still built in the browser; `toLocalDateString` reuses its formatter (from ~170 to ~11 ms).

## [TD-080] The app feels slow (2026-10-09 21:36)
Measured in dev with real data: API and Postgres answer in 4–32 ms and the Next proxy adds ~2 ms; each request through the Cloudflare tunnel costs ~250 ms. The slowness is the network, not the code; WL-082 (cache) and TD-083 (full history) remain.

## [TD-079] The bottom bar no longer floats on iOS (2026-10-09 21:13)
When opening the installed app, iOS hands over a viewport 39 pt shorter than the screen and whatever was pinned to the bottom floated. `.anchor-bottom` corrects the edge with `100dvh - 100lvh` in installed mode (bar and bottom panels). The bar's height lives in `--nav-h` and screens reserve its space with `.pb-nav`. Under observation: when iOS corrects the viewport a brief jump is noticeable; check on other iPhones and revert if it looks bad.

## [RM-021] Export the history for your AI (2026-10-09 17:39)
From the History you choose a range (7, 30, 90 days, all or dates) and share, download or copy a `.md` built in the browser: age, measurements with a starting point, conventions and one row per set in CSV with routine and note. Adds period coverage, format version and empty-value rules (see `docs/feedback/2026-10-09-export-ia.md`).

## [WL-071] Body measurements and birth date in the profile (2026-10-09 16:44)
Profile adds the birth date (computes the age) and dated measurements: height, weight and body fat % (in the order the gym hands them out), all optional, one per day and editable. `BodyMeasurement` table with a `CHECK` for at least one value, `/measurements` endpoints and `PATCH /auth/me`.

## [TD-019] Timed sets no longer store a filler `reps = 1` (2026-10-09 11:09)
`Workout.reps` becomes nullable and a migration sets the reps of sets with a duration to `NULL`; the API drops them if `durationSec` arrives and the web stops sending them. Along the way, the exercise progress shows the durations (`45 s · 40 s`) instead of `1 · 1 reps`.

## [RM-057] Rest time since the last set (2026-10-09 10:31)
Guided mode stores the time of the last set in the session and shows a timer that ticks up every second: large on the saved-set screen and compact above the exercise. It's computed from that time, so coming back from another app it's the real one; it hides after 30 min.

## [TD-076] The web on pnpm 11, same as the API (2026-10-09 10:01)
The web goes from pnpm 10.17.1 to 11.28.2 (the API's version): `onlyBuiltDependencies` migrates to `allowBuilds` and the Dockerfile copies `pnpm-workspace.yaml`, which pnpm 11 requires because of `strictDepBuilds`. Lockfile untouched; lint, tests, build and dev image verified.

## [TD-074] The API image from 1.4 GB to 719 MB (2026-10-09 10:01)
Production deps are installed in their own stage with the pnpm store in a cache mount and the `runner` copies only `node_modules`: 1.39 GB → 719 MB (compressed 310 → 156 MB). What's left is the Prisma CLI for `migrate deploy`; removing it goes with RM-075.

## [RM-051] App in the cloud (2026-10-08 11:04)
Prod runs on an always-on server with the same compose and its tunnel, with the data migrated, a daily backup off the machine (successfully restored in dev) and CD: every push to `main` with CI green builds the ARM64 images, publishes them to GHCR and updates the server.

## [TD-073] Backup and restore in `sh` (2026-10-07 23:49)
`backup.sh` and `restore.sh` replace the `.cmd` files: they run the same on Linux and on Windows (Git Bash), take the credentials from the container itself and the restore runs in a single transaction. `.gitattributes` forces LF on the `.sh` files.

## [TD-072] Dev with its own tunnel (2026-10-07 22:36)
Dev goes out through its own tunnel and subdomain, with its `container_name` (`gym-tracker-dev-tunnel`): prod and dev run at the same time without splitting traffic or sharing `localStorage`, and Google login works in dev from the phone.

## [RM-069] Ramp on a single screen (2026-10-07 09:37)
In guided mode, the ramp shows all its steps with their weight (last time or % of the working weight) and a single tap logs them as `RAMP` sets and goes straight to the working set. The kg/lb selector becomes a shared component.

## [RM-068] No notes on sets (2026-10-07 08:52)
Removed the "¿Cómo te sentiste?" field from the free day, its editing and its display in the history; the `opinion` column is kept with the old notes for export. A migration turns into `WARMUP` the 59 sets that were marked with the note "Aproximaciones".

## [WL-012] Remove the "Aproximación" checkbox (2026-10-07 08:23)
Removed the checkbox from the free day, guided mode, the routine editor and the history; the blocks (`warmup`, `ramp`) say what's a warm-up. A migration turns the marked sets into `WARMUP`, the `approx` blocks into `warmup` and drops `Workout.isApproximation`.

## [RM-053] Watch the exercise on TikTok (2026-10-07 07:56)
A sticker-style button in guided mode, rest and the free day that opens the exercise search in the TikTok app (`snssdk1233://` on iOS, `intent://` on Android). Left untested: iOS without the app (`TD-069`) and Android (`TD-070`).

## [RM-067] CI on GitHub Actions (2026-10-06 20:52)
`.github/workflows/ci.yml` runs lint, unit tests and build of the API and the web on every push and PR to `main`. Before that, lint for both apps was brought to zero and the web got its first tests (Vitest); CD stays in `RM-051`.

## [TD-010] Web lint green (2026-10-06 20:36)
No synchronous `setState` in effects or refs read during render: lazy initial state from `localStorage`, derived values, state adjustment on prop change and `useSyncExternalStore` for the viewport. The 26 characterization tests pass unchanged.

## [TD-049] API lint green (2026-10-06 20:09)
Typed Jest mocks in the specs, `void bootstrap()` and a `test/tsconfig.json` so ESLint reads the e2e tests (the `no-unsafe-*` rules are turned off there because of `res.body`). Removed the rules that were off or downgraded to warning in `src/` (`no-explicit-any`, `no-floating-promises`, `no-unsafe-argument`, `no-unused-vars`). `lint` no longer autofixes; `lint:fix` does.

## [RM-052] Exercise history with a streak (2026-10-06 19:19)
In guided training, a fire with the streak of sessions with every set at the top (any routine counts; the free day neither adds nor breaks it) that opens the exercise's history with its equipment. It suggests going up or down without proposing a weight; the "+3 reps" rule was removed.

## [TD-066] Product documentation with the new direction (2026-10-06 18:47)
Rewrote `product-vision.md`, `ux-foundations.md` and the README with the progression rule (range, streak, floor for going down); `milestones.md` and `design-brief.md` were deleted. Roadmap reordered by priority (AWS first, RM-051 to RM-057) and wishlist updated (WL-002 already covered by RM-038; WL-042 becomes RM-056).

## [TD-050] Technical documentation aligned with the code (2026-10-05 11:09)
Rewrote the `apps/api` and `apps/web` READMEs (stack, variables, routes, endpoints, architecture) and `CLAUDE.md` as root orientation, pointing to `schema.prisma` instead of copying it. The `.env.example` files now include `JWT_SECRET` (API) and `API_INTERNAL_URL` (web).

## [RM-048] Rep range in the routine (2026-10-03 10:25)
The `weight_reps` and `reps` blocks store `repsMax` next to `reps` (minimum): the editor asks for a minimum and an optional maximum, and guided mode and program explore show `3 × 8–10` and `meta 8–10`. Routines without a range look the same; the Upper/Lower program's ranges were loaded in dev and prod.

## [RM-046] No "Otro ejercicio" on the saved-set screen (2026-10-03 10:07)
The button and its dead path are removed (`addExercise` in `useGuidedSession` and the selector in `/train`); replacing from the session map stays the same. In-progress sessions with extras already added are still read.

## [RM-045] 4-tab navigation: Hoy · Rutinas · Historial · Perfil (2026-09-30 13:51)
Rutinas becomes a tab (no back arrow, with shortcuts to Programas and Explorar), Hoy keeps only "Hoy toca" and Día libre, and Perfil the account; Programas goes back to Rutinas.

## [RM-044] History without a floating button (2026-09-30 13:46)
The floating `+` in the History is removed, since it duplicated the entry to Día libre from Hoy; the empty-state button ("Comenzar a entrenar") stays.

## [RM-038] Training programs · phase 2: explore and copy programs (2026-09-30 13:22)
`GET /programs/explore` lists other people's programs and `POST /programs/:id/copy` makes a deep, independent copy (suffix "(2)" if the name clashes, `copiedFromId` as the origin) that's only activated if you had no active program. Web: `/explore` + detail with "Copiar", a discreet entry point from Programas and a welcome on Inicio for users without routines (Explorar or Armar el mío). Tested in dev with a second account.

## [RM-030] Training programs · phase 1: daily use + "today's routine" (2026-09-30 12:26)
`Program` groups routines in rotation order and `User.activeProgramId` marks the one you follow; `GET /programs/active` proposes the one after the last done. Web: `/programs` to create/edit/activate, Perfil only shows it, `/routines` filtered to the active program and Inicio with one-tap "Hoy toca" + "Otra rutina" and "Programas" shortcuts. Tested in dev and deployed to prod.

## [RM-037] Separate prod and dev environments in Docker (2026-09-23 12:54)
`apps/docker/` now has `prod/` (closed) and `dev/` (the same stack with its own DB and open ports), which share the tunnel without running at the same time; `.env.example`, `.gitignore`, `scripts/` (backup/restore) and `backups/` stay at the root, shared by both. Verified with a prod backup restored in dev.

## [RM-036] Open as a full-screen app from the home screen (2026-09-23 09:18)
Promoted from `WL-006` (installable PWA).
Manifest, `appleWebApp` with a translucent status bar, `viewportFit: cover`, icons generated by code (lucide dumbbell + hazard tape) and `safe-area` margins on the header, bottom bar, panels and toasts; `lang="es"`.

## [RM-035] No iOS auto-zoom in the routine editor (2026-09-23 09:12)
The block-type `select` goes from `text-xs` to `text-base` (16px), the minimum for iOS not to zoom the page on focus; it was the only field below it.

## [RM-034] Page height fitted to the visible viewport on iOS (2026-09-22 23:41)
`PageShell` goes from `min-h-screen` (100vh) to `min-h-dvh`, which removes the phantom scroll in Safari and in the home-screen app; `overscroll-behavior: none` on `html`/`body` removes the bounce.

## [TD-020] The web runs on Node 22 (2026-09-22 09:44)
Both stages of `apps/web/Dockerfile` go from `node:20-alpine` (unsupported since April 2026) to `node:22-alpine`, same as the API. Verified: image build and `node --version` = v22.22.3 in the container.

## [TD-009] The API dies if it can't reach the database (2026-09-22 09:44)
`onModuleInit` no longer swallows the error and runs a `SELECT 1`: with the `pg` adapter, `$connect()` doesn't open a connection, so removing the try/catch wasn't enough. Without a DB the process exits with code 1 and the real error, and `restart: unless-stopped` retries it.

## [TD-007] The API starts without downloading the Prisma CLI (2026-09-22 09:44)
`prisma` moves to `dependencies`, so `pnpm install --prod` keeps it in the image, and the `CMD` runs `node_modules/.bin/prisma migrate deploy && node dist/main`, with no more `pnpm dlx` or pnpm at startup. Verified with `--network none`: the CLI works offline.

## [TD-017] `pnpm run build` regenerates the Prisma client (2026-09-22 09:17)
The API's `build` script runs `prisma generate && nest build`, so a schema change breaks the local build right away instead of giving a false green. The Dockerfile passes the dummy URLs to that `RUN` and the standalone `generate`, which was redundant, is removed.

## [WL-013] Warn in the ramp when the working weight goes up (2026-09-19 09:57)
A step with history shows the "Sube a X kg" notice when the percentage of the current working weight exceeds the stored weight by 2.5 kg or more; the field stays prefilled with the stored weight. Promoted from WL-013.

## [RM-032] Ramp warm-up: a single slot with weight per step (2026-09-19 09:34)
The ramp is a `ramp` block inside the exercise's slot and each step remembers its own weight (`Workout.setType = RAMP` + `step`, recommendation filtered by step); the percentage of the working weight stays as a suggestion. Data migrated: 7 ramps merged (20 fewer slots) and 20 sets tagged with their step.

## [RM-029] Set-by-set recommendation (fixes ramp and warm-up) (2026-09-19 09:34)
Closed within RM-032: each ramp step and each warm-up set looks up its own history by `setType` and `step`, and `isApproximation` goes back to meaning only "the weight is imprecise".

## [RM-031] Flexible slots: the routine as a list of typed blocks (2026-09-16 22:18)
Each `RoutineItem` stores `blocks` (typed JSON: `weight_reps`, `reps`, `time`, `warmup`) and each `Workout` a `setType` (`WORKING`/`WARMUP`); guided mode, free day (measurement selector) and editor work per block. Data migrated: 8 PPL warm-ups merged with their slot, 112 warm-up sets marked and bodyweight without `0 kg`.

## [TD-018] `Exercise.isTimed` decides the `legacy` block's measurement (2026-09-16 22:18)
Solved within RM-031: the measurement lives in the block type (or is chosen in the free set), and the `isTimed` column, the "Se mide en tiempo" checkbox and the transitional `legacy` type were deleted.

## [TD-016] Docker README aligned with what backup and restore do (2026-09-07 09:11)
The README said the dump covers only `Exercise`/`Workout` and that restore truncates those two; in reality both operate on all five tables (`User`, `Exercise`, `Routine`, `RoutineItem`, `Workout`). Fixed the three mentions and noted that restore is a full rollback, and that an old backup loads into a new schema because each `COPY` carries its explicit column list — verified by restoring the pre-migration backup onto the schema with the time columns.

## [RM-028] Exercises measured by time (2026-09-07 09:05)
`Exercise.isTimed` + `Workout.durationSec` + `RoutineItem.targetDurationSec`, with nullable `Workout.weight`: a set carries weight **or** duration (`@ValidateIf` in the DTO enforces it) and the recommendation never suggests a weight without a previous weight. Guided mode and the free day ask for seconds, the history renders "45 s" and lets you edit them, and the routine editor sets targets in seconds; the modal's checkbox marks an exercise as timed when creating it. Applied in dev and prod.

## [RM-020] Flexible routine mode (checklist + live detours) (2026-07-26 12:34)
Guided mode stops being linear: `ActiveSession` (localStorage) gains `skipped`/`replacedBy` per index and a full-screen `SessionMap` (opened from the header with "N de M") lets you jump ahead/back to any exercise, skip (reversible) and replace in the same slot inheriting targets. Zero DB changes; the saved template isn't touched.

## [TD-013] Zombie active session if the routine no longer exists (2026-07-26 12:34)
The routine GET in `/train` now clears the session (`clearActiveSession`) in the catch/404 instead of leaving the "Continuar" banner pointing at a deleted routine. Slipped in within RM-020.

## [RM-026] Per-set equipment + pure exercise with slug (2026-07-24 10:56)
Equipment stops belonging to the exercise and moves to each set (`Equipment` table seeded in the migration + nullable `Workout.equipmentId`); `Exercise` stays pure with `slug` identity and its per-equipment duplicates merged. Selector when logging with a sticky default from history (localStorage) + icons, and weight recommendation filtered by equipment. Dev migrated; prod at the next `migrate deploy`.

## [RM-025] Exercise catalog cleanup (2026-07-23 14:02)
Identity = `(name, equipment)`: `@IsIn` validates the equipment, a `UNIQUE (lower(name), equipment)` index gives case-insensitive uniqueness, and a migration normalized equipment + merged duplicates (repointing FKs to the one with the most workouts). Applied in dev and prod.

## [TD-008] Timezone moved to the front end (agnostic back end) (2026-07-23 14:24)
Instead of a server-side `SELECT DISTINCT`, it was decided that the timezone belongs to the client: `GET /workouts/dates` and the `?date=` filter were deleted, `findAll` returns everything and `useWorkoutHistory` groups by the browser's local day (`toLocaleDateString("en-CA")`) filtering in memory. `getRecommendation` receives `tz` from the client; `APP_TIMEZONE` removed from env/docker/docs.

## [TD-006] Network feedback on front-end writes (2026-07-23 13:16)
`sonner` + a `notifyError(msg, retry)` helper: the 5 write `catch` blocks (free logging, edit/delete history, log guided set, save routine) now show an error toast with a "Reintentar" button instead of only `console.error`. Dark/red `<Toaster>` mounted in the layout.

## [RM-024] Sign-in/sign-up with Google (2026-07-23 10:27)
Back end: optional `passwordHash` + `googleId` on `User`, public endpoint `POST /auth/google` that verifies the ID token with `google-auth-library` and reuses the JWT cookie (creates the account or links it by email). Web: `@react-oauth/google` (`GoogleOAuthProvider` in the layout + "Continuar con Google" button on login and sign-up).

## [RM-023] Own domain + named Cloudflare tunnel (2026-07-23 10:27)
Own domain delegated to Cloudflare and a named tunnel instead of the quick tunnel: the public URL is fixed with HTTPS and no longer changes on every restart. The domain and the `TUNNEL_TOKEN` go in each person's `.env`, never in the repository. Closes the pending item from RM-012.

## [RM-022] User accounts (auth + isolation) (2026-07-21 14:18)
`User` model (email, username, slug) + `userId` on `Workout`/`Routine` (existing data migrated to the owner account); JWT auth in an httpOnly cookie (register/login/logout/me) and per-user isolation across the whole API. Web with `AuthProvider`, route guard and login/sign-up pages; exercises stay global. Promoted from WL-001 (no Supabase anymore).

## [TD-005] API with authentication (global JWT guard) (2026-07-21 13:11)
`auth` module (register/login/logout/me) with bcrypt hashing, JWT in an httpOnly cookie and a unique slug from the username; `JwtAuthGuard` as `APP_GUARD` protects every endpoint except the `@Public()` ones (register/login/healthz). Closes anonymous read/write access through the tunnel.

## [TD-004] API with input validation (2026-07-21 12:43)
Global `ValidationPipe` (`whitelist` + `forbidNonWhitelisted` + `transform`) and the exercises/workouts/routines DTOs converted to classes with `class-validator` decorators. Invalid payloads (non-integer reps, negative weight, bad UUID, extra fields) now give 400 instead of 500. Prerequisite for multi-user.

## [TD-011] Weight in lb was stored with long decimals (2026-07-14 07:34)
New `toKg` helper in `units.ts` that rounds the lb→kg conversion to 1 decimal before persisting; used by `useWorkoutForm` and `SetLogger`. The 17 existing rows with long decimals were rounded with a direct UPDATE.

## [RM-019] Weight recommendation: go up or stay? (2026-06-28 15:23)
`GET /workouts/recommendation` endpoint that, segmenting by `isApproximation`, compares the best set of the most recent day against the previous session at the same weight: if it beats it by ≥3 reps it suggests `weight+2.5kg`. Shown as text (doesn't auto-apply values) in `SetLogger` and `SetDoneScreen`; replaces the `last` endpoint.

## [RM-018] Mark approximation sets (working by default) (2026-06-28 10:59)
Boolean `isApproximation` flag (default `false`) on `Workout` and `RoutineItem`: whatever isn't marked is working by absence. Shared toggle in manual logging, guided mode (prefilled from the routine slot), routine editor and set editing; "≈ Aprox" badge in the history. Prerequisite for RM-019.

## [RM-017] Home as a starting hub (2026-06-23 00:00)
The root stops being the logging form and becomes a hub with 3 entry points: Iniciar una rutina (→ `/routines`), Día libre (→ new route `/log`, the old form) and Crear rutina (→ `/routines/new`), with the `ContinueRoutineBanner` on top if there's an active session. The "repetir set"/"registrar otro" flow links (success, FAB and the history's "Repetir") were repointed to `/log`.

## [RM-016] Guided mode: screen-by-screen flow (2026-06-22 14:04)
Redesign of `/train`: the list view with `done/target` counters is removed; it's now a screen-to-screen state machine (log set → confirmation → continue). A contextual main button that follows the routine (next set if any are left, otherwise next exercise) + Otro ejercicio + Terminar. No auto-advance; the session only ends manually. Centered confirmation with a "what's next" message (machine/set to prepare) and a pop+pulse animation on completion. "Otro ejercicio" adds ad hoc to the session (`extras` in localStorage).

## [RM-015] Guided routine mode (execution) — MVP (2026-06-21 18:22)
`/train` screen: you pick a routine ("Empezar"), the app guides you exercise by exercise (target + last time's weight via `GET /workouts/last`), you log sets and it moves on. Progress/cursor in localStorage (resumes after reloading the page, with the same URL); each set is tagged with `Workout.routineId` (nullable, `onDelete: SetNull`). "Continuar" banner on the home. No `Session` entity; free logging stays intact.

## [RM-014] Create and manage routines — CRUD (2026-06-21 17:26)
New `Routine`/`RoutineItem` model (Prisma) + NestJS CRUD module and `/routines` UI (list, editor with `@dnd-kit` drag & drop, optional target sets/reps per exercise). No guided execution or recommendation: only the data foundations are laid. Entry from the home header.

## [RM-011] Edit dialog usable with the keyboard open (2026-06-15 12:18)
`useVisualViewport` hook that follows `window.visualViewport`; `EditWorkoutDialog` repositions the `DialogContent` to the center of the visible area and limits its height (scrollable) when the keyboard appears. On desktop it keeps the default centering.

## [RM-010] Editable comment in the edit dialog (2026-06-15 11:37)
The set edit dialog now includes a "Comentario" `<textarea>` that preloads the current opinion and persists via PATCH (the back end already supported `opinion`); no field in the dialog uses a placeholder.

## [RM-013] API migrated to pnpm 11 (2026-06-14 10:54)
`apps/api` moves from npm to pnpm 11.6.0 (corepack, `pnpm-lock.yaml`, no `package-lock.json`; `nodeLinker: hoisted` + `allowBuilds` for prisma in `pnpm-workspace.yaml`). Dockerfile on pnpm over Node 22 and `*.tsbuildinfo` excluded from the context; build and Docker stack validated (the API comes up and answers 200).

## [RM-009] Icon-only "Repetir" button in the history (2026-06-14 10:55)
In `WorkoutCard` the "Repetir" button now shows only the icon (`RotateCcw`), with `aria-label`/`title` "Repetir Set" to keep accessibility.

## [RM-008] Compact the history cards (2026-06-14 10:42)
`WorkoutCard` is now denser (`p-3` padding, actions next to the stats) and the opinion block only renders when it exists, with no reserved space: a set without a comment takes noticeably less height.

## [RM-012] Migration to self-hosted with Cloudflare Tunnel (2026-06-14 08:23)
Render/Vercel/Supabase are retired: the stack is self-hosted in Docker and only the front end goes out to the internet via Cloudflare Tunnel (quick tunnel for now). Added `docker-compose.dev.yml` (isolated Postgres for dev) and `apps/docker/README.md`; updated the root README and CLAUDE.md.

## [RM-005] kg/lb support (2026-06-14 01:23)
Local kg/lb toggle in the logging form: the weight is still always stored in kg and converted on the fly (1 lb = 0.45359237 kg, rounded to 0.5). Without touching the DB or the history.

## [TD-003] Grouping/filtering of workouts by local day (2026-06-13)
Workouts are grouped and filtered by day in the local zone (`APP_TIMEZONE`, default `America/Lima`) instead of UTC, so late-night sets stop falling into the next day.

## [TD-002] Web consumes the API through the Next server proxy (2026-06-13)
The web calls `/api/*` (Next server rewrite → `API_INTERNAL_URL`); `NEXT_PUBLIC_API_URL` is removed from the client. The API no longer publishes ports to the host: only the web is exposed (`:3000`), the only thing that crosses the tunnel.

## [TD-001] Fixed the web's Docker build (2026-06-13)
Uses pnpm (corepack + `pnpm install --frozen-lockfile`) instead of `npm ci` with an already deleted `package-lock.json`.
