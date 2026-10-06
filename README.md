# Gym Tracker

Un registrador de entrenamiento de fuerza que se usa **entre series, sin
pensar**.

Ves lo que levantaste la vez pasada, lo repites o subes el peso, lo anotas en
dos segundos y sueltas el celular.

---

## El problema

Las apps de gimnasio hacen que registrar cueste más que entrenar.

Te piden edad, peso, objetivos y hasta lo que comes antes de dejarte anotar la
primera serie. Guardan lo básico, como crear tus propias rutinas, detrás de una
suscripción. Y para saber si te toca subir el peso, tienes que revisar el
historial día por día, entre serie y serie, con el descanso corriendo.

Gym Tracker nace de lo contrario: **la app no debería estorbar**.

## Cómo se siente

- **No pensar.** Abres, eliges tu rutina y la app te muestra lo de la última
  vez. Te sugiere cuándo subir; tú decides.
- **Carácter.** Oscura, enérgica, con identidad. Nada de libreta neutra.
- **Entra, entrena, vete.** Sin onboarding, sin encuestas, sin datos personales
  obligatorios.

## Qué hace hoy

- **Registro en dos segundos.** El último peso y las últimas reps vienen
  precargados; confirmas y listo.
- **Rutinas guiadas.** Armas tu sesión una vez y la app te lleva ejercicio por
  ejercicio, con la meta de cada serie y un mapa de la sesión. Puedes saltar,
  reemplazar o añadir ejercicios sobre la marcha: la estructura ayuda, no
  obliga.
- **Series de todo tipo.** Peso y reps con rango (3 × 8-10), solo reps
  (dominadas, fondos), por tiempo (plancha), calentamientos y rampas de
  aproximación.
- **Programas.** Agrupa tus rutinas (Push, Pull, Pierna; Upper/Lower) y la app
  te dice cuál toca hoy.
- **Explorar y copiar.** Mira los programas de otros y cópialos para hacerlos
  tuyos.
- **Día libre.** ¿No toca rutina? Registras suelto.
- **Sugerencia de carga.** Si vienes mejorando las reps a un mismo peso, la app
  te propone subir. Compara solo con el mismo equipo, porque una máquina y una
  mancuerna no pesan igual.
- **Kilos o libras.** Eliges la unidad al registrar, porque hay máquinas que
  solo vienen en libras.
- **Historial editable.** Corriges cualquier serie después, por día.
- **Cuentas propias** con correo o Google. Tus datos son tuyos.
- **Se instala en el celular** y abre a pantalla completa.

## Qué NO es

- **No es todo-en-uno.** Nada de nutrición, hábitos ni fisioterapia.
- **No es una red social.** Sin feed, sin chat, sin fotos.
- **No tiene cronómetro.** Ya tienes uno en el celular.
- **No tiene muro de pago** para lo esencial.

## Qué viene

- **En la nube**, para que esté disponible siempre.
- **Historial del ejercicio con racha:** ver tus últimas sesiones de ese
  ejercicio sin salir del entrenamiento, y saber de un vistazo si toca subir.
- **Ver el ejercicio en video** con un toque.
- **Calculadora de discos:** cuánto poner a cada lado de la barra.
- **Exportar tus datos** por rango de fechas para que los analice tu IA.

El detalle está en el [roadmap](./docs/logbook/roadmap.md).

## Cómo está construido

Un monorepo con dos aplicaciones independientes y la orquestación que las une:

| Carpeta | Qué es |
|---|---|
| [`apps/api`](./apps/api/README.md) | API REST: NestJS, PostgreSQL y Prisma |
| [`apps/web`](./apps/web/README.md) | Interfaz: Next.js, React y Tailwind |
| [`apps/docker`](./apps/docker/README.md) | Docker Compose de producción y desarrollo, backups y restauración |

Cada app tiene su propio README con el detalle técnico: comandos, variables de
entorno, arquitectura y endpoints.

### Levantarla en tu máquina

Todo el stack (base de datos, API, web y un túnel de Cloudflare opcional) corre
con Docker Compose:

```bash
cd apps/docker
cp .env.example prod/.env   # y completa los valores
cd prod
docker compose up -d --build
```

Los detalles están en [`apps/docker/README.md`](./apps/docker/README.md).

## Sobre el proyecto

Es una app que uso de verdad, cada semana, en el gimnasio. Nació de una molestia
propia y se mantiene por la misma razón: las decisiones se toman pensando en si
mejoran el minuto y medio entre series, no en si suman una función más a la
lista.

Lo difícil no es hacer un CRUD de ejercicios, sino decidir qué no construir.

- [Visión de producto](./docs/product-vision.md): qué es, para quién y por qué.
- [Fundamentos de UI/UX](./docs/ux-foundations.md): los criterios de diseño.
- [Bitácora](./docs/logbook/): roadmap, deuda técnica, ideas y registro de
  cambios.

## Licencia

MIT © Esteban Abanto
