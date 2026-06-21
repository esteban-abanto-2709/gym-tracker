# Gym Tracker — API

REST API del proyecto Gym Tracker. Construida con NestJS sobre Express, usa Prisma como ORM y PostgreSQL como base de datos.

## Stack

- **Framework:** NestJS 11 + Express 5
- **ORM:** Prisma 7 con `@prisma/adapter-pg` (connection pooling)
- **Base de datos:** PostgreSQL 16
- **Runtime:** Node.js 20
- **Testing:** Jest + Supertest

## Requisitos

- Node.js 22+
- PostgreSQL corriendo (o usar Docker Compose desde `apps/docker/`)
- pnpm 11 (gestionado vía corepack; la versión está pineada en `package.json`)

## Instalación

```bash
corepack enable   # habilita la versión de pnpm pineada en package.json
pnpm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz de `apps/api/`:

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/gym_tracker
DIRECT_URL=postgresql://user:password@localhost:5432/gym_tracker
FRONTEND_URL=http://localhost:3000
```

`DATABASE_URL` se usa en runtime y `DIRECT_URL` exclusivamente para migraciones. En este setup self-hosted ambas apuntan al mismo contenedor de Postgres dentro de la red Docker; se mantienen separadas porque el schema de Prisma requiere las dos.

## Comandos

```bash
pnpm run start:dev      # desarrollo con hot-reload
pnpm run start:prod     # producción (requiere build previo)
pnpm run build          # compila TypeScript → dist/

pnpm run test:unit      # tests unitarios
pnpm run test:e2e       # tests end-to-end
pnpm run test:cov       # cobertura de tests

pnpm run lint           # ESLint con auto-fix
pnpm run format         # Prettier
```

## Migraciones (Prisma)

```bash
pnpm exec prisma migrate dev          # crear y aplicar nueva migración (desarrollo)
pnpm exec prisma migrate deploy       # aplicar migraciones existentes (producción)
pnpm exec prisma generate             # regenerar cliente tras cambios en el schema
pnpm exec prisma studio               # UI visual de la base de datos
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/exercises` | Lista todos los ejercicios (orden alfabético) |
| `POST` | `/exercises` | Crea un ejercicio nuevo |
| `GET` | `/workouts` | Lista workouts (filtro opcional `?date=YYYY-MM-DD`) |
| `POST` | `/workouts` | Registra un workout |
| `PATCH` | `/workouts/:id` | Edita un workout |
| `DELETE` | `/workouts/:id` | Elimina un workout |
| `GET` | `/workouts/dates` | Devuelve las fechas distintas con workouts registrados |

## Arquitectura

```
src/
├── main.ts                     # Bootstrap: CORS, prefijo global, puerto
├── app.module.ts               # Módulo raíz
├── modules/
│   ├── exercises/              # ExercisesController + ExercisesService
│   └── workouts/               # WorkoutsController + WorkoutsService
└── providers/
    └── prisma/                 # PrismaService con pg.Pool
```

El `PrismaService` inicializa un `pg.Pool` y lo pasa como adapter a Prisma, lo que permite reusar conexiones de forma eficiente y mantener el pool bajo control frente al Postgres en red.

## Schema de base de datos

```prisma
model Exercise {
  id        String    @id @default(uuid())
  name      String    @unique
  equipment String
  workouts  Workout[]
  createdAt DateTime  @default(now())
}

model Workout {
  id         String   @id @default(uuid())
  exerciseId String
  exercise   Exercise @relation(fields: [exerciseId], references: [id])
  weight     Float
  reps       Int
  opinion    String
  createdAt  DateTime @default(now())
}
```

## Docker

El `Dockerfile` incluye un build multi-stage. Al iniciar el contenedor ejecuta automáticamente `prisma migrate deploy` antes de levantar el servidor. Para correr junto al resto del stack, usa Docker Compose desde `apps/docker/`.

## Despliegue

**Self-hosted** vía Docker Compose (`apps/docker/`) en una sola máquina. La API corre dentro de la red privada `gym-tracker-network` y no se expone a internet: solo la web sale al exterior a través de un Cloudflare Tunnel. `DATABASE_URL` y `DIRECT_URL` apuntan al contenedor de Postgres de la misma red.
