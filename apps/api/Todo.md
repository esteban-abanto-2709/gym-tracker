# API TODOs (v1.0: Normalización)

## Objetivo: Completado ✅

Implementar la arquitectura relacional sólida requerida para métricas futuras. Todo fue migrado exitosamente, la DB fue purgada de sus viejos "strings" y `description` fue eliminado por completo de todos los estratos de datos.

- [x] **Schema Prisma**: Crear la tabla o modelo `Exercise`.
- [x] **Relación M:1**: Alterar la tabla `Workout` para que se relacione con `Exercise` a través de un `categoryId` o `exerciseId`.
- [x] **Controladores Base**: Crear `ExercisesController` para Listar (GET) y Crear (POST) el maestro de ejercicios.
- [x] **Migración de Datos**: Preparar script/lógica para transformar los viejos strings (ej. "Press Pecho") en registros reales bajo la nueva tabla sin perder datos antiguos.
- [x] **Actualización de Endpoints**: Refactorizar endpoints y DTOs (`CreateWorkoutDto` y `UpdateWorkoutDto`) para recibir `exerciseId` numérico/UUID en vez de string.

---

## Siguiente Fase

_Por el momento, la API se encuentra estable, segura bajo Docker, conectada por `prisma.config.ts` y funcionando limpiamente con controladores modulares. Quedará en espera de cuando implementemos Login o Gráficas (Dashboards)._
