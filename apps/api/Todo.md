# API TODOs (v1.0: Normalización)

## Objetivo
Implementar la arquitectura relacional sólida requerida para métricas futuras.

- [ ] **Schema Prisma**: Crear la tabla o modelo `Exercise`.
- [ ] **Relación M:1**: Alterar la tabla `Workout` para que se relacione con `Exercise` a través de un `categoryId` o `exerciseId`.
- [ ] **Controladores Base**: Crear `ExercisesController` para Listar (GET) y Crear (POST) el maestro de ejercicios.
- [ ] **Migración de Datos**: Preparar script/lógica para transformar los viejos strings (ej. "Press Pecho") en registros reales bajo la nueva tabla sin perder datos antiguos.
- [ ] **Actualización de Endpoints**: Refactorizar endpoints y DTOs (`CreateWorkoutDto` y `UpdateWorkoutDto`) para recibir `exerciseId` numérico/UUID en vez de string.
