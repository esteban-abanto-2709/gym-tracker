# Gym Tracker — Visión de producto

> Qué es la app, para quién y por qué. El trabajo comprometido vive en el
> [`roadmap`](./logbook/roadmap.md); cómo se ve y se siente, en
> [`ux-foundations.md`](./ux-foundations.md).

## En una frase

Un registrador de entrenamiento de fuerza que se usa **entre series, sin
pensar**: ves lo que hiciste la vez pasada, la app te dice si toca subir, lo
registras y sueltas el celular.

## Para quién

- **Hoy:** el autor, que la usa cada semana en el gimnasio.
- **Siguiente:** sus amigos, y los amigos de ellos, por invitación.
- **El perfil:** gente joven de nivel **intermedio**. Conoce los ejercicios y
  sabe hacerlos bien, pero sigue descubriendo matices. No necesita que la app le
  enseñe a entrenar; necesita que no le estorbe. Los principiantes absolutos no
  son el objetivo.

## El problema

> "Estoy en el gimnasio, quiero entrenar ahora. No quiero contarle a una app mi
> edad, mi peso ni lo que como. Quiero ver qué rutina hago hoy, saber con cuánto
> peso, registrarlo y seguir con mi vida."

Las apps de gimnasio que existen:

- Piden datos personales y objetivos antes de dejarte registrar la primera serie.
- Esconden lo básico (crear tus rutinas) detrás de una suscripción.
- Te obligan a revisar el historial día por día para decidir si subes el peso.
- Se ven sosas: quieren gustarle a todo el mercado y no tienen carácter.

## Las dos certezas

Todo lo demás se juzga contra esto.

### 1. No pensar

- **Cero configuración para empezar.** Entras, eliges una rutina (o copias la de
  un amigo) y entrenas.
- **La app hace las cuentas; tú decides.** Te muestra lo de la vez pasada, lleva
  la racha y te sugiere subir o bajar. La decisión final es tuya.
- **Nada te saca del entrenamiento.** Lo que necesitas consultar en el momento
  (tu historial con ese ejercicio, cómo se hace, cuántos discos poner) está a un
  toque, sin salir de la serie.

### 2. Carácter

- La app se ve **agresiva, con identidad**, no como una libreta neutra.
- La promesa no es que el gimnasio sea tu vida: es **entra, entrena, vete**. El
  carácter está en la estética, no en exigirte tiempo.

## Cómo progresa el entrenamiento

La lógica que guía las sugerencias, sin que el usuario la configure:

- **Doble progresión.** Cada ejercicio de una rutina tiene un rango de reps
  (p. ej. 3 × 8-10). Cuando **todas** las series llegan al tope, toca subir el
  peso y el objetivo vuelve al mínimo.
- **Racha.** Cada sesión con todas las series en el tope suma una racha; una
  serie por debajo la rompe y subir el peso la reinicia. Cuanto más larga, más
  clara la sugerencia de subir.
- **Bajar con respeto.** Por debajo del mínimo es aceptable. Por debajo de un
  piso (por defecto, dos reps menos que el mínimo: 6 en un 8-10) la app sugiere
  bajar el peso.
- **Incrementos reales.** El salto depende del equipo: barra, mancuerna o
  máquina no suben igual.
- Los ejercicios de solo reps o de tiempo progresan con más reps o más tiempo.

## Principios

- **Registrar es el corazón.** Todo lo demás le suma o sobra; nunca le da trabajo
  al usuario.
- **Los datos personales son opcionales.** Edad, peso corporal o porcentaje de
  grasa mejoran el análisis, pero se agregan cuando uno quiere, desde el perfil,
  nunca antes de entrenar ni durante.
- **Herramientas del gimnasio real.** Lo que sirve entre series cansado: la
  calculadora de discos, buscar el ejercicio en video, ver tu historial con ese
  ejercicio.
- **Si otra app ya lo hace bien, no se copia.** Para hablar con tus amigos está
  WhatsApp; para la comida, apps de nutrición.
- **Tus datos son tuyos.** Se pueden exportar para que los analice tu IA de
  confianza.
- **Sin muro de pago para lo esencial.**

## Qué NO es

- **No es todo-en-uno:** nada de nutrición, hábitos ni fisioterapia.
- **No es una red social:** sin chat, sin feed, sin fotos. Lo social se limita a
  copiar programas y, como mucho, compararse con amigos.
- **No tiene cronómetro.** Como app web, el sistema la congela en segundo plano;
  se usa el del celular.
- **No tiene onboarding.** Ni encuestas ni objetivos al registrarse.

## Hacia dónde va

- **Siempre disponible:** pasar de un servidor en casa a la nube, para que la app
  funcione aunque se vaya la luz.
- **Pulir el momento de entrenar:** historial del ejercicio con racha, buscar el
  ejercicio en video, calculadora de discos y un registro de un toque.
- **Abrirla a amigos por invitación**, con una versión cómoda en escritorio para
  revisar tus datos, exportarlos o importar un programa armado con tu IA.
- **Compartir programas y rutinas sueltas** que otros puedan copiar y adaptar.

El detalle comprometido está en el [`roadmap`](./logbook/roadmap.md) y las ideas
sin compromiso, en la [`wishlist`](./logbook/wishlist.md).

## Restricciones

- Stack: NestJS + Next.js + PostgreSQL (Prisma), en Docker.
- Web instalable en el celular (pantalla completa, vertical).
- Presupuesto mínimo: capas gratuitas y créditos, trabajo en tiempo libre.
