# Benchmark de las series

Mide dos consultas que crecen con las series del usuario: la última serie
(`GET /workouts/recommendation`), que corre cada vez que se abre el formulario
de una serie, y los días entrenados (`GET /workouts/days`), que corre al entrar
al historial. El benchmark las pide por igual, así que `days` pesa mucho más
que en el uso real. Solo contra dev.

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
| Última serie (TD-107)  | 1        | 3.8 ms               | 23 ms      | 81           |
| Última serie (TD-107)  | 10       | 110 ms               | 184-186 ms | 101          |
| Índices (TD-108)       | 1        | 2.6 ms               | 22 ms      | 88           |
| Índices (TD-108)       | 10       | 111-113 ms           | 186 ms     | 102          |
| Días en SQL (TD-131)   | 1        | 2.1 ms               | 11 ms      | 174          |
| Días en SQL (TD-131)   | 10       | 9.8 ms               | 24 ms      | 718-720      |

Tiempo de Postgres solo (`EXPLAIN ANALYZE`, usuario `bench`):

| Consulta                         | Sin índices | Con índices |
| -------------------------------- | ----------- | ----------- |
| Última serie (`LIMIT 1`)         | 1.37 ms     | 0.05 ms     |
| Días (`createdAt` del usuario)   | 2.08 ms     | 1.16 ms     |
| Progreso (`LIMIT 300` del ejer.) | 1.09 ms     | 0.66 ms     |

Con TD-131 la consulta de días agrupa en Postgres (`GROUP BY` sobre la fecha
local): tarda 7.6 ms, más que leer las fechas, pero devuelve 731 filas en vez de
10 000 y la API ya no las convierte.

- **La API se satura en unas 75-80 peticiones/s.** De 1 a 10 usuarios el total
  casi no sube y la latencia se multiplica por 15: el resto es cola.
- **El cuello de botella es la API, no la base.** Con 10 usuarios la API usa
  133% de CPU y Postgres 42%. `EXPLAIN ANALYZE` de la última serie tarda 3.8
  ms: Postgres ya filtra por `userId` con el índice único `(userId, clientId)`
  y no recorre la tabla entera. El costo está en que la API convierte las 2 013
  series del ejercicio para usar una sola.
- **TD-107 lo confirma.** Traer solo la última serie baja `recommendation` de 9
  a 3.8 ms y sube la capacidad un 30%, porque le quita trabajo justo a la API.
  Ahora `days` es casi todo el tiempo de cada vuelta (TD-131).
- **TD-108 acelera la base, no la capacidad.** Con el índice, la última serie
  lee una fila (recorre el índice hacia atrás) en vez de 2 013, y los días se
  leen del índice sin ordenar. Con 1 usuario `recommendation` baja de 3.8 a 2.6
  ms; con 10 la capacidad no cambia, porque el límite sigue siendo el CPU de la
  API. El índice importa cuando la tabla deje de caber en memoria.
- **TD-131 multiplica la capacidad por 7.** Con los días agrupados en SQL la API
  pasa de ~100 a ~720 peticiones/s y `days` baja de 186 a 24 ms con 10
  usuarios. El trabajo pasó a Postgres, que lo reparte entre varios núcleos
  (316% de CPU); la API, con un solo hilo, vuelve a estar cerca de su techo
  (115%), ahora con 7 veces más peticiones.
