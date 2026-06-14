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

## [TD-004] API sin validación de entrada
- **Ubicación:** `apps/api/src/main.ts:5` y `apps/api/src/modules/*/dto/*.ts`
- **Riesgo:** 5/10
- **Problema:** No hay `ValidationPipe` global ni decoradores de `class-validator` en los DTOs (ni está instalada la librería). Cualquier payload llega tal cual a Prisma; `reps: NaN` o campos extra producen errores 500 opacos.
- **Impacto futuro:** Bugs silenciosos (p. ej. `Number("")` → 0 guardado como peso) y respuestas 500 en lugar de 400 descriptivos. Será obligatorio antes de v2.0 (auth multi-usuario).
- **Fecha:** 2026-06-10 · **Estado:** Abierto

## [TD-005] API y web sin ninguna autenticación, pronto expuestas a internet
- **Ubicación:** `apps/api/src/main.ts:7-10`
- **Riesgo:** 6/10
- **Problema:** No existe auth (planificada para v2.0). Hoy lo cubre la oscuridad de las URLs de Vercel/Render, pero al exponer el stack local por Cloudflare Tunnel, cualquiera con la URL puede leer y escribir en la base de datos.
- **Impacto futuro:** Escritura/borrado anónimo de datos en la BD local. Mitigable sin código con Cloudflare Access delante del tunnel.
- **Fecha:** 2026-06-10 · **Estado:** Abierto

## [TD-006] Errores de red silenciados en los hooks del frontend
- **Ubicación:** `apps/web/src/hooks/useWorkoutForm.ts:89-92`, `apps/web/src/hooks/useWorkoutHistory.ts:144-147`
- **Riesgo:** 5/10
- **Problema:** Los `catch` solo hacen `console.error`; el usuario no ve ningún mensaje cuando falla un POST/PATCH/DELETE.
- **Impacto futuro:** En el gym con señal móvil inestable (escenario principal del tunnel), un set puede no guardarse sin que el usuario lo note → pérdida de datos percibida como bug.
- **Fecha:** 2026-06-10 · **Estado:** Abierto

## [TD-007] El contenedor de la API descarga el CLI de Prisma al arrancar
- **Ubicación:** `apps/api/Dockerfile:42`
- **Riesgo:** 4/10
- **Problema:** El CMD ejecuta `npx prisma migrate deploy`, pero `prisma` es devDependency y el stage final instala con `--omit=dev`: npx lo descarga de internet en cada arranque del contenedor.
- **Impacto futuro:** Arranques lentos y fallo del contenedor si no hay red o npm está caído; además `migrate deploy` y el arranque quedan acoplados.
- **Fecha:** 2026-06-10 · **Estado:** Abierto

## [TD-008] findDistinctDates carga todos los workouts en memoria
- **Ubicación:** `apps/api/src/modules/workouts/workouts.service.ts:22-35`
- **Riesgo:** 3/10
- **Problema:** Para obtener fechas distintas se traen todas las filas y se deduplican en JS, en lugar de un `SELECT DISTINCT` / `groupBy` en SQL.
- **Impacto futuro:** Crecimiento lineal de memoria/latencia con el historial; irrelevante hoy, molesto en unos años de uso diario.
- **Fecha:** 2026-06-10 · **Estado:** Abierto

## [TD-010] Lint roto: acceso a ref durante el render en useWorkoutForm
- **Ubicación:** `apps/web/src/hooks/useWorkoutForm.ts:35`
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
