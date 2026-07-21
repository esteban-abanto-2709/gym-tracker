# Hitos (Alcance)

> Cómo crece la app sin romper nada. Cada hito es una **versión estable y
> usable**. El [`roadmap`](./logbook/roadmap.md) solo se llena con las tareas del
> hito **activo**; no se planifica todo de golpe. Deriva de la
> [definición de producto](./product-vision.md).

## Cómo funciona

- **Hito = versión estable.** Al cerrar un hito la app queda usable y desplegable.
- **Roadmap = hito activo.** Las tareas `RM-###` del logbook son las del hito en
  curso, ninguna más. Cuando se cierran (pasan al changelog), recién entonces
  bajamos las del siguiente hito.
- **Este documento = el plan.** Los hitos futuros viven aquí como descripción; sus
  `RM-###` se asignan cuando ese hito se vuelve activo. Como los códigos nunca se
  reutilizan, habrá saltos en la numeración.

## Punto de partida (ya existe)

Registro de ejercicios sueltos (peso + reps + opinión), historial por día y
"repetir último". Es el cuaderno rápido base.

## H1 · Registro afilado — *activo (corto plazo)*

El registro de 2 segundos, sólido y con identidad. Sigue siendo el cuaderno
rápido, pero pulido.

- kg/lb (interno en kg, elección al registrar).
- Escala de dificultad 1-5 opcional por set.
- Nunca perder un set en silencio (resuelve `TD-006`).
- Pasada de identidad visual (aplica `ux-foundations.md`).

**Estable cuando:** registrar es a prueba de fricción y la app ya "se siente" GYM.

## H2 · Entrenamientos estructurados

El "no pensar": eliges la sesión → te dice ejercicio · peso · reps → registras
hecho/no hecho y avanzas. Puedes desviarte (cambiar de ejercicio) cuando haga
falta; el modo libre actual nunca desaparece.

- Entidades de rutina y sesión; asignación por día/tipo (Push/Pull…).
- Tracking en vivo: qué toca ahora y cuánto falta para terminar.
- Tooltips breves por ejercicio ("a qué prestar atención", "esta ronda debe costar").

**Estable cuando:** puedo entrenar guiado de principio a fin sin pensar, y aún así
registrar libre si quiero.

## H3 · Recomendación de peso

Cierra el loop del entrenador. Con los datos **opcionales** del usuario (peso,
talla, sexo, nivel) + la dificultad 1-5, el sistema sugiere peso/reps y los ajusta
con el tiempo. Sin datos → arranca liviano y aprende. Nada obligatorio, fiel al
"no pensar".

**Estable cuando:** la app propone la carga y se afina sola sesión a sesión.

## Cuentas y multiusuario — *hecho (`RM-022`)*

Promovido desde la wishlist antes de tiempo. Cada persona tiene su cuenta (email +
username + contraseña) y ve solo sus datos; los ejercicios siguen siendo un catálogo
global compartido. Auth propia con JWT en cookie (sin Supabase). Es el prerequisito
que habilita todo lo **social** de la wishlist.

---

Más allá de H3, lo **social** y los **extras** viven en la
[`wishlist`](./logbook/wishlist.md) hasta que decidamos comprometer alguno como un
hito nuevo. El orden de los hitos es una propuesta y puede repriorizarse.
