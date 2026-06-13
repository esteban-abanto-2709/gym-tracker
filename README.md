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
    ├── product-vision.md   # Visión del producto y fases planificadas
    └── logbook/            # Roadmap, deuda técnica, wishlist y changelog
```

Cada app es independiente y tiene su propio `package.json`. Para detalles de comandos, variables de entorno y arquitectura interna, consulta el README de cada app.

## Roadmap

El proyecto está en desarrollo activo. Consulta [`docs/product-vision.md`](./docs/product-vision.md) para ver las fases planificadas:

- **v1.5** — Sistema de rutinas (multi-ejercicio por sesión)
- **v2.0** — Autenticación con Supabase Auth + perfiles de usuario
- **v2.5** — Dashboards de analíticas y comparativas sociales
- **v3.0** — Sugerencias de IA y sobrecarga progresiva

## Licencia

MIT © Esteban Abanto
