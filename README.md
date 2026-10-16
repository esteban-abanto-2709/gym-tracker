# Gym Tracker

Un registrador de entrenamiento de fuerza que se usa **entre series, sin
pensar**.

Ves lo que levantaste la vez pasada, lo repites o subes el peso, lo anotas en
dos segundos y sueltas el celular.

[![CD](https://github.com/esteban-abanto-2709/gym-tracker/actions/workflows/cd.yml/badge.svg?branch=main)](https://github.com/esteban-abanto-2709/gym-tracker/actions/workflows/cd.yml)
[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-blue)](./LICENSE)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](./apps/docker/README.md)

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

**Al entrenar**

- **Registro en dos segundos.** El último peso y las últimas reps vienen
  precargados; confirmas y listo. La serie se guarda al instante, aunque la
  señal del gimnasio sea mala: si no llega, se reintenta por detrás sin
  duplicarse.
- **Rutinas guiadas.** La app te lleva ejercicio por ejercicio, con la meta de
  cada serie y un mapa de la sesión. Puedes saltar, reemplazar o adelantarte:
  la estructura ayuda, no obliga.
- **Racha y sugerencia de carga.** Un fuego cuenta las sesiones seguidas en las
  que llegaste al tope del rango con el mismo peso. Con racha te propone subir;
  si te quedas corto, bajar. Nunca te dice cuánto: tú decides. Compara solo con
  el mismo equipo, porque una máquina y una mancuerna no pesan igual.
- **Historial del ejercicio** sin salir del entrenamiento: tus últimas sesiones
  de ese ejercicio, con su equipo.
- **Tiempo de descanso.** Ves cuánto pasó desde la última serie, sin activar
  nada.
- **Ver el ejercicio** en video con un toque, si no recuerdas cómo se hace.
- **Kilos o libras.** Eliges la unidad al registrar, porque hay máquinas que
  solo vienen en libras.

**Fuera del gimnasio**

- **Series de todo tipo.** Peso y reps con rango (3 × 8-10), solo reps
  (dominadas, fondos), por tiempo (plancha), calentamientos y rampas de
  aproximación.
- **Programas.** Agrupa tus rutinas (Push, Pull, Pierna; Upper/Lower) y la app
  te dice cuál toca hoy. También puedes mirar los programas de otros y
  copiarlos.
- **Día libre.** ¿No toca rutina? Registras suelto.
- **Historial editable** por día, para corregir cualquier serie después.
- **Exportar para tu IA.** Un rango de fechas en un archivo listo para que tu
  asistente analice tu progreso.
- **Medidas corporales** opcionales: peso, % de grasa y altura por fecha.
- **Ejercicios en inglés o español.** Casi 100 ejercicios oficiales en los dos
  idiomas; el buscador los encuentra sin importar tildes.
- **Novedades** dentro de la app, para descubrir lo que puede hacer.
- **Cuentas propias** con correo o Google, y **se instala en el celular**: abre
  a pantalla completa, como una app.

## Qué NO es

- **No es todo-en-uno.** Nada de nutrición, hábitos ni fisioterapia.
- **No es una red social.** Sin feed, sin chat, sin fotos.
- **No tiene cronómetro que manejar.** El descanso se cuenta solo; no hay nada
  que iniciar ni detener.
- **No tiene muro de pago** para lo esencial.

## Qué viene

- **Calculadora de discos:** cuánto poner a cada lado de la barra.
- **Más formas de encontrar un ejercicio:** alias ("press plano") y variantes
  por equipo.
- **La interfaz en inglés**, además de los ejercicios.
- **Registro de un toque:** un experimento para marcar series sin formulario.

El detalle y el orden están en el [roadmap](./docs/logbook/roadmap.md).

## Cómo está construido

Dos aplicaciones independientes y la orquestación que las une:

```
navegador ──/api/*──▶ web (Next.js) ──▶ api (NestJS) ──▶ PostgreSQL
```

| Carpeta | Qué es |
|---|---|
| [`apps/web`](./apps/web/README.md) | La interfaz: Next.js, React y Tailwind, pensada para el celular |
| [`apps/api`](./apps/api/README.md) | La API REST: NestJS, Prisma y PostgreSQL |
| [`apps/docker`](./apps/docker/README.md) | Docker Compose de producción y desarrollo, backups y restauración |
| [`.github/workflows`](./.github/workflows/README.md) | CI en cada pull request y despliegue automático en cada push a `main` |

El navegador solo habla con la web, que hace de proxy hacia la API: la dirección
de la API nunca llega al cliente. La sesión vive en una cookie httpOnly.

Cada carpeta tiene su propio README con el detalle técnico: comandos, variables
de entorno, arquitectura y endpoints.

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

[MIT](./LICENSE) © Esteban Abanto
