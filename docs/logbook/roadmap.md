# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-001] Modelado de rutinas (v1.5)
- **Objetivo:** crear las entidades `Routine` y `RoutineExercise` para que el usuario siga un plan, no solo registre sets sueltos.
- **Hecho cuando:** existen los modelos Prisma con su relación, migración aplicada y endpoints CRUD básicos de rutinas.
- **Fecha:** 2026-06-13 · **Estado:** Abierto

## [RM-002] Asignación de días a rutinas (v1.5)
- **Objetivo:** poder etiquetar rutinas por día/tipo (ej. Lunes = "Push", Martes = "Pull").
- **Hecho cuando:** una rutina puede asociarse a un día/etiqueta y la web lo muestra al elegir el plan del día.
- **Fecha:** 2026-06-13 · **Estado:** Abierto

## [RM-003] Tracking inteligente en vivo (v1.5)
- **Objetivo:** UI durante el entrenamiento que liste la rutina seleccionada y marque cuántas series/sets faltan para terminar.
- **Hecho cuando:** al entrenar se ve el progreso de la rutina (completados vs. pendientes) en tiempo real.
- **Fecha:** 2026-06-13 · **Estado:** Abierto

## [RM-004] Gestión de sesiones (v1.5)
- **Objetivo:** agrupar los sets diarios bajo una entidad `Session` para saber cuándo empezó y terminó un entrenamiento.
- **Hecho cuando:** existe el modelo `Session`, los sets se vinculan a ella y se registra inicio/fin del entrenamiento.
- **Fecha:** 2026-06-13 · **Estado:** Abierto
