# Gym Tracker — Novedades

> Cómo se registran las novedades: las tarjetas que se abren con el icono de
> estrellas en Hoy. Le cuentan al usuario lo que puede hacer en la app, sin un
> tutorial que interrumpa.

## Dónde viven

| Qué | Dónde |
|---|---|
| Cuáles novedades existen | [`apps/web/src/lib/news.ts`](../apps/web/src/lib/news.ts), la lista `NEWS` |
| Qué abrió y qué vio cada usuario | `User.newsOpened` y `User.newsSeen` en la base: solo ids |

La base no sabe qué novedades hay. Registrar o quitar una novedad es editar
`news.ts`; nunca lleva migración.

## Qué entra

Solo lo que le aporta al usuario, cumpliendo las tres:

1. **Le sirve al entrenar.** Lo técnico (base de datos, deploys, backups) y los
   arreglos no entran.
2. **No es obvio.** Si se ve al usarlo (registrar una serie, el selector kg/lb),
   no necesita tarjeta.
3. **Funciona bien hoy.** No se anuncia algo con un bug conocido que decepcione.

Las decide el dueño del proyecto: nunca se agrega una novedad sin que lo pida.

## Cada novedad

```ts
{
  id: "body-measurements",
  Icon: Ruler,
  title: "Registra tus medidas",
  body: "Anota altura, peso y % de grasa con su fecha para ver cómo cambias. ...",
  href: "/perfil#medidas",
}
```

- **`id`:** en inglés y kebab-case. Es lo que se guarda por usuario: **no se
  cambia ni se reutiliza**.
- **`Icon`:** de `lucide-react`.
- **`title`:** una frase corta que se entienda sola, en lo posible con un verbo
  ("Registra tus medidas", "Copia el programa de otro").
- **`body`:** dos o tres líneas: qué hace y por qué le sirve.
- **`href`:** opcional. La pantalla a la que lleva "Ir"; sin lugar fijo (algo que
  vive dentro del entrenamiento), se omite. Para abrir un panel o bajar a una
  sección se usa un parámetro o un ancla que esa pantalla ya entienda
  (`/history?export=1`, `/perfil#medidas`).

**El orden del archivo es el orden en pantalla.** Una novedad nueva va arriba.
Las no vistas siempre salen antes que las vistas.

## Operaciones

Solo hay dos: **agregar** y **quitar**.

- **Funcionalidad nueva:** se agrega una tarjeta con un id nuevo, arriba.
- **Bug en una novedad:** se quita la tarjeta mientras se arregla. Al volver,
  vuelve con **el mismo id**: quien ya la vio no la ve de nuevo como nueva.
- **Mejora de una funcionalidad ya anunciada:** se quita la tarjeta vieja y se
  agrega una nueva con id nuevo (`explore-programs` → `explore-programs-2`),
  contando lo que mejoró. A todos les vuelve a salir el punto.
- **Corregir el texto** sin que cambie la funcionalidad (una falta, una palabra):
  se edita en su lugar con el mismo id; no avisa a nadie.

Una novedad nueva va en el mismo commit que la funcionalidad que anuncia.
