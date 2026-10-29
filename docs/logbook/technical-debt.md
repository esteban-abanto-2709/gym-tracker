# Technical Debt

Shortcuts, pending decisions and future risks in this project.
Code `TD-###` (never reused). Once resolved, the entry moves to the changelog
and is deleted from here.

**Entry format:**
- **Location:** affected `file:line`.
- **Risk:** 1 to 10 (1-3 cosmetic · 4-6 slows down/moderate · 7-9 latent bug or security · 10 critical).
- **Problem:** what's wrong, condensed.
- **Future impact:** what it can cause if left alone.
- **Suggestion:** (optional) how to fix it, in one line. A hint for whoever picks it up, not a spec.
- **Date** and **Status** (Open / In progress).

---

## [TD-165] Small convention drift in the API
- **Location:** `apps/api/src/modules/auth/auth.module.ts:17`, `apps/api/src/modules/auth/auth.service.ts:19`, `apps/api/src/common/slugify.ts`, `apps/api/src/common/locale.ts:3`, `apps/api/src/modules/exercises/exercises.service.ts:3`
- **Risk:** 2/10
- **Problem:** the throttler message is in Spanish though all code is English; three separate "strip accents and normalize" helpers (`slugify`, `uniqueSlug`, `toSearchName`); `exercises.service.ts` uses relative imports while the rest uses `@/`. Unlike the web, no lint rule guards the API's own conventions.
- **Future impact:** the three normalizers drift apart (a slug and a search name built differently for the same text); a Spanish message reaches English users.
- **Suggestion:** one normalize helper reused by the three; English message (the web already translates 429s); a lint rule for `@/` imports.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-164] API response shapes are inconsistent and the README is out of date
- **Location:** `apps/api/src/modules/publications/publications.service.ts:83`, `apps/api/src/modules/workouts/workouts.service.ts`, `apps/api/README.md`
- **Risk:** 3/10
- **Problem:** DELETE returns the deleted row (workouts, routines, programs), `{id}` (publications) or `{ok:true}` (measurements, auth); POST and PATCH `/workouts` return the bare row while GET returns it with relations. The README's endpoint table lacks `PATCH /auth/password` and `DELETE /auth/me` and still says the P2002 → 409 mapping is only for programs.
- **Future impact:** every client has to learn each endpoint's shape by reading code; a second client gets it wrong.
- **Suggestion:** pick one DELETE shape (`204` or `{ok:true}`) and make writes return what GET returns; refresh the README table.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-163] The API doesn't check its config at boot
- **Location:** `apps/api/src/modules/auth/auth.module.ts:10`, `apps/api/src/main.ts`, `apps/api/Dockerfile`, `apps/api/.env.example`
- **Risk:** 4/10
- **Problem:** `process.env` is read in 7 places with no check: without `JWT_SECRET` the app starts and every login fails with a 500. The container runs as root (no `USER node`) and `.env.example` lacks `NODE_ENV`, which decides whether the cookie is `secure`.
- **Future impact:** a broken `.env` passes the deploy healthcheck and only shows up when someone tries to log in.
- **Suggestion:** a 10-line required-vars check at the top of `bootstrap()`; `USER node` in the runtime stage. No config library.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-162] Foreign keys without an index
- **Location:** `apps/api/prisma/schema.prisma:205` (`RoutineItem.routineId`), plus `Routine.programId`, `Workout.routineId`, `Session.routineId`, `Exercise.createdById`
- **Risk:** 2/10
- **Problem:** Postgres doesn't index foreign keys on its own; `RoutineItem.routineId` is read on every routines and programs GET, and the others on deletes (`SetNull`) and program views.
- **Future impact:** sequential scans that grow with every user's data; invisible today because the tables are small.
- **Suggestion:** one `@@index` per key in a single migration.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-161] The API's tsconfig isn't strict
- **Location:** `apps/api/tsconfig.json:23`
- **Risk:** 3/10
- **Problem:** no `strict`, with `noImplicitAny: false` and `strictBindCallApply: false`. Today there are 0 implicit `any`s, but nothing stops new ones. Turning on `strict` gives 29 errors: 26 are DTO `TS2564` (normal with class-validator) and only 3 are real (`auth.module.ts:13`, `exercises.service.spec.ts:27`, `measurements.service.spec.ts:38`).
- **Future impact:** untyped code creeps in unnoticed, and query params typed `string` can be `undefined` (see TD-156).
- **Suggestion:** `strict: true` + `strictPropertyInitialization: false`, and fix the 3 errors.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-160] The public healthz leaks the DB error and reports no real version
- **Location:** `apps/api/src/app.service.ts:34`, `apps/api/src/app.service.ts:16`
- **Risk:** 3/10
- **Problem:** `/healthz` is public and returns the database driver's raw `error.message`; its `version` comes from `package.json` and always says `0.0.1`. The API has no logger at all (0 `Logger` uses), so errors only reach Nest's default handler.
- **Future impact:** internal details exposed to anyone; after a deploy there's no way to tell which commit is running.
- **Suggestion:** return a fixed `"db": "down"` and log the detail with Nest's `Logger`; pass the commit SHA as an env var at build time.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-159] The API e2e suite is flaky and leaks handles
- **Location:** `apps/api/test/explore.e2e-spec.ts:80`, `apps/api/package.json` (`test:e2e`), `apps/api/test/*.e2e-spec.ts`
- **Risk:** 4/10
- **Problem:** the explore `beforeAll` went over the 5 s timeout in 1 of 3 full runs (12 failures); Jest warns "worker failed to exit gracefully" on every run and `--forceExit` hides it. The app bootstrap, `ValidationPipe` config included, is copied into all 17 files instead of reusing `main.ts`.
- **Future impact:** a red CD for no reason, and e2e that test a different app from prod the day `main.ts` changes.
- **Suggestion:** a shared `createTestApp()` that applies the same setup as `main.ts`, a longer timeout on heavy `beforeAll`s, and find the open handle with `--detectOpenHandles`.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-158] No test guards that one user can't reach another's data
- **Location:** `apps/api/test/` (no suite for it)
- **Risk:** 6/10
- **Problem:** every service filters by `userId` today (read one by one), but no e2e checks that user B gets 404 on GET, PATCH or DELETE of user A's `routines/:id`, `programs/:id`, `workouts/:id` or measurements. `/programs/active` (today's routine), `/measurements`, `/equipment` and `/healthz` have no e2e at all.
- **Future impact:** a refactor that drops one `userId` filter leaks a person's training data to everyone, and CI stays green.
- **Suggestion:** one parametrized suite: user A creates each resource, user B tries every verb and must get 404.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-157] Text and list fields have no maximum size
- **Location:** `apps/api/src/modules/routines/dto/create-routine.dto.ts:32`, `apps/api/src/modules/programs/dto/create-program.dto.ts:12`, `apps/api/src/modules/exercises/dto/create-exercise.dto.ts:13`, `apps/api/src/modules/workouts/dto/create-workout.dto.ts:49`, `apps/api/src/modules/workouts/dto/update-workout.dto.ts:39`
- **Risk:** 5/10
- **Problem:** routine, program and exercise names and a set's `opinion` take any length; routine items and blocks have no `ArrayMaxSize`; `equipmentId` is only checked as a string.
- **Future impact:** a client (or a script) can store megabytes per row, break layouts with endless names, or publish huge routines that every Explore visitor downloads.
- **Suggestion:** `MaxLength` on every free-text field and `ArrayMaxSize` on items and blocks, with limits generous enough for real use.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-156] Recommendation and progress don't validate their query
- **Location:** `apps/api/src/modules/workouts/workouts.controller.ts:38`, `apps/api/src/modules/workouts/workouts.controller.ts:58`, `apps/api/src/modules/workouts/streak.ts:47`
- **Risk:** 5/10
- **Problem:** both read loose `@Query` params instead of a DTO. Without `exerciseId` the Prisma filter is `undefined`, so they answer with data from any of the user's exercises; an invalid `tz` makes `Intl` throw a `RangeError` in `streak.ts` → 500. Creating a set does validate `tz` (`workouts.service.ts:111`).
- **Future impact:** a client bug shows the wrong last set or streak without any error; a bad timezone breaks the training screen.
- **Suggestion:** a query DTO with a required `exerciseId` and the same `tz` check `create` already uses.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-155] Custom exercises are shared with every user
- **Location:** `apps/api/src/modules/exercises/exercises.service.ts:44`, `apps/api/src/modules/exercises/exercises.service.ts:22`, `apps/api/src/modules/exercises/exercises.controller.ts`
- **Risk:** 7/10
- **Problem:** `findAll` has no `createdById` filter, so every custom exercise anyone creates shows up in everyone's catalog; `create` returns another user's custom exercise when the name matches; `POST /exercises` has no throttle and no name length limit (TD-157).
- **Future impact:** with people Esteban doesn't know, anyone can fill everyone's exercise list with junk or offensive names, and nothing undoes it short of deleting rows by hand.
- **Suggestion:** decide visibility first (official + own: `createdById: null OR createdById: userId` in `findAll` and in the match in `create`), then throttle `POST /exercises`.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-154] Foreign key and unique violations answer 500 instead of 4xx
- **Location:** `apps/api/src/main.ts` (no exception filter), `apps/api/src/modules/routines/routines.service.ts`, `apps/api/src/modules/workouts/workouts.service.ts`, `apps/api/src/modules/auth/auth.service.ts`
- **Risk:** 6/10
- **Problem:** Prisma's P2003 (missing foreign key) and the P2002 races outside `withUniqueName` reach the client as 500: a routine with a valid but nonexistent `exerciseId`, a set POST or PATCH with a nonexistent `exerciseId` or `equipmentId`, and races on register, user slug and exercise create.
- **Future impact:** clients can't tell "never going to be accepted" (4xx) from "failed now, retry" (5xx); it's the API half of TD-149, since the offline queue can't learn to drop a set the API will always refuse.
- **Suggestion:** one small global filter: P2003 → 400 (or 404), P2002 → 409, everything else untouched.
- **Date:** 2026-10-29 · **Status:** Open

