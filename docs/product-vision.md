# Gym Tracker — Definición de Producto

> Documento conceptual: qué es la app, para quién y por qué. El trabajo
> comprometido vive en [`docs/logbook/`](./logbook/); el diseño, en
> [`ux-foundations.md`](./ux-foundations.md).

## En una frase

Un registrador de entrenamiento que se usa **entre series sin pensar**: ves
cuánto hiciste la vez pasada, lo repites o subes el peso, registras en 2
segundos y sueltas el celular.

## Propósito del proyecto

- **Hoy:** uso personal (yo y un par de amigos) + pieza de portafolio.
- **Como portafolio** debe demostrar: clean code, arquitectura limpia, dominio
  full-stack y —sobre todo— **visión de producto**: algo usable y funcional, no
  solo bonito.
- **No** es un lanzamiento masivo. Si interesa, se abre a amigos cercanos con
  cuentas. Nada más allá de eso.

## Para quién

- Usuario principal: yo y mis amigos. Hombres jóvenes (~18-26), nivel medio
  tirando a principiante.
- Ya sabe entrenar: conoce los ejercicios y la técnica, solo quiere **registrar**.
- No quiere configurar nada antes de empezar. Quiere entrenar y que la app no
  estorbe.

## El problema (job-to-be-done)

> "Cuando estoy entre series, quiero anotar lo que acabo de hacer en segundos y
> olvidarme, para concentrarme en descansar — sin tener que recordar qué toca
> hoy ni pensar."

Lo que molesta de las apps existentes (Strong, Hevy, etc.): **onboarding pesado**
(peso, talla, unidades, objetivos antes de poder usarla) y **límites freemium**
para registrar rutinas.

## Principio rector: "No pensar"

El mayor valor de la app es eliminar la carga mental:

- Veo el peso/reps de la última vez, lo repito y listo.
- Si lo siento fácil, subo el peso y registro. El progreso se siente porque
  **queda anotado**.
- A largo plazo, un "entrenador digital" silencioso me dice qué máquina, qué peso
  y cuántas reps — yo solo ejecuto y registro. Sin avatar, sin charla.

## Principios de producto

- **Minimalista y rápido.** Cero fricción, sobre todo en el gym.
- **Registrar es el corazón.** Todo lo demás le suma o sobra; nunca le da trabajo
  al usuario.
- **Constancia > intensidad.** La UX premia ir siempre, no levantar mucho.
- **Dos contextos:** en el gym = cero pensamiento, mínimos toques; en casa = está
  bien ver más datos.
- **Sin muros de pago** para lo esencial.

## Qué NO es (anti-features)

- No es un "todo en uno": nada de nutrición, ni fisioterapia, ni hábitos.
- No es una red social: nada de chat, feed ni subir fotos.
- Lo único "social" aceptado (a futuro): perfiles para comparar cargas con amigos
  y copiar rutinas ajenas.
- No tiene cronómetro propio: se usa junto al cronómetro del celular.
- No tiene onboarding pesado ni límites freemium.

## Alcance por horizontes

> El desglose en versiones estables vive en [`milestones.md`](./milestones.md); las
> tareas del hito activo, en [`logbook/roadmap.md`](./logbook/roadmap.md).

### Corto plazo — lo importante hoy

Pulir el **registro sin fricción**:

- Registrar un set en 2 segundos; repetir último peso/reps por defecto.
- **Soporte kg/lb:** interno en kg, el usuario elige unidad al registrar (hay
  máquinas solo en lb); fin de las conversiones manuales en otra pestaña.
- Escala de dificultad **1-5** opcional por set.
- Feedback claro cuando falla la red: nunca perder un set en silencio.
- Estética que transmita identidad (ver `ux-foundations.md`).

### Largo plazo — se planifica con calma

El **"entrenador que no te hace pensar"**:

- **Entrenamientos estructurados:** eliges la sesión y te dice ejercicio → peso →
  reps; registras hecho/no hecho y avanzas. Puedes cambiar de ejercicio si algo
  pasa (la estructura ayuda, no obliga).
- **Tooltips breves** por ejercicio (a qué prestar atención, "esta ronda debe
  costar").
- **Recomendación de peso** a partir de datos (peso corporal, talla, sexo, nivel)
  + la dificultad 1-5 → el algoritmo ajusta peso/reps con el tiempo.
- **Social mínimo:** perfiles comparables + copiar la rutina de un amigo ("Push de
  Miguel77" → botón "hacer rutina"). Comparar es vanidad secundaria; copiar es el
  golazo.
- **Registro ampliado opcional:** cardio post-rutina, movilidad/calentamiento.
- **IA para reconocer patrones** desde notas en texto (ej. "este ejercicio no te
  va"). Secundario, nunca el centro.

## Métricas de éxito (corto plazo)

- Que alguien vea la app, le guste cómo se ve / lo fácil que es, y la quiera usar.
- Que un amigo que la probó la siga usando e integre en su rutina habitual.

## Restricciones

- Stack fijo: NestJS + Next.js + PostgreSQL (Prisma).
- Web only por ahora (acceso vía Cloudflare Tunnel, URL cambiante). Idea futura
  sin compromiso: PWA instalable.
- Sin presupuesto de crecimiento: tiers gratis, mejoras en tiempo libre.
