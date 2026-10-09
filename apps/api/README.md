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
│   ├── date-only.ts      # fechas sin hora (YYYY-MM-DD) y su validador
│   ├── slugify.ts        # slugs de ejercicios y usuarios
│   └── timezone.util.ts  # agrupar por día local según la tz del cliente
├── modules/
│   ├── auth/             # registro, login, Google, logout, /me
│   ├── exercises/        # catálogo global de ejercicios
│   ├── equipment/        # catálogo global de equipos
│   ├── workouts/         # series registradas + recomendación de peso
│   ├── routines/         # rutinas y sus bloques tipados
│   ├── programs/         # programas, programa activo, explorar y copiar
│   └── measurements/     # medidas corporales opcionales con fecha
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
| PATCH | `/auth/me` | Cambia o borra (`null`) la fecha de nacimiento |
| GET | `/exercises` | Catálogo de ejercicios, por nombre |
| POST | `/exercises` | Crea un ejercicio |
| GET | `/equipment` | Catálogo de equipos |
| GET | `/workouts` | Todas las series del usuario (el agrupado por día lo hace el cliente) |
| POST | `/workouts` | Registra una serie |
| PATCH | `/workouts/:id` | Edita una serie |
| DELETE | `/workouts/:id` | Borra una serie |
| GET | `/workouts/recommendation` | Última serie, para precargar el formulario (ver abajo) |
| GET | `/workouts/progress` | Racha e historial de un ejercicio (ver abajo) |
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
| GET | `/measurements` | Medidas corporales del usuario, la más nueva primero |
| PUT | `/measurements` | Crea o reemplaza la medida de una fecha |
| DELETE | `/measurements/:date` | Borra la medida de una fecha |

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
- **`BodyMeasurement`** es una medida corporal opcional: una por usuario y
  fecha, con peso, % de grasa y altura opcionales. Un `CHECK` en la base exige
  al menos uno. `User.birthDate` es un valor único; la edad se calcula.
- **`Exercise`** es solo `name` + `slug`; cómo se mide un ejercicio vive en el
  bloque, no en el ejercicio.

## Última serie

`GET /workouts/recommendation?exerciseId=&equipmentId=&setType=&step=`

- Devuelve la última serie del **mismo ejercicio, equipo y `setType`** (el peso
  no es comparable entre una máquina y una mancuerna) para precargar el
  formulario. No sugiere pesos.
- Con `setType=RAMP` y `step` devuelve además `workingWeight`, sobre el que el
  cliente calcula el peso de cada escalón.

## Racha e historial del ejercicio

`GET /workouts/progress?exerciseId=&routineId=&tz=`

- **Sesión:** las series efectivas (`WORKING`) de un día local (`tz`) con el
  mismo equipo, separando las hechas en rutina de las del día libre.
- **Meta:** el primer bloque `weight_reps` del ejercicio en `routineId`. Sin
  rutina o sin ese bloque, `streak` es `null` (no hay racha).
- **Racha:** sesiones con rutina seguidas, de la más reciente hacia atrás, con
  todas las series que pide la meta, todas en el tope (`repsMax`, o `reps` si no
  hay rango) y con el mismo peso y equipo. Cuenta series de cualquier rutina;
  el día libre no suma ni rompe. Una sesión de hoy aún incompleta y al tope no
  rompe la racha.
- **Sugerencia:** `down` si alguna serie de la última sesión quedó bajo el piso
  (mínimo del rango menos 2); si no, `up` con racha. El cliente decide cómo
  mostrarla; nunca propone un peso.
- `sessions` trae las sesiones de las últimas 300 series efectivas, incluidas
  las del día libre, con su equipo. El cliente las pagina. La lógica vive en `modules/workouts/streak.ts`.

## Docker

`Dockerfile` multi-stage sobre `node:22-alpine`. Las dependencias de producción
se instalan en su propia etapa con el store de pnpm en un cache mount, y la
imagen final copia solo ese `node_modules`, `dist/` y el cliente de Prisma: sin
pnpm ni store dentro. Al arrancar
ejecuta `prisma migrate deploy` antes de `node dist/main`. La orquestación con
la web y la base vive en [`apps/docker/`](../docker/README.md).
