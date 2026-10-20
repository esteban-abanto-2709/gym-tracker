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
pnpm run lint         # ESLint, solo revisa
pnpm run lint:fix     # ESLint y corrige lo que pueda
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

En Prisma 7, `migrate dev` ya no regenera el cliente: corre `prisma generate`
después, o los tests y el editor siguen viendo el schema anterior.

## Arquitectura

```
src/
├── main.ts               # bootstrap: cookie-parser, ValidationPipe, CORS, puerto
├── app.module.ts         # módulos de dominio + JwtAuthGuard global (APP_GUARD)
├── app.controller.ts     # GET /healthz
├── common/
│   ├── decorators/       # @Public() y @CurrentUser()
│   ├── guards/           # JwtAuthGuard: lee la cookie `token`
│   ├── interceptors/     # ExerciseNamesInterceptor: nombres en el idioma del usuario
│   ├── date-only.ts      # fechas sin hora (YYYY-MM-DD) y su validador
│   ├── locale.ts         # elegir el nombre por idioma y normalizar búsquedas
│   ├── slugify.ts        # slugs de ejercicios y usuarios
│   └── timezone.util.ts  # agrupar por día local según la tz del cliente
├── modules/
│   ├── auth/             # registro, login, Google, logout, /me
│   ├── exercises/        # catálogo global de ejercicios y los oficiales (official-exercises.ts)
│   ├── equipment/        # catálogo global de equipos
│   ├── workouts/         # series registradas, última serie y racha
│   ├── routines/         # rutinas y sus bloques tipados
│   ├── programs/         # programas y programa activo
│   ├── measurements/     # medidas corporales opcionales con fecha
│   └── publications/     # publicar rutinas y programas como foto fija
├── providers/prisma/     # PrismaService sobre un pg.Pool
├── scripts/seed.ts       # carga o actualiza los ejercicios oficiales
└── types/                # tipos de Express (req.user)
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
- **Nombres de ejercicio por idioma:** los services devuelven los ejercicios con
  todos sus nombres, y `ExerciseNamesInterceptor` deja en cada respuesta solo el
  del idioma de ejercicios del usuario (`User.exerciseLocale`, inglés por
  defecto). Ningún endpoint elige el idioma por su cuenta.

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
| PATCH | `/auth/me` | Cambia la fecha de nacimiento (o la borra con `null`), el idioma de ejercicios y las novedades abiertas o vistas |
| GET | `/exercises` | Catálogo de ejercicios, con el nombre en el idioma del usuario |
| POST | `/exercises` | Crea un ejercicio propio, con el nombre en el idioma del usuario |
| GET | `/equipment` | Catálogo de equipos |
| GET | `/workouts?from=&to=` | Las series de un rango de fechas, con ejercicio, equipo y nombre de la rutina (el agrupado por día lo hace el cliente) |
| GET | `/workouts/days?tz=` | Los días con series (en la zona horaria del cliente) y las series del día más reciente |
| POST | `/workouts` | Registra una serie. Con `clientId`, repetir el envío devuelve la misma serie en vez de duplicarla |
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
| GET | `/programs/:id` | Un programa |
| PATCH | `/programs/:id` | Edita un programa |
| DELETE | `/programs/:id` | Borra un programa |
| GET | `/measurements` | Medidas corporales del usuario, la más nueva primero |
| PUT | `/measurements` | Crea o reemplaza la medida de una fecha |
| DELETE | `/measurements/:date` | Borra la medida de una fecha |
| POST | `/routines/:id/publish` | Publica una rutina propia con un slug (foto fija) |
| POST | `/programs/:id/publish` | Publica un programa propio con sus rutinas (foto fija) |
| GET | `/publications/slug-available` | `?kind=ROUTINE\|PROGRAM&slug=`: si el slug está libre |
| GET | `/explore/routines`, `/explore/programs` | Publicaciones (`?sort=likes\|copies\|recent`, 50 como máximo) con autor (`username` y `slug`), me gusta, copias, `likedByMe` e `isMine` |
| GET | `/explore/{routines\|programs}/:slug` | Una publicación con sus rutinas y ejercicios |
| POST | `/explore/routines/:slug/copy` | Copia la rutina como rutina suelta |
| PUT, DELETE | `/explore/{routines\|programs}/:slug/like` | Da o quita tu me gusta (idempotente; el tuyo propio da 403). Devuelve `likeCount` y `likedByMe` |
| POST | `/explore/programs/:slug/copy` | Copia el programa entero (lo activa si no tenías uno) o, con `routinePosition`, solo esa rutina |

## Modelo de datos

La fuente de verdad es [`prisma/schema.prisma`](./prisma/schema.prisma). Lo que
no se deduce a simple vista:

- **`Workout` es una serie**, no una sesión. Lleva peso, reps o duración,
  equipo, `setType` (`WORKING`, `WARMUP`, `RAMP`) y `step` (el escalón de la
  rampa). Sin `weight` ni `durationSec` es una serie de solo reps. `clientId`
  es opcional y único por usuario: la web lo genera para reintentar un envío
  sin duplicar la serie.
- **`RoutineItem.blocks`** es una lista JSON de bloques tipados por `kind`:
  `weight_reps`, `reps`, `time`, `warmup` y `ramp`. En la base es JSON libre;
  la forma la garantizan `modules/routines/blocks.ts` y
  `dto/routine-block.dto.ts`.
- **`Program`** agrupa rutinas en orden (`programPosition`). El usuario tiene un
  `activeProgram`; la rutina que toca se deriva de la última serie registrada.
  `copiedFromId` solo existe en copias hechas con el Explorar anterior a las
  publicaciones; ya no se escribe.
- **`Publication`** es una foto fija: publicar copia la rutina o el programa a
  `PublicationRoutine` y `PublicationRoutineItem`, sin enlace al original, así
  que editarlo o borrarlo no cambia lo publicado. El slug es único por `kind`
  (`ROUTINE` o `PROGRAM`); `PublicationLike` y `PublicationCopy` llevan un
  registro por usuario. Borrar la cuenta borra sus publicaciones. Copiar tu
  propia publicación no se registra en `PublicationCopy`, así que no suma.
- **`BodyMeasurement`** es una medida corporal opcional: una por usuario y
  fecha, con peso, % de grasa y altura opcionales. Un `CHECK` en la base exige
  al menos uno. `User.birthDate` es un valor único; la edad se calcula.
- **`Exercise`** lleva `slug`, músculos principales y secundarios y `mechanic`
  (compuesto o aislado). Sus nombres viven en **`ExerciseName`**, uno por idioma
  (`en`, `es`), con un `searchName` sin tildes ni mayúsculas para el buscador.
  Los oficiales no tienen `createdById`; los que crea un usuario sí. Cómo se
  mide un ejercicio vive en el bloque de la rutina, no en el ejercicio.
- **`User.newsOpened` / `newsSeen`** guardan qué novedades de la app abrió o vio
  cada usuario.

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
pnpm ni store dentro. Al arrancar ejecuta `prisma migrate deploy`, luego el seed
de ejercicios oficiales (`dist/scripts/seed`; si falla, la API arranca igual) y
por último `node dist/main`. La orquestación con
la web y la base vive en [`apps/docker/`](../docker/README.md).
