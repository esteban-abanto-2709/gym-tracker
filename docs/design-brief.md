# Gym Tracker — Brief para Diseño

> Documento autocontenido para pasarle a diseño. Describe **qué es la app, para
> quién, y todo lo que el sistema puede hacer hoy** — sin dictar la solución
> visual. La creatividad estética queda libre; lo único fijo son el concepto, el
> contexto de uso y unas pocas restricciones duras (ver [Reglas del encargo](#reglas-del-encargo)).

---

## El concepto en una frase

**"El gym es mi vida, no solo una parte de ella."**

No es un cuaderno de notas ni una app de salud tibia. Es una app con **identidad
fuerte**, para alguien cuya rutina de gym es parte de quién es. Tiene que dar
ganas de abrirla.

Y al mismo tiempo, su trabajo real es **quitarte la cabeza de encima**:

- **No pensar.** Ves qué hiciste la última vez, lo repites o subes el peso, y ya.
- **Reduce el esfuerzo.** Registrar un set son 2 segundos y un par de toques.
- **Ordena el caos.** El gym es caótico (máquina ocupada, te saltas algo, cambias
  de ejercicio sobre la marcha). La app absorbe ese desorden en vez de romperse.

## Para quién

- El dueño y un puñado de amigos. Hombres jóvenes (~18–26), nivel medio tirando a
  principiante. Ya saben entrenar; solo quieren **registrar**.
- No quieren configurar nada antes de empezar. Cero onboarding.

## El contexto de uso (esto manda la ergonomía)

Esto no es negociable porque describe el mundo físico, no un gusto:

- Se usa **entre series**: de pie, sudado, con prisa, **con una sola mano**.
- Flujo real: pongo el cronómetro de descanso (otra app) → **registro** → suelto
  el celular y descanso.
- Por eso: pantalla **vertical**, botones grandes, targets táctiles generosos,
  texto legible de un vistazo y cansado.
- Hay un segundo contexto, **en casa**: ahí sí se vale mostrar más datos y revisar
  con calma (historial, progreso). Dos densidades, mismo producto.

---

## Qué puede hacer el sistema hoy (inventario funcional)

Todo lo de abajo ya está construido y funcionando. Es el material con el que
diseñar. Está descrito por **función**, no por cómo se ve.

### 1. Cuentas y sesión

- Registro e inicio de sesión con **email + contraseña**, o con **Google**.
- Cada usuario ve solo sus datos (entrenamientos y rutinas son privados). El
  catálogo de ejercicios y equipos es **compartido** entre todos.
- Menú de cuenta con nombre de usuario y cerrar sesión.

### 2. Pantalla principal (hub)

Tres caminos, nada más:

- **Iniciar una rutina** → entrenamiento guiado paso a paso.
- **Día libre** → registrar un set suelto, sin rutina.
- **Crear rutina** → armar una rutina nueva.
- Si hay una rutina **en curso**, aparece un aviso para **continuarla**.

### 3. Registrar un set ("día libre" / registro suelto)

El corazón de la app. Un formulario corto:

- **Elegir ejercicio** (buscador con autocompletar; si no existe, se crea al vuelo).
- **Equipo** opcional (mancuerna, barra, máquina, polea…). Por defecto propone
  **el último equipo que usaste** en ese ejercicio.
- **Peso** con conmutador **kg / lb** (internamente todo es kg; muestra la
  conversión aproximada en vivo). Muchas máquinas vienen solo en libras.
- **Repeticiones.**
- **¿Cómo te sentiste?** — nota de texto libre, opcional.
- **Aproximación** — casilla para marcar que el peso fue estimado, no exacto (p.
  ej. una mancuerna que no marca el número justo). Los sets "aproximados" se
  cuentan aparte para las recomendaciones.
- Se guarda **con fecha y hora automáticas**. Confirmación visible inmediata.

### 4. Rutinas

- **Crear / editar** una rutina: nombre + lista ordenada de ejercicios.
- Cada ejercicio de la rutina puede llevar **objetivo de series × reps** (opcional)
  y marcarse como **aproximación**.
- Los ejercicios se **reordenan arrastrando**.
- **Listar** rutinas, **empezar** una, **borrarla**.
- Si intentas empezar una rutina teniendo otra en curso, pregunta antes de
  descartar la anterior.

### 5. Entrenamiento guiado (la joya — "ordenar el caos")

Al iniciar una rutina entras en un modo guiado, un ejercicio a la vez:

- Muestra el **ejercicio actual**, qué serie vas (Serie N) y la **meta** (p. ej.
  "3 × 10") o "series libres" si no tiene objetivo.
- Registras el set (peso, reps, equipo, aproximación) igual que en día libre.
- Tras cada set aparece una **pantalla de confirmación** que te dice **qué
  preparar a continuación** (seguir en la misma máquina, o la siguiente) — para
  leerla de reojo mientras descansas.
- **Recomendación de peso automática:** si en tu último día batiste tus reps del
  día anterior a ese mismo peso por un margen, te sugiere **subir el peso**. Silenciosa,
  sin coach ni avatar. Solo compara sets del **mismo equipo** (el peso no es
  comparable entre una máquina y una mancuerna).
- **Progreso de la sesión:** un indicador "Ejercicio N de M" y un **mapa de la
  sesión** con el estado de cada ejercicio (hecho / a medias / pendiente /
  saltado).

**Lo que absorbe el caos** — desde el mapa de la sesión puedes:

- **Saltar** un ejercicio por hoy (y retomarlo después si quieres).
- **Reemplazar** un ejercicio por otro (máquina ocupada) — el hueco conserva su
  meta pero cambia el movimiento.
- **Adelantarte** a cualquier ejercicio de la lista (no obliga al orden).
- **Añadir** un ejercicio suelto a mitad de sesión.
- La estructura **ayuda, nunca obliga**: siempre puedes desviarte.
- La sesión se **guarda sola** (sobrevive si cierras la app) y **caduca al día
  siguiente**.

### 6. Historial

- Ver entrenamientos pasados **agrupados por día** (selector de fechas).
- Por cada set: peso (kg + lb), reps, nota, si fue aproximación.
- **Repetir** un set pasado, **editarlo** o **borrarlo**.

### 7. Catálogo de ejercicios y equipos

- Buscador de ejercicios; crear uno nuevo cuando no existe.
- Lista de equipos (barra, mancuerna, máquina, polea, etc.), compartida.

---

## Reglas del encargo

Casi todo es libre. Esto no:

- **Libertad visual total.** Puedes proponer la identidad desde cero: paleta,
  tipografía, formas, estilo. Incluso reinventar el color de acento. No hay una
  estética heredada que respetar.
- **Modo claro y modo oscuro, ambos obligatorios.** No uno como pariente pobre del
  otro: los dos tienen que verse igual de intencionados.
- **Móvil vertical, una mano.** Es la restricción reina. Diseña para el pulgar,
  para leerse sudado y cansado, con targets táctiles grandes.
- **Registrar es el camino más corto.** Un set no debería estar a más de 1–2
  toques desde el inicio. Todo lo demás le suma o sobra, pero nunca le estorba.
- **Cero configuración obligatoria** antes de poder registrar.
- **Feedback inmediato** al registrar y **claro cuando falla la red** (nunca
  perder un set en silencio).
- **Dos densidades:** mínimo y sin ruido en el gym; más generoso en casa
  (historial, progreso).

## Tono de voz

Motivacional pero **serio**. Frases cortas, que se queden grabadas. Pensado para
leerse tras una serie pesada. **Nada cursi, nada de coach payaso.**

## Qué NO es (para no desviarse)

- No es todo-en-uno: nada de nutrición, hábitos ni fisioterapia.
- No es red social: nada de feed, chat ni fotos.
- No tiene cronómetro propio (se usa junto al del celular).
- Sin onboarding pesado ni muros de pago para lo esencial.
