# Wishlist

Ideas y mejoras posibles, sin compromiso (quizá nunca). Código `WL-###` (nunca se reutiliza).
Si una idea se promueve, se borra de aquí y nace un `RM` nuevo.

**Formato:** título + idea en 1–2 líneas, sin campos.

---

## [WL-066] Sugerir bajar tras muchas sesiones sin subir
Si pasan muchas sesiones sin poder completar el tope con el mismo peso, sugerir bajar para retomar. Falta definir cuántas cuentan como "muchas".

## [WL-058] Versión de escritorio
Una experiencia cómoda en la computadora para lo que no se hace entre series: revisar tu progreso, exportar tus datos e importar o armar programas.

## [WL-059] Invitaciones con cupo
Para abrir la app a amigos: cada usuario recibe un cupo fijo de invitaciones (p. ej. 4) que comparte por link. El link se puede regenerar, pero quien ya entró no se expulsa.

## [WL-060] Crear un programa con tu IA
La app entrega un `.md` con el formato de programas y rutinas, las convenciones de registro y qué preguntarle al usuario. Tu IA de confianza lo usa para armar el programa y devuelve un JSON; al importarlo se crea un programa **nuevo**, nunca se reemplaza uno existente. No incluye historial: para eso está la exportación (RM-021).

## [WL-061] Recuperar y cambiar la contraseña
Obligatorio antes de tener usuarios que no sean el autor. Google sigue siendo el camino principal, por ser el de menos pasos.

## [WL-039] Publicar programas y rutinas sueltas
Además de programas, publicar rutinas sueltas ("Espalda de Cbum", la que armó un amigo para entrenar juntos hoy). Privados por defecto; al publicar, otros pueden darles "me gusta" y copiarlos. La copia es tuya y no recibe cambios del original. Explorar podría ordenarse por "me gusta" o por copias.

## [WL-047] Análisis por músculo
Un gráfico de radar con cuánto trabajas cada músculo (bíceps, tríceps, cuádriceps, isquios…), para ver qué sobreentrenas y qué descuidas. Depende de que el catálogo tenga músculos (RM-056). Antes de construir otras gráficas, buscar una librería que calce con el stack.

## [WL-003] Compararse con amigos
Rivalidad sana y opcional: comparar el radar de músculos, la constancia (días por semana) o la carga en un ejercicio. Preferir compartir una imagen o un link por WhatsApp antes que construir perfiles, amistades o chat.

## [WL-064] Analíticas de uso
Saber cuántos usuarios entran, cuántos entrenan cada semana y cuánto se usan las invitaciones. Empezar con consultas a la base antes que con una herramienta.

## [WL-065] Sesión de entrenamiento en el servidor
Hoy cada `Workout` es una serie suelta y la sesión guiada vive en `localStorage`. Una entidad de sesión en la base permitiría continuarla desde otro dispositivo, registrar sin red y evitar series duplicadas al reintentar (TD-014). Las referencias analizadas coinciden en este cambio.

## [WL-063] Personalización por usuario y ejercicio
El ejercicio (nombre, músculos, descripción) es común a todos, pero cada usuario lo hace a su manera: otra barra (la corta para hip thrust), otros discos o las escalas de las máquinas de su gimnasio. Una capa propia por usuario y ejercicio alimentaría la calculadora de discos y los incrementos.

## [WL-008] Salto de peso por tipo de equipo en la recomendación
Hoy la sugerencia es siempre `+2.5 kg`. Mancuernas, máquinas y poleas saltan distinto (la prensa sube de a 10 kg por lado); usar el equipo para proponer un incremento realista.

## [WL-062] Temas
Además de claro y oscuro, temas intercambiables (tipo Dracula) para personalizar la app.

## [WL-009] Guardar la unidad original del registro
Columna `unit` en `Workout` para mostrar el peso en la unidad en que se registró (ej. "45 lb" en vez de "20.4 kg"). Serviría al análisis con IA. Hoy se convierte todo a kg redondeado a 1 decimal al guardar.

## [WL-010] Ocultar el selector de equipo en los sets de solo reps
En un bloque `reps` (Dead Bug, plancha abdominal) el equipo siempre es "peso corporal", así que el selector solo estorba. Idea: ocultarlo en esa medición, dejando la puerta abierta a mostrarlo si algún día se hace con lastre o asistido.

## [WL-011] Marcar el calentamiento de forma explícita en el modo guiado
Hoy un set de calentamiento solo se distingue por la etiqueta chica "Calentamiento · La última vez…", mientras el set efectivo muestra la casilla "Aproximación" bien visible: se siente al revés. Idea: un distintivo claro en la tarjeta del ejercicio (badge o color) cuando la serie es de calentamiento, y acortar el texto de la pantalla de descanso, que hoy se corta ("objetivo 25 reps de calentamien…").

## [WL-007] Tags de anotación para análisis con IA
Vocabulario de tags de lista cerrada más allá de "aproximación" (ej. "fallo técnico", "sobreesfuerzo") que se apilan sobre la serie y enriquecen el texto que se exporta a la IA (ver `RM-021`). Diferido: hoy solo interesa la marca de aproximación (`RM-018`).

## [WL-040] Armar un programa desde lo que ya registraste
Tercer camino al empezar con la app vacía: registrar libre unos días y que la app proponga convertir esas sesiones en rutinas y un programa.

## [WL-043] Copias en Explorar: mostrarlas o no
Explorar lista todos los programas de los demás, incluidas las copias (`copiedFromId`), así que si varios amigos copian el mismo programa aparecen duplicados idénticos. Opciones: ocultar las copias (`copiedFromId: null`, pierde las versiones adaptadas), ocultar solo las que no se han editado, o agruparlas bajo el original ("3 personas lo usan").

## [WL-037] Recargar desde dentro de la app instalada
En modo pantalla completa no existe el botón de recargar de Safari: si algo se cuelga, hay que cerrar la app. Evaluar un "tira para recargar" o un botón de reintento en los estados de error.

## [WL-004] IA: patrones desde notas
El usuario escribe una nota del entrenamiento y la IA detecta patrones (ej. "este ejercicio no te va"). Secundario, nunca el centro.

## [WL-005] Registro ampliado: cardio y movilidad
Registrar cardio post-rutina y ejercicios de movilidad/calentamiento antes, sin ensuciar el flujo principal de pesas.
