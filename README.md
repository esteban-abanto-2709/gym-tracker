# Gym Tracker

Un registrador de entrenamiento que se usa **entre series, sin pensar**.

Ves lo que levantaste la vez pasada, lo repites o subes el peso, lo anotas en dos
segundos y sueltas el celular.

---

## El problema

Las apps de gimnasio que existen hacen que registrar cueste más que entrenar.

Te piden peso, talla, unidades y objetivos antes de dejarte anotar la primera
serie. Guardan lo básico —crear tus propias rutinas— detrás de una suscripción.
Y cuando por fin estás en el gym, entre serie y serie, con el descanso corriendo,
te obligan a navegar tres pantallas para apuntar un número que ya sabías.

Gym Tracker nace de lo contrario: **la app no debería estorbar**.

## El principio: no pensar

Ese es el valor entero del proyecto, y todo lo demás se subordina a él.

- Abres la app y ves el peso y las repeticiones de la última vez.
- Lo repites tal cual, o subes la carga si lo sentiste fácil.
- Lo registras y guardas el celular.

El progreso no hay que buscarlo en un gráfico: se siente porque **queda anotado**.
A largo plazo la idea es que la app te diga qué toca, con cuánto peso y cuántas
repeticiones, y tú solo ejecutes. Un entrenador silencioso, sin avatar y sin
charla.

## Qué hace hoy

- **Registro en dos segundos.** El último peso y las últimas reps vienen
  precargados; confirmas y listo.
- **Rutinas guiadas.** Armas tu sesión una vez (Push, Pull, Pierna) y la app te
  lleva ejercicio por ejercicio, contando las series que llevas.
- **Día libre.** ¿No tocaba rutina? Registras suelto, sin estructura.
- **Kilos o libras.** Eliges la unidad al registrar, porque hay máquinas que solo
  vienen en libras. Por dentro todo se guarda igual; se acabaron las conversiones
  en otra pestaña.
- **Series de todo tipo.** Con peso y reps, solo reps (dominadas, fondos), por
  tiempo (plancha), calentamientos y rampas de aproximación.
- **Sugerencia de carga.** Si vienes mejorando las repeticiones a un mismo peso,
  la app te propone subir.
- **Historial editable.** Te equivocaste en un número: lo corriges después, por día.
- **Cuentas propias.** Con correo o con Google. Tus datos son tuyos y nadie más
  los ve.

## Qué NO es

Tan importante como lo anterior:

- **No es un todo-en-uno.** Nada de nutrición, hábitos ni fisioterapia.
- **No es una red social.** Sin feed, sin chat, sin fotos.
- **No tiene cronómetro.** Ya tienes uno en el celular.
- **No tiene onboarding pesado.** Entras y registras.
- **No tiene muro de pago.** Lo esencial es lo esencial.

Lo único "social" que sí encaja, más adelante: poder copiarle la rutina a un
amigo. Comparar cargas es vanidad; copiar una buena rutina sí es útil.

## Autohospedado: la app es tuya

Gym Tracker no depende de ningún servicio en la nube. Todo el stack —base de
datos, API y frontend— corre en contenedores sobre una sola máquina.

Eso significa que **cualquiera puede clonar este repositorio y levantar la app
completa en su propia PC**, sin crear cuentas en ningún proveedor ni pagar nada.
Tus entrenamientos viven en tu máquina, en tu base de datos.

Si además quieres alcanzarla desde fuera de tu casa —desde el gimnasio, por
ejemplo— el proyecto incluye la pieza para publicarla por un túnel de Cloudflare.
Es opcional: sin configurarlo, la app funciona igual dentro de tu red local.

```bash
cd apps/docker
cp .env.example .env
docker compose up --build
```

Los detalles están en [`apps/docker/README.md`](./apps/docker/README.md).

## Cómo está construido

Un monorepo con dos aplicaciones independientes y la orquestación que las une:

| Carpeta | Qué es |
|---------|--------|
| [`apps/api`](./apps/api/README.md) | La API REST y la base de datos. NestJS, PostgreSQL y Prisma. |
| [`apps/web`](./apps/web/README.md) | La interfaz. Next.js, React y Tailwind. |
| [`apps/docker`](./apps/docker/README.md) | Docker Compose, backups y restauración. |

Cada app se gestiona por su cuenta y tiene su propio README **con el detalle
técnico**: comandos, variables de entorno, arquitectura interna y endpoints. Este
documento es la vista de producto; esos son los planos.

## Sobre el proyecto

Es una app que uso de verdad, cada semana, en el gimnasio. Nació de una molestia
propia y se mantiene por la misma razón, así que las decisiones se toman pensando
en si mejoran el minuto y medio entre series — no en si suman una función más a
la lista.

También es una pieza de portafolio, y lo que busca demostrar es **visión de
producto**: que lo difícil no es hacer un CRUD de ejercicios, sino decidir qué no
construir.

Está en desarrollo activo. El recorrido se organiza en tres hitos:

- **Registro afilado** — que anotar una serie sea instantáneo y no falle nunca.
- **Entrenamientos estructurados** — el entrenador que no te hace pensar.
- **Recomendación de peso** — que la carga sugerida se afine sola con tu historial.

Si te interesa el razonamiento detrás de todo esto:

- [Definición de producto](./docs/product-vision.md) — qué es, para quién y por qué.
- [Hitos](./docs/milestones.md) — cómo se parte el camino en versiones estables.
- [Fundamentos de UI/UX](./docs/ux-foundations.md) — los criterios de diseño.
- [Bitácora](./docs/logbook/) — roadmap, deuda técnica, ideas y registro de cambios.

## Licencia

MIT © Esteban Abanto

Úsalo, modifícalo y levántalo donde quieras.
