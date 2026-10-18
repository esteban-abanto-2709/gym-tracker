# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

> Ordenado por prioridad: de arriba hacia abajo. La lógica de producto detrás
> de cada tarea está en [`../product-vision.md`](../product-vision.md).

## [RM-054] Calculadora de discos
- **Objetivo:** no hacer cuentas cansado para saber qué discos poner en la barra.
- **Alcance:** al registrar con barra, mostrar de forma visual la barra (20 kg) con los discos de cada lado para el peso total. Discos disponibles fijos: 20, 10, 5 y 2,5 kg. Personalizar barras y discos por usuario queda en la wishlist (WL-063).
- **Hecho cuando:** con 90 kg en press de banca se ve "barra 20 + 35 por lado" representado con sus discos (20 + 10 + 5).
- **Fecha:** 2026-10-06 · **Estado:** Abierto

## [RM-055] Registro de un toque (demo)
- **Objetivo:** validar si registrar tocando es más rápido que el formulario actual.
- **Alcance:** demo aislada, sin cablear a producción. Cada serie es una ficha precargada con peso y meta: un toque la marca como hecha; tocar otra vez resta una rep; una pulsación larga abre la edición.
- **Hecho cuando:** la demo se usa en una sesión real y se decide si reemplaza a `SetForm` + `SetDoneScreen`.
- **Fecha:** 2026-10-06 · **Estado:** Abierto

## [RM-093] Traducir la interfaz
- **Objetivo:** que la interfaz (botones, títulos, mensajes) se muestre en el idioma del usuario. Es una preferencia aparte del idioma de los ejercicios (RM-086): hay quien quiere la interfaz en español y los ejercicios en inglés.
- **Alcance:** instalar una librería de i18n para Next.js (candidata: `next-intl`, verificar su API al empezar) y sacar los textos de cada pantalla a archivos de traducción `es`/`en`. Incluye los nombres de equipo (lista fija), el formato de fechas (hoy fijo en español) y los textos explicativos de la exportación para la IA. Sin preferencia guardada, la interfaz usa el idioma del celular si es `es` o `en`; cualquier otro, `en`. El selector va en el mismo panel de idioma del perfil, debajo de "Nombres de ejercicios".
- **Hecho cuando:** con el idioma en inglés, la interfaz, los equipos, las fechas y la exportación salen en inglés.
- **Fecha:** 2026-10-12 · **Estado:** Abierto

## [RM-090] Diccionario de ejercicios: alias y variantes
- **Objetivo:** encontrar un ejercicio por cualquier nombre con el que se le conozca, incluidos los que llevan el equipo en el nombre. Depende de RM-086.
- **Alcance:**
  - **Alias:** otros nombres del mismo ejercicio, cada uno en un idioma ("press plano" → Press de banca).
  - **Variantes:** un alias puede llevar un equipo. "Smith squat" o "sentadilla en Smith" no es otro ejercicio: es Squat + equipo Smith, y al elegirlo quedan seleccionados los dos. Regla: si cambia el movimiento o los músculos, es otro ejercicio; si solo cambia el equipo, es el mismo ejercicio con otro equipo. Requiere TD-091.
  - El nombre de una variante se arma solo ("Sentadilla · Smith"), no se guarda a mano; el botón de TikTok busca con ese nombre completo.
- **A decidir al empezar:** si los usuarios pueden agregar alias y quién los ve. Propuesta: alias oficiales curados para todos y alias personales que solo ve quien los crea, para que nadie ensucie la búsqueda de los demás.
- **Hecho cuando:** buscar "press plano" encuentra Press de banca, y buscar "smith squat" deja seleccionados Squat y el equipo Smith.
- **Fecha:** 2026-10-12 · **Estado:** Abierto

