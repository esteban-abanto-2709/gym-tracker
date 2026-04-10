# WEB TODOs (v1.0: Normalización)

## ✅ Refactorización Arquitectónica (Completada)

**Estado**: COMPLETADO

Se modularizó `page.tsx` (567 → 197 líneas) y `history/page.tsx` (530 → 166 líneas) extrayendo lógica a hooks y UI a componentes reutilizables.

### Lo que se hizo:

1. **Tipados Globales:**
   - [x] `lib/types.ts` — Interfaces `Exercise`, `Equipment`, `Workout`

2. **Custom Hooks (Lógica de Negocio):**
   - [x] `hooks/useExercises.ts` — Fetch, filtrado, creación de ejercicios
   - [x] `hooks/useWorkoutForm.ts` — Estado del formulario, repeat desde sessionStorage, submit
   - [x] `hooks/useWorkoutHistory.ts` — Fetch fechas, cache inteligente, CRUD workouts

3. **Componentes UI Aislados:**
   - [x] `components/exercises/ExerciseCombobox.tsx` — Selector visual con tarjeta premium
   - [x] `components/exercises/CreateExerciseModal.tsx` — Dialog de creación con selector de Equipment
   - [x] `components/history/WorkoutCard.tsx` — Tarjeta de workout set
   - [x] `components/history/EditWorkoutDialog.tsx` — Modal de edición
   - [x] `components/history/DeleteWorkoutDialog.tsx` — Confirmación de borrado

4. **Componentes Layout Compartidos:**
   - [x] `components/layout/PageShell.tsx` — Wrapper con background pattern + gradient orbs
   - [x] `components/layout/AppHeader.tsx` — Header flexible con slots reutilizables

5. **Limpieza Final:**
   - [x] `page.tsx` reducido a orquestador (~197 líneas)
   - [x] `history/page.tsx` reducido a orquestador (~166 líneas)
   - [x] `success/page.tsx` usa layout compartido (~83 líneas)
   - [x] Lint y build sin errores
