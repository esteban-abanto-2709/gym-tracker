# Wishlist

Ideas y mejoras posibles, sin compromiso (quizá nunca). Código `WL-###` (nunca se reutiliza).
Si una idea se promueve, se borra de aquí y nace un `RM` nuevo.

**Formato:** título + idea en 1–2 líneas, sin campos.

---

## [WL-078] Exportación para IA, segunda versión
Mejoras al archivo de RM-021 según la revisión en [`docs/feedback/2026-10-09-export-ia.md`](../feedback/2026-10-09-export-ia.md): identificador de sesión, slug del ejercicio, objetivo de entrenamiento y un resumen calculado encima de las series. Se hacen cuando el uso real muestre que faltan.

## [WL-066] Sugerir bajar tras muchas sesiones sin subir
Si pasan muchas sesiones sin poder completar el tope con el mismo peso, sugerir bajar para retomar. Falta definir cuántas cuentan como "muchas".

## [WL-010] Ocultar el selector de equipo en los sets de solo reps
En un bloque `reps` (Dead Bug, plancha abdominal) el equipo siempre es "peso corporal", así que el selector solo estorba. Idea: ocultarlo en esa medición, dejando la puerta abierta a mostrarlo si algún día se hace con lastre o asistido.

## [WL-011] Marcar el calentamiento de forma explícita en el modo guiado
Hoy una serie de calentamiento solo se distingue por la etiqueta chica "Calentamiento · La última vez…" sobre el formulario (`SetForm.tsx`), igual que una efectiva. Idea: un distintivo claro en la tarjeta del ejercicio (badge o color) cuando la serie es de calentamiento, y revisar que el texto de la pantalla de descanso no se corte.

## [WL-037] Recargar desde dentro de la app instalada
En modo pantalla completa no existe el botón de recargar de Safari: si algo se cuelga, hay que cerrar la app. Evaluar un "tira para recargar" o un botón de reintento en los estados de error.

## [WL-009] Guardar la unidad original del registro
Columna `unit` en `Workout` para mostrar el peso en la unidad en que se registró (ej. "45 lb" en vez de "20.4 kg"). Conviene evaluarla junto con la exportación (RM-021), para que la IA vea lo que de verdad se cargó. Hoy se convierte todo a kg redondeado a 1 decimal al guardar.

## [WL-071] Datos personales opcionales en el perfil
Edad, peso corporal con su fecha y porcentaje de grasa, para enriquecer el análisis y la exportación. Siempre opcionales y desde el perfil ("agrega información para mejorar tu análisis"); nunca antes de entrenar ni durante. Decidido (2026-10-09): **medidas** con historial (peso, % de grasa y altura, cada uno opcional, al menos uno; fecha editable que arranca en hoy; una por fecha, registrar otra vez esa fecha la actualiza) y **fecha de nacimiento** como valor único editable de la que se calcula la edad. Se ven en Perfil y en la exportación, no en el Historial. **En progreso (2026-10-09).**

## [WL-058] Versión de escritorio
Una experiencia cómoda en la computadora para lo que no se hace entre series: revisar tu progreso, exportar tus datos e importar o armar programas. En escritorio, el video del ejercicio puede abrirse en YouTube en vez de TikTok.

## [WL-059] Invitaciones con cupo
Para abrir la app a amigos: cada usuario recibe un cupo fijo de invitaciones (p. ej. 4) que comparte por link. El link se puede regenerar, pero quien ya entró no se expulsa.

## [WL-061] Recuperar y cambiar la contraseña
Obligatorio antes de tener usuarios que no sean el autor. Google sigue siendo el camino principal, por ser el de menos pasos.

## [WL-060] Crear un programa con tu IA
La app entrega un `.md` con el formato de programas y rutinas, las convenciones de registro y qué preguntarle al usuario. Tu IA de confianza lo usa para armar el programa y devuelve un JSON; al importarlo se crea un programa **nuevo**, nunca se reemplaza uno existente. No incluye historial: si quieres que la IA lo considere, se lo pasas aparte con la exportación (RM-021).

## [WL-039] Publicar programas y rutinas sueltas
Además de programas, publicar rutinas sueltas ("Espalda de Cbum", la que armó un amigo para entrenar juntos hoy). Privados por defecto; al publicar, otros pueden darles "me gusta" y copiarlos. La copia es tuya y no recibe cambios del original. Explorar podría ordenarse por "me gusta" o por copias. Como solo aparece lo publicado, las copias sin publicar ya no se ven duplicadas en Explorar (hoy salen todas, incluidas las copias por `copiedFromId`).

## [WL-047] Análisis por músculo
Un gráfico de radar con cuánto trabajas cada músculo (bíceps, tríceps, cuádriceps, isquios…), para ver qué sobreentrenas y qué descuidas. Depende de que el catálogo tenga músculos (RM-056). Antes de construir otras gráficas, buscar una librería que calce con el stack.

## [WL-065] Sesión de entrenamiento en el servidor
Hoy cada `Workout` es una serie suelta y la sesión guiada vive en `localStorage`. Una entidad de sesión en la base permitiría continuarla desde otro dispositivo, registrar sin red y evitar series duplicadas al reintentar (TD-014). Las referencias analizadas coinciden en este cambio.

## [WL-003] Compararse con amigos
Rivalidad sana y opcional: comparar el radar de músculos, la constancia (días por semana) o la carga en un ejercicio. Preferir compartir una imagen o un link por WhatsApp antes que construir perfiles, amistades o chat.

## [WL-064] Analíticas de uso
Saber cuántos usuarios entran, cuántos entrenan cada semana y cuánto se usan las invitaciones. Empezar con consultas a la base antes que con una herramienta.

## [WL-063] Personalización por usuario y ejercicio
El ejercicio (nombre, músculos, descripción) es común a todos, pero cada usuario lo hace a su manera: otra barra (la corta para hip thrust), otros discos o las escalas de las máquinas de su gimnasio. Con esa capa, la calculadora de discos se adapta a cada uno y la sugerencia de subir puede proponer un peso concreto con el salto real de su equipo (la prensa sube de a 10 kg por lado; la barra, de a 5 kg en total).

## [WL-062] Temas
Además de claro y oscuro, temas intercambiables (tipo Dracula) para personalizar la app.

## [WL-005] Registro ampliado: cardio y movilidad
Registrar cardio post-rutina y ejercicios de movilidad/calentamiento antes, sin ensuciar el flujo principal de pesas.

## [WL-077] Ocultar en los logs los identificadores del deploy
Las variables del job `deploy` con el rol a asumir y el servidor de destino no son credenciales, pero las variables de GitHub no se enmascaran y quedan legibles en los logs públicos de Actions. Pasarlas a *Secrets* (`cd.yml` lee `secrets.` en vez de `vars.`) y borrar los logs de las ejecuciones anteriores.
