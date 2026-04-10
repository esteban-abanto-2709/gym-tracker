# WEB TODOs (v1.0: Normalización)

## 🏗️ Refactorización Arquitectónica (Próximo Objetivo)

**Estado**: PENDIENTE (En preparación)

Nuestro `apps/web/src/app/page.tsx` ha superado el límite razonable de líneas (+500) tras implementar las lógicas de UI complejas y llamadas concurrentes. Antes de crear más vistas (Ej. Dashboards o Rutinas), debemos limpiar la casa separando responsabilidades.

### Pasos paso a paso:

1. **Tipados Globales:**
   - [ ] Aislar las interfaces (`Exercise`, `Equipment`) en un nuevo fichero `apps/web/src/lib/types.ts`.
2. **Custom Hooks (Lógica de Negocio):**
   - [ ] Crear `useExercises.ts` -> Para englobar el fetch inicial del listado, los estados de _loading_, la lógica de `filter` en la búsqueda nativa y enviar el POST de creación.
   - [ ] Crear `useWorkoutForm.ts` -> Para alojar los `useState` del formulario final (peso, reps), guardar en `sessionStorage` para repeticiones de UX rápidas y hacer POST del Set completado.

3. **Componentes UI Aislados:**
   - [ ] Crear `components/exercises/ExerciseCombobox.tsx` -> Un archivo 100% visual. Toma props de los hooks y decide si muestra la vista del "Input Texto" o si la cambia mágicamente por la "Tarjeta Premium Selección".
   - [ ] Crear `components/exercises/CreateExerciseModal.tsx` -> Extraer puramente el diseño del `<Dialog>` de Shadcn con sus selectores de _Equipment_.

4. **El gran limpieza final:**
   - [ ] Achicar drásticamente el retorno renderizado en el mismo `page.tsx`, dejando su código a no más de 100 líneas donde solo orquesta enviando data de los _Hooks_ a los _Components Componentes_.
   - [ ] Testear y revisar todo localmente sin warnings.
