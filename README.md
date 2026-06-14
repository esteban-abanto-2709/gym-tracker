# Gym Tracker

Aplicación full-stack para registrar y analizar entrenamientos de gimnasio. Permite llevar un historial de ejercicios, pesos y repeticiones, con una interfaz rápida pensada para usarse en medio del entrenamiento.

## Apps

| App | Descripción | README |
|-----|-------------|--------|
| **API** | REST API construida con NestJS + PostgreSQL (Prisma) | [`apps/api`](./apps/api/README.md) |
| **Web** | Frontend construido con Next.js 16 + shadcn/ui | [`apps/web`](./apps/web/README.md) |

## Stack

- **Backend:** NestJS · Prisma · PostgreSQL
- **Frontend:** Next.js 16 · React 19 · Tailwind CSS · shadcn/ui
- **Infra:** Docker Compose · Cloudflare Tunnel (acceso público del frontend)

## Filosofía: self-hosted

El proyecto es **autohospedado**: todo el stack (PostgreSQL + API + web) corre en Docker en una sola máquina, sin proveedores gestionados (antes Render/Vercel/Supabase, ya retirados). Lo único que sale a internet es el frontend, a través de un Cloudflare Tunnel; la API y la base de datos quedan privadas dentro de la red Docker.

En la práctica esto significa que **cualquiera puede clonar el repo y levantar la app completa en su propia PC** con Docker, sin cuentas en la nube ni claves de servicios externos. El acceso público vía tunnel es opcional y solo hace falta si quieres exponer tu instancia fuera de tu red local.

## Levantar el proyecto completo (Docker)

Para todos los comandos (prod local, base de datos de desarrollo, reset, tunnel) consulta [`apps/docker/README.md`](./apps/docker/README.md). En resumen:

```bash
cd apps/docker
cp .env.example .env
docker compose up --build
```

Servicios disponibles:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 (privado en la red Docker) |
| PostgreSQL | localhost:5432 (privado en la red Docker) |

## Estructura del repositorio

```
gym-tracker/
├── apps/
│   ├── api/        # NestJS REST API
│   ├── web/        # Next.js frontend
│   └── docker/     # Docker Compose + variables de entorno
└── docs/
    ├── product-vision.md    # Definición de producto y horizontes
    ├── milestones.md        # Hitos (versiones estables) y su orden
    ├── ux-foundations.md    # Fundamentos de UI/UX
    └── logbook/             # Roadmap, deuda técnica, wishlist y changelog
```

Cada app es independiente y tiene su propio `package.json`. Para detalles de comandos, variables de entorno y arquitectura interna, consulta el README de cada app.

## Producto y roadmap

El proyecto está en desarrollo activo. La [definición de producto](./docs/product-vision.md) explica qué es la app y a dónde va; los [hitos](./docs/milestones.md) la parten en versiones estables:

- **H1 · Registro afilado** (activo) — el registro de 2 s pulido y con identidad: kg/lb, dificultad 1-5, manejo de errores de red.
- **H2 · Entrenamientos estructurados** — el "entrenador que no te hace pensar".
- **H3 · Recomendación de peso** — sugerencia de carga que se afina sola.

El roadmap solo lleva las tareas del hito activo; lo demás vive en la [wishlist](./docs/logbook/wishlist.md). El trabajo comprometido y la deuda técnica se siguen en [`docs/logbook/`](./docs/logbook/).

## Licencia

MIT © Esteban Abanto
