# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## [CÓDIGO] Título (YYYY-MM-DD HH:MM)
Resumen en ≤2 líneas de lo que se hizo.
```

---

## [TD-006] Feedback de red en escrituras del frontend (2026-07-23 13:16)
`sonner` + helper `notifyError(msg, retry)`: los 5 `catch` de escritura (registro libre, editar/borrar historial, registrar serie guiada, guardar rutina) ahora muestran un toast de error con botón "Reintentar" en vez de solo `console.error`. `<Toaster>` dark/rojo montado en el layout.

## [RM-024] Login/registro con Google (2026-07-23 10:27)
Backend: `passwordHash` opcional + `googleId` en `User`, endpoint público `POST /auth/google` que verifica el ID token con `google-auth-library` y reusa la cookie JWT (crea la cuenta o la vincula por email). Web: `@react-oauth/google` (`GoogleOAuthProvider` en el layout + botón "Continuar con Google" en login y registro).

## [RM-023] Dominio propio + named Cloudflare tunnel (2026-07-23 10:27)
`treno.rocks` (comprado en name.com, DNS delegado a Cloudflare) y named tunnel en lugar del quick tunnel: la URL pública queda fija con HTTPS y ya no cambia en cada reinicio. Cierra el pendiente de RM-012.

## [RM-022] Cuentas de usuario (auth + aislamiento) (2026-07-21 14:18)
Modelo `User` (email, username, slug) + `userId` en `Workout`/`Routine` (datos existentes migrados a la cuenta owner); auth JWT en cookie httpOnly (register/login/logout/me) y aislamiento por usuario en toda la API. Web con `AuthProvider`, guard de rutas y páginas login/registro; ejercicios siguen globales. Promovido desde WL-001 (ya sin Supabase).

## [TD-005] API con autenticación (guard JWT global) (2026-07-21 13:11)
Módulo `auth` (register/login/logout/me) con hash bcrypt, JWT en cookie httpOnly y slug único desde el username; `JwtAuthGuard` como `APP_GUARD` deja todo endpoint protegido salvo los `@Public()` (register/login/healthz). Cierra el acceso anónimo de lectura/escritura vía el tunnel.

## [TD-004] API con validación de entrada (2026-07-21 12:43)
`ValidationPipe` global (`whitelist` + `forbidNonWhitelisted` + `transform`) y DTOs de exercises/workouts/routines convertidos a clases con decoradores de `class-validator`. Payloads inválidos (reps no entero, peso negativo, UUID malo, campos extra) ahora dan 400 en vez de 500. Prerrequisito del multiusuario.

## [TD-011] Peso en lb se guardaba con decimales largos (2026-07-14 07:34)
Nuevo helper `toKg` en `units.ts` que redondea la conversión lb→kg a 1 decimal antes de persistir; usado por `useWorkoutForm` y `SetLogger`. Las 17 filas existentes con decimales largos se redondearon con un UPDATE directo.

## [RM-019] Recomendación de peso: ¿subir o mantener? (2026-06-28 15:23)
Endpoint `GET /workouts/recommendation` que, segmentando por `isApproximation`, compara la mejor serie del día más reciente vs la sesión previa al mismo peso: si la supera por ≥3 reps sugiere `peso+2.5kg`. Se muestra como texto (no auto-aplica valores) en `SetLogger` y `SetDoneScreen`; reemplaza al endpoint `last`.

## [RM-018] Marcar sets de aproximación (efectivo por defecto) (2026-06-28 10:59)
Flag booleano `isApproximation` (default `false`) en `Workout` y `RoutineItem`: lo no marcado es efectivo por ausencia. Toggle compartido en registro manual, modo guiado (pre-llenado desde la ranura de rutina), editor de rutina y edición de set; badge "≈ Aprox" en el historial. Prerrequisito de RM-019.

## [RM-017] Home como hub de inicio (2026-06-23 00:00)
El root deja de ser el form de registro y pasa a ser un hub con 3 accesos: Iniciar una rutina (→ `/routines`), Día libre (→ nueva ruta `/log`, el form de antes) y Crear rutina (→ `/routines/new`), con el `ContinueRoutineBanner` arriba si hay sesión activa. Re-apuntados a `/log` los enlaces del flujo "repetir set"/"registrar otro" (success, FAB y "Repetir" del historial).

## [RM-016] Modo guiado: flujo por pantallas (2026-06-22 14:04)
Rediseño de `/train`: se elimina la vista de lista con contadores `done/target`; ahora es una máquina de estados pantalla-a-pantalla (registrar serie → confirmación → continuar). Botón principal contextual que sigue la rutina (siguiente serie si quedan, si no siguiente ejercicio) + Otro ejercicio + Terminar. Sin auto-avance; la sesión solo termina manualmente. Confirmación centrada con mensaje "lo que sigue" (máquina/serie a preparar) y animación pop+pulse al completar. "Otro ejercicio" agrega ad-hoc a la sesión (`extras` en localStorage).

## [RM-015] Modo guiado de rutinas (ejecución) — MVP (2026-06-21 18:22)
Pantalla `/train`: eliges una rutina ("Empezar"), la app guía ejercicio a ejercicio (meta + peso de la última vez vía `GET /workouts/last`), registras series y avanza. Progreso/cursor en localStorage (retoma tras recargar la página, con la misma URL); cada serie se etiqueta con `Workout.routineId` (nullable, `onDelete: SetNull`). Banner "Continuar" en el home. Sin entidad `Session`; el registro libre sigue intacto.

## [RM-014] Crear y gestionar rutinas — CRUD (2026-06-21 17:26)
Nuevo modelo `Routine`/`RoutineItem` (Prisma) + módulo NestJS CRUD y UI `/routines` (lista, editor con drag & drop `@dnd-kit`, series/reps objetivo opcionales por ejercicio). Sin ejecución guiada ni recomendación: solo se dejan las bases de datos. Entrada desde el header de la home.

## [RM-011] Diálogo de edición usable con el teclado abierto (2026-06-15 12:18)
Hook `useVisualViewport` que sigue `window.visualViewport`; `EditWorkoutDialog` reposiciona el `DialogContent` al centro del área visible y limita su alto (scrollable) cuando aparece el teclado. En desktop conserva el centrado por defecto.

## [RM-010] Comentario editable en el diálogo de edición (2026-06-15 11:37)
El diálogo de edición de sets ahora incluye un `<textarea>` "Comentario" que precarga la opinión actual y persiste vía PATCH (backend ya soportaba `opinion`); ningún campo del diálogo usa placeholder.

## [RM-013] API migrada a pnpm 11 (2026-06-14 10:54)
`apps/api` pasa de npm a pnpm 11.6.0 (corepack, `pnpm-lock.yaml`, sin `package-lock.json`; `nodeLinker: hoisted` + `allowBuilds` para prisma en `pnpm-workspace.yaml`). Dockerfile a pnpm sobre Node 22 y `*.tsbuildinfo` excluido del contexto; build y stack Docker validados (la API levanta y responde 200).

## [RM-009] Botón "Repetir" solo icono en el historial (2026-06-14 10:55)
En `WorkoutCard` el botón "Repetir" pasa a mostrar solo el icono (`RotateCcw`), con `aria-label`/`title` "Repetir Set" para mantener accesibilidad.

## [RM-008] Compactar las cards del historial (2026-06-14 10:42)
`WorkoutCard` ahora es más densa (padding `p-3`, acciones junto a las stats) y el bloque de opinión solo se renderiza cuando existe, sin espacio reservado: un set sin comentario ocupa notablemente menos alto.

## [RM-012] Migración a self-hosted con Cloudflare Tunnel (2026-06-14 08:23)
Se retiran Render/Vercel/Supabase: el stack queda autohospedado en Docker y solo el frontend sale a internet vía Cloudflare Tunnel (quick tunnel por ahora). Añadidos `docker-compose.dev.yml` (Postgres aislado para dev) y `apps/docker/README.md`; actualizados README raíz y CLAUDE.md.

## [RM-005] Soporte kg/lb (2026-06-14 01:23)
Toggle kg/lb local en el formulario de registro: el peso se sigue guardando siempre en kg y se convierte al vuelo (1 lb = 0.45359237 kg, redondeo a 0.5). Sin tocar DB ni historial.

## [TD-003] Agrupado/filtrado de workouts por día local (2026-06-13)
Los workouts se agrupan y filtran por día en la zona local (`APP_TIMEZONE`, default `America/Lima`) en vez de UTC, así los sets nocturnos dejan de caer en el día siguiente.

## [TD-002] Web consume la API vía proxy del servidor Next (2026-06-13)
La web llama a `/api/*` (rewrite del server Next → `API_INTERNAL_URL`); se elimina `NEXT_PUBLIC_API_URL` del cliente. La API ya no publica puertos al host: solo se expone la web (`:3000`), lo único que cruza el tunnel.

## [TD-001] Arreglado el build Docker de la web (2026-06-13)
Usa pnpm (corepack + `pnpm install --frozen-lockfile`) en vez del `npm ci` con un `package-lock.json` ya eliminado.
