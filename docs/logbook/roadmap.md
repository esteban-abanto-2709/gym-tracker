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
- **Hecho cuando:** en una sesión guiada puedo marcar/reordenar libremente los ejercicios del checklist y registrar sustituciones/añadidos sobre la marcha, sin tocar la rutina guardada.
- **Fecha:** 2026-06-25 · **Estado:** Abierto

## [RM-018] Marcar sets de aproximación (efectivo por defecto)
- **Objetivo:** poder marcar una serie como **aproximación**; lo que no esté marcado es efectivo (no existe marca de "efectiva", se infiere por ausencia). La marca es un valor controlado (no texto libre, sin CRUD de tags) y vive en dos sitios: en el `RoutineItem` (la rutina declara que esa ranura es de aproximación → segmenta la recomendación y pre-rellena al registrar) y en el `Workout` (fuente de verdad del set registrado, también disponible en día libre). Prerrequisito de [[RM-019]].
- **Hecho cuando:** puedo marcar una ranura de rutina y/o una serie registrada como aproximación; queda persistido, se distingue de las efectivas, y el historial/recomendación las tratan por separado.
- **Fuera de alcance:** cualquier otro tag (eventos como "fallo técnico"/"sobreesfuerzo", vocabulario abierto, gestión de tags). Solo la marca de aproximación — el resto vive en [[WL-007]].
- **Fecha:** 2026-06-25 · **Estado:** Abierto

## [RM-019] Algoritmo de recomendación: ¿subir peso o reps?
- **Objetivo:** que el sistema sugiera el siguiente paso de un ejercicio (subir peso, subir reps o mantener) a partir del historial. Usa la marca de aproximación de [[RM-018]] como llave de segmentación: compara aproximación con aproximación y efectiva con efectiva, nunca cruzadas; la ranura de rutina indica de qué segmento recomendar. Núcleo de H3.
- **Hecho cuando:** en el flujo de registro/guiado aparece una sugerencia accionable basada en los sets previos del mismo segmento.
- **Fecha:** 2026-06-25 · **Estado:** Abierto

## [RM-021] Exportar rutina como texto para análisis con IA
- **Objetivo:** poder copiar/descargar un texto legible con la rutina actual (y quizá historial reciente) para pegárselo a una IA y que la analice.
- **Hecho cuando:** existe una acción que genera/copia un texto de la rutina actual, listo para pegar en un chat de IA.
- **Fecha:** 2026-06-25 · **Estado:** Abierto
