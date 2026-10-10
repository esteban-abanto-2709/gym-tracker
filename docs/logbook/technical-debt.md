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

## [TD-081] Rutinas hace scroll con varias rutinas
- **Ubicación:** `apps/web/src/app/routines/page.tsx`
- **Riesgo:** 3/10
- **Problema:** con 7 rutinas la pantalla mide ~933 px en un iPhone de 844 y hace scroll; los accesos a Programas y Explorar quedan bajo la barra. Choca con la regla de sin scroll de `docs/ux-foundations.md`.
- **Impacto futuro:** cada rutina nueva empuja más contenido fuera de la pantalla.
- **Sugerencia:** compactar las tarjetas o agrupar por programa, dejando los accesos arriba.
- **Fecha:** 2026-10-09 · **Estado:** Abierto

## [TD-080] La app se siente lenta
- **Ubicación:** sin localizar (web, API, túnel o servidor)
- **Riesgo:** 4/10
- **Problema:** navegar y cargar pantallas se siente algo lento, aunque usable. No hay mediciones: puede venir del túnel, del servidor, de que cada pantalla pide sus datos al cargar sin caché o del tamaño del JavaScript.
- **Impacto futuro:** entre series cada segundo cuenta; una app lenta empuja a anotar en otro lado.
- **Sugerencia:** medir primero (tiempos de red por endpoint y de carga por pantalla) y atacar solo el cuello de botella que aparezca.
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
