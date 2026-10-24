# Benchmark de la pantalla de entrenar

Mide las dos consultas que corren cada vez que se abre el formulario de una
serie: la última serie (`GET /workouts/recommendation`) y los días entrenados
(`GET /workouts/days`). Solo contra dev.

## Datos

`pnpm run seed:bench` llena la base de dev con 100 usuarios de prueba
(`@gym-tracker.test`) y 109 000 series repartidas en dos años:

- `bench@gym-tracker.test` (contraseña `bench-password`): 10 000 series, 2 000
  de ellas en press de banca con barra. Unos cinco años de un usuario constante.
- 99 usuarios más con 1 000 series cada uno, para que la tabla pese como con un
  centenar de usuarios activos.

Es repetible: cada corrida borra los usuarios de prueba anteriores y los vuelve a
crear. `pnpm run seed:bench -- --clean` solo los borra. Se niega a correr si
`DATABASE_URL` no apunta a `localhost`.

## Correrlo

Con la API de dev arriba (`docker compose up -d --build api` en
`apps/docker/dev`), desde `apps/api`:

```bash
pnpm run seed:bench
```

El seed imprime el `EXERCISE_ID` del ejercicio medido. k6 corre en un
contenedor dentro de la red de dev, sin instalar nada:

```bash
docker run --rm -i --network gym-tracker-dev_gym-tracker-dev-network -e EXERCISE_ID=<id> grafana/k6:1.3.0 run --quiet - < bench/form.k6.js
```

Por defecto son 10 usuarios virtuales durante 30 s, cada uno pidiendo las dos
rutas sin pausa: mide la capacidad de la API. Con `--vus 1` después de `run`
mide lo que tarda una petición sola, sin cola. Con `docker stats` en otra
terminal se ve quién gasta el CPU.

## Resultados

Medido en la PC de desarrollo con Docker Desktop: los números absolutos no son
los del servidor de prod; sirven para comparar un cambio contra otro. Entre dos
corridas iguales los números varían un 5-7%, así que una diferencia menor al
10% no prueba nada.

| Versión                | Usuarios | `recommendation` p95 | `days` p95 | Peticiones/s |
| ---------------------- | -------- | -------------------- | ---------- | ------------ |
| Antes (TD-107, TD-108) | 1        | 9 ms                 | 23 ms      | 68           |
| Antes (TD-107, TD-108) | 10       | 139-148 ms           | 214-228 ms | 74-79        |

- **La API se satura en unas 75-80 peticiones/s.** De 1 a 10 usuarios el total
  casi no sube y la latencia se multiplica por 15: el resto es cola.
- **El cuello de botella es la API, no la base.** Con 10 usuarios la API usa
  133% de CPU y Postgres 42%. `EXPLAIN ANALYZE` de la última serie tarda 3.8
  ms: Postgres ya filtra por `userId` con el índice único `(userId, clientId)`
  y no recorre la tabla entera. El costo está en que la API convierte las 2 013
  series del ejercicio para usar una sola.
