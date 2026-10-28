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

