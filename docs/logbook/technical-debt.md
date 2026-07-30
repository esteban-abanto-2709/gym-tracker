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

## [TD-007] El contenedor de la API descarga el CLI de Prisma al arrancar
- **Ubicación:** `apps/api/Dockerfile:47`
- **Riesgo:** 4/10
- **Problema:** El CMD ejecuta `pnpm dlx prisma@7.8.0 migrate deploy`, pero `prisma` es devDependency y el stage final instala con `pnpm install --prod`: pnpm lo descarga de internet en cada arranque del contenedor.
- **Impacto futuro:** Arranques lentos y fallo del contenedor si no hay red o npm está caído; además `migrate deploy` y el arranque quedan acoplados.
- **Sugerencia:** copiar el CLI de prisma desde el stage builder (ya lo tiene instalado) y ejecutar `migrate deploy` con ese binario local en el CMD/entrypoint.
- **Fecha:** 2026-06-10 · **Estado:** Abierto

## [TD-010] Lint roto: acceso a ref durante el render en useWorkoutForm
- **Ubicación:** `apps/web/src/hooks/useWorkoutForm.ts:36`
- **Riesgo:** 4/10
- **Problema:** La lógica one-shot de *repeat* lee `repeatProcessed.current` durante el render, lo que viola la regla `react-hooks/refs` y hace que `pnpm lint` falle con 2 errores (preexistentes, ajenos a kg/lb).
- **Impacto futuro:** El lint queda en rojo y enmascara errores nuevos; el patrón puede no re-ejecutarse como se espera en futuras versiones de React.
- **Sugerencia:** mover la lógica a un `useEffect` o inicializar el ref con el patrón `if (ref.current == null)`.
- **Fecha:** 2026-06-14 · **Estado:** Abierto

## [TD-009] PrismaService traga el error de conexión a la BD
- **Ubicación:** `apps/api/src/providers/prisma/prisma.service.ts:21-27`
- **Riesgo:** 3/10
- **Problema:** `onModuleInit` captura el error de `$connect` y solo lo loguea: la API arranca "sana" sin base de datos y responde 500 en cada request.
- **Impacto futuro:** Diagnóstico confuso en Docker (el healthcheck/depends_on parece OK pero nada funciona).
- **Sugerencia:** quitar el try/catch y dejar que el proceso falle; `restart: unless-stopped` del compose reintenta solo.
- **Fecha:** 2026-06-10 · **Estado:** Abierto
