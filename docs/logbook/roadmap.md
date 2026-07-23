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

## [RM-006] Escala de dificultad 1-5 por set
- **Objetivo:** capturar qué tan difícil fue un set, de forma opcional y sin sumar fricción.
- **Hecho cuando:** al registrar se puede marcar 1-5 (o dejarlo vacío) y queda persistido junto al set.
- **Fecha:** 2026-06-13 · **Estado:** Abierto

## [RM-007] Pasada de identidad visual
- **Objetivo:** que la app refleje la identidad de `ux-foundations.md` (dark + rojo, energía, foco) más allá de lo actual.
- **Hecho cuando:** registro e historial aplican los fundamentos de UI/UX y el usuario valida que "se siente GYM".
- **Fecha:** 2026-06-13 · **Estado:** Abierto

## [RM-020] Modo rutina flexible (checklist + desvíos en vivo)
- **Objetivo:** que el modo guiado deje de ser lineal/rígido. La rutina pasa a ser un checklist y, durante la sesión, puedo adelantar un ejercicio, agregar uno ad-hoc o cambiar uno por otro (máquina ocupada) sin alterar la rutina base guardada. Solo se registra el contratiempo real, no se edita la plantilla.
- **Diseño acordado (2026-07-23):** la pantalla guiada actual se conserva; se le suma una vista **lista/mapa de la sesión** (abierta desde el header, que además muestra "Ejercicio N de M") con el estado de cada item (✓ 3/3, ▶ 1/3, pendiente). Tocar un item lo vuelve el actual (adelantar/volver); menú por item ofrece "Saltar" y "Reemplazar" (abre el picker de `AddExerciseSheet`, hereda targetSets/targetReps, marca el original como cubierto vía `replacedBy` en `ActiveSession`). Todo vive en localStorage; cero cambios de esquema en DB — el `Workout` ya registra el `exerciseId` real + `routineId`. No se persiste la sustitución como entidad ni se "recuerdan" reemplazos (YAGNI). Depende conceptualmente de RM-025: el reemplazo típico es la variante de otro equipo del mismo movimiento.
- **Hecho cuando:** en una sesión guiada puedo saltar a cualquier ejercicio pendiente (y volver), saltar uno definitivamente y reemplazar uno heredando sus metas, sin tocar la rutina guardada.
- **Fecha:** 2026-06-25 · **Estado:** Abierto

## [RM-025] Saneo del catálogo de ejercicios (identidad movimiento + equipo)
- **Objetivo:** formalizar que la identidad de un ejercicio es el par **(nombre normalizado, equipo)** y cerrar las fuentes de basura del catálogo global: hoy `equipment` es texto libre sin validar en el API (`Maquina`/`Máquina`/`Mancuernas` conviven) y `name @unique` es case-sensitive (existen `Press Militar (Máquina)` y `press militar (maquina)` como filas distintas, partiendo el historial de progresión y la recomendación de peso).
- **Alcance:** (1) validar `equipment` en el servidor contra la lista canónica (`IsIn` en el DTO; enum de Prisma opcional); (2) unicidad case-insensitive por `(nombre normalizado, equipo)` en lugar de nombre solo — variantes legítimas del mismo movimiento en distinto equipo conviven; (3) limpieza de duplicados existentes reasignando `Workout`/`RoutineItem` al canónico antes de borrar la fila. **La limpieza y la migración deben ejecutarse también en la BD de producción** (el análisis se hizo sobre la BD de dev; prod tiene los datos reales de todos los usuarios y debe quedar corregida con el mismo procedimiento: migración de valores de equipo + fusión de duplicados + constraint nuevo).
- **Hecho cuando:** el API rechaza equipos fuera de la lista, la unicidad `(nombre, equipo)` está en el esquema, y **dev y producción** quedan sin duplicados ni valores de equipo inconsistentes.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [RM-021] Exportar rutina como texto para análisis con IA
- **Objetivo:** poder copiar/descargar un texto legible con la rutina actual (y quizá historial reciente) para pegárselo a una IA y que la analice.
- **Hecho cuando:** existe una acción que genera/copia un texto de la rutina actual, listo para pegar en un chat de IA.
- **Fecha:** 2026-06-25 · **Estado:** Abierto
