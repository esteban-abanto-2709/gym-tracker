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

## [RM-056] Diccionario de ejercicios: el núcleo
- **Objetivo:** un diccionario oficial de ejercicios con nombre en español bien escrito y los músculos que trabaja cada uno. Es la base de compartir programas, del análisis por músculo, del botón de video y de importar programas armados con IA. Absorbe WL-042. Los alias y los idiomas van en RM-086; la personalización por usuario, en WL-063.
- **Capas:** este RM hace solo el **núcleo** (qué es el ejercicio). El nombre sigue en `Exercise.name`, en español, hasta RM-086.
- **Músculos en dos niveles:** cada ejercicio guarda **músculos** primarios y secundarios de una lista cerrada de 19 (los 17 de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) con "hombros" separado en deltoide anterior, lateral y posterior). Cada músculo pertenece a un **grupo** (unos 12: Pecho, Espalda, Hombros, Bíceps…), que es lo que mostrará el radar. La equivalencia músculo → grupo vive en el código, no en la base. Además, el **tipo** del ejercicio: compuesto o aislamiento.
- **Oficial o de usuario:** `Exercise` guarda quién lo creó. Sin creador = oficial. Cualquier usuario puede crear un ejercicio en pleno entrenamiento pidiendo **solo el nombre** (músculos y tipo opcionales); es visible para todos, se marca como no oficial y la búsqueda muestra primero los oficiales.
- **Cómo entra cada cosa:**
  - **Estructura** (músculos, tipo, creador) → migración.
  - **Diccionario oficial** (~100-150 ejercicios de fuerza comunes, con nombre en español curado a mano y músculos tomados de free-exercise-db) → **semilla** idempotente: un archivo de datos en el repo y un script que crea o actualiza por `slug`. Corre en cada despliegue y nunca borra ni modifica ejercicios de usuarios.
  - **Ejercicios existentes:** pasan a ser del usuario que los creó (no oficiales). Un **script de una sola vez** los fusiona con su equivalente oficial: mueve sus series y rutinas al oficial y borra el duplicado. Los que no tengan equivalente quedan como del usuario.
- **Hecho cuando:** el diccionario oficial está sembrado con músculos y tipo; crear un ejercicio desde el entrenamiento pide solo el nombre y queda como no oficial; tras la fusión, el total de series y de ítems de rutina es idéntico al de antes, y los ejercicios en uso apuntan al oficial cuando existe. Verificado primero en dev con una copia de los datos reales.
- **Fecha:** 2026-10-06 · **Estado:** En progreso (2026-10-11)

## [RM-086] Diccionario de ejercicios: idioma y alias
- **Objetivo:** que un ejercicio se encuentre por cualquiera de sus nombres ("press de banca", "press plano", "bench press") y se muestre en el idioma del usuario. Depende de RM-056.
- **Alcance:** los nombres salen de `Exercise.name` a una tabla de nombres por idioma, donde cada fila es un nombre principal o un alias. La búsqueda ignora tildes y mayúsculas y encuentra por palabras sueltas. En el frontend, una librería de i18n para mostrar el nombre del ejercicio en el idioma elegido.
- **A decidir al empezar:**
  - Si los usuarios pueden agregar alias y quién los ve. Propuesta: alias oficiales curados para todos y alias personales que solo ve quien los crea, para que nadie ensucie la búsqueda de los demás.
  - Si la librería de i18n traduce también la interfaz o solo los nombres de ejercicios.
- **Hecho cuando:** buscar "press plano" o "bench press" encuentra el mismo ejercicio oficial, y cambiar el idioma muestra su nombre en ese idioma.
- **Fecha:** 2026-10-10 · **Estado:** Abierto

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
