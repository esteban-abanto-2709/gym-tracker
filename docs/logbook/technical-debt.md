# Deuda Técnica

Registro de atajos, decisiones pendientes y riesgos a futuro de este proyecto.
Código `TD-###` (nunca se reutiliza). Al resolverse, la entrada se mueve al
changelog y se borra de aquí.

**Formato de cada entrada:**
- **Ubicación:** `archivo:línea` afectado.
- **Riesgo:** del 1 al 10 (1-3 cosmético · 4-6 ralentiza/moderado · 7-9 bug latente o seguridad · 10 crítico).
- **Problema:** qué está mal, sintetizado.
- **Impacto futuro:** qué puede causar si no se atiende.
- **Sugerencia:** (opcional) cómo resolverlo, en una línea. Es una pista para quien lo ejecute, no una especificación.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [TD-019] Los sets de tiempo guardan `reps = 1` de relleno
- **Ubicación:** `apps/api/prisma/schema.prisma` (`Workout.reps Int` no nullable); lo envían `apps/web/src/components/train/SetForm.tsx`, `apps/web/src/hooks/useWorkoutForm.ts` y `apps/web/src/hooks/useWorkoutHistory.ts`.
- **Riesgo:** 3/10
- **Problema:** Un set medido en tiempo no tiene repeticiones, pero `reps` es obligatorio, así que el front manda `reps: 1`. Es el mismo tipo de parche que `isTimed`: el dato miente sobre lo que pasó.
- **Impacto futuro:** Cualquier suma o promedio de reps (analítica, exportación para IA) cuenta un "1" falso por cada set de tiempo, y la recomendación agrupa reps de sets que no las tienen.
- **Sugerencia:** hacer `reps` nullable, dejar de enviarlo en sets de tiempo y migrar los existentes (`durationSec IS NOT NULL` → `reps = NULL`); revisar la recomendación y el historial para que no asuman reps.
- **Fecha:** 2026-09-16 · **Estado:** Abierto

## [TD-015] GoogleLogin re-inicializa GSI varias veces (warning en consola)
- **Ubicación:** `apps/web/src/components/auth/GoogleButton.tsx` (usa `GoogleLogin`), montado en `/login` y `/register`; provider en `apps/web/src/app/layout.tsx`.
- **Riesgo:** 2/10
- **Problema:** `GoogleLogin` de `@react-oauth/google` llama a `google.accounts.id.initialize()` en cada montaje. Con StrictMode en dev y al navegar entre `/login` y `/register` se invoca varias veces → `GSI_LOGGER: initialize() is called multiple times`.
- **Impacto futuro:** Solo ruido en consola (GSI usa la última instancia y el login funciona; en prod es más silencioso). Podría enmascarar un problema real si algún día dependiéramos de configurar el init por-instancia.
- **Sugerencia:** montar/inicializar GSI una sola vez (p. ej. un único punto de init a nivel layout, o memoizar), o asumirlo como artefacto dev-only de StrictMode.
- **Fecha:** 2026-07-30 · **Estado:** Abierto

## [TD-014] El "Reintentar" del toast puede duplicar un set o guardar datos viejos
- **Ubicación:** `apps/web/src/hooks/useGuidedSession.ts` (logSet), `apps/web/src/hooks/useWorkoutForm.ts` (handleSubmit), `apps/web/src/components/routines/RoutineEditor.tsx` (handleSave)
- **Riesgo:** 3/10
- **Problema:** Los closures `run` que se pasan a `notifyError` (fix de TD-006) no re-arman el flag de loading al reintentar (sin spinner, y el botón de submit queda habilitado) y capturan el estado del momento del fallo. Durante los 6s del toast: si el usuario reenvía manualmente con éxito y luego toca "Reintentar", el set se registra dos veces; en el editor de rutinas, el retry guarda el payload capturado antes del fallo, descartando ediciones posteriores.
- **Impacto futuro:** Sets duplicados esporádicos en el historial (difíciles de correlacionar con la causa) y ediciones de rutina perdidas tras un reintento.
- **Sugerencia:** re-armar el flag de loading al inicio de `run` y descartar el toast pendiente al reenviar manualmente (`toast.dismiss()`); en RoutineEditor, construir el payload dentro de `run`.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [TD-012] Botón X del combobox enfoca el primer input de la página
- **Ubicación:** `apps/web/src/components/exercises/ExerciseCombobox.tsx:117`
- **Riesgo:** 3/10
- **Problema:** Al limpiar la búsqueda se hace `document.querySelector("input")?.focus()`, que agarra el primer `<input>` del DOM, no el de búsqueda. En el editor de rutinas el primer input es el nombre de la rutina → el foco salta al campo equivocado.
- **Impacto futuro:** El usuario limpia la búsqueda y el teclado móvil se abre sobre otro campo; confusión y typos en el nombre de la rutina.
- **Sugerencia:** guardar un `ref` al input de búsqueda dentro del combobox y enfocar ese ref.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [TD-010] Lint roto: acceso a ref durante el render en useWorkoutForm
- **Ubicación:** `apps/web/src/hooks/useWorkoutForm.ts:94` (antes :36); también `apps/web/src/hooks/useWorkoutHistory.ts:69`.
- **Riesgo:** 4/10
- **Problema:** La lógica one-shot de *repeat* lee `repeatProcessed.current` durante el render, lo que viola la regla `react-hooks/refs`. Verificado el 2026-09-19: `pnpm lint` falla con **15 errores + 1 warning**, no con 2 como decía esta entrada — además de `react-hooks/refs` hay varios `react-hooks/set-state-in-effect`. El alcance real es mayor al registrado.
- **Impacto futuro:** El lint queda en rojo y enmascara errores nuevos; el patrón puede no re-ejecutarse como se espera en futuras versiones de React.
- **Sugerencia:** mover la lógica a un `useEffect` o inicializar el ref con el patrón `if (ref.current == null)`.
- **Fecha:** 2026-06-14 · **Estado:** Abierto
