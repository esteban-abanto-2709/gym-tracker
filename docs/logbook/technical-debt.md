# Deuda Técnica

Registro de atajos, decisiones pendientes y riesgos a futuro de este proyecto.
Código `TD-###` (nunca se reutiliza). Al resolverse, la entrada se mueve al
changelog y se borra de aquí.

**Formato de cada entrada:**
- **Ubicación:** `archivo:línea` afectado.
- **Riesgo:** del 1 al 10 (1-3 cosmético · 4-6 ralentiza/moderado · 7-9 bug latente o seguridad · 10 crítico).
- **Problema:** qué está mal, sintetizado.
- **Impacto futuro:** qué puede causar si no se atiende.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [TD-012] Botón X del combobox enfoca el primer input de la página
- **Ubicación:** `apps/web/src/components/exercises/ExerciseCombobox.tsx:117`
- **Riesgo:** 3/10
- **Problema:** Al limpiar la búsqueda se hace `document.querySelector("input")?.focus()`, que agarra el primer `<input>` del DOM, no el de búsqueda. En el editor de rutinas el primer input es el nombre de la rutina → el foco salta al campo equivocado.
- **Impacto futuro:** El usuario limpia la búsqueda y el teclado móvil se abre sobre otro campo; confusión y typos en el nombre de la rutina.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [TD-013] Sesión activa zombi si la rutina referenciada ya no existe
- **Ubicación:** `apps/web/src/hooks/useGuidedSession.ts:46-50`, `apps/web/src/components/train/ContinueRoutineBanner.tsx:21`
- **Riesgo:** 4/10
- **Problema:** Si la rutina de la sesión activa se borra (o su GET falla), `/train` muestra el empty state pero nunca limpia el localStorage; el banner "Continuar rutina" sigue apareciendo en Home apuntando a una sesión rota.
- **Impacto futuro:** Loop confuso Home → Entrenar → "No hay rutina activa" → Home, sin salida visible hasta que la sesión expire al día siguiente.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [TD-006] Errores de red silenciados en los hooks del frontend
- **Ubicación:** `apps/web/src/hooks/useWorkoutForm.ts:110-113`, `apps/web/src/hooks/useWorkoutHistory.ts:156-159` y `:188-191`, `apps/web/src/hooks/useGuidedSession.ts:113-114`, `apps/web/src/components/routines/RoutineEditor.tsx:199-202`
- **Riesgo:** 5/10
- **Problema:** Los `catch` solo hacen `console.error`; el usuario no ve ningún mensaje cuando falla un POST/PATCH/DELETE. Aplica al registro libre, al historial (editar/borrar), al modo guiado (registrar serie) y al guardado de rutinas.
- **Impacto futuro:** En el gym con señal móvil inestable, un set puede no guardarse sin que el usuario lo note → pérdida de datos percibida como bug. Es el problema #1 del diagnóstico UX (2026-07-23); mínimo viable: toast de error + reintentar.
- **Fecha:** 2026-06-10 · **Estado:** Abierto

## [TD-007] El contenedor de la API descarga el CLI de Prisma al arrancar
- **Ubicación:** `apps/api/Dockerfile:47`
- **Riesgo:** 4/10
- **Problema:** El CMD ejecuta `pnpm dlx prisma@7.8.0 migrate deploy`, pero `prisma` es devDependency y el stage final instala con `pnpm install --prod`: pnpm lo descarga de internet en cada arranque del contenedor.
- **Impacto futuro:** Arranques lentos y fallo del contenedor si no hay red o npm está caído; además `migrate deploy` y el arranque quedan acoplados.
- **Fecha:** 2026-06-10 · **Estado:** Abierto

## [TD-008] findDistinctDates carga todos los workouts en memoria
- **Ubicación:** `apps/api/src/modules/workouts/workouts.service.ts:69-82`
- **Riesgo:** 3/10
- **Problema:** Para obtener fechas distintas se traen todas las filas y se deduplican en JS, en lugar de un `SELECT DISTINCT` / `groupBy` en SQL.
- **Impacto futuro:** Crecimiento lineal de memoria/latencia con el historial; irrelevante hoy, molesto en unos años de uso diario.
- **Fecha:** 2026-06-10 · **Estado:** Abierto

## [TD-010] Lint roto: acceso a ref durante el render en useWorkoutForm
- **Ubicación:** `apps/web/src/hooks/useWorkoutForm.ts:36`
- **Riesgo:** 4/10
- **Problema:** La lógica one-shot de *repeat* lee `repeatProcessed.current` durante el render, lo que viola la regla `react-hooks/refs` y hace que `pnpm lint` falle con 2 errores (preexistentes, ajenos a kg/lb).
- **Impacto futuro:** El lint queda en rojo y enmascara errores nuevos; el patrón puede no re-ejecutarse como se espera en futuras versiones de React. Mover la lógica a un `useEffect` o inicializar el ref con el patrón `if (ref.current == null)`.
- **Fecha:** 2026-06-14 · **Estado:** Abierto

## [TD-009] PrismaService traga el error de conexión a la BD
- **Ubicación:** `apps/api/src/providers/prisma/prisma.service.ts:21-27`
- **Riesgo:** 3/10
- **Problema:** `onModuleInit` captura el error de `$connect` y solo lo loguea: la API arranca "sana" sin base de datos y responde 500 en cada request.
- **Impacto futuro:** Diagnóstico confuso en Docker (el healthcheck/depends_on parece OK pero nada funciona); mejor dejar que el proceso falle y `restart: unless-stopped` reintente.
- **Fecha:** 2026-06-10 · **Estado:** Abierto
