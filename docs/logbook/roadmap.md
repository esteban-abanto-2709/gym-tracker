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

## [RM-020] Modo rutina flexible (checklist + desvíos en vivo)
- **Objetivo:** que el modo guiado deje de ser lineal/rígido. La rutina pasa a ser un checklist y, durante la sesión, puedo adelantar un ejercicio, agregar uno ad-hoc o cambiar uno por otro (máquina ocupada) sin alterar la rutina base guardada. Solo se registra el contratiempo real, no se edita la plantilla.
- **Diseño acordado (2026-07-23):** la pantalla guiada actual se conserva; se le suma una vista **lista/mapa de la sesión** (abierta desde el header, que además muestra "Ejercicio N de M") con el estado de cada item (✓ 3/3, ▶ 1/3, pendiente). Tocar un item lo vuelve el actual (adelantar/volver); menú por item ofrece "Saltar" y "Reemplazar" (abre el picker de `AddExerciseSheet`, hereda targetSets/targetReps, marca el original como cubierto vía `replacedBy` en `ActiveSession`). Todo vive en localStorage; cero cambios de esquema en DB — el `Workout` ya registra el `exerciseId` real + `routineId`. No se persiste la sustitución como entidad ni se "recuerdan" reemplazos (YAGNI). Depende conceptualmente de RM-025: el reemplazo típico es la variante de otro equipo del mismo movimiento.
- **Hecho cuando:** en una sesión guiada puedo saltar a cualquier ejercicio pendiente (y volver), saltar uno definitivamente y reemplazar uno heredando sus metas, sin tocar la rutina guardada.
- **Fecha:** 2026-06-25 · **Estado:** Abierto

## [RM-027] Default de equipo desde la BD (último Workout real del ejercicio)
- **Objetivo:** al comenzar un ejercicio, preseleccionar el equipo consultando de la BD **cómo se hizo la última vez** (el equipo del último `Workout` de ese ejercicio), en vez de depender solo de la memoria localStorage por-navegador de RM-026. Robustez cross-device y ante limpieza de storage/incógnito.
- **Alcance:** extender `GET /workouts/recommendation` (u otro endpoint ligero) para devolver `lastEquipmentId` del último set de ese ejercicio; el front lo usa como default del selector, con la memoria localStorage como fallback optimista/offline.
- **Hecho cuando:** al elegir un ejercicio desde cualquier dispositivo, el equipo por default = el del último `Workout` real de ese ejercicio en la BD.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [RM-021] Exportar rutina como texto para análisis con IA
- **Objetivo:** poder copiar/descargar un texto legible con la rutina actual (y quizá historial reciente) para pegárselo a una IA y que la analice.
- **Hecho cuando:** existe una acción que genera/copia un texto de la rutina actual, listo para pegar en un chat de IA.
- **Fecha:** 2026-06-25 · **Estado:** Abierto