## [TD-153] The axe check on the training screen is flaky
- **Location:** `apps/web/e2e/a11y.spec.ts:128`, `apps/web/e2e/axe.ts:13`, `apps/web/src/app/train/page.tsx:126`
- **Risk:** 4/10
- **Problem:** "training is accessible" fails about one run in three with `color-contrast` on the whole set form (`.text-primary`, `.bg-primary`, the weight and reps inputs, the chips), with or without React Compiler. The likely cause is axe measuring while `animate-fade-in-up` is still running: the form mounts after the recommendation fetch, so its animation can start after `expectAccessible` collected the running ones.
- **Future impact:** a red e2e that says nothing about the app; real contrast regressions on that screen get ignored as "the flaky one".
- **Suggestion:** wait for the set form to be visible before `expectAccessible`, or disable animations in the e2e (`reducedMotion: "reduce"` once TD-152 lands).
- **Date:** 2026-10-28 · **Status:** Open

## [TD-152] Animations ignore reduced motion
- **Location:** `apps/web/src/app/globals.css:177` (`.animate-fade-in-up`, `.animate-slide-in-right`, `.animate-scale-in`)
- **Risk:** 2/10
- **Problem:** the entrance animations run on every page even when the phone asks for reduced motion; only a few spots use `motion-safe:`.
- **Future impact:** people sensitive to motion get every page sliding in; axe doesn't check it, so nothing catches new ones.
- **Suggestion:** wrap the custom animations in `@media (prefers-reduced-motion: no-preference)`.
- **Date:** 2026-10-27 · **Status:** Open

