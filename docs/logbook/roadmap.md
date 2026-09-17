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

## [RM-030] Programas de entrenamiento (capa sobre las rutinas)
- **Objetivo:** agrupar rutinas en un **programa** (estilo de entrenamiento: "PPL" = Push/Pull/Leg, "Upper/Lower" = Upper A/B + Lower A/B) y dejar anclado en el perfil cuál sigue el usuario hoy, para que iniciar el día sea más directo.
- **Modelo:** `Program` (`userId`, `name`, `@@unique([userId, name])`, igual que `Routine`). `Routine.programId` nullable (`onDelete: SetNull`): una rutina pertenece a **un** programa o a ninguno (1-N, no N-N). `User.activeProgramId` nullable: el programa activo vive en la BD, no en localStorage, para que siga al usuario entre dispositivos.
- **Migración:** solo columnas/tabla nuevas, sin backfill. Las rutinas existentes quedan sueltas (`programId = null`) y cada usuario las agrupa desde la UI.
- **API:** módulo `programs` (CRUD por usuario, mismo patrón que `routines`) + activar/desactivar el programa activo. `CreateRoutineDto`/`UpdateRoutineDto` aceptan `programId` validando que el programa sea del mismo usuario.
- **Web:** `/routines` agrupado por programa (el activo primero, las sueltas al final); selector de programa en `RoutineEditor`; en Perfil se ve y se cambia el programa activo; "Iniciar rutina" abre directo las rutinas del programa activo.
- **Fuera de alcance:** copiar un programa de un amigo (WL-002). Con el 1-N se reduce a clonar `Program` → `Routine` → `RoutineItem` para otro `userId`, sin tocar el modelo. Tampoco entra sugerir qué rutina del programa toca hoy (rotación).
- **Regla para cuando se haga la copia (no olvidar):** copiar es una **copia profunda e independiente**, no una referencia. El amigo recibe sus propias filas `Program`/`Routine`/`RoutineItem` y puede editarlas libremente (cambiar ejercicios, metas, orden) sin que se toque el original, y viceversa. La copia guarda de dónde viene (`Program.copiedFromId` nullable, `onDelete: SetNull`) solo como dato de origen, sin sincronizar nada. Los `Exercise` son un catálogo global y se comparten: cambiar un ejercicio en la copia es repuntar su `RoutineItem`, nunca editar el `Exercise`.
- **Hecho cuando:** puedo crear "PPL" y "Upper/Lower", asignar mis rutinas a cada uno, marcar "Upper/Lower" como activo desde el perfil, y al tocar "Iniciar rutina" veo primero Upper A/B y Lower A/B.
- **Fecha:** 2026-09-16 · **Estado:** Abierto

## [RM-032] Calentamiento en rampa (un slot, pesos por escalón)
- **Objetivo:** que la rampa (10 / 5 / 3 reps antes de las series efectivas) sea parte del **mismo slot** que las series de esa máquina y que **cada escalón recuerde su propio peso**. Hoy solo sobrevive el peso del último escalón y hay que recalcular el de 10 y el de 5 en cada sesión.
- **Depende de:** RM-031 (bloques, hecho).
- **Bloque `ramp`:** `{ kind: "ramp", steps: [{ reps: 10, pct: 50 }, { reps: 5, pct: 70 }, { reps: 3, pct: 85 }] }`. Va antes del bloque `weight_reps` en el mismo slot: Hack Squat = `[ramp 10/5/3] + [weight_reps 3×8]`. Cada escalón es un set planificado con `setType = RAMP` y `step = 1..n`.
- **Peso de cada escalón:** se precarga **siempre** con el peso que usaste en ese mismo escalón la última vez (mismo ejercicio + equipo, `setType = RAMP`, mismo `step`, último día). El porcentaje es solo una sugerencia visible ("≈ 50 % de tu peso efectivo") y se usa para precargar únicamente si ese escalón no tiene historial. "Peso efectivo" = peso del último bloque `weight_reps` de ese ejercicio (no es un 1RM: hoy no existe).
- **Recomendación:** `getRecommendation` filtra por `setType` y `step` en vez de `isApproximation`. Así las series efectivas dejan de mezclarse con la rampa y la sugerencia de +2.5 kg se calcula solo sobre las efectivas. **Absorbe RM-029.**
- **Migración de datos:**
  - Rutinas: los slots consecutivos del mismo ejercicio con `isApproximation` y `1×N` (10/5/3, o 10/5 en Leg Press), seguidos del slot efectivo, se fusionan en un slot `[ramp] + [weight_reps]`. Son 7 casos en Upper A/B y Lower A/B.
  - Sets: los sets `isApproximation` de esos ejercicios con reps 10/5/3 dentro de un mismo día se marcan `setType = RAMP` con su `step` por orden. `isApproximation` vuelve a `false` en esos sets y recupera su significado original ("peso impreciso"). El mismo patrón aplica a sets fuera de rutina.
