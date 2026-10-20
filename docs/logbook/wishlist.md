# Wishlist

Ideas y mejoras posibles, sin compromiso (quizá nunca). Código `WL-###` (nunca se reutiliza).
Si una idea se promueve, se borra de aquí y nace un `RM` nuevo.

**Formato:** título + idea en 1–2 líneas, sin campos.

---

## [WL-124] Recuperar la contraseña por correo
El "¿Olvidaste tu contraseña?": link de un solo uso por correo que caduca, `POST /auth/forgot` (responde igual exista o no la cuenta) y `POST /auth/reset` (cierra todas las sesiones con TD-120), con límite de intentos. Exige que la app envíe correos: proveedor (candidato Resend) y SPF/DKIM en el DNS. Aplazado: hoy casi todos entran con Google y cambiar la contraseña ya existe (WL-061).

## [WL-122] Manual de funcionamiento
Un documento no técnico que explique cómo funciona la app para cualquier persona, con sus reglas concretas: qué cuenta para la racha, qué pasa con la sesión guiada al terminar el día, que cerrar sesión cierra todos los dispositivos (TD-120), etc. Distinto de `product-vision.md` (el porqué) y de los README (lo técnico).

## [WL-115] Animación de serie guardada con más movimiento
Desde RM-114 el check sale al instante, pero el overlay aparece y se va algo de golpe, con una micropausa. Darle una entrada y salida más fluida (transición desde el botón, salida que se funda con la pantalla siguiente). Detalle fino: se ve al usar, no al leer el código.

## [WL-103] ¿Deben existir las series libres?
Un ejercicio de rutina sin bloques ("Series libres") no tiene meta: la app no sabe cuándo pasar al siguiente ni puede calcular el fuego, y obliga a casos especiales en la sesión guiada. Discutir si quitarlas (exigir al menos un bloque al guardar) o darles un uso claro.

## [WL-098] Tutoriales guiados
Desde una tarjeta de Novedades, un botón "ver tutorial" que oscurece la pantalla e ilumina paso a paso dónde tocar (p. ej. Perfil → Medidas). Opcional: solo lo ve quien lo pide. Con una librería existente (`driver.js` o `react-joyride`, ambas MIT) y solo para las dos o tres funciones que más confunden, porque cada cambio de pantalla puede romper un tutorial.

## [WL-097] Deslizar para cerrar los paneles
Bajar con el dedo para cerrar los paneles que suben desde abajo (Novedades, Exportar, Idioma, Medidas, mapa de la sesión), los cinco a la vez para que se comporten igual. Primero elegir librería: `vaul` (la del Drawer de shadcn) parece sin mantenimiento, verificarlo y comparar con alternativas como el drag de `motion`.

## [WL-087] Fusionar y promover ejercicios
Con ejercicios creados por usuarios aparecen duplicados ("press raro" creado varias veces). Una herramienta para fusionar un ejercicio en otro (mover sus series y rutinas) y para promover uno de usuario a oficial, completándole músculos y tipo. Depende de RM-056.

## [WL-082] Caché de datos en el navegador
Cada pantalla pide sus datos al montarse y cada viaje por el túnel cuesta ~250 ms (ver TD-080 en el changelog). Con una librería de caché (TanStack Query o SWR), volver a una pantalla mostraría al instante lo último cargado y refrescaría por detrás.

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

## [WL-058] Versión de escritorio
Una experiencia cómoda en la computadora para lo que no se hace entre series: revisar tu progreso, exportar tus datos e importar o armar programas. En escritorio, el video del ejercicio puede abrirse en YouTube en vez de TikTok.

## [WL-060] Crear un programa con tu IA
La app entrega un `.md` con el formato de programas y rutinas, las convenciones de registro y qué preguntarle al usuario. Tu IA de confianza lo usa para armar el programa y devuelve un JSON; al importarlo se crea un programa **nuevo**, nunca se reemplaza uno existente. No incluye historial: si quieres que la IA lo considere, se lo pasas aparte con la exportación (RM-021).

## [WL-039] Publicar programas y rutinas sueltas
**En progreso (2026-10-20).** Todo es privado; publicar crea una foto fija con slug propio (`/explore/routines/:slug`, `/explore/programs/:slug`) sin ancla a la rutina o el programa original. El autor solo puede renombrarla o eliminarla; las copias de los demás se quedan. Un "me gusta" por cuenta; el contador de copias cuenta personas distintas y no baja si borran su copia. El autor no puede darse "me gusta", pero sí copiar su propia publicación sin sumar al contador. Explorar ordena por "me gusta", copias o recientes.

## [WL-047] Análisis por músculo
Un gráfico de radar con cuánto trabajas cada músculo (bíceps, tríceps, cuádriceps, isquios…), para ver qué sobreentrenas y qué descuidas. Depende de que el catálogo tenga músculos (RM-056). Antes de construir otras gráficas, buscar una librería que calce con el stack.

## [WL-065] Sesión de entrenamiento en el servidor
Hoy cada `Workout` es una serie suelta y la sesión guiada vive en `localStorage`. Una entidad de sesión en la base permitiría continuarla desde otro dispositivo. Registrar sin red y no duplicar al reintentar ya lo resuelve RM-114 sin ella. Las referencias analizadas coinciden en este cambio.

## [WL-003] Compararse con amigos
Rivalidad sana y opcional: comparar el radar de músculos, la constancia (días por semana) o la carga en un ejercicio. Preferir compartir una imagen o un link por WhatsApp antes que construir perfiles, amistades o chat.

## [WL-064] Analíticas de uso
Saber cuántos usuarios entran, cuántos entrenan cada semana y cuántos vuelven. Empezar con consultas a la base antes que con una herramienta.

## [WL-063] Personalización por usuario y ejercicio
El ejercicio (nombre, músculos, descripción) es común a todos, pero cada usuario lo hace a su manera: otra barra (la corta para hip thrust), otros discos o las escalas de las máquinas de su gimnasio. Con esa capa, la calculadora de discos se adapta a cada uno y la sugerencia de subir puede proponer un peso concreto con el salto real de su equipo (la prensa sube de a 10 kg por lado; la barra, de a 5 kg en total).

## [WL-062] Temas
Además de claro y oscuro, temas intercambiables (tipo Dracula) para personalizar la app.

## [WL-005] Registro ampliado: cardio y movilidad
Registrar cardio post-rutina y ejercicios de movilidad/calentamiento antes, sin ensuciar el flujo principal de pesas.

## [WL-077] Ocultar en los logs los identificadores del deploy
Las variables del job `deploy` con el rol a asumir y el servidor de destino no son credenciales, pero las variables de GitHub no se enmascaran y quedan legibles en los logs públicos de Actions. Pasarlas a *Secrets* (`cd.yml` lee `secrets.` en vez de `vars.`) y borrar los logs de las ejecuciones anteriores.
