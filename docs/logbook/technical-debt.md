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

## [TD-142] The offline set queue has no test of its own
- **Location:** `apps/web/src/lib/pendingSets.ts`
- **Risk:** 5/10
- **Problem:** the queue that keeps sets when there's no network (send in order, drop each one only after the API accepts it, a single flush at a time, re-flush when asked mid-flush) is only covered indirectly through `useGuidedSession.test.ts`; there's no `pendingSets.test.ts`. `PendingSet.body.setType` is also typed as `string` instead of `SetType`.
- **Future impact:** a change to the queue can lose or duplicate real sets without any test going red; it's the piece where a bug costs user data.
- **Suggestion:** a `pendingSets.test.ts` with a mocked `api.post`: failure mid-queue keeps the rest, two concurrent flushes send each set once, a flush requested mid-flush runs again.
- **Date:** 2026-10-26 · **Status:** Open

## [TD-141] Icon-only buttons without an accessible name
- **Location:** `apps/web/src/components/layout/AppHeader.tsx:56` (`BackAction`: neither label nor title), `AppHeader.tsx:67` and `:79` (`HistoryAction`, `RoutinesAction`: `title` only), plus the other header icon buttons
- **Risk:** 4/10
- **Problem:** several buttons and links show only a lucide icon and rely on `title` (not read reliably by screen readers, never shown on touch) or have nothing at all; there's no automated accessibility check.
- **Future impact:** a screen-reader user hears "link" or "button" with no purpose; regressions go unnoticed because nothing checks them.
- **Suggestion:** `aria-label` on every icon-only control, and an `@axe-core/playwright` check in the existing e2e.
- **Date:** 2026-10-26 · **Status:** Open

## [TD-140] Route protection and loading states live in the client
- **Location:** `apps/web/src/lib/auth-context.tsx:224` (redirect effect + `FullScreenLoader`), `apps/web/src/app/` (no `loading.tsx`, `error.tsx` or `not-found.tsx`)
- **Risk:** 4/10
- **Problem:** every private page waits for `GET /auth/me` in the browser before rendering, showing "Cargando…" and only then redirecting to `/login`; 51 files are `"use client"`. An exception in a page has no error boundary, and unknown URLs get Next's default 404.
- **Future impact:** a blank loader on every cold start (~250 ms per trip through the tunnel), a white screen on an unexpected error, and every new page has to remember the auth dance.
- **Suggestion:** redirect without a `token` cookie in `proxy.ts` (Next 16's name for middleware; verify when starting), as `app/page.tsx` already does, plus root `error.tsx` and `not-found.tsx`.
- **Date:** 2026-10-26 · **Status:** Open

## [TD-139] Web data fetching fails silently and isn't shared
- **Location:** `apps/web/src/lib/api.ts` (unused `token` parameter, 401 redirects and then throws anyway), `apps/web/src/lib/auth-context.tsx` (three hand-written `fetch`s next to the client), `apps/web/src/hooks/*` (22 files with `useEffect` + `fetch` + `useState`)
- **Risk:** 5/10
- **Problem:** 38 `console.error`s are the only reaction to a failed request (e.g. deleting a routine in `useRoutines.ts` fails with nothing on screen); only `useExplore.ts` and `PublishForm.tsx` guard against an older response arriving after a newer one; every hook repeats the same loading/error state by hand.
- **Future impact:** the user thinks something was saved or deleted when it wasn't; stale data can overwrite fresh data on fast tab switches; every new screen copies the pattern again.
- **Suggestion:** surface failures with `notifyError`, drop the dead `token` parameter, and route auth through the same client; the cache library of WL-082 would remove most of these hooks.
- **Date:** 2026-10-26 · **Status:** Open

## [TD-138] The web has no shared design system
- **Location:** `apps/web/src/components/**` and `apps/web/src/app/**` (the brand gradient is copied in 29 places; `components/ui/button.tsx` is used in 2 files)
- **Risk:** 4/10
- **Problem:** the tokens exist in `globals.css`, but the base components don't. `hsl(var(--brand-…))` appears 66 times, there are 92 hand-written `<button>`s, 37 hand-written display titles, 20 hand-written `Loader2` spinners, the "Guardando…" overlay copied 5 times, the same input class 5 times, 85 arbitrary `text-[…rem]` sizes, and 37 template-literal `className`s instead of `cn()`. Related: TD-126 (sheets) and TD-094 (border colors).
- **Future impact:** every visual change takes dozens of edits and one ends up different; desktop (WL-058) and translating the UI (RM-093) touch the same files and cost twice as much.
- **Suggestion:** a `bg-brand` utility via `@utility`, a `Button` with variants (`cva`), `Title`, `Spinner`, `LoadingOverlay`, an input variant and a type scale in `@theme`; migrate one piece per commit.
- **Date:** 2026-10-26 · **Status:** In progress (2026-10-26)

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

## [TD-126] Every bottom sheet copies its own scaffolding
- **Location:** `apps/web/src/components/profile/ThemeSheet.tsx:30`, `LanguageSheet.tsx:37`, `MeasureSheet.tsx`, `history/ExportSheet.tsx`, `news/NewsButton.tsx`, `train/SessionMap.tsx`
- **Risk:** 3/10
- **Problem:** the portal, the dark backdrop, the `anchor-bottom` container with its animation, the handle and the header with the X are repeated almost identically in six components.
- **Future impact:** a fix to the sheets (accessibility, swipe to close, focus) has to be done six times and one ends up different.
- **Date:** 2026-10-21 · **Status:** Open
