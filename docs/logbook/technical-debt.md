# Deuda Técnica

Registro de atajos, decisiones pendientes y riesgos a futuro de este proyecto.
Código `TD-###` (nunca se reutiliza). Al resolverse, la entrada se mueve al
changelog y se borra de aquí.

**Formato de cada entrada:**
- **Ubicación:** `archivo:línea` afectado.
- **Riesgo:** del 1 al 10 (1-3 cosmético · 4-6 ralentiza/moderado · 7-9 bug latente o seguridad · 10 crítico).
- **Problema:** qué está mal, sintetizado.
- **Impacto futuro:** qué puede causar si no se atiende.
- **Sugerencia:** (opcional) cómo resolverlo, en una línea. Es una pista para quien lo ejecute, no una especificación.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [TD-105] El build de la web depende de Google Fonts en la red
- **Ubicación:** `apps/web/src/app/layout.tsx:2`
- **Riesgo:** 4/10
- **Problema:** `next/font/google` descarga Oswald, Space Grotesk y Space Mono durante `next build`. El 2026-10-13 la imagen web del CD falló por eso (`next/font/google queries have exactly one entry`) con el mismo código que en CI compiló bien, y el deploy no corrió; el siguiente push pasó sin cambios.
- **Impacto futuro:** deploys que fallan al azar y sin aviso; un cambio puede quedarse sin llegar a prod sin que nadie lo note.
- **Sugerencia:** servir las fuentes desde el repo con `next/font/local` y quitar la descarga del build.
- **Fecha:** 2026-10-14 · **Estado:** Abierto

## [TD-104] Los ejercicios "extra" de la sesión son código muerto
- **Ubicación:** `apps/web/src/hooks/useGuidedSession.ts:104`, `apps/web/src/lib/activeSession.ts:16`
- **Riesgo:** 2/10
- **Problema:** la sesión guiada guarda y combina `extras` (ejercicios agregados a mitad de sesión), pero ninguna pantalla los agrega desde que el mapa solo reemplaza.
- **Impacto futuro:** ramas y tipos que nadie ejerce confunden al leer la sesión y al decidir sobre las series libres (WL-103).
- **Sugerencia:** borrar `extras` del hook y de `ActiveSession`, o devolver el "agregar ejercicio" al mapa si se quiere.
- **Fecha:** 2026-10-13 · **Estado:** Abierto

## [TD-099] El editor de rutinas no explica dónde va el peso
- **Ubicación:** `apps/web/src/components/routines/RoutineEditor.tsx`
- **Riesgo:** 3/10
- **Problema:** la rutina define series y reps, pero no peso, a propósito: el peso se pone al entrenar y la app recuerda el último. Nada en el editor lo dice, y la primera pregunta de un usuario nuevo fue "¿cómo pongo el peso de los ejercicios?".
- **Impacto futuro:** cada usuario nuevo se traba en el mismo punto al armar su primera rutina.
- **Sugerencia:** una línea de ayuda en el editor ("El peso lo pones al entrenar; la app recuerda el último") y una tarjeta en Novedades.
- **Fecha:** 2026-10-13 · **Estado:** Abierto

## [TD-094] Los colores de borde de Tailwind no se aplican
- **Ubicación:** `apps/web/src/app/globals.css:100`
- **Riesgo:** 4/10
- **Problema:** la regla global `* { border-color: hsl(var(--border)); }` está fuera de las capas de Tailwind, y en Tailwind 4 los estilos sin capa ganan a las utilidades. Por eso `border-primary` y los demás colores de borde nunca se ven: el botón "Medir" y la opción elegida del panel de idioma muestran el borde gris.
- **Impacto futuro:** cualquier diseño que dependa de un borde de color (selección, foco, error) no se ve como se diseñó, y es difícil de notar.
- **Sugerencia:** mover la regla dentro de `@layer base` y revisar visualmente las pantallas, porque varios bordes cambiarán de color a la vez.
- **Fecha:** 2026-10-13 · **Estado:** Abierto

## [TD-091] La lista de equipos no tiene la máquina Smith
- **Ubicación:** tabla `Equipment` (sembrada en la migración `equipo_tabla_y_slug`)
- **Riesgo:** 3/10
- **Problema:** los equipos son genéricos (Barra, Polea, Mancuerna, Máquina, Peso Corporal, Otro). Una sentadilla en Smith queda como "Máquina", mezclada con cualquier otra máquina, y su historial y su racha se comparan con los de otras máquinas.
- **Impacto futuro:** sin Smith no se pueden armar variantes como "Squat + Smith" (RM-090), y otros equipos comunes (barra Z, kettlebell, banda) tienen el mismo problema.
- **Sugerencia:** revisar qué equipos faltan, agregarlos con una migración de datos y reasignar las series que correspondan.
- **Fecha:** 2026-10-12 · **Estado:** Abierto

