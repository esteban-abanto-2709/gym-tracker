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

## [RM-026] Equipo por-set + ejercicio puro con slug
- **Objetivo:** el equipo deja de ser propiedad del ejercicio y pasa a ser propiedad de la *repe* (cada `Workout`). El ejercicio queda puro: identidad = `slug` derivado del nombre, sin `equipment`. Esto apoya el "no pensar" (si hoy la barra está ocupada, al registrar el set cambio a máquina y la sesión asume máquina para los siguientes) y alimenta la flexibilidad de RM-020.
- **Diseño acordado (2026-07-23):** `equipment` sale de `Exercise` y pasa a una **tabla `Equipment`** (`id` fijo tipo slug + `name @unique`; 6 filas: Barra, Polea, Mancuerna, Máquina, Peso Corporal, Otro). `Workout` gana `equipmentId` **nullable** (FK) → `null` = "sin especificar"; el texto `"Sin especificar"` se pone **solo al exportar** para la IA, no hay fila para ello. **Los valores de `Equipment` se siembran DENTRO de la migración** (`INSERT` en el `migration.sql`), no con script suelto ni `prisma db seed`, para que `migrate deploy` los cargue en prod al hacer `docker compose up --build`. `Exercise` gana `slug @unique` (identidad) y pierde `equipment` + el índice `(lower(name), equipment)`. El "sticky entre sets" y los iconos son **estado de sesión en el frontend** (localStorage, iconos mapeados por `Equipment.id`), cero persistencia nueva. El default de equipo al registrar se **deriva del último `Workout` de ese ejercicio** (opción B), no se guarda en la rutina. La recomendación de peso puede filtrar por el equipo del set. Backfill: cada `Workout` hereda el equipo que hoy tiene su `Exercise` (ya limpio por RM-025 — de ahí la limpieza sí paga); el `slug` se deriva del nombre. Migración corre en dev y prod vía `migrate deploy`.
- **Hecho cuando:** `Exercise` no tiene `equipment` y su identidad es el `slug`; cada `Workout` guarda su equipo (enum validado); al registrar, el equipo trae por default el del último set de ese ejercicio, se puede cambiar y el cambio se pega para los siguientes sets de la sesión; dev y prod migrados sin pérdida de datos.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [RM-021] Exportar rutina como texto para análisis con IA
- **Objetivo:** poder copiar/descargar un texto legible con la rutina actual (y quizá historial reciente) para pegárselo a una IA y que la analice.
- **Hecho cuando:** existe una acción que genera/copia un texto de la rutina actual, listo para pegar en un chat de IA.
- **Fecha:** 2026-06-25 · **Estado:** Abierto
