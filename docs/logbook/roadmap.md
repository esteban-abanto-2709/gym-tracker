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

## [RM-051] App en la nube: AWS
- **Objetivo:** que la app esté disponible siempre, sin depender de la PC de casa. Un corte de luz dejó la app caída y hubo que registrar el entrenamiento en WhatsApp.
- **Alcance:** una instancia EC2 (mínimo 2 GB de RAM) con el mismo `docker compose` de `apps/docker/prod/` y el túnel de Cloudflare, sin abrir puertos. Backups automáticos de Postgres a S3. Migrar los datos actuales desde la base local y apagar la instancia de la PC. Incluye el despliegue automático (CD): un job de GitHub Actions que, con el CI en verde en `main`, actualiza la instancia.
- **A decidir al empezar:** tipo de instancia, presupuesto mensual y qué pasa cuando se acaben los créditos de la cuenta.
- **Hecho cuando:** con la PC apagada, la app abre desde el celular con todo el historial, y existe al menos un backup en S3 restaurado con éxito en dev.
- **Fecha:** 2026-10-06 · **Estado:** En progreso (2026-10-07)

## [RM-054] Calculadora de discos
- **Objetivo:** no hacer cuentas cansado para saber qué discos poner en la barra.
- **Alcance:** al registrar con barra, mostrar de forma visual la barra (20 kg) con los discos de cada lado para el peso total. Discos disponibles fijos: 20, 10, 5 y 2,5 kg. Personalizar barras y discos por usuario queda en la wishlist (WL-063).
- **Hecho cuando:** con 90 kg en press de banca se ve "barra 20 + 35 por lado" representado con sus discos (20 + 10 + 5).
- **Fecha:** 2026-10-06 · **Estado:** Abierto

## [RM-021] Exportar el historial para análisis con IA
- **Objetivo:** pasarle tus datos de entrenamiento a tu IA de confianza para que los analice.
- **Alcance:** desde el historial, elegir un rango de fechas y descargar las series en JSON o CSV, con ejercicio, equipo, peso, reps, tipo de serie, rutina y fecha. Incluir una breve explicación de las convenciones (barra = total, mancuerna = por unidad).
- **Hecho cuando:** puedo descargar el último mes y pegárselo a una IA, y la IA entiende cada serie sin preguntar qué significa cada campo.
- **Fecha:** 2026-06-25 · **Estado:** Abierto

## [RM-055] Registro de un toque (demo)
- **Objetivo:** validar si registrar tocando es más rápido que el formulario actual.
- **Alcance:** demo aislada, sin cablear a producción. Cada serie es una ficha precargada con peso y meta: un toque la marca como hecha; tocar otra vez resta una rep; una pulsación larga abre la edición.
- **Hecho cuando:** la demo se usa en una sesión real y se decide si reemplaza a `SetForm` + `SetDoneScreen`.
- **Fecha:** 2026-10-06 · **Estado:** Abierto

## [RM-056] Catálogo de ejercicios con alias y músculos
- **Objetivo:** que cada ejercicio tenga un nombre claro en español, se encuentre por sus sinónimos ("tirón" / "lat pulldown") y sepa qué músculos trabaja. Es la base de la búsqueda, del botón de video y de cualquier análisis por músculo. Absorbe WL-042.
- **Alcance:** el slug no cambia; se agregan nombre en español, alias buscables y músculos primarios y secundarios. Curar a mano los ejercicios de fuerza a partir de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio público) y sembrarlos con una migración que complete los existentes por slug, sin duplicar.
- **Hecho cuando:** buscar "press de banca" o "bench press" encuentra el mismo ejercicio, todos los ejercicios en uso tienen nombre en español y músculos, y ninguna serie existente pierde su ejercicio.
- **Fecha:** 2026-10-06 · **Estado:** Abierto

## [RM-057] Tiempo de descanso desde la última serie
- **Objetivo:** saber cuánto llevas descansando sin poner un cronómetro.
- **Alcance:** mostrar "llevas X descansando" calculado desde la hora de la última serie registrada. No es un temporizador: al volver a la app tras usar otras, el tiempo sigue siendo correcto. Sin alarmas ni sonidos.
- **Hecho cuando:** tras registrar una serie, salir a otra app y volver, el tiempo mostrado coincide con el real.
- **Fecha:** 2026-10-06 · **Estado:** Abierto

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
