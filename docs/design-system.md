# Design system (`apps/web`)

Read this before adding or changing any UI. The look comes from
`docs/product-vision.md` (aggressive, energetic, with identity); these rules
keep it consistent. `pnpm lint` enforces the rules marked **(lint)**.

## The one rule

**If a style shows up a second time, it becomes a token or a base component.**
Don't copy a long `className` from another file: extend `components/base/`
(a new `cva` variant or a new piece) or `globals.css` (a new token), then use
it in both places.

## Where things live

| Place                  | What                                                                               | Edit by hand?                                                                |
| ---------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/app/globals.css`  | Theme variables (`:root`, `.dark`), `@theme` tokens, `@utility` classes, keyframes | Yes                                                                          |
| `src/components/base/` | Our own components and class helpers                                               | Yes                                                                          |
| `src/components/ui/`   | shadcn/ui primitives                                                               | **No.** Add with `pnpm exec shadcn add <name>`; wrap in `base/` to customize |
| `src/lib/utils.ts`     | `cn()`, merge-aware of our text sizes                                              | Rarely                                                                       |

## Tokens

**Colors** (as `bg-*`, `text-*`, `border-*`, `from-*`, `to-*`…):

| Token                                  | Use                                                                |
| -------------------------------------- | ------------------------------------------------------------------ |
| `background`, `foreground`             | Page and body text                                                 |
| `card`, `secondary`, `muted`, `accent` | Surfaces, quiet fills                                              |
| `muted-foreground`                     | Secondary text, idle icons                                         |
| `primary`                              | The action color (red): CTAs, selection, focus                     |
| `destructive`                          | Delete and danger (same red, different meaning)                    |
| `success`                              | Achievement only: PR, completed                                    |
| `warning`                              | Partial or pending states                                          |
| `border`, `input`, `ring`              | Lines, field borders, focus ring                                   |
| `brand-start`, `brand-end`             | The brand gradient: `bg-linear-to-r from-brand-start to-brand-end` |

**Text sizes:** Tailwind's scale (`text-xs`…`text-7xl`) plus four small ones
for labels and kickers: `text-2xs` (0.7rem), `text-3xs` (0.65rem), `text-4xs`
(0.6rem), `text-5xs` (0.55rem).

**Fonts:** `font-display` (Oswald) for titles and big numbers, `font-sans`
(Space Grotesk) for body, `font-mono` (Space Mono) through `kicker`.

**Utilities:** `kicker` (mono, uppercase, wide tracking label, e.g.
`// preferencias`), `hazard-bar` (diagonal stripes), `pb-nav` (room for the
bottom nav), `anchor-bottom` (keeps sheets on the visible iOS viewport), and the
`animate-*` classes in `globals.css`.

## Components and helpers (`components/base/`)

| Piece                                                            | When                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button` / `buttonVariants()`                                    | Any repeated button. Variants: `brand` (default), `muted` (edit), `danger` (delete), `remove` (round X). Sizes: `xl` (full-width CTA, default), `lg`, `md`, `icon`, `icon-round`. Use `buttonVariants()` on a `Link` that looks like a button |
| `heading({ size, className })`                                   | Every display title: base `font-display font-bold uppercase`; `sm` 2xl, `md` 4xl, `lg` 5xl (with `tracking-tight`). Works on any tag                                                                                                          |
| `Spinner`                                                        | Any loading icon (`className="size-10 text-primary"`)                                                                                                                                                                                         |
| `LoadingOverlay label="Guardando..."`                            | Full-screen blocking save or publish                                                                                                                                                                                                          |
| `BottomSheet` + `SheetHeader` / `SheetHandle`                    | Every panel that slides up from the bottom. Built on Radix Dialog: Escape, focus and scroll lock come with it. Title it with `SheetHeader` or `SheetTitle`. A non-Radix overlay opened from a sheet must replace it, not stack on it          |
| `surfaceClass`                                                   | The bordered card surface (`rounded-2xl border-2 border-input bg-card`) for panels, lists and tiles; add layout with `cn(surfaceClass, …)`                                                                                                    |
| `fieldInputClass`                                                | The large auth-style input (login, register)                                                                                                                                                                                                  |
| `themeColors`                                                    | Theme colors as strings for JS: charts, SVG, inline `style`                                                                                                                                                                                   |
| `profile/SettingsRow` (`settingsRowClass`, `SettingsRowContent`) | A row in a settings list: icon, kicker label, value and a chevron or pencil                                                                                                                                                                   |

A one-off element (a list row, a radio tile) may stay a plain `<button>` or
`<div>` with utilities; when a second copy appears, apply the one rule.

## Rules

- Compose classes with `cn()`, never a template literal. **(lint)**
- Import `cn` from `@/lib/utils`, not from `cn`. **(lint)**
  (`@/lib/utils` is built on the `cn` package with our text sizes added;
  shadcn files in `ui/` import the package directly, which is fine.)
- Buttons come from `@/components/base/button`. `@/components/ui/button` is
  shadcn's, used only inside its own dialogs; don't import it elsewhere. **(lint)**
- The same for spinners: `@/components/base/spinner`, not `@/components/ui/spinner`. **(lint)**
- Titles use `heading()`, never a hand-written `font-display font-bold uppercase`. **(lint)**
- Loading icons use `Spinner`, not `Loader2`. **(lint)**
- Bottom sheets use `BottomSheet`; no `createPortal` outside `base/`. **(lint)**
- No Tailwind palette colors (`bg-red-500`, `text-amber-400`…) and no raw
  colors (`bg-[#…]`, `hsl(var(--…))` in a class). Use a token; if none fits,
  add one to `globals.css` for both themes. **(lint)**
- No small rem or px text sizes (`text-[0.6rem]`, `text-[10px]`); use the
  theme scale, `text-5xs`…`text-7xl`. **(lint)** A one-off display size bigger
  than `1rem` (the landing hero) is the only acceptable arbitrary size.
- Never invert the theme (`bg-foreground text-background`) or hard-code
  `bg-white`, `bg-black`, `text-white`, `text-black`: a light screen is light
  everywhere and a dark one is dark everywhere. Selection uses
  `border-primary bg-primary/10 text-primary`. **(lint)**
- Don't edit `components/ui/`. If shadcn's style doesn't fit, wrap it in `base/`.
- Overriding a base piece: pass `className`; `cn()` lets the later class win.
- Icons come from `lucide-react`. No emoji anywhere in the UI.
- Design mobile-first (iPhone width); every screen works in light and dark.
- UI copy stays in Spanish, short and direct; base components take their text
  as props, so translating the UI later touches the callers, not `base/`.

## Charts

Training charts follow the same tokens; never invent colors.

- Take colors from `themeColors` (`primary` for the main series, `success` for
  PRs or goals hit, `warning` for partial, `mutedForeground` for axes and
  labels, `border` for grid lines). They are CSS variables, so the chart
  follows light and dark automatically.
- Text inside a chart uses the theme fonts: numbers in `font-display`, labels
  in `kicker` style.
- More than three series is a smell: prefer one highlighted series in
  `primary` and the rest in `mutedForeground`.
