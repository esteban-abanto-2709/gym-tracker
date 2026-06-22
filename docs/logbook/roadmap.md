# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

> Solo tareas del hito activo: **H1 · Registro afilado** (ver
> [`../milestones.md`](../milestones.md)). Las de hitos futuros se añaden cuando ese
> hito se active.

## [RM-006] Escala de dificultad 1-5 por set
- **Objetivo:** capturar qué tan difícil fue un set, de forma opcional y sin sumar fricción.
- **Hecho cuando:** al registrar se puede marcar 1-5 (o dejarlo vacío) y queda persistido junto al set.
- **Fecha:** 2026-06-13 · **Estado:** Abierto

## [RM-007] Pasada de identidad visual
- **Objetivo:** que la app refleje la identidad de `ux-foundations.md` (dark + rojo, energía, foco) más allá de lo actual.
- **Hecho cuando:** registro e historial aplican los fundamentos de UI/UX y el usuario valida que "se siente GYM".
- **Fecha:** 2026-06-13 · **Estado:** Abierto

## [RM-017] Home como hub de inicio (rutina / día libre / crear)
- **Objetivo:** convertir el root en un hub con 3 botones: **Iniciar una rutina**, **Día libre** (registro suelto, el form actual) y **Crear rutina**. Si hay una sesión en curso, mostrar arriba el slot de **Continuar rutina** que ya existe (`ContinueRoutineBanner`).
- **Hecho cuando:** el root muestra los 3 accesos; "Día libre" lleva al registro actual y "Crear rutina" al editor; con sesión activa aparece el banner de continuar.
- **Fecha:** 2026-06-22 · **Estado:** Abierto
