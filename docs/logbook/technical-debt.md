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

## [TD-136] Dependencias con vulnerabilidades conocidas
- **Ubicación:** `apps/web/package.json` (`next@16.2.3`), `apps/api/package.json` (`@nestjs/*`, `prisma`)
- **Riesgo:** 8/10
- **Problema:** `pnpm audit --prod` marca 46 avisos en web (5 críticos de Next: RCE en Image Optimization y `next/og`; bypass de middleware, SSRF en rewrites) y 40 en la API (`proxy-addr`, `body-parser`, `multer` vía Express; `fast-uri`, `mysql2` vía las herramientas de Prisma).
- **Impacto futuro:** RCE o DoS explotables en el servidor de prod expuesto a internet.
- **Sugerencia:** web: Next a la última 16.x; API: actualizar `@nestjs/*` y `prisma` dentro de su mayor.
- **Fecha:** 2026-10-25 · **Estado:** En progreso (2026-10-25)

## [TD-130] Los ids de los equipos están en español
- **Ubicación:** tabla `Equipment` (ids `barra`, `polea`, `mancuerna`, `maquina`, `otro`… sembrados en la migración `equipo_tabla_y_slug`); `apps/web/src/lib/equipmentIcons.ts`.
- **Riesgo:** 2/10
- **Problema:** la regla es que los slugs van en inglés, pero los ids de `Equipment` son palabras en español y aparecen en el código (iconos, tests, `equipmentId` de cada serie). Cambiarlos no es renombrar: es una migración de datos sobre `Workout.equipmentId` en prod y sobre el `localStorage` de `equipmentMemory`.
- **Impacto futuro:** cada equipo nuevo (TD-091) suma otro id en español si no se decide antes.
- **Sugerencia:** decidirlo al hacer TD-091 / RM-090, que ya tocan esa tabla: o se migran los ids a inglés en el mismo paso, o se acepta que los ids existentes quedan y los nuevos van en inglés.
- **Fecha:** 2026-10-23 · **Estado:** Abierto

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

## [TD-081] Rutinas hace scroll con varias rutinas
- **Ubicación:** `apps/web/src/app/routines/page.tsx`
- **Riesgo:** 3/10
- **Problema:** con 7 rutinas la pantalla mide ~933 px en un iPhone de 844 y hace scroll; los accesos a Programas y Explorar quedan bajo la barra. Choca con la regla de sin scroll de `docs/ux-foundations.md`.
- **Impacto futuro:** cada rutina nueva empuja más contenido fuera de la pantalla.
- **Sugerencia:** compactar las tarjetas o agrupar por programa, dejando los accesos arriba.
- **Fecha:** 2026-10-09 · **Estado:** Abierto

## [TD-135] TikTok en Android sin la app instalada, sin probar
- **Ubicación:** `apps/web/src/lib/tiktok.ts` (rama Android de `openTikTok`)
- **Riesgo:** 3/10
- **Problema:** en Android el botón abre `intent://search?keyword=…` con el esquema `snssdk1233` y el paquete de TikTok, sin respaldo web; probado solo con TikTok instalado. Sin la app, lo esperable es que Android abra TikTok en la Play Store, fuera de la PWA.
- **Impacto futuro:** si Android no hace eso, quien no tenga TikTok toca el botón y no obtiene nada o termina en una pantalla rara.
- **Sugerencia:** probar desde la PWA instalada en un Android sin TikTok; no volver a `browser_fallback_url`, que carga la web dentro de la PWA.
- **Fecha:** 2026-10-24 · **Estado:** Abierto

