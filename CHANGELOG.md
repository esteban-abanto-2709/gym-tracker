# Changelog

Registro de cambios relevantes de Gym Tracker. Lo más reciente, arriba.

## Sin publicar

- (TD-002) La web consume la API vía proxy del servidor Next (`/api/*` → `API_INTERNAL_URL`); se elimina `NEXT_PUBLIC_API_URL` del cliente.
- (TD-002) Docker: la API deja de publicar puertos al host; solo se expone la web (`:3000`), que es lo único que cruza el tunnel.
- (TD-001) Arreglado el build Docker de la web: usa pnpm (corepack + `pnpm install --frozen-lockfile`) en vez del `npm ci` con un `package-lock.json` ya eliminado.
