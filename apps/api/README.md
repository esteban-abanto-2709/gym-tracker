# Gym Tracker — API

API REST de Gym Tracker. NestJS sobre Express, Prisma como ORM y PostgreSQL.
Funciona sola: cualquier cliente que hable HTTP + cookies puede usarla.

## Stack

| Pieza | Versión |
|---|---|
| Runtime | Node.js 22 |
| Framework | NestJS 11 (Express 5) |
| ORM | Prisma 7 con `@prisma/adapter-pg` (pool de `pg`) |
| Base de datos | PostgreSQL 16 |
| Auth | JWT (`@nestjs/jwt`) en cookie httpOnly · `google-auth-library` · `bcryptjs` |
| Validación | `class-validator` + `class-transformer` |
| Tests | Jest + Supertest |
| Gestor de paquetes | pnpm 11 (pineado en `package.json`, vía corepack) |

## Puesta en marcha

```bash
corepack enable                   # activa el pnpm pineado
pnpm install
cp .env.example .env              # y completa los valores
pnpm exec prisma migrate deploy   # aplica las migraciones
pnpm run start:dev                # http://localhost:4000
```

Para tener un Postgres local sin instalar nada:
`docker compose up -d postgres` desde `apps/docker/dev/`.

## Variables de entorno

| Variable | Obligatoria | Para qué |
|---|---|---|
| `DATABASE_URL` | Sí | Conexión en runtime (la usa el pool de `PrismaService`) |
| `DIRECT_URL` | Sí | Conexión para migraciones (la lee `prisma.config.ts`) |
| `JWT_SECRET` | Sí | Firma de los tokens de sesión |
| `FRONTEND_URL` | Sí | Origen permitido por CORS |
| `GOOGLE_CLIENT_ID` | Solo con Google | Audiencia esperada al verificar el ID token de Google |
| `PORT` | No | Puerto HTTP (por defecto `4000`) |
| `NODE_ENV` | No | En `production` la cookie de sesión se marca `secure` |

`DATABASE_URL` y `DIRECT_URL` pueden apuntar a la misma base; Prisma las pide
por separado para soportar un pooler delante.

## Comandos

```bash
pnpm run start:dev    # desarrollo con recarga
pnpm run build        # prisma generate + compilación a dist/
pnpm run start:prod   # node dist/main (requiere build)
pnpm run lint         # ESLint con --fix
pnpm run format       # Prettier
pnpm run test:unit    # Jest, specs junto al código (src/**/*.spec.ts)
pnpm run test:e2e     # Jest + Supertest (test/*.e2e-spec.ts)
pnpm run test:cov     # cobertura
```

```bash
pnpm exec prisma migrate dev     # crear y aplicar una migración nueva
pnpm exec prisma migrate deploy  # aplicar las existentes
pnpm exec prisma generate        # regenerar el cliente
pnpm exec prisma studio          # explorar la base
```

## Arquitectura

```
src/
├── main.ts               # bootstrap: cookie-parser, ValidationPipe, CORS, puerto
├── app.module.ts         # módulos de dominio + JwtAuthGuard global (APP_GUARD)
├── app.controller.ts     # GET /healthz
├── common/
│   ├── decorators/       # @Public() y @CurrentUser()
│   ├── guards/           # JwtAuthGuard: lee la cookie `token`
│   ├── slugify.ts        # slugs de ejercicios y usuarios
│   └── timezone.util.ts  # agrupar por día local según la tz del cliente
├── modules/
│   ├── auth/             # registro, login, Google, logout, /me
│   ├── exercises/        # catálogo global de ejercicios
│   ├── equipment/        # catálogo global de equipos
│   ├── workouts/         # series registradas + recomendación de peso
│   ├── routines/         # rutinas y sus bloques tipados
│   └── programs/         # programas, programa activo, explorar y copiar
└── providers/prisma/     # PrismaService sobre un pg.Pool
```

Cada módulo sigue el patrón Nest de `controller` + `service` + `dto/`. Los
controllers no tienen lógica: validan con DTOs y delegan en el service.

**Reglas transversales:**

- **Todo requiere sesión** salvo lo marcado con `@Public()` (registro, login,
  Google, `/healthz`). El guard es global, así que un endpoint nuevo nace
  protegido.
- **Los datos del usuario se filtran siempre por `userId`** (`@CurrentUser()`).
  Workouts, rutinas y programas son privados; ejercicios y equipos son un
  catálogo compartido.
