# Docker

Orquestación del stack con Docker Compose. Hay **dos entornos**, cada uno en su
carpeta y con **su propia base de datos**:

| Carpeta | Para qué | Puertos publicados al host | Volumen de datos |
|---------|----------|----------------------------|------------------|
| `prod/` | la app que usas a diario | ninguno (solo sale por el tunnel) | `gym-tracker_postgres_data` |
| `dev/` | probar cambios antes de pasarlos a prod | `3000` web · `4000` api · `5432` postgres | `gym-tracker-dev_postgres_data_dev` |

Los dos levantan lo mismo (`postgres` + `api` + `web` + `cloudflared`) desde el
mismo código (`apps/api` y `apps/web`). Por qué existe un entorno de prod dentro
del repositorio: ver [Autohospedado](../../README.md#autohospedado-la-app-es-tuya)
en el README principal.

```
apps/docker/
├── .env.example      # plantilla ÚNICA: se copia a prod/.env y a dev/.env
├── .gitignore        # ignora los .env de las dos carpetas y backups/
├── README.md
├── backups/          # dumps de prod (ignorada por git)
├── scripts/
│   ├── backup-prod.cmd
│   └── restore.cmd
├── prod/
│   └── docker-compose.yml
└── dev/
    └── docker-compose.yml
```

> Cada `docker compose` se ejecuta **desde su carpeta** (`apps/docker/prod/` o
> `apps/docker/dev/`): ahí es donde lee su `.env`.

## Primer arranque

**`.env.example` sirve para los dos entornos.** Prod y dev usan exactamente las
mismas variables, así que hay una sola plantilla en la raíz de `apps/docker/`.
Cópiala a la carpeta de cada entorno que vayas a usar y rellena los valores:

```bash
# desde apps/docker/
cp .env.example prod/.env
cp .env.example dev/.env
```

Variables:

| Variable | Para qué |
|----------|----------|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | credenciales de Postgres |
| `DATABASE_URL` / `DIRECT_URL` | conexión de la API a Postgres (ambas a la red interna) |
| `FRONTEND_URL` | origen permitido por CORS en la API |
| `JWT_SECRET` | secreto con el que se firman las sesiones |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth (API y botón de la web) |
| `TUNNEL_TOKEN` | token del Cloudflare Tunnel (vacío si usas quick tunnel) |

Qué debe diferir entre `prod/.env` y `dev/.env`:

- **`JWT_SECRET`: distinto en cada uno.** Así una sesión de un entorno no sirve en
  el otro. Al cambiar de entorno tendrás que iniciar sesión; es lo esperado.
- **`POSTGRES_*`: da igual si coinciden, pero no las cambies después.** Postgres
  solo las aplica la primera vez que crea el volumen; si luego las cambias en el
  `.env`, la API ya no podrá conectarse a esa base.
- **`TUNNEL_TOKEN`, `FRONTEND_URL` y `GOOGLE_CLIENT_ID`: iguales** si los dos
  entornos salen por el mismo tunnel (ver [Cambiar entre prod y dev](#cambiar-entre-prod-y-dev)).

## Prod

```bash
# desde apps/docker/prod/
docker compose up -d                 # levanta con las imágenes ya construidas
docker compose up -d --build         # reconstruye con el código actual (ver abajo)
docker compose logs -f cloudflared   # ver la URL pública del tunnel
docker compose down                  # detener (conserva los datos)
docker compose down -v               # detener y BORRAR el volumen de datos
```

> **En prod, `--build` solo cuando decides publicar un cambio.** Prod construye
> desde tu carpeta de trabajo (`apps/api`, `apps/web`): si reconstruyes con un
> cambio a medias, eso es lo que queda en prod. Sin `--build`, `up` reutiliza la
> última imagen construida, la que ya probaste. Las imágenes de dev llevan otro
> prefijo (`gym-tracker-dev-*`), así que construir dev nunca pisa las de prod.

Servicios:

| Servicio | Acceso |
|----------|--------|
| `web` | **solo** a través del tunnel (no publica puerto en el host) |
| `api` | privado en la red `gym-tracker-network` (`http://api:4000`) |
| `postgres` | privado en la red (`postgres:5432`, **sin** publicar al host) |
| `cloudflared` | sin puerto; alcanza a `web` por la red interna |

> Por seguridad, prod no publica ningún puerto al host: `web` solo se alcanza por
> el Cloudflare Tunnel y `postgres` solo desde dentro de la red.

## Dev

Dev tiene dos usos. Los dos comparten la misma base de datos de dev.

### Stack completo (probar en el celular)

```bash
# desde apps/docker/dev/
docker compose up -d --build   # postgres + api + web + cloudflared
docker compose down            # detener (conserva los datos)
docker compose down -v         # detener y resetear la BD de dev
```

- Todo queda abierto en el host: web en `http://localhost:3000`, API en
  `http://localhost:4000`, Postgres en `localhost:5432`.
- La API aplica las migraciones pendientes al arrancar, igual que en prod.
- Sale a internet por el mismo tunnel que prod: ver [Cambiar entre prod y dev](#cambiar-entre-prod-y-dev).

### Solo la base (desarrollo nativo con hot reload)

```bash
# desde apps/docker/dev/
docker compose up -d postgres
```

Luego, en tu máquina, apunta `apps/api/.env` a `localhost:5432` y corre la API y la web nativas:

```bash
# apps/api/
pnpm exec prisma migrate dev
pnpm run start:dev

# apps/web/
pnpm dev
```

> El stack completo de dev ocupa los puertos `3000` y `4000`: no lo tengas
> levantado mientras corres la API y la web nativas. Es uno u otro.

> Prod no publica el `5432`; dev sí. Es a propósito: al desarrollar siempre
> apuntas a `localhost:5432`, así que si levantaste prod en vez de dev y corres
> `prisma migrate dev` o la API local, la conexión **falla**: la señal de que
> levantaste el Docker equivocado.

## Cambiar entre prod y dev

Pensado para una sola máquina: **prod y dev comparten el mismo tunnel** (mismo
`TUNNEL_TOKEN`, mismo dominio) y **nunca corren a la vez**. Trabajas en dev y,
cuando toca usar la app de verdad, bajas dev y subes prod:

```bash
# a trabajar: bajar prod, subir dev
cd apps/docker/prod && docker compose down
cd ../dev && docker compose up -d --build

# al gimnasio: bajar dev, subir prod (sin --build)
cd apps/docker/dev && docker compose down
cd ../prod && docker compose up -d
```

- **Por qué nunca a la vez:** con dos conectores usando el mismo token, Cloudflare
  reparte el tráfico entre ambos al azar; a veces caerías en dev y a veces en prod.
  Para evitarlo, el servicio `cloudflared` de los dos composes usa el mismo
  `container_name: gym-tracker-tunnel`. Si olvidas bajar uno, Docker se niega a
  levantar el otro (`name ... is already in use`).
- **Las bases sí pueden correr juntas** (`docker compose up -d postgres` en cada
  carpeta): tienen contenedor y volumen distintos. Así se lleva un backup de prod
  a dev (ver [Restaurar un backup](#restaurar-un-backup-llenar-dev-o-prod)).
- Como el dominio es el mismo, Google login funciona en los dos sin tocar la
  consola de Google.
- Si prefieres tener los dos arriba a la vez, crea un segundo tunnel (otro token y
  otro subdominio) para dev, cambia el `container_name` de su `cloudflared` y
  agrega ese subdominio a los orígenes autorizados de tu Client ID de Google.

### Cloudflare Tunnel (opcional)

El tunnel **solo hace falta si quieres alcanzar tu instancia desde fuera de tu red
local** (por ejemplo, desde el gimnasio). Sin él la app funciona igual: levantas el
stack y la usas desde la misma red. Cada quien expone —o no— su propia instancia;
el repositorio no trae ningún dominio ni token configurado.

Hay dos modos, y los dos composes traen el segundo activo:

| Modo | `command` | `TUNNEL_TOKEN` | URL |
|------|-----------|----------------|-----|
| **Quick tunnel** | `tunnel --no-autoupdate --url http://web:3000` | no hace falta | aleatoria de `trycloudflare.com`, **cambia en cada reinicio** |
| **Named tunnel** | `tunnel --no-autoupdate run` | obligatorio | fija, sobre tu propio dominio |

El **quick tunnel** es el camino de cero configuración: no pide cuenta ni dominio,
y la URL aparece en los logs (`docker compose logs -f cloudflared`). Sirve para
probar. En `prod/docker-compose.yml` su línea está comentada justo debajo de la activa.

El **named tunnel** es el que conviene si vas a usar la app a diario: necesitas una
cuenta de Cloudflare y un dominio delegado a ella. Creas el tunnel desde el panel
de Cloudflare (Zero Trust → Networks → Tunnels), lo apuntas al servicio `web` en
el puerto `3000`, y pegas el token que te da en `TUNNEL_TOKEN` dentro de tu `.env`.
Como en los dos composes el servicio se llama `web`, el mismo tunnel sirve para prod
y para dev.

> Los `.env` están en `.gitignore`: tu token y tu dominio **nunca** salen de tu
> máquina. Si no quieres usar tunnel, deja `TUNNEL_TOKEN` vacío y omite el
> servicio con `docker compose up -d postgres api web`.

## Backups de prod

Genera un dump de **solo datos** (tablas `User`, `Exercise`, `Routine`,
`RoutineItem` y `Workout`) de la BD de prod
en un solo comando. El archivo cae en `apps/docker/backups/` (ignorada por git)
con nombre `gym-prod_YYYY-MM-DD_HHmmss.sql`.

```cmd
scripts\backup-prod.cmd
```

Es un script batch puro de Windows (`.cmd`, solo cmd.exe — no corre en Linux/mac).
Lee las credenciales de `prod/.env`, corre `pg_dump` dentro del contenedor
`gym-tracker-sql` (misma versión que el servidor, sin líos de compatibilidad) y
copia el archivo al host. Se puede llamar desde cualquier carpeta. Para guardar en
otra carpeta, pásala como primer argumento:

```cmd
scripts\backup-prod.cmd "D:\mis-backups"
```

### Requisitos para que el comando funcione

- **Docker corriendo** y el contenedor `gym-tracker-sql` **levantado** (el `pg_dump`
  se ejecuta dentro de ese contenedor, no en tu máquina). Si no está, el script
  se detiene con un aviso. Basta con la base: `docker compose up -d postgres` en `prod/`.
- **`prod/.env` presente** con `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`
  (de ahí saca las credenciales).
- Es un `.cmd` (cmd.exe). No necesitas `pg_dump` en el host: vive dentro del
  contenedor. Tampoco depende de PowerShell.

### ¿Y si cambia el schema de la base de datos?

El script dumpea explícitamente cinco tablas: `User`, `Exercise`, `Routine`,
`RoutineItem` y `Workout` (los `-t` de `backup-prod.cmd`). Según el cambio:

| Cambio en el schema | ¿Hay que tocar el script? |
|---------------------|---------------------------|
| Agregar/quitar columnas en cualquiera de las cinco | **No** — `--data-only` toma las columnas que existan al momento del dump, y cada `COPY` lleva su lista de columnas explícita. Un backup viejo carga en un esquema que **agregó** columnas (las que no menciona toman su valor por defecto), pero **no** en uno que **quitó** columnas que el backup sí trae. |
| Agregar una tabla nueva | **Sí** — añade otra línea `-t 'public."NuevaTabla"'` o quedará fuera del backup. |
| Renombrar una tabla | **Sí** — actualiza el patrón `-t` correspondiente. |

### Backups anteriores a los bloques de rutina (RM-031)

RM-031 quitó columnas en dos momentos, así que un backup de antes no carga
directo en el esquema actual:

| Backup | Trae columnas que ya no existen |
|--------|---------------------------------|
| Anterior a `20260916180000_drop_routine_item_targets` (p. ej. `gym-prod_2026-09-16_161847.sql`) | `RoutineItem.targetSets`/`targetReps`/`targetDurationSec`/`isApproximation` y `Exercise.isTimed` |
| Anterior a `20260918120000_drop_exercise_is_timed` (p. ej. `gym-prod_2026-09-16_165959.sql`) | `Exercise.isTimed` (sus rutinas tienen bloques `legacy`) |

Para usarlo, sobre una BD con todas las migraciones aplicadas (los archivos
están en `apps/api/prisma/migrations/`):

1. Vuelve a crear temporalmente las columnas que trae el backup:
   ```sql
   ALTER TABLE "Exercise" ADD COLUMN "isTimed" BOOLEAN NOT NULL DEFAULT false;
   -- solo si el backup es anterior a 20260916180000:
   ALTER TABLE "RoutineItem" ADD COLUMN "targetSets" INTEGER,
     ADD COLUMN "targetReps" INTEGER, ADD COLUMN "targetDurationSec" INTEGER,
     ADD COLUMN "isApproximation" BOOLEAN NOT NULL DEFAULT false;
   ```
2. Corre `restore.cmd` con ese backup.
3. Solo si es anterior a `20260916180000`: ejecuta el `UPDATE` de
   `20260916120000_add_routine_item_blocks/migration.sql` y luego
   `20260916180000_drop_routine_item_targets/migration.sql`.
4. Ejecuta `20260917180000_migrate_legacy_blocks/migration.sql` (bloques `legacy`
   a los tipos nuevos, peso corporal sin peso y calentamientos viejos).
5. Ejecuta `20260918120000_drop_exercise_is_timed/migration.sql`.

> El backup es **solo datos**, no incluye el schema. Por eso al restaurar, la BD
> destino debe tener las tablas ya creadas por las migraciones de Prisma.

## Restaurar un backup (llenar dev o prod)

Carga un backup en la BD que elijas. **Reemplaza** los datos: hace `TRUNCATE`
de `Workout`, `RoutineItem`, `Routine`, `Exercise` y `User` (con `CASCADE`) y
luego carga el backup. Ojo: es marcha atrás **total**, no quirúrgica — también
se van los usuarios y las rutinas, no solo los sets.

```cmd
scripts\restore.cmd dev          :: llena dev con el backup mas reciente de backups/
scripts\restore.cmd prod         :: idem, sobre prod
scripts\restore.cmd dev "D:\mis-backups\gym-prod_2026-06-14_120000.sql"   :: archivo concreto
```

- Mapea el destino al contenedor y a su `.env`: `dev` → `gym-tracker-dev-sql` con
  `dev/.env`, `prod` → `gym-tracker-sql` con `prod/.env`.
- Si no pasas archivo, toma el `gym-prod_*.sql` más reciente de `apps/docker/backups/`.
- **Pide confirmación** (hay que escribir `si`) porque borra los datos actuales.
- El contenedor destino debe estar **corriendo** y sus tablas deben **existir ya**
  (creadas por las migraciones de Prisma). Si la BD está vacía, levanta la API de
  ese entorno una vez (aplica `migrate deploy` al arrancar) o corre
  `prisma migrate dev` contra dev, y reintenta.

> El restore corre por `docker exec` (no depende de puertos publicados), así que
> funciona sobre el contenedor que tengas levantado, sea dev o prod.

### Llevar los datos reales de prod a dev

Para probar en dev con tus datos de verdad sin arriesgarlos, las dos bases pueden
estar arriba a la vez (el tunnel no hace falta):

```cmd
:: desde apps/docker/
cd prod && docker compose up -d postgres && cd ..
cd dev && docker compose up -d postgres && cd ..
scripts\backup-prod.cmd
scripts\restore.cmd dev
```

Antes, confirma que las dos bases tienen las mismas migraciones aplicadas: si dev
va atrasada o adelantada respecto a prod, el restore puede fallar.

## Resetear la base de datos

El `-v` elimina el volumen y con él **todos los datos**. Se ejecuta en la carpeta
del entorno que quieras resetear:

```bash
# desde apps/docker/prod/  (BORRA tus datos reales)
docker compose down -v

# desde apps/docker/dev/
docker compose down -v
```
