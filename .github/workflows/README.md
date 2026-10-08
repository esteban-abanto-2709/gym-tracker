# Workflows

Dos archivos, uno por responsabilidad: **CI verifica**, **CD publica**.

| Archivo | Se dispara con | Qué hace |
|---|---|---|
| `ci.yml` | cada pull request a `main`, o cuando otro workflow lo llama | lint, tests unitarios y build de `api` y `web` |
| `cd.yml` | cada push a `main` | llama a `ci.yml` y, si pasa, construye y publica las imágenes |

```
push a main ──▶ cd.yml
                 ├─ CI   (ci.yml: api + web)
                 └─ Images (solo si CI pasa)
                      ├─ api ─┐
                      └─ web ─┴─▶ ghcr.io/esteban-abanto-2709/gym-tracker-{api,web}
```

## Por qué dos archivos

En el estándar suele haber un solo `ci.yml` que hace todo. Aquí se separan porque
son cosas distintas: verificar una propuesta no es lo mismo que publicar lo que ya
está en `main`, y un pull request nunca debe publicar nada.

- **`ci.yml` no se repite en código:** declara `workflow_call`, así que `cd.yml`
  lo reutiliza como su primer job en vez de copiar sus pasos.
- **No corre dos veces por push:** `ci.yml` ya no escucha los push a `main`; ahí
  solo corre `cd.yml`, que lo llama una vez. En un pull request corre solo
  `ci.yml`.
- **Lo que se publica es exactamente lo que se verificó:** el CI de `cd.yml` prueba
  el commit que va a construir, no el del pull request (entre uno y otro pudo
  entrar otro cambio a `main`).

## Imágenes

- Se construyen en un runner **ARM64** de GitHub (`ubuntu-24.04-arm`), la misma
  arquitectura del servidor de prod: nada de emulación.
- Cada imagen lleva dos etiquetas: `latest` (lo que corre prod) y el **SHA del
  commit** (para volver a una versión concreta).
- Usan el caché de GitHub Actions (`type=gha`), separado por app.
- Los paquetes de GHCR son **públicos**: no llevan secretos. El runner construye
  desde una copia limpia del repo, donde los `.env` no existen; lo único "propio"
  es el Client ID de Google de la web, que ya es público porque viaja en el
  JavaScript del navegador.

## Configuración del repo

| Variable (Settings → Secrets and variables → Actions → Variables) | Para qué |
|---|---|
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth que se hornea en la imagen de `web` |

Las variables (no secrets) son para valores públicos; un secreto real iría en
*Secrets*.

## Concurrencia

- `cd.yml` usa el grupo `cd` sin cancelar: si llegan dos push seguidos, el segundo
  espera a que termine el primero en vez de cortarlo a la mitad.
- `ci.yml` cancela la ejecución anterior de la misma rama: en un pull request solo
  importa el último commit.