## [TD-069] TikTok en iOS sin la app instalada, sin probar
- **Ubicación:** `apps/web/src/lib/tiktok.ts` (rama iOS de `openTikTok`)
- **Riesgo:** 3/10
- **Problema:** en iOS el botón abre directo `snssdk1233://search?keyword=…`, probado solo con TikTok instalado. No se sabe qué pasa en un iPhone sin la app: lo esperable es que no pase nada o salga un aviso de dirección inválida. Se descartó un respaldo con temporizador porque saltaba a Safari aunque TikTok abriera bien.
- **Impacto futuro:** quien no tenga TikTok toca el botón y no obtiene nada.
- **Sugerencia:** probar en un iPhone sin TikTok desde la PWA instalada y, si hace falta respaldo, usar `x-safari-https://` sin depender de tiempos.
- **Fecha:** 2026-10-07 · **Estado:** Abierto

## [TD-015] GoogleLogin re-inicializa GSI varias veces (warning en consola)
- **Ubicación:** `apps/web/src/components/auth/GoogleButton.tsx` (usa `GoogleLogin`), montado en `/login` y `/register`; provider en `apps/web/src/app/layout.tsx`.
- **Riesgo:** 2/10
- **Problema:** `GoogleLogin` de `@react-oauth/google` llama a `google.accounts.id.initialize()` en cada montaje. Con StrictMode en dev y al navegar entre `/login` y `/register` se invoca varias veces → `GSI_LOGGER: initialize() is called multiple times`.
- **Impacto futuro:** Solo ruido en consola (GSI usa la última instancia y el login funciona; en prod es más silencioso). Podría enmascarar un problema real si algún día dependiéramos de configurar el init por-instancia.
- **Sugerencia:** montar/inicializar GSI una sola vez (p. ej. un único punto de init a nivel layout, o memoizar), o asumirlo como artefacto dev-only de StrictMode.
- **Fecha:** 2026-07-30 · **Estado:** Abierto

## [TD-014] El "Reintentar" del editor de rutinas puede guardar datos viejos
- **Ubicación:** `apps/web/src/components/routines/RoutineEditor.tsx` (handleSave). El registro libre y la sesión guiada ya no usan este reintento: van por la cola de series con `clientId`.
- **Riesgo:** 3/10
- **Problema:** El closure `run` que se pasa a `notifyError` (fix de TD-006) no re-arma el flag de loading al reintentar (sin spinner, y el botón queda habilitado) y captura el estado del momento del fallo: durante los 6s del toast, el retry guarda el payload capturado antes del fallo y descarta las ediciones posteriores.
- **Impacto futuro:** ediciones de rutina perdidas tras un reintento.
- **Sugerencia:** construir el payload dentro de `run`.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [TD-012] Botón X del combobox enfoca el primer input de la página
- **Ubicación:** `apps/web/src/components/exercises/ExerciseCombobox.tsx:117`
- **Riesgo:** 3/10
- **Problema:** Al limpiar la búsqueda se hace `document.querySelector("input")?.focus()`, que agarra el primer `<input>` del DOM, no el de búsqueda. En el editor de rutinas el primer input es el nombre de la rutina → el foco salta al campo equivocado.
- **Impacto futuro:** El usuario limpia la búsqueda y el teclado móvil se abre sobre otro campo; confusión y typos en el nombre de la rutina.
- **Sugerencia:** guardar un `ref` al input de búsqueda dentro del combobox y enfocar ese ref.
- **Fecha:** 2026-07-23 · **Estado:** Abierto

## [TD-126] Cada hoja inferior copia su propio armazón
- **Ubicación:** `apps/web/src/components/profile/ThemeSheet.tsx:30`, `LanguageSheet.tsx:37`, `MeasureSheet.tsx`, `history/ExportSheet.tsx`, `news/NewsButton.tsx`, `train/SessionMap.tsx`
- **Riesgo:** 3/10
- **Problema:** el portal, el fondo oscuro, el contenedor `anchor-bottom` con su animación, la barrita y el encabezado con la X se repiten casi idénticos en seis componentes.
- **Impacto futuro:** un arreglo de las hojas (accesibilidad, cerrar deslizando, foco) hay que hacerlo seis veces y alguna queda distinta.
- **Fecha:** 2026-10-21 · **Estado:** Abierto
