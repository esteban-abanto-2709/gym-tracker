# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## [CÓDIGO] Título (YYYY-MM-DD HH:MM)
Resumen en ≤2 líneas de lo que se hizo.
```

---

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