## [TD-151] The web e2e suite sits at the API's sign-up rate limit
- **Location:** `apps/api/src/modules/auth/auth.module.ts:14`, `apps/web/e2e/`
- **Risk:** 3/10
- **Problem:** register and login allow 5 calls per minute per IP, and the e2e suite already makes exactly 5 (`pending-sets` 3, `train` 1, `a11y` 1). A second run within a minute fails with 429s that look like broken tests.
- **Future impact:** the next journey that signs a user in breaks CI for a reason that has nothing to do with the app.
- **Suggestion:** a higher limit outside prod through an env var, or sign one user in once and share its cookies across specs.
- **Date:** 2026-10-27 · **Status:** Open

## [TD-149] A set the API rejects for good still blocks the offline queue
- **Location:** `apps/web/src/lib/pendingSets.ts:64`
- **Risk:** 4/10
- **Problem:** since TD-147 a deleted routine or equipment no longer blocks the queue, but `drain` still stops at the first failed set whatever the error, so a set the API can never accept (its exercise deleted from the catalog, or a body an older app version saved after the set DTO changed) keeps every set behind it from being sent. The only way out is discarding the whole queue.
- **Future impact:** one bad set can hold back a whole session of real sets.
- **Suggestion:** two rules before code: change the set DTO only with expand/contract, and never delete a catalog exercise (hide or redirect it when merging).
- **Date:** 2026-10-27 · **Status:** Open

