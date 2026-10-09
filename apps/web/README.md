# Gym Tracker — Web

Interfaz de Gym Tracker. Next.js (App Router) pensado para el celular en
vertical y una sola mano. Habla con la [API](../api/README.md) a través de un
proxy en el propio servidor de Next.

## Stack

| Pieza | Versión |
|---|---|
| Runtime | Node.js 22 |
| Framework | Next.js 16 (App Router, salida `standalone`) + React 19 |
| UI | Tailwind CSS 4 · shadcn/ui sobre Radix · iconos `lucide-react` |
| Interacción | `@dnd-kit` (reordenar ejercicios) · `sonner` (toasts) |
| Auth con Google | `@react-oauth/google` |
| Gestor de paquetes | pnpm (pineado en `package.json`, vía corepack) |

## Puesta en marcha

```bash
corepack enable
pnpm install
cp .env.example .env.local   # opcional si la API está en localhost:4000
pnpm dev                     # http://localhost:3000
```

Necesita la API corriendo (por defecto en `http://localhost:4000`).

## Variables de entorno

| Variable | Cuándo se lee | Para qué |
|---|---|---|
| `API_INTERNAL_URL` | En el build (`next.config.ts`) | Destino del proxy `/api/*`. Por defecto `http://localhost:4000`. No llega al navegador |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | En el build | Se incrusta en el bundle para el botón de Google. Vacía = sin login con Google |

Las dos se fijan al compilar: cambiarlas exige un build nuevo. En Docker llegan
como build args.

## Comandos

```bash
pnpm dev      # desarrollo
pnpm build    # build de producción (standalone)
pnpm start    # sirve el build
pnpm lint     # ESLint
pnpm format   # Prettier
```

## Cómo habla con la API

- El navegador **solo llama a su propio origen**: `lib/api.ts` pide a `/api/...`
  y `next.config.ts` reescribe esas rutas hacia `API_INTERNAL_URL`. La URL real
  de la API nunca aparece en el cliente y no hay CORS que configurar.
- La sesión es la cookie httpOnly `token` que pone la API; viaja sola en cada
  petición (`credentials: "include"`).
- Un `401` en una llamada de datos manda a `/login`. `AuthProvider`
  (`lib/auth-context.tsx`) consulta `/auth/me` al montar y protege todas las
  rutas salvo `/login` y `/register`.
- Las escrituras que fallan muestran un toast con "Reintentar"
  (`lib/notify.ts`).

## Rutas

| Ruta | Pantalla |
|---|---|
| `/` | **Hoy**: hub para empezar o continuar la rutina, día libre y programa activo |
| `/train` | Entrenamiento guiado: serie a serie, mapa de la sesión, saltar, reemplazar, añadir |
| `/log` | Día libre: registrar una serie suelta |
| `/success` | Confirmación tras registrar en día libre |
| `/routines`, `/routines/new`, `/routines/[id]` | Listar, crear y editar rutinas |
| `/programs`, `/programs/new`, `/programs/[id]` | Listar, crear y editar programas |
| `/explore`, `/explore/[id]` | Programas de otros usuarios y copiarlos |
| `/history` | Historial por día: repetir, editar y borrar series |
| `/perfil` | Cuenta, fecha de nacimiento, medidas corporales y cierre de sesión |
| `/login`, `/register` | Acceso con email o Google |

La navegación principal es la barra inferior de cuatro pestañas
(`components/layout/BottomNav.tsx`): Hoy · Rutinas · Historial · Perfil.

## Arquitectura

```
src/
├── app/            # rutas (App Router), layout raíz, manifest e iconos
├── components/
│   ├── ui/         # primitivos de shadcn/ui
│   ├── layout/     # PageShell, AppHeader, BottomNav
│   ├── train/      # flujo de entrenar: SetForm, SetDoneScreen, SessionMap…
│   ├── routines/   # editor de rutinas con drag & drop
│   ├── programs/   # editor de programas y detalle de explorar
│   ├── history/    # tarjetas y diálogos del historial
│   ├── exercises/  # buscador y alta de ejercicios
│   ├── equipment/  # selector de equipo
│   └── auth/       # botón de Google, input de contraseña
├── hooks/          # estado y datos por dominio (useGuidedSession, useWorkoutForm…)
└── lib/            # cliente HTTP, auth, rutas, tipos y lógica pura
```

- **Sin librería de estado global.** Cada dominio tiene su hook en `hooks/`, y
  `lib/api.ts` es el único punto de contacto con la API.
- **Rutas centralizadas** en `lib/routes.ts`, tanto las de la app como las de la
  API.
- **Lógica pura en `lib/`**: `blocks.ts` aplana los bloques de una rutina en
  series planificadas, `units.ts` convierte kg/lb (todo se guarda en kg),
  `setDisplay.ts` formatea series.
- **Estado local del navegador** (`localStorage`):
  - `lib/activeSession.ts`: la sesión guiada en curso; caduca al cambiar de día.
  - `lib/equipmentMemory.ts`: el último equipo usado por ejercicio.
- **`components/ui/` no se edita a mano**: se ajusta con Tailwind desde el
  componente padre o envolviendo el primitivo.

## Experiencia de app instalada

`app/manifest.ts` declara `display: standalone` y orientación vertical, así que
al añadirla a la pantalla de inicio abre a pantalla completa.
`hooks/useVisualViewport.ts` ajusta el alto al viewport visible de iOS
(teclado y barras).

## Docker

`Dockerfile` multi-stage sobre `node:22-alpine` que usa la salida `standalone`
de Next y corre con un usuario sin privilegios. Recibe `API_INTERNAL_URL` y
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` como build args. La orquestación vive en
[`apps/docker/`](../docker/README.md).