- **Fuera de alcance:** calcular la rampa en base a un 1RM real. Los porcentajes quedan configurables por escalón, pero hoy se toman del peso efectivo.
- **Hecho cuando:** en Upper A, Lat Pulldown es un solo slot. Al entrar precarga 31.5 / 45 / 51.8 kg en los tres escalones (lo del 07/09) y 58.5 en las efectivas, con la sugerencia de porcentaje visible al lado. El mapa de la sesión lo muestra como una sola fila.
- **Fecha:** 2026-09-16 · **Estado:** Abierto

## [RM-029] Recomendación serie por serie (arregla rampa y calentamiento)
- **Objetivo:** que el "la última vez" muestre el peso de **esa misma serie** la sesión pasada, no el del último set registrado.
- **Problema:** `getRecommendation` hace `last = sets[0]` (`workouts.service.ts:52`): un solo peso recordado por ejercicio+pista. Con una rampa de 30×10 / 42×5 / 51×3 los tres escalones muestran 51 kg. Con un calentamiento de dos series a distinto peso (real: `Lat Pulldown` 31.5×25 y 38.3×25 el 01/09) la primera muestra el peso de la segunda.
- **Alcance:** que la recomendación devuelva los sets del **último día** de ese ejercicio y esa pista, en orden, y que el front elija el que toca según en qué serie va (`setsDoneForCurrent` ya lo sabe). Sin migración: el dato ya está en la BD, y el arreglo es **retroactivo** sobre todo el historial. Descartado: emparejar por reps objetivo — arregla la rampa (10/5/3) pero no el calentamiento (las dos series son de 25). Diferido a H3: rampa como % del 1RM, que hoy no se guarda en ninguna parte.
- **Efecto secundario deseado:** la rampa deja de necesitar `isApproximation` para separarse, y el booleano vuelve a significar solo "el peso es impreciso".
- **Hecho cuando:** en la rampa de UPPER A cada escalón muestra su propio peso de la sesión anterior, y la primera serie de calentamiento muestra la primera, no la última.
- **Fecha:** 2026-09-07 · **Estado:** Abierto · absorbido por RM-032 (se cierra junto con él)

## [RM-027] Default de equipo desde la BD (último Workout real del ejercicio)
- **Objetivo:** al comenzar un ejercicio, preseleccionar el equipo consultando de la BD **cómo se hizo la última vez** (el equipo del último `Workout` de ese ejercicio), en vez de depender solo de la memoria localStorage por-navegador de RM-026. Robustez cross-device y ante limpieza de storage/incógnito.
- **Alcance:** extender `GET /workouts/recommendation` (u otro endpoint ligero) para devolver `lastEquipmentId` del último set de ese ejercicio; el front lo usa como default del selector, con la memoria localStorage como fallback optimista/offline.
- **Hecho cuando:** al elegir un ejercicio desde cualquier dispositivo, el equipo por default = el del último `Workout` real de ese ejercicio en la BD.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [RM-021] Exportar rutina como texto para análisis con IA
- **Objetivo:** poder copiar/descargar un texto legible con la rutina actual (y quizá historial reciente) para pegárselo a una IA y que la analice.
- **Hecho cuando:** existe una acción que genera/copia un texto de la rutina actual, listo para pegar en un chat de IA.
- **Fecha:** 2026-06-25 · **Estado:** Abierto
