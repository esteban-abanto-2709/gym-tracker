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
- **Infra:** Docker Compose (local) · Render (API) · Vercel (Web) · Supabase (DB)

## Levantar el proyecto completo (Docker)

```bash
cd apps/docker
cp .env.example .env
docker compose up --build
```

Servicios disponibles:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| PostgreSQL | localhost:5432 |

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
