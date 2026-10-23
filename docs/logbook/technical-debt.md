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

## [TD-128] El web no tiene Prettier
- **Ubicación:** `apps/web/package.json` (`"format": "npx prettier --write ."`)
- **Riesgo:** 2/10
- **Problema:** Prettier no está en las dependencias ni hay `.prettierrc`; `format` baja la última versión con `npx` y usa la config por defecto. Con la config de la API, 44 archivos de `src/` no cumplen.
- **Impacto futuro:** diffs con ruido de formato y estilos mezclados; no se puede verificar en el CI.
- **Sugerencia:** igual que en la API (TD-068): Prettier como dependencia, `.prettierrc`, `format:check` en el CI y formatear una vez.
- **Fecha:** 2026-10-23 · **Estado:** Abierto

## [TD-108] La tabla de series no tiene índices
- **Ubicación:** `apps/api/prisma/schema.prisma:123` (`model Workout`)
- **Riesgo:** 4/10
- **Problema:** Postgres no indexa solo las llaves foráneas, y `Workout` no declara ningún `@@index`. Todas las consultas filtran por `userId` (y casi todas por `exerciseId`) y ordenan por `createdAt`, así que cada una recorre la tabla entera, que suma las series de todos los usuarios.
- **Impacto futuro:** la pantalla de entrenar se vuelve más lenta con cada serie y cada amigo nuevo; hoy no se nota con unas miles de filas.
- **Sugerencia:** `@@index([userId, exerciseId, createdAt])` y `@@index([userId, createdAt])`; la migración es segura sobre datos reales.
- **Fecha:** 2026-10-16 · **Estado:** Abierto

## [TD-107] "Última serie" trae todo el historial del ejercicio para usar una fila
- **Ubicación:** `apps/api/src/modules/workouts/workouts.service.ts:70` (`getRecommendation`)
- **Riesgo:** 4/10
- **Problema:** la consulta principal es un `findMany` sin `take` que carga todas las series del ejercicio con ese equipo, y solo se usa `sets[0]`. Corre cada vez que se abre el formulario de una serie. `getDays` (`:129`) también lee todas las fechas del usuario en cada llamada.
- **Impacto futuro:** el formulario tarda más en precargarse cuanto más entrenas un ejercicio: justo lo contrario de "no pensar".
- **Sugerencia:** `findFirst` (o `take: 1`) en `getRecommendation`; `getDays` puede esperar a que se note.
- **Fecha:** 2026-10-16 · **Estado:** Abierto

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

## [TD-015] GoogleLogin re-inicializa GSI varias veces (warning en consola)
- **Ubicación:** `apps/web/src/components/auth/GoogleButton.tsx` (usa `GoogleLogin`), montado en `/login` y `/register`; provider en `apps/web/src/app/layout.tsx`.
- **Riesgo:** 2/10
- **Problema:** `GoogleLogin` de `@react-oauth/google` llama a `google.accounts.id.initialize()` en cada montaje. Con StrictMode en dev y al navegar entre `/login` y `/register` se invoca varias veces → `GSI_LOGGER: initialize() is called multiple times`.
- **Impacto futuro:** Solo ruido en consola (GSI usa la última instancia y el login funciona; en prod es más silencioso). Podría enmascarar un problema real si algún día dependiéramos de configurar el init por-instancia.
- **Sugerencia:** montar/inicializar GSI una sola vez (p. ej. un único punto de init a nivel layout, o memoizar), o asumirlo como artefacto dev-only de StrictMode.
- **Fecha:** 2026-07-30 · **Estado:** Abierto

## [TD-014] El "Reintentar" del toast puede duplicar un set o guardar datos viejos
- **Ubicación:** `apps/web/src/hooks/useWorkoutForm.ts` (handleSubmit), `apps/web/src/components/routines/RoutineEditor.tsx` (handleSave). La sesión guiada ya no usa este reintento (RM-114).
- **Riesgo:** 3/10
- **Problema:** Los closures `run` que se pasan a `notifyError` (fix de TD-006) no re-arman el flag de loading al reintentar (sin spinner, y el botón de submit queda habilitado) y capturan el estado del momento del fallo. Durante los 6s del toast: si el usuario reenvía manualmente con éxito y luego toca "Reintentar", el set se registra dos veces; en el editor de rutinas, el retry guarda el payload capturado antes del fallo, descartando ediciones posteriores.
- **Impacto futuro:** Sets duplicados esporádicos en el historial (difíciles de correlacionar con la causa) y ediciones de rutina perdidas tras un reintento.
- **Sugerencia:** en el registro libre, mandar un `clientId` por serie como la sesión guiada (RM-114); en RoutineEditor, construir el payload dentro de `run`.
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