- **Validación estricta:** `ValidationPipe` con `whitelist` y
  `forbidNonWhitelisted`; un campo que no esté en el DTO devuelve 400.
- **Conflictos de nombre** (`P2002` de Prisma) en programas se traducen a 409.

## Autenticación

- Registro y login con email + contraseña (hash con bcrypt), o con un ID token de
  Google verificado contra `GOOGLE_CLIENT_ID`; si el email ya existe, la cuenta
  se vincula.
- La sesión es un JWT (`sub` = id de usuario, 30 días) en la cookie `token`:
  `httpOnly`, `sameSite=lax`, `secure` en producción.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/healthz` | Salud del servicio (público) |
| POST | `/auth/register` | Crea la cuenta y abre sesión (público) |
| POST | `/auth/login` | Abre sesión (público) |
| POST | `/auth/google` | Login o registro con ID token de Google (público) |
| POST | `/auth/logout` | Cierra sesión |
| GET | `/auth/me` | Usuario actual |
| GET | `/exercises` | Catálogo de ejercicios, por nombre |
| POST | `/exercises` | Crea un ejercicio |
| GET | `/equipment` | Catálogo de equipos |
| GET | `/workouts` | Todas las series del usuario (el agrupado por día lo hace el cliente) |
| POST | `/workouts` | Registra una serie |
| PATCH | `/workouts/:id` | Edita una serie |
| DELETE | `/workouts/:id` | Borra una serie |
| GET | `/workouts/recommendation` | Última serie y sugerencia de peso (ver abajo) |
| GET | `/routines` | Rutinas del usuario |
| POST | `/routines` | Crea una rutina |
| GET | `/routines/:id` | Una rutina con sus ítems |
| PATCH | `/routines/:id` | Edita nombre, ítems y bloques |
| DELETE | `/routines/:id` | Borra una rutina |
| GET | `/programs` | Programas del usuario |
| POST | `/programs` | Crea un programa |
| GET | `/programs/active` | Programa activo y la rutina que toca hoy |
| PUT | `/programs/active` | Cambia o quita el programa activo |
| GET | `/programs/explore` | Programas de otros usuarios |
| POST | `/programs/:id/copy` | Copia un programa ajeno (con sus rutinas) |
| GET | `/programs/:id` | Un programa |
| PATCH | `/programs/:id` | Edita un programa |
| DELETE | `/programs/:id` | Borra un programa |

## Modelo de datos

La fuente de verdad es [`prisma/schema.prisma`](./prisma/schema.prisma). Lo que
no se deduce a simple vista:

- **`Workout` es una serie**, no una sesión. Lleva peso, reps o duración,
  equipo, `setType` (`WORKING`, `WARMUP`, `RAMP`) y `step` (el escalón de la
  rampa). Sin `weight` ni `durationSec` es una serie de solo reps.
- **`RoutineItem.blocks`** es una lista JSON de bloques tipados por `kind`:
  `weight_reps`, `reps`, `time`, `warmup` y `ramp`. En la base es JSON libre;
  la forma la garantizan `modules/routines/blocks.ts` y
  `dto/routine-block.dto.ts`.
- **`Program`** agrupa rutinas en orden (`programPosition`). El usuario tiene un
  `activeProgram`; la rutina que toca se deriva de la última serie registrada.
  `copiedFromId` guarda de qué programa salió una copia.
- **`Exercise`** es solo `name` + `slug`; cómo se mide un ejercicio vive en el
  bloque, no en el ejercicio.

## Recomendación de peso

`GET /workouts/recommendation?exerciseId=&tz=&equipmentId=&setType=&step=`

- Solo compara series del **mismo ejercicio, equipo y `setType`** (el peso no es
  comparable entre una máquina y una mancuerna).
- Toma el peso de la última serie y busca la mejor marca de reps por día local
  (`tz`) a ese peso. Si el último día supera al anterior por 3 reps o más,
  sugiere +2,5 kg (`REP_MARGIN`, `WEIGHT_STEP_KG` en `workouts.service.ts`).
- Con `setType=RAMP` y `step` devuelve además `workingWeight`, sobre el que el
  cliente calcula el peso de cada escalón.

## Docker

`Dockerfile` multi-stage sobre `node:22-alpine`. La imagen final solo lleva
dependencias de producción, `dist/` y el cliente de Prisma, y al arrancar
ejecuta `prisma migrate deploy` antes de `node dist/main`. La orquestación con
la web y la base vive en [`apps/docker/`](../docker/README.md).
