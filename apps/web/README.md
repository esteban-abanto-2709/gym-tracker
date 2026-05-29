# Gym Tracker — Web

Frontend del proyecto Gym Tracker. Construido con Next.js 16 (App Router), React 19 y shadcn/ui. Diseñado para ser rápido de usar en medio de un entrenamiento.

## Stack

- **Framework:** Next.js 16 + React 19
- **UI:** shadcn/ui + Radix UI + Tailwind CSS 4
- **Iconos:** Lucide React
- **Package manager:** pnpm

## Requisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- API corriendo en `http://localhost:4000` (o configurar `NEXT_PUBLIC_API_URL`)

## Instalación

```bash
pnpm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz de `apps/web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Comandos

```bash
pnpm dev        # servidor de desarrollo (http://localhost:3000)
pnpm build      # build de producción
pnpm start      # inicia el build de producción
pnpm lint       # ESLint
pnpm format     # Prettier
```

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Registrar un workout: selecciona ejercicio, ingresa peso, reps y valoración |
| `/history` | Historial de workouts agrupado por fecha, con edición y borrado |
| `/success` | Confirmación tras registrar un workout |

## Arquitectura

```
src/
├── app/                    # Páginas (Next.js App Router)
│   ├── page.tsx            # Home — formulario de registro
│   ├── history/page.tsx    # Historial
│   └── layout.tsx          # Layout raíz con fuente y metadata
├── components/
│   ├── exercises/          # ExerciseCombobox, CreateExerciseModal
│   ├── history/            # WorkoutCard, EditWorkoutDialog, DeleteWorkoutDialog
│   ├── layout/             # PageShell, AppHeader
│   └── ui/                 # Primitivos de shadcn/ui (no modificar directamente)
├── hooks/
│   ├── useExercises.ts     # Carga y gestión de la lista de ejercicios
│   ├── useWorkoutForm.ts   # Estado del formulario de registro
│   └── useWorkoutHistory.ts # Estado del historial y filtro por fecha
└── lib/
    ├── api.ts              # ApiClient singleton (get/post/patch/delete)
    ├── types.ts            # Tipos compartidos: Exercise, Workout, Equipment
    └── routes.ts           # Constantes de rutas de la API
```

El estado de la app se maneja con custom hooks — no hay ninguna librería de estado global. Toda comunicación con la API pasa por el `ApiClient` en `lib/api.ts`.

Los componentes de `components/ui/` son primitivos de shadcn/ui. Si necesitas modificar su estilo, hazlo con Tailwind desde el componente padre o extendiendo el componente, no editando los archivos de `ui/` directamente.

## Docker

El `Dockerfile` usa el output standalone de Next.js para minimizar el tamaño de imagen. Para correr junto al resto del stack, usa Docker Compose desde `apps/docker/`.

## Despliegue

Desplegado en **Vercel**. La variable `NEXT_PUBLIC_API_URL` debe apuntar a la URL pública de la API en Render.
