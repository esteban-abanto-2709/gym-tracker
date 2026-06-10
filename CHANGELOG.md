# Changelog

Registro de cambios relevantes de Gym Tracker.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [commits convencionales](https://www.conventionalcommits.org/).

## [Sin publicar]

### Arreglado

- **Build Docker de la web roto tras migración a pnpm.** El `apps/web/Dockerfile`
  todavía copiaba `package-lock.json` y ejecutaba `npm ci`, pero ese lockfile se
  eliminó al migrar el frontend a pnpm, por lo que la imagen web no compilaba y
  `docker compose up --build` no levantaba el frontend. El stage de build ahora
  habilita pnpm vía `corepack enable` (usa la versión fijada en `package.json`) e
  instala con `pnpm install --frozen-lockfile`. (TD-001)