## [TD-089] Un ejercicio no distingue si se hace a una mano
- **Ubicación:** `apps/api/prisma/schema.prisma` (`Exercise`, `Workout`)
- **Riesgo:** 4/10
- **Problema:** el diccionario de ejercicios no sabe si una serie fue unilateral (una mano o una pierna a la vez). Al fusionar los ejercicios existentes con los oficiales, variantes como "curl biceps unilateral" quedaron dentro del ejercicio bilateral y su historial se mezcla.
- **Impacto futuro:** la última vez, la racha y las sugerencias comparan pesos de series a una mano con series a dos manos.
- **Sugerencia:** marcar lo unilateral en la serie (como el equipo), no como ejercicio aparte.
- **Fecha:** 2026-10-12 · **Estado:** Abierto

## [TD-088] Código con partes en español
- **Ubicación:** `apps/api` y `apps/web` (identificadores, mensajes de log, nombres de tests, migraciones de datos)
- **Riesgo:** 3/10
- **Problema:** la regla es que todo el código va en inglés y solo lo que ve el usuario va en español, pero hay partes en español (por ejemplo, nombres de tests como `sin sesion responde 401` y la migración `saneo_catalogo_ejercicios`).
- **Impacto futuro:** mezcla de idiomas que confunde a quien lea el código y choca con la capa de idioma de los ejercicios (RM-086).
- **Sugerencia:** revisar ambas apps y pasar a inglés todo lo que no sea texto de UI; las migraciones ya aplicadas no se renombran.
- **Fecha:** 2026-10-11 · **Estado:** Abierto

## [TD-081] Rutinas hace scroll con varias rutinas
- **Ubicación:** `apps/web/src/app/routines/page.tsx`
- **Riesgo:** 3/10
- **Problema:** con 7 rutinas la pantalla mide ~933 px en un iPhone de 844 y hace scroll; los accesos a Programas y Explorar quedan bajo la barra. Choca con la regla de sin scroll de `docs/ux-foundations.md`.
- **Impacto futuro:** cada rutina nueva empuja más contenido fuera de la pantalla.
- **Sugerencia:** compactar las tarjetas o agrupar por programa, dejando los accesos arriba.
- **Fecha:** 2026-10-09 · **Estado:** Abierto

## [TD-070] TikTok en Android sin probar
- **Ubicación:** `apps/web/src/lib/tiktok.ts` (rama Android de `openTikTok`)
- **Riesgo:** 4/10
- **Problema:** en Android el botón de TikTok usa un `intent://` con el paquete de TikTok y `browser_fallback_url`, pero no se probó en ningún dispositivo. Faltan dos pruebas: con TikTok instalado debe abrir la app con la búsqueda; sin TikTok debe abrir la búsqueda en el navegador del sistema, no dentro de la PWA.
- **Impacto futuro:** quien use Android puede tocar el botón y no pasar nada, o terminar en TikTok web dentro de la PWA.
- **Sugerencia:** probar ambos casos desde la PWA instalada; si la app no acepta la ruta `/search`, buscar el esquema propio de TikTok en Android.
- **Fecha:** 2026-10-07 · **Estado:** Abierto

## [TD-069] TikTok en iOS sin la app instalada, sin probar
- **Ubicación:** `apps/web/src/lib/tiktok.ts` (rama iOS de `openTikTok`)
- **Riesgo:** 3/10
- **Problema:** en iOS el botón abre directo `snssdk1233://search?keyword=…`, probado solo con TikTok instalado. No se sabe qué pasa en un iPhone sin la app: lo esperable es que no pase nada o salga un aviso de dirección inválida. Se descartó un respaldo con temporizador porque saltaba a Safari aunque TikTok abriera bien.
- **Impacto futuro:** quien no tenga TikTok toca el botón y no obtiene nada.
- **Sugerencia:** probar en un iPhone sin TikTok desde la PWA instalada y, si hace falta respaldo, usar `x-safari-https://` sin depender de tiempos.
- **Fecha:** 2026-10-07 · **Estado:** Abierto

