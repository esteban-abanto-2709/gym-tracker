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

## [RM-029] Recomendación serie por serie (arregla rampa y calentamiento)
- **Objetivo:** que el "la última vez" muestre el peso de **esa misma serie** la sesión pasada, no el del último set registrado.
- **Problema:** `getRecommendation` hace `last = sets[0]` (`workouts.service.ts:52`): un solo peso recordado por ejercicio+pista. Con una rampa de 30×10 / 42×5 / 51×3 los tres escalones muestran 51 kg. Con un calentamiento de dos series a distinto peso (real: `Lat Pulldown` 31.5×25 y 38.3×25 el 01/09) la primera muestra el peso de la segunda.
- **Alcance:** que la recomendación devuelva los sets del **último día** de ese ejercicio y esa pista, en orden, y que el front elija el que toca según en qué serie va (`setsDoneForCurrent` ya lo sabe). Sin migración: el dato ya está en la BD, y el arreglo es **retroactivo** sobre todo el historial. Descartado: emparejar por reps objetivo — arregla la rampa (10/5/3) pero no el calentamiento (las dos series son de 25). Diferido a H3: rampa como % del 1RM, que hoy no se guarda en ninguna parte.
- **Efecto secundario deseado:** la rampa deja de necesitar `isApproximation` para separarse, y el booleano vuelve a significar solo "el peso es impreciso".
- **Hecho cuando:** en la rampa de UPPER A cada escalón muestra su propio peso de la sesión anterior, y la primera serie de calentamiento muestra la primera, no la última.
- **Fecha:** 2026-09-07 · **Estado:** Abierto

## [RM-027] Default de equipo desde la BD (último Workout real del ejercicio)
- **Objetivo:** al comenzar un ejercicio, preseleccionar el equipo consultando de la BD **cómo se hizo la última vez** (el equipo del último `Workout` de ese ejercicio), en vez de depender solo de la memoria localStorage por-navegador de RM-026. Robustez cross-device y ante limpieza de storage/incógnito.
- **Alcance:** extender `GET /workouts/recommendation` (u otro endpoint ligero) para devolver `lastEquipmentId` del último set de ese ejercicio; el front lo usa como default del selector, con la memoria localStorage como fallback optimista/offline.
- **Hecho cuando:** al elegir un ejercicio desde cualquier dispositivo, el equipo por default = el del último `Workout` real de ese ejercicio en la BD.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [RM-021] Exportar rutina como texto para análisis con IA
- **Objetivo:** poder copiar/descargar un texto legible con la rutina actual (y quizá historial reciente) para pegárselo a una IA y que la analice.
- **Hecho cuando:** existe una acción que genera/copia un texto de la rutina actual, listo para pegar en un chat de IA.
- **Fecha:** 2026-06-25 · **Estado:** Abierto
