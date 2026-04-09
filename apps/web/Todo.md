# WEB TODOs (v1.0: Normalización)

## Objetivo
Consumir la nueva arquitectura de base de datos sin fricción para el usuario en medio de un entrenamiento.

- [ ] **Diseño UI**: Reemplazar el input de texto libre en el index (Pantalla principal) por un "Buscador autocompletable" (Combobox / Select searchable).
- [ ] **Rutas API**: Agregar `routes.api.exercises.list()` y `.create()` a nuestro `lib/routes.ts`.
- [ ] **Caché Menor**: Traer todos los ejercicios al montar la app, guardarlos en un Zustand/Context o state base para búsqueda instantánea (sin red).
- [ ] **Flujo "Nuevo Ejercicio"**: Si un ejercicio no está en la lista estándar, integrar la creación "Vuelo" (On-the-fly) sin tener que abandonar la vista de registro.
- [ ] **Refactor de Rendimiento**: Actualizar `HistoryPage` para leer el nombre del ejercicio a través de la relación (ej. `workout.exercise.name`).
