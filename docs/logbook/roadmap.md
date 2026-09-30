# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

> Tareas del cierre de **H1 · Registro afilado**, refinamiento de **H2 ·
> Entrenamientos estructurados** y apertura de **H3 · Recomendación de peso**
> (ver [`../milestones.md`](../milestones.md)).

## [RM-030] Programas de entrenamiento · fase 1: uso diario + "hoy te toca"
- **Objetivo:** agrupar rutinas en un **programa** (estilo de entrenamiento: "PPL" = Push/Pull/Leg, "Upper/Lower" = Upper A → Lower A → Upper B → Lower B) con un orden de rotación, dejar en el perfil cuál sigue el usuario hoy y que la app proponga la rutina que toca para empezarla con un toque.
- **Modelo:** `Program` (`userId`, `name`, `@@unique([userId, name])`, igual que `Routine`). `Routine.programId` nullable (`onDelete: SetNull`) + `Routine.programPosition` (orden dentro del programa): una rutina pertenece a **un** programa o a ninguno (1-N, no N-N). `User.activeProgramId` nullable (`onDelete: SetNull`): el programa activo vive en la BD, no en localStorage, para que siga al usuario entre dispositivos.
- **Migración:** solo columnas/tabla nuevas, sin backfill. Las rutinas existentes quedan sueltas (`programId = null`) y cada usuario las agrupa desde la UI.
- **Hoy te toca:** la siguiente, en el orden del programa activo, a la rutina del último `Workout` con `routineId` de ese programa (vuelve al inicio tras la última). Sin historial en el programa → la primera. Sin calendario ni días de la semana; si quieres otra, la eliges a mano.
- **Web:** en Perfil se ve y se cambia el programa activo, y se crean/editan programas (nombre + rutinas en orden). `/routines` muestra solo las del programa activo; el resto (otros programas y sueltas) detrás de "Otros programas". En Inicio, "Iniciar rutina" dice "Hoy: Lower A" y arranca esa rutina con un toque. Sin programa activo todo se comporta como hoy.
- **Fuera de alcance:** copiar programas (RM-038), historial de programas ("seguí PPL de junio a septiembre"), estadísticas por programa, selector de programa dentro de `RoutineEditor` (las rutinas se asignan desde el programa).
- **Hecho cuando:** creo "PPL" y "Upper/Lower" con sus rutinas en orden, marco "Upper/Lower" como activo desde el perfil, `/routines` solo muestra Upper A/B y Lower A/B, y tras hacer Upper A el Inicio me propone "Hoy: Lower A" y la empiezo con un toque.
- **Fecha:** 2026-09-16 · **Estado:** En progreso (2026-09-30)

## [RM-038] Programas de entrenamiento · fase 2: explorar y copiar programas
- **Objetivo:** bajar la barrera de entrada para amigos nuevos: en vez de armar sus rutinas desde cero, copian un programa existente y lo ajustan a su gimnasio.
- **Explorar programas:** pantalla que lista los programas de **todos** los usuarios (grupo chico, sin privacidad por programa), con autor y sus rutinas. Nada de tienda: sin búsqueda, categorías ni likes.
- **Copiar:** botón que hace una **copia profunda e independiente**, no una referencia. El amigo recibe sus propias filas `Program`/`Routine`/`RoutineItem` y puede editarlas libremente (cambiar ejercicios, metas, orden) sin que se toque el original, y viceversa. La copia guarda de dónde viene (`Program.copiedFromId` nullable, `onDelete: SetNull`) solo como dato de origen, sin sincronizar nada. Los `Exercise` son un catálogo global y se comparten: cambiar un ejercicio en la copia es repuntar su `RoutineItem`, nunca editar el `Exercise`. El programa copiado queda como **activo**. Choque de nombres (`@@unique([userId, name])` en `Program` y `Routine`) se resuelve con sufijo.
- **Onboarding:** un usuario sin rutinas ve la invitación a copiar un programa, que lo lleva a Explorar.
- **Fuera de alcance:** perfiles de amigos, seguir usuarios, tienda (WL-002 sigue en la wishlist para lo social).
- **Hecho cuando:** un amigo se registra, entra a Explorar, copia mi "Upper/Lower", queda activo, lo empieza desde Inicio, y si cambia un ejercicio en su copia mi programa no se altera.
- **Fecha:** 2026-09-30 · **Estado:** Abierto

## [RM-033] Reemplazo con la forma real del ejercicio + editar el slot en sesión
- **Objetivo:** que reemplazar un ejercicio en el modo guiado deje el slot como **sueles hacer ese ejercicio**, no con los bloques del slot reemplazado, y poder ajustar el slot del día con un lápiz.
- **Problema:** hoy el sustituto hereda los bloques del slot (regla de RM-020). Al reemplazar Incline Press (`[warmup 2×25] + [weight_reps 3×8]`) por Plank, el mapa cuenta "0/5 series" y la meta dice `Cal. 2 × 25 + 3 × 8` para un ejercicio de tiempo. Detectado probando RM-031 el 2026-09-19.
- **Regla:** al reemplazar, el slot se reconstruye desde el **último día** en que hiciste el sustituto: sus calentamientos pasan a un bloque `warmup` (series y reps de ese día) y sus series efectivas a un bloque con la medición que usaste (`weight_reps`/`reps`/`time`). Sin historial → slot libre y la medición se elige en el formulario. Los pesos siguen saliendo de "la última vez".
- **API:** endpoint nuevo que devuelve la forma de la última sesión de un ejercicio (cuántos calentamientos, cuántas efectivas y con qué medición).
- **Lápiz (editar slot):** disponible en cualquier slot, no solo tras un reemplazo; permite cambiar series, reps o segundos y agregar/quitar el calentamiento. **Afecta solo la sesión de hoy** (se guarda en `ActiveSession`); la rutina guardada no se toca, igual que saltar/reemplazar/agregar. Ofrecer "guardar en la rutina" queda para después.
- **Pasos:** (1) endpoint + test; (2) el reemplazo lo usa; (3) el lápiz.
- **Hecho cuando:** reemplazar Incline Press por Plank deja "3 × 40 s" (lo que sueles hacer) en vez de heredar el calentamiento, y desde el lápiz puedo bajarlo a 2 series solo por hoy.
- **Fecha:** 2026-09-19 · **Estado:** Abierto

## [RM-027] Default de equipo desde la BD (último Workout real del ejercicio)
- **Objetivo:** al comenzar un ejercicio, preseleccionar el equipo consultando de la BD **cómo se hizo la última vez** (el equipo del último `Workout` de ese ejercicio), en vez de depender solo de la memoria localStorage por-navegador de RM-026. Robustez cross-device y ante limpieza de storage/incógnito.
- **Alcance:** extender `GET /workouts/recommendation` (u otro endpoint ligero) para devolver `lastEquipmentId` del último set de ese ejercicio; el front lo usa como default del selector, con la memoria localStorage como fallback optimista/offline.
- **Hecho cuando:** al elegir un ejercicio desde cualquier dispositivo, el equipo por default = el del último `Workout` real de ese ejercicio en la BD.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [RM-021] Exportar rutina como texto para análisis con IA
- **Objetivo:** poder copiar/descargar un texto legible con la rutina actual (y quizá historial reciente) para pegárselo a una IA y que la analice.
- **Hecho cuando:** existe una acción que genera/copia un texto de la rutina actual, listo para pegar en un chat de IA.
- **Fecha:** 2026-06-25 · **Estado:** Abierto
