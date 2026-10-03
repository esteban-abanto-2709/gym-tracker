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

## [RM-048] Rango de reps en la rutina (8–10 en vez de 10)
- **Objetivo:** que un bloque `weight_reps` o `reps` pueda planear un rango (`3 × 8–10`) para distinguir un 8–10 de un 10–12 al entrenar; un solo número sigue siendo válido. Base para importar rutinas generadas por IA.
- **Modelo:** `repsMax` (nullable) junto a `reps`, que pasa a ser el mínimo; `null` = meta de un solo número, sin migrar datos. La API exige `repsMax >= reps`. Calentamiento y rampa no llevan rango.
- **Pasos:** (1) API acepta y guarda `repsMax`; (2) la web lo edita y lo muestra (cabecera, objetivo de la siguiente serie, etiqueta "meta", explorar programas); (3) sin commit: cargar los rangos reales en las rutinas actuales.
- **Hecho cuando:** una rutina con `3 × 8–10` se ve así en el editor y en el modo guiado, y las rutinas sin rango se ven igual que antes.
- **Fecha:** 2026-10-03 · **Estado:** En progreso (2026-10-03)

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
