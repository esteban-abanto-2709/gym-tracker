# Gym Tracker — API

REST API del proyecto Gym Tracker. Construida con NestJS sobre Express, usa Prisma como ORM y PostgreSQL como base de datos.

## Stack

- **Framework:** NestJS 11 + Express 5
- **ORM:** Prisma 7 con `@prisma/adapter-pg` (connection pooling)
- **Base de datos:** PostgreSQL 16
- **Runtime:** Node.js 20
- **Testing:** Jest + Supertest

## Requisitos

- Node.js 20+
- PostgreSQL corriendo (o usar Docker Compose desde `apps/docker/`)
- npm

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz de `apps/api/`:

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/gym_tracker
DIRECT_URL=postgresql://user:password@localhost:5432/gym_tracker
FRONTEND_URL=http://localhost:3000
```

`DATABASE_URL` se usa en runtime (puede ser una URL de pool como Supabase Transaction Mode).  
`DIRECT_URL` se usa exclusivamente para migraciones y debe ser una conexión directa.

## Comandos

```bash
npm run start:dev      # desarrollo con hot-reload
npm run start:prod     # producción (requiere build previo)
npm run build          # compila TypeScript → dist/

npm run test:unit      # tests unitarios
npm run test:e2e       # tests end-to-end
npm run test:cov       # cobertura de tests

npm run lint           # ESLint con auto-fix
npm run format         # Prettier
```

## Migraciones (Prisma)

```bash
npx prisma migrate dev          # crear y aplicar nueva migración (desarrollo)
npx prisma migrate deploy       # aplicar migraciones existentes (producción)
npx prisma generate             # regenerar cliente tras cambios en el schema
npx prisma studio               # UI visual de la base de datos
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

El `PrismaService` inicializa un `pg.Pool` y lo pasa como adapter a Prisma, lo que permite reusar conexiones de forma eficiente en entornos serverless o con límites de conexiones (Supabase, Render free tier).

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

Desplegado en **Render** como servicio web containerizado. En producción, `DIRECT_URL` debe apuntar a la conexión directa de Supabase (Session Mode o IPv4 add-on) para que las migraciones funcionen correctamente.