## [TD-137] Switching between login and sign-up drops the way back
- **Location:** `apps/web/src/app/login/page.tsx:106`, `apps/web/src/app/register/page.tsx:132`
- **Risk:** 3/10
- **Problem:** a guest who comes from a publication lands on `/register?next=…` or `/login?next=…`, but the link between those two pages is plain `routes.register()` / `routes.login()`, so the `next` is lost if they switch.
- **Future impact:** a guest who already had an account (or not) ends up on the home page instead of the routine they wanted to copy; it gets worse once public profiles also send people to sign up.
- **Date:** 2026-10-26 · **Status:** Open

## [TD-130] Equipment ids are in Spanish
- **Location:** `Equipment` table (ids `barra`, `polea`, `mancuerna`, `maquina`, `otro`… seeded in the `equipo_tabla_y_slug` migration); `apps/web/src/lib/equipmentIcons.ts`.
- **Risk:** 2/10
- **Problem:** the rule is that slugs are in English, but the `Equipment` ids are Spanish words and they show up in the code (icons, tests, each set's `equipmentId`). Changing them isn't a rename: it's a data migration over `Workout.equipmentId` in prod and over the `equipmentMemory` `localStorage`.
- **Future impact:** every new equipment (TD-091) adds another Spanish id if this isn't decided first.
- **Suggestion:** decide it while doing TD-091 / RM-090, which already touch that table: either the ids are migrated to English in the same step, or we accept that existing ids stay and new ones go in English.
- **Date:** 2026-10-23 · **Status:** Open

## [TD-104] The session's "extra" exercises are dead code
- **Location:** `apps/web/src/hooks/useGuidedSession.ts:104`, `apps/web/src/lib/activeSession.ts:16`
- **Risk:** 2/10
- **Problem:** the guided session stores and merges `extras` (exercises added mid-session), but no screen adds them since the map only replaces.
- **Future impact:** branches and types nobody exercises confuse whoever reads the session and decides about free sets (WL-103).
- **Suggestion:** delete `extras` from the hook and from `ActiveSession`, or bring "add exercise" back to the map if wanted.
- **Date:** 2026-10-13 · **Status:** Open

## [TD-099] The routine editor doesn't explain where the weight goes
- **Location:** `apps/web/src/components/routines/RoutineEditor.tsx`
- **Risk:** 3/10
- **Problem:** the routine defines sets and reps, but not weight, on purpose: the weight is entered while training and the app remembers the last one. Nothing in the editor says so, and a new user's first question was "¿cómo pongo el peso de los ejercicios?".
- **Future impact:** every new user gets stuck at the same point when building their first routine.
- **Suggestion:** a help line in the editor ("El peso lo pones al entrenar; la app recuerda el último") and a card in Novedades.
- **Date:** 2026-10-13 · **Status:** Open

## [TD-091] The equipment list has no Smith machine
- **Location:** `Equipment` table (seeded in the `equipo_tabla_y_slug` migration)
- **Risk:** 3/10
- **Problem:** the equipment is generic (Barra, Polea, Mancuerna, Máquina, Peso Corporal, Otro). A Smith squat ends up as "Máquina", mixed with any other machine, and its history and streak are compared with other machines'.
- **Future impact:** without Smith, variants like "Squat + Smith" (RM-090) can't be built, and other common equipment (EZ bar, kettlebell, band) has the same problem.
- **Suggestion:** review which equipment is missing, add it with a data migration and reassign the sets that belong to it.
- **Date:** 2026-10-12 · **Status:** Open

## [TD-089] An exercise doesn't know whether it's done one-handed
- **Location:** `apps/api/prisma/schema.prisma` (`Exercise`, `Workout`)
- **Risk:** 4/10
- **Problem:** the exercise dictionary doesn't know whether a set was unilateral (one hand or one leg at a time). When merging the existing exercises with the official ones, variants like "curl biceps unilateral" ended up inside the bilateral exercise and their history gets mixed.
- **Future impact:** last time, the streak and the suggestions compare one-handed set weights with two-handed sets.
- **Suggestion:** mark unilateral on the set (like the equipment), not as a separate exercise.
- **Date:** 2026-10-12 · **Status:** Open

## [TD-081] Routines scrolls with several routines
- **Location:** `apps/web/src/app/routines/page.tsx`
- **Risk:** 3/10
- **Problem:** with 7 routines the screen is ~933 px tall on an 844 iPhone and scrolls; the shortcuts to Programas and Explorar end up below the bar. It clashes with the no-scroll rule in `docs/ux-foundations.md`.
- **Future impact:** every new routine pushes more content off the screen.
- **Suggestion:** compact the cards or group by program, keeping the shortcuts on top.
- **Date:** 2026-10-09 · **Status:** Open

## [TD-135] TikTok on Android without the app installed, untested
- **Location:** `apps/web/src/lib/tiktok.ts` (Android branch of `openTikTok`)
- **Risk:** 3/10
- **Problem:** on Android the button opens `intent://search?keyword=…` with the `snssdk1233` scheme and TikTok's package, with no web fallback; tested only with TikTok installed. Without the app, the expected behavior is that Android opens TikTok in the Play Store, outside the PWA.
- **Future impact:** if Android doesn't do that, whoever doesn't have TikTok taps the button and gets nothing or ends up on a weird screen.
- **Suggestion:** test from the installed PWA on an Android without TikTok; don't go back to `browser_fallback_url`, which loads the website inside the PWA.
- **Date:** 2026-10-24 · **Status:** Open

## [TD-069] TikTok on iOS without the app installed, untested
- **Location:** `apps/web/src/lib/tiktok.ts` (iOS branch of `openTikTok`)
- **Risk:** 3/10
- **Problem:** on iOS the button opens `snssdk1233://search?keyword=…` directly, tested only with TikTok installed. It's unknown what happens on an iPhone without the app: the expected behavior is that nothing happens or an invalid-address alert shows up. A timer-based fallback was discarded because it jumped to Safari even when TikTok opened fine.
- **Future impact:** whoever doesn't have TikTok taps the button and gets nothing.
- **Suggestion:** test on an iPhone without TikTok from the installed PWA and, if a fallback is needed, use `x-safari-https://` without relying on timing.
- **Date:** 2026-10-07 · **Status:** Open

## [TD-015] GoogleLogin re-initializes GSI several times (console warning)
- **Location:** `apps/web/src/components/auth/GoogleButton.tsx` (uses `GoogleLogin`), mounted on `/login` and `/register`; provider in `apps/web/src/app/layout.tsx`.
- **Risk:** 2/10
- **Problem:** `@react-oauth/google`'s `GoogleLogin` calls `google.accounts.id.initialize()` on every mount. With StrictMode in dev and when navigating between `/login` and `/register` it's invoked several times → `GSI_LOGGER: initialize() is called multiple times`.
- **Future impact:** Only console noise (GSI uses the last instance and login works; in prod it's quieter). It could mask a real problem if we ever depended on configuring the init per instance.
- **Suggestion:** mount/initialize GSI only once (e.g. a single init point at layout level, or memoize), or accept it as a dev-only StrictMode artifact.
- **Date:** 2026-07-30 · **Status:** Open

## [TD-014] The routine editor's "Reintentar" can save stale data
- **Location:** `apps/web/src/components/routines/RoutineEditor.tsx` (handleSave). Free logging and the guided session no longer use this retry: they go through the set queue with `clientId`.
- **Risk:** 3/10
- **Problem:** The `run` closure passed to `notifyError` (TD-006 fix) doesn't re-arm the loading flag on retry (no spinner, and the button stays enabled) and captures the state at the moment of the failure: during the toast's 6s, the retry saves the payload captured before the failure and drops later edits.
- **Future impact:** routine edits lost after a retry.
- **Suggestion:** build the payload inside `run`.
- **Date:** 2026-07-23 · **Status:** Open

## [TD-012] The combobox X button focuses the page's first input
- **Location:** `apps/web/src/components/exercises/ExerciseCombobox.tsx:117`
- **Risk:** 3/10
- **Problem:** When clearing the search it does `document.querySelector("input")?.focus()`, which grabs the first `<input>` in the DOM, not the search one. In the routine editor the first input is the routine name → focus jumps to the wrong field.
- **Future impact:** The user clears the search and the mobile keyboard opens over another field; confusion and typos in the routine name.
- **Suggestion:** keep a `ref` to the search input inside the combobox and focus that ref.
- **Date:** 2026-07-23 · **Status:** Open

