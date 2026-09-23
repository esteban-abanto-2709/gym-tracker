# Wishlist

Ideas y mejoras posibles, sin compromiso (quizá nunca). Código `WL-###` (nunca se reutiliza).
Si una idea se promueve, se borra de aquí y nace un `RM` nuevo.

**Formato:** título + idea en 1–2 líneas, sin campos.

---

## [WL-002] Copiar rutinas de amigos
Ir al perfil de un amigo, ver su rutina (ej. "Push de Miguel77") y clonarla con un botón. El golazo social.

## [WL-003] Comparar cargas con amigos
Perfiles comparables: cuánto cargas tú vs. un amigo. Vanidad, secundario.

## [WL-004] IA: patrones desde notas
El usuario escribe una nota del entrenamiento y la IA detecta patrones (ej. "este ejercicio no te va"). Secundario, nunca el centro.

## [WL-005] Registro ampliado: cardio y movilidad
Registrar cardio post-rutina y ejercicios de movilidad/calentamiento antes, sin ensuciar el flujo principal de pesas.

## [WL-008] Salto de peso por tipo de equipo en la recomendación
Hoy `RM-019` sugiere siempre `+2.5 kg`. Mancuernas, máquinas y poleas saltan distinto; usar el `equipment` del ejercicio para proponer un incremento realista por equipo.

## [WL-009] Guardar la unidad original del registro
Columna `unit` en `Workout` para mostrar el peso en la unidad en que se registró (ej. "45 lb" en vez de "20.4 kg"). Podría servir al análisis IA de v3.0. Hoy se convierte todo a kg redondeado a 1 decimal al guardar.

## [WL-010] Ocultar el selector de equipo en los sets de solo reps
En un bloque `reps` (Dead Bug, plancha abdominal) el equipo siempre es "peso corporal", así que el selector solo estorba. Idea: ocultarlo en esa medición, dejando la puerta abierta a mostrarlo si algún día se hace con lastre o asistido.

## [WL-011] Marcar el calentamiento de forma explícita en el modo guiado
Hoy un set de calentamiento solo se distingue por la etiqueta chica "Calentamiento · La última vez…", mientras el set efectivo muestra la casilla "Aproximación" bien visible: se siente al revés. Idea: un distintivo claro en la tarjeta del ejercicio (badge o color) cuando la serie es de calentamiento, y acortar el texto de la pantalla de descanso, que hoy se corta ("objetivo 25 reps de calentamien…").

## [WL-012] Quitar la casilla "Aproximación"
Con el slot flexible, lo que antes se marcaba a mano ya lo dice el propio bloque (`warmup`, `ramp`, `reps`, `time`), así que la casilla podría sobrar. Evaluar quitarla del formulario y decidir qué pasa con la columna `Workout.isApproximation`.

## [WL-007] Tags de anotación para análisis con IA
Vocabulario de tags de lista cerrada más allá de "aproximación" (ej. "fallo técnico", "sobreesfuerzo") que se apilan sobre la serie y enriquecen el texto que se exporta a la IA (ver `RM-021`). Diferido: hoy solo interesa la marca de aproximación (`RM-018`).

## [WL-037] Recargar desde dentro de la app instalada
En modo pantalla completa no existe el botón de recargar de Safari: si algo se cuelga, hay que cerrar la app. Evaluar un "tira para recargar" o un botón de reintento en los estados de error.