## [RM-033] Reemplazo con la forma real del ejercicio + editar el slot en sesión
- **Objetivo:** que reemplazar un ejercicio en el modo guiado deje el slot como **sueles hacer ese ejercicio**, no con los bloques del slot reemplazado, y poder ajustar el slot del día con un lápiz.
- **Problema:** hoy el sustituto hereda los bloques del slot (regla de RM-020). Al reemplazar Incline Press (`[warmup 2×25] + [weight_reps 3×8]`) por Plank, el mapa cuenta "0/5 series" y la meta dice `Cal. 2 × 25 + 3 × 8` para un ejercicio de tiempo. Detectado probando RM-031 el 2026-09-19.
- **Regla:** al reemplazar, el slot se reconstruye desde el **último día** en que hiciste el sustituto: sus calentamientos pasan a un bloque `warmup` (series y reps de ese día) y sus series efectivas a un bloque con la medición que usaste (`weight_reps`/`reps`/`time`). Sin historial → slot libre y la medición se elige en el formulario. Los pesos siguen saliendo de "la última vez".
- **API:** endpoint nuevo que devuelve la forma de la última sesión de un ejercicio (cuántos calentamientos, cuántas efectivas y con qué medición).
- **Lápiz (editar slot):** disponible en cualquier slot, no solo tras un reemplazo; permite cambiar series, reps o segundos y agregar/quitar el calentamiento. **Afecta solo la sesión de hoy** (se guarda en `ActiveSession`); la rutina guardada no se toca, igual que saltar/reemplazar/agregar. Ofrecer "guardar en la rutina" queda para después.
- **Pasos:** (1) endpoint + test; (2) el reemplazo lo usa; (3) el lápiz.
- **Hecho cuando:** reemplazar Incline Press por Plank deja "3 × 40 s" (lo que sueles hacer) en vez de heredar el calentamiento, y desde el lápiz puedo bajarlo a 2 series solo por hoy.
- **Fecha:** 2026-09-19 · **Estado:** Abierto

## [RM-027] Default de equipo desde la BD (último Workout real del ejercicio)
- **Objetivo:** al comenzar un ejercicio, preseleccionar el equipo consultando de la BD **cómo se hizo la última vez** (el equipo del último `Workout` de ese ejercicio), en vez de depender solo de la memoria localStorage por-navegador de RM-026. Robustez cross-device y ante limpieza de storage/incógnito.
- **Alcance:** extender `GET /workouts/recommendation` (u otro endpoint ligero) para devolver `lastEquipmentId` del último set de ese ejercicio; el front lo usa como default del selector, con la memoria localStorage como fallback optimista/offline.
- **Hecho cuando:** al elegir un ejercicio desde cualquier dispositivo, el equipo por default = el del último `Workout` real de ese ejercicio en la BD.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [RM-075] Base de datos administrada
- **Objetivo:** que los datos de prod no dependan de un solo disco ni de backups hechos a mano: backups automáticos, restauración a cualquier minuto reciente y parches a cargo del proveedor.
- **Alcance:** mover Postgres del compose de prod a un servicio administrado. Migración con `backup.sh`/`restore.sh` y reversible: si no convence, la base vuelve al compose. La API solo cambia de `DATABASE_URL`/`DIRECT_URL`. Si las migraciones dejan de correr en el arranque de la API, `prisma` vuelve a devDependencies y la imagen se ahorra la CLI (`node_modules` 371 → 136 MB medido); la CLI carga Studio al arrancar, así que no se puede recortar por dentro.
- **Hecho cuando:** prod corre contra la base administrada con todos los datos, el backup automático del servicio existe y se probó restaurar uno en dev.
- **Fecha:** 2026-10-08 · **Estado:** Abierto

## [RM-117] Elegir modo claro u oscuro
- **Objetivo:** que cada usuario elija cómo ver la app en vez de depender del modo de su celular. Hoy la app sigue `prefers-color-scheme` (`apps/web/src/app/globals.css:46`): no hay selector y la preferencia no se guarda.
- **Alcance:** selector Claro / Oscuro / Sistema en el perfil, guardado por usuario en la base igual que el idioma de los ejercicios (`User.exerciseLocale`), con "Sistema" por defecto. Aplica también al `themeColor` y al tema de los toasts. Temas extra (tipo Dracula) siguen en WL-062.
- **Hecho cuando:** un usuario con el celular en oscuro elige "Claro", cierra sesión, entra desde otro dispositivo y ve la app en claro.
- **Fecha:** 2026-10-16 · **Estado:** Abierto