## [TD-068] El formato de la API no se verifica
- **Ubicación:** `apps/api/eslint.config.mjs` (`'prettier/prettier': 'off'`)
- **Riesgo:** 2/10
- **Problema:** el plugin de Prettier está cargado pero apagado, así que el formato solo se aplica si alguien corre `pnpm run format`. Activado da 618 errores: 589 son `CRLF` de Windows (`core.autocrlf=true` frente al `endOfLine: lf` de Prettier) y unos 29 son formato real pendiente.
- **Impacto futuro:** diffs con ruido de formato y estilos mezclados; no se puede sumar al CI tal como está.
- **Sugerencia:** fijar los finales de línea (`.gitattributes` con `eol=lf` o `endOfLine: "auto"`), correr `pnpm run format` una vez y verificar con `prettier --check` en el CI en vez de por ESLint.
- **Fecha:** 2026-10-06 · **Estado:** Abierto

## [TD-041] Nombre de rutina repetido responde 500
- **Ubicación:** `apps/api/src/modules/routines/routines.service.ts:18` (`create`) y `:50` (`update`).
- **Riesgo:** 4/10
- **Problema:** `Routine` es única por `[userId, name]`, pero el servicio no captura el `P2002` de Prisma: crear o renombrar una rutina con un nombre que ya tienes devuelve 500 y el editor solo muestra "No se pudo guardar la rutina", sin decir por qué. `programs` ya lo resuelve con un 409 y un aviso en el editor.
- **Impacto futuro:** con amigos usando la app (y copias que suman rutinas con sufijo), chocar con un nombre es más probable y el error no explica qué corregir.
- **Sugerencia:** reutilizar el patrón `withUniqueName` de `programs.service.ts` (409) y avisar en `RoutineEditor` si el nombre ya existe.
- **Fecha:** 2026-09-30 · **Estado:** Abierto

## [TD-015] GoogleLogin re-inicializa GSI varias veces (warning en consola)
- **Ubicación:** `apps/web/src/components/auth/GoogleButton.tsx` (usa `GoogleLogin`), montado en `/login` y `/register`; provider en `apps/web/src/app/layout.tsx`.
- **Riesgo:** 2/10
- **Problema:** `GoogleLogin` de `@react-oauth/google` llama a `google.accounts.id.initialize()` en cada montaje. Con StrictMode en dev y al navegar entre `/login` y `/register` se invoca varias veces → `GSI_LOGGER: initialize() is called multiple times`.
- **Impacto futuro:** Solo ruido en consola (GSI usa la última instancia y el login funciona; en prod es más silencioso). Podría enmascarar un problema real si algún día dependiéramos de configurar el init por-instancia.
- **Sugerencia:** montar/inicializar GSI una sola vez (p. ej. un único punto de init a nivel layout, o memoizar), o asumirlo como artefacto dev-only de StrictMode.
- **Fecha:** 2026-07-30 · **Estado:** Abierto

## [TD-014] El "Reintentar" del toast puede duplicar un set o guardar datos viejos
- **Ubicación:** `apps/web/src/hooks/useGuidedSession.ts` (logSet), `apps/web/src/hooks/useWorkoutForm.ts` (handleSubmit), `apps/web/src/components/routines/RoutineEditor.tsx` (handleSave)
- **Riesgo:** 3/10
- **Problema:** Los closures `run` que se pasan a `notifyError` (fix de TD-006) no re-arman el flag de loading al reintentar (sin spinner, y el botón de submit queda habilitado) y capturan el estado del momento del fallo. Durante los 6s del toast: si el usuario reenvía manualmente con éxito y luego toca "Reintentar", el set se registra dos veces; en el editor de rutinas, el retry guarda el payload capturado antes del fallo, descartando ediciones posteriores.
- **Impacto futuro:** Sets duplicados esporádicos en el historial (difíciles de correlacionar con la causa) y ediciones de rutina perdidas tras un reintento.
- **Sugerencia:** re-armar el flag de loading al inicio de `run` y descartar el toast pendiente al reenviar manualmente (`toast.dismiss()`); en RoutineEditor, construir el payload dentro de `run`.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [TD-012] Botón X del combobox enfoca el primer input de la página
- **Ubicación:** `apps/web/src/components/exercises/ExerciseCombobox.tsx:117`
- **Riesgo:** 3/10
- **Problema:** Al limpiar la búsqueda se hace `document.querySelector("input")?.focus()`, que agarra el primer `<input>` del DOM, no el de búsqueda. En el editor de rutinas el primer input es el nombre de la rutina → el foco salta al campo equivocado.
- **Impacto futuro:** El usuario limpia la búsqueda y el teclado móvil se abre sobre otro campo; confusión y typos en el nombre de la rutina.
- **Sugerencia:** guardar un `ref` al input de búsqueda dentro del combobox y enfocar ese ref.
- **Fecha:** 2026-07-23 · **Estado:** Abierto
