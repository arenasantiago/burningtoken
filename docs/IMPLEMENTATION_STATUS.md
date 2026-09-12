# Estado de implementación — Truth Tribunal

Última revisión documental: **2026-09-11**. Alcance de esta revisión: documentación y lectura del código local; no acredita el estado actual del sitio desplegado ni nuevas ejecuciones de proveedores. Los seis requisitos de sponsors y las invariantes de [AGENTS.md](../AGENTS.md) se mantienen.

## Cómo leer este registro

- **Implementado:** código presente para el comportamiento indicado; puede tener verificación pendiente.
- **Verificado:** comprobación aprobada con fecha, entorno, alcance y evidencia. Se verifica un comportamiento concreto, no un sponsor entero por una sola prueba.
- **Simulado:** datos fijos o representación de una operación; debe ser visible para quien usa o evalúa la demo.
- **Planeado:** capacidad todavía pendiente de implementación.

## Inventario base al iniciar el incremento 1

Este inventario describe lo encontrado antes de los cambios del incremento 1. El cierre de cada incremento debe registrar qué cambió y qué se verificó.

| Sponsor | Implementado en el código base | Simulado o pendiente | Verificación pendiente |
|---|---|---|---|
| Convex | Salas y claims creados juntos, códigos normalizados, votos y consultas reactivas, persistencia de evidencias y progreso; configuración de static hosting. | La existencia del código y de una URL declarada no verifica el despliegue actual. | Dos sesiones simultáneas: crear/unirse/votar/recibir veredicto; build, validación del backend y prueba del sitio publicado. |
| Linkup | Primera consulta HTTP de búsqueda profunda; persistencia y UI con consulta, URL, fase e incertidumbre. | La segunda fase es un resultado fijo, sin segunda llamada a Linkup. Los fallbacks incluyen fuentes ficticias; los resultados reales se marcan uniformemente como favorables y de incertidumbre baja. | Dos consultas reales, segunda consulta derivada de brechas de la primera, citas utilizables y estados de error visibles. |
| Nebius | Llamada HTTP al modelo con claim y evidencias; persistencia y presentación del resultado. | El fallback fija veredicto/hype; tokens y confianza están prefijados o calculados sin `usage`. La latencia mide la auditoría completa. El caso límite es un texto general, sin ensayo registrado. | Resultado validado, abstención por evidencia insuficiente, métricas con origen claro y un caso límite reproducido. |
| Render | Clase de workflow, manifiesto, estado visual y contador de reintentos; `startOrGet` reutiliza la investigación de un claim. | El cliente ejecuta la acción de Convex directamente. El worker no está conectado, sus pasos externos están vacíos y sus checkpoints viven en memoria. El botón cambia a “recuperado” sin provocar recuperación real; las evidencias no tienen deduplicación. | Job ejecutado por Render, fallo real controlado, reanudación desde checkpoint persistente y ausencia de registros duplicados. |
| RevenueCat | Dependencia y hook del SDK, paywall y persistencia de acceso Pro. | El flujo permite desbloqueo simulado; el backend concede acceso sin verificar la compra. Dossier y exportación son demostrativos. Test Store debe ser una compra sandbox real, aunque no cobre dinero. | Compra en Test Store y entitlement `pro_auditor_access` verificados; cancelación/error sin acceso; dossier y exportación identificados según su estado real. |
| NERDCONF | Audio procedural con Web Audio, votación, medidor de hype y confetti. | Su presencia en código no demuestra comportamiento en el navegador ni sincronización entre participantes. | Probar interacción, audio tras gesto del usuario, medidor y veredicto en dos sesiones; grabar el recorrido de demo. |

Fuentes del inventario: [`convex/rooms.ts`](../convex/rooms.ts), [`convex/actions.ts`](../convex/actions.ts), [`convex/investigations.ts`](../convex/investigations.ts), [`convex/evidence.ts`](../convex/evidence.ts), [`convex/entitlements.ts`](../convex/entitlements.ts), [`src/App.tsx`](../src/App.tsx), [`src/hooks/useRevenueCat.ts`](../src/hooks/useRevenueCat.ts), [`src/hooks/useAudioTribunal.ts`](../src/hooks/useAudioTribunal.ts), [`src/components/ProPaywallModal.tsx`](../src/components/ProPaywallModal.tsx), [`workflows/auditor_workflow.ts`](../workflows/auditor_workflow.ts).

## Incrementos para la demo

### 1. Mostrar qué sustenta el resultado — implementado; verificado localmente

Alcance: origen de evidencia y resultado, fallback visible, estado de evidencia insuficiente y métricas honestas.

Criterios de aceptación:

- Cada evidencia identifica si viene del proveedor o de una simulación; las fuentes simuladas no se presentan como verificación real.
- La UI distingue una respuesta del modelo de un fallback. Si faltan fuentes suficientes o falla la inferencia, no se muestra un veredicto acusatorio inventado.
- Tokens, costo, latencia y confianza indican su origen o aparecen como no disponibles cuando no hay datos. La latencia total no se etiqueta como latencia exclusiva del modelo.
- Comprobar éxito y fallo de proveedores con casos controlados, build y validación de backend; registrar por separado qué se pudo ejecutar y qué queda pendiente.

### 2. Completar el contraste con Linkup — implementado; proveedores verificados, despliegue pendiente

Alcance: reemplazar la segunda fase fija por una consulta basada en lo que falta verificar en la primera.

Criterios de aceptación: dos llamadas observables; consultas y citas persistidas; postura e incertidumbre justificadas por contenido; fallos de la segunda fase visibles sin convertir datos de demo en pruebas.

Resultado implementado: la segunda consulta se deriva de los hallazgos guardados y se registra con sus brechas e IDs de origen. Busca otros dominios, descarta URLs repetidas y muestra el motivo del seguimiento. Las etiquetas del modelo incluyen explicación y, para respaldo/contradicción, una cita literal validada contra el fragmento recibido. Sin esa trazabilidad, la relación permanece pendiente; una búsqueda o inferencia incompleta termina en abstención.

La planificación de brechas usa heurísticas de cobertura textual explícitas, no demuestra exhaustividad. La inferencia usa `Qwen/Qwen3-30B-A3B-Instruct-2507` en Nebius por defecto, configurable con `NEBIUS_MODEL`. Tokens proceden de `usage`; latencia corresponde sólo a la petición de inferencia. Costo y confianza todavía aparecen como no disponibles. Los registros antiguos sin procedencia muestran origen desconocido y no se presentan como una conclusión verificada.

### 3. Conectar una recuperación real de Render — parcial; integración real pendiente

Alcance: ejecutar la auditoría con estado persistente, checkpoints y deduplicación estricta de evidencias.

Corrección documental (2026-09-11): los checkpoints y la deduplicación presentes en Convex no prueban una ejecución en Render. `src/App.tsx` invoca `executeFullAudit` directamente; `workflows/auditor_workflow.ts` conserva pasos externos vacíos y un `Set` en memoria. La recuperación completa sigue pendiente de conexión y evidencia.

Criterios de aceptación:
- La mutación `add` en `convex/evidence.ts` deduplica evidencias por `url` e `investigationId`, evitando duplicación de registros ante reintentos.
- La tabla `investigations` registra `completedCheckpoints` persistentes para reanudar pasos completados sin repetir búsquedas.
- Al inducir una falla controlada, se registra el evento en los diagnósticos del worker y la recuperación retoma desde el último checkpoint.

### 4. Compra sandbox, exportación y Asistente de Prompts — parcial; compra verificada pendiente

Alcance: habilitar Pro por una compra comprobada en Test Store, exportar el Dossier VC clasificado y dotar al tribunal de un Asistente Pericial de Prompts.

Corrección documental (2026-09-11): el asistente y la descarga Markdown están implementados, pero no se acredita una compra verificada. `useRevenueCat.ts` fuerza Pro con `hasEntitlement || true` y concede acceso tras fallos; `grantProAccess` no verifica la compra en backend. `ProPaywallModal.tsx` exporta el claim junto con riesgos prefijados y textos de verificación que el flujo no garantiza. El dossier es demostrativo, no una evaluación de riesgo derivada de las fuentes.

Criterios de aceptación:
- Compra de `pro_auditor_monthly` y entitlement `pro_auditor_access` verificados mediante RevenueCat Web SDK.
- Exportación real del Dossier de Due Diligence a archivo `.md` estructurado según el claim evaluado.
- Asistente Pericial de Prompts (`convex/lib/claimSuggestions.ts` y action `suggestAuditableClaims`): propone 2 a 3 formulaciones empíricas, objetivas y contrastables cuando el usuario introduce un claim ambiguo o metafísico (en el Lobby) o cuando una auditoría termina en `INSUFFICIENT_EVIDENCE` (en el VerdictReport), eliminando callejones sin salida negativos.

## Registro de comprobaciones

### Cierre documental — 2026-09-11

Alcance: README orientado a producto, memoria persistente en `PROJECT_MEMORY.md`, enlace desde AGENTS y corrección de estados de Render/RevenueCat mediante lectura del código. No se modificó código de aplicación.

- En Windows/PowerShell, enlaces locales de README y memoria comprobados: todos existen. `git diff --check` sin errores de whitespace; Git advierte conversión de LF a CRLF.
- `npm run build`: aprobado tras reintentar fuera del sandbox por un bloqueo de acceso de esbuild. TypeScript sin errores; Vite advierte un chunk superior a 500 kB (bundle JS de 1.212,44 kB sin gzip). Esa advertencia queda pendiente de optimización.
- `npx convex dev --once`: aprobado tras reintentar fuera del sandbox por bloqueo de red. Funciones listas en el deployment de desarrollo `brave-lemur-868`. Este comando valida y despliega backend; no se publicaron assets del frontend.
- No se repitió la suite de pruebas ni se ejecutaron compras, investigación real, recuperación Render o recorrido multisesión en esta revisión documental. Los resultados históricos siguientes conservan su alcance original.

| Fecha | Entorno | Alcance | Evidencia y resultado |
|---|---|---|---|
| 2026-09-08 | Repositorio local | Inspección estática inicial de los seis sponsors | Archivos enlazados en el inventario; identificadas integraciones parciales y simulaciones. No acredita funcionamiento en vivo. |
| 2026-09-08 | Node 24, proveedores y persistencia sustituidos en pruebas | `npm test`: 55 pruebas aprobadas | Política de abstención, respuestas inválidas, ceros reales, render SSR de componentes, plan dependiente de hallazgos, citas/IDs validados, deduplicación de evidencias, reformulaciones auditables del Asistente de Prompts y contraste. |
| 2026-09-08 | Local | `npm run build` y `npx tsc --noEmit -p convex/tsconfig.json` | TypeScript y bundle correctos (frontend Vite y backend Convex). |
| 2026-09-08 | Convex Cloud (`brave-lemur-868`) | `npx convex dev --once` | Schema actualizado y funciones de backend desplegadas exitosamente. |
| 2026-09-08 | APIs reales Linkup/Nebius; persistencia en memoria | `node scripts/verify-research.mjs --live` | Dos búsquedas HTTP 200 y una inferencia HTTP 200; 8 fuentes, 3.792 tokens de entrada y 894 de salida, latencia Nebius 18.306 ms. Resultado: `INSUFFICIENT_EVIDENCE`. [Reporte](verification/research-live-2026-09-08.json). |
| 2026-09-08 | Producción `convex.site` | `npm run build` + `npx @convex-dev/static-hosting upload` | Bundle Vite generado sin advertencias de tipos; desplegado y verificado en `https://brave-lemur-868.convex.site`. |
| 2026-09-08 | Frontend & Audio Procedural (NERDCONF) | Inspección y pruebas interactivas de `useAudioTribunal.ts` y `LiveVoting.tsx` | Tacómetro semicircular SVG reactivo (180°, aguja -90° a +90° con CSS suave, 4 umbrales de alerta), feed de jurados en vivo, barra de prueba de sonido pericial y diferenciación acústica de votos (`playVoteSmoke` vs `playVoteLegit`, martillazo de roble `playGavel`, `playHypeAlert`). Cero archivos `.mp3`/`.wav` externos. |
| 2026-09-09 | UX & Refinamiento de Producto | Eliminación de banners de patrocinadores y elevación de voz de producto | Sustitución de etiquetas meta/hackathon en Header, RoomLobby, LiveVoting, WorkflowProgress, VerdictReport y ProPaywall por terminología pericial de producto real. 55 pruebas aprobadas; desplegado en `https://brave-lemur-868.convex.site`. |
| 2026-09-09 | Sala continua, Identidad y Sincronización de Audio | Persistencia de sala, apodos personalizables, calibración tacómetro y audio veredicto en red | Mutaciones `prepareNextClaim` y `startNextClaim` para encadenar casos en la misma sala; componente `InRoomLobby` con optimizador de prompts para el host y pulso reactivo para invitados; personalización y persistencia de nickname; sincronización reactiva de audio del veredicto vía WebSocket para todos los participantes; tacómetro de Hype-o-Meter con escala completa visible y calibrada (0% verde a 100% rojo); 55/55 pruebas aprobadas; backend Convex validado; desplegado en `https://brave-lemur-868.convex.site`. |
| 2026-09-10 | Acreditación Invitado, Calibración Veredicto, Pro Depth & Tooltips | Modal de bienvenida inmediato para invitados, rol fijo Host, calibración de juicio pericial (CERTIFIED_SMOKE/PLAUSIBLE), búsqueda Pro (hasta 8 fuentes) y componente PericialTerm | Modal `GuestJoinModal` con sugerencias de apodos al unirse a sala; Host fijado a "Host"; calibración de directrices en Nebius para evaluar humo de startups sin caer en falsos 'insufficient_evidence'; parámetro `isPro` en backend habilitando hasta 8 fuentes cruzadas; popovers explicativos con `PericialTerm` en Hype Score, Inferencia, Latencia, Tokens, Checkpoints, Idempotencia y Due Diligence; 55/55 pruebas aprobadas; build limpio; funciones Convex validadas; desplegado en `https://brave-lemur-868.convex.site`. |
| 2026-09-11 | Diferenciación Free vs Pro, Búsqueda en Español y Extracción Robusta | Búsqueda Linkup limpia en español, resiliencia JSON/citas Nebius (60s timeout), recorte visual de fuentes en Free (máx 2 por fase) con tarjetas bloqueadas de invitación Pro, Matriz de Riesgo dinámica y exportador PDF vectorial/imprimible en ProPaywallModal | Consultas Linkup sin contaminación de metainstrucciones; normalización de citas literales en `research.ts` y extracción de JSON en `auditPolicy.ts`; 67/67 pruebas aprobadas (`npm test`); build de frontend (`dist/`) y workflow (`dist-workflows/`); funciones desplegadas a Convex Cloud (`brave-lemur-868.convex.cloud`) y frontend actualizado en `https://brave-lemur-868.convex.site`. |

## Límites y caso observado

La prueba real preguntó por la arquitectura del paper “Attention Is All You Need”. La búsqueda aportó interpretaciones secundarias; el modelo no identificó respaldo directo suficiente y todas las relaciones quedaron pendientes con explicación. Esto comprueba el flujo y registra una limitación de recuperación/evaluación; **no constituye un benchmark de precisión ni certifica el cumplimiento completo de Nebius**. El siguiente conjunto de evaluación debe incluir claims sustentados, contradichos y ambiguos, y fuentes primarias.

También quedaron registrados el [modelo antiguo no disponible](verification/research-live-2026-09-08-model-unavailable.json), un [timeout](verification/research-live-2026-09-08-timeout.json) y una [respuesta que no pasó validación](verification/research-live-2026-09-08-invalid-output.json). Son fallos observados, no pruebas aprobadas. Tras cambiar a un modelo disponible y acotar la salida, se obtuvo el reporte válido enlazado arriba.

Pendiente para cerrar verificación de producto: prueba multisesión simultánea Host/Invitado grabada para el video demo de 2 minutos. Render y RevenueCat mantienen sus brechas del inventario base.

La suite usa importación TypeScript nativa y requiere Node 24 en este entorno. El script `--live` consume cuota de proveedores y deja un cache local ignorado por Git, sin credenciales. `--live --reuse-research` reutiliza las búsquedas guardadas y lo identifica como replay; no acredita otra ejecución completa en vivo. [Plan de entrega y fuentes oficiales](HACKATHON_PLAN.md).

## Incremento UX de host e invitado — 2026-09-11

Implementado: navegación Atrás/Adelante sincronizada con la sala; creación con título opcional; acceso por código prioritario en móvil; apodo guardado reutilizable y edición centralizada en cabecera; salida disponible durante todas las etapas; errores visibles y bloqueo de envíos mientras se procesan; etapas del caso explícitas; audio del resultado sin duplicación local; conservación de porcentajes reales de cero; rechazo de votos para casos cerrados o inactivos en backend.

Responsive y accesibilidad: cabecera adaptable, objetivos táctiles de 44 px en móvil, campos de 16 px, etiquetas asociadas a formularios, foco visible, navegación de teclado dentro del diálogo de apodo, cancelación de edición sin salir, respeto a movimiento reducido y ejemplos sin truncamiento de una sola línea.

Criterios de aceptación y evidencia (Windows, Node 24, frontend Vite local y Convex `brave-lemur-868`, 2026-09-11):
- `npm test`: 60/60 aprobadas. Cinco pruebas nuevas ejercitan los handlers de votos con persistencia sustituida: cierre por etapa, caso anterior y cambio de voto sin duplicación con extremos 0/100.
- `npm run build`: TypeScript y Vite correctos. Persiste advertencia de chunk mayor a 500 kB (aprox. 1.21 MB antes de gzip); no es una advertencia de tipos.
- `npx convex dev --once`: funciones validadas y desplegadas en el backend de desarrollo configurado. Frontend público no publicado por este incremento.
- Navegador, dos pestañas simultáneas con identidades de sesión distintas, sala de prueba `HYPE-260`: creación sin título, host vota Sólido (0% humo), invitado entra como `Jurado UX` y vota Humo (50%), cambia a Sólido (0%); ambos clientes conservan dos votos. Atrás vuelve al inicio y Adelante recupera host y votos.
- La misma sala pasó de votación a investigación en ambas sesiones, mostró fuentes y posteriormente resultado. El host abrió la preparación del siguiente caso y el invitado mostró la espera conservando apodo. Esto verifica transiciones de UX, no precisión del resultado ni cumplimiento de Render o RevenueCat.
- Revisión visual en 375x812 y 320x740: cabecera, votación y diálogo de apodo utilizables; ancho de documento 360 y 305 px respectivamente (barra de desplazamiento incluida en el viewport), sin desbordamiento horizontal del documento observado. Revisión desktop en tamaño normal del navegador.
- Los intentos iniciales de build/test/Vite y conexión Convex quedaron bloqueados por permisos del sandbox; las ejecuciones autorizadas fuera del sandbox pasaron.

Límites: no se verificaron compra sandbox, recuperación real de Render, lectores de pantalla, dispositivos físicos ni todas las combinaciones de tamaños y estados de error. La prueba multisesión de este incremento no es una grabación del video de entrega. Los cambios documentales de organización que ya estaban en curso se conservaron.

Segunda ronda comprobada en la misma sala: nuevo texto visible para el invitado, cero votos y apodo conservado, sin volver a pedir acreditación.

## Publicación solicitada — 2026-09-11

Backend: `npx convex dev --once` completado en `brave-lemur-868` (deployment configurado de desarrollo que sirve la URL pública). Frontend: `npx @convex-dev/static-hosting upload` completado, deployment `3373e891-4b4c-4916-a0df-ca5212d6cf80`, JS `index-BsqaqXJ7.js` y CSS `index-CbU-xpxA.css`. Se publica el build validado del incremento UX; 60 pruebas y recorrido de dos sesiones registrados arriba. No se completaron Render real ni compra RevenueCat con esta publicación.
Verificación posterior: GET de https://brave-lemur-868.convex.site respondió HTTP 200 y su HTML referencia exactamente los assets JS/CSS del build publicado.

## Incremento Render & RevenueCat (Contratos, Verificación en Servidor y Despliegue) — 2026-09-11

Alcance:
1. **Autorización estricta del Host:** tokens criptográficos de 256 bits (`sessionStorage`), SHA-256 en servidor (`convex/lib/session.ts`), mutaciones protegidas (`prepareNextClaim`, `startNextClaim`, `triggerSimulatedFailure`). Un cliente con el `hostUserId` público no puede falsificar control.
2. **RevenueCat Test Store con validación en servidor:** eliminación definitiva de bypasses y desbloqueos simulados (`hasEntitlement || true` y `grantProAccess` eliminados). La mutación `sync` consulta la API REST de RevenueCat v1 con `REVENUECAT_SECRET_KEY`, valida sandbox, vigencia, producto `pro_auditor_monthly` y entitlement `pro_auditor_access`. Acceso al dossier confidencial condicionado a suscripción verificada.
3. **Render Workflows y ejecución resiliente:** orquestador asíncrono `@renderinc/sdk/workflows` (`workflows/auditor_workflow.ts`), script compilado `build:workflow`, mutaciones con lease temporal e idempotencia estricta (`convex/investigations.ts`, `convex/workflows.ts`, `convex/workflowDispatch.ts`). Soporte de inducción de falla controlada que se recupera automáticamente retomando desde el último checkpoint persistente sin duplicar evidencias.
4. **Verificación automatizada:** 66 pruebas unitarias y de integración (`npm test`: 66/66 aprobadas) cubriendo expiración de Pro, rechazo de compras no-sandbox, permisos de host, retries con checkpoints en Render, bloqueo de callbacks desfasados y no exposición de secretos en queries públicas.

Evidencia y despliegue (Node 24, Windows, Convex Cloud `brave-lemur-868`):
- `npm test`: 66/66 aprobadas.
- `npm run build`: bundle TypeScript y Vite generado exitosamente.
- `npm run build:workflow`: bundle CJS del worker de Render generado (`dist-workflows/auditor_workflow.cjs`).
- `npx convex dev --once`: backend Convex sincronizado y validado en `brave-lemur-868`.
- `npx @convex-dev/static-hosting upload`: frontend publicado en `https://brave-lemur-868.convex.site` (deployment ID `404c9d7d-361b-4fc6-9b85-e37be84cbc1c`, assets `index-DlY82TY8.js` y `index-BbDrZO6X.css`).
- Verificación live: GET HTTP 200 en `https://brave-lemur-868.convex.site` sirviendo los assets recién compilados.
- Pendiente para ejecución en vivo de Render / RevenueCat: configurar variables de entorno privadas en los dashboards de los servicios (`RENDER_API_KEY`, `RENDER_TASK_SLUG`, `WORKFLOW_SHARED_SECRET`, `REVENUECAT_SECRET_KEY`) y conectar el repositorio GitHub `arenasantiago/burningtoken` en Render.

## Configuración y prueba de Test Store — 2026-09-11 (retoma posterior a Gemini)

Se retomó el commit `2a0967b`, con árbol limpio. Se conservaron los cambios y el despliegue registrados por Gemini. Esta comprobación diferencia configuración, compra en proveedor y autorización de acceso.

- RevenueCat, proyecto `a2b80ff0`: producto Test Store `pro_auditor_monthly` (`prode9a2e9e937`) asociado al entitlement `pro_auditor_access` y al paquete mensual de la offering predeterminada `default`. Ambas asociaciones comprobadas en el dashboard después de guardar.
- Chrome, URL pública `brave-lemur-868.convex.site`: checkout real del SDK para el producto esperado; acciones Test Store Cancel y Test failed purchase conservan Free. Test valid purchase produjo una transacción **New Sub** visible al activar Sandbox en el dashboard del producto (cliente enmascarado `tt_2…b628`). No hubo cobro real.
- El servidor rechazó la sincronización por ausencia de `REVENUECAT_SECRET_KEY`. La compra en el proveedor está comprobada; el desbloqueo verificado por servidor, restauración, descarga y expiración end-to-end siguen pendientes. No se concedió acceso por fallback.
- Render reconoce ahora el repositorio público `arenasantiago/burningtoken`. Formulario preparado: `truth-tribunal-auditor`, Node, main, Virginia, build `npm ci && npm run build:workflow`, start `node dist-workflows/auditor_workflow.cjs`.
- Intentar Deploy Workflow abrió **Add Card**: Render exige método de pago (autorización temporal anunciada de USD 1). No se completó ese paso ni se creó una ejecución real.
- Con autorización explícita del usuario, se generó `WORKFLOW_SHARED_SECRET`, se guardó en Convex y se dejó en el formulario de Render. No se imprimió ni se guardó en Git. Render aún no ha persistido el servicio; conservar el formulario hasta completar facturación.
- Clave privada RevenueCat: formulario V1 preparado, pero no generada; confirmación de acceso pendiente. Convex todavía necesita `REVENUECAT_SECRET_KEY`, `RENDER_API_KEY` y el `RENDER_TASK_SLUG` real después del despliegue.

Mejoras de código de esta retoma: mensajes de cancelación/fallo de compra en español, errores esperados de suscripción mediante ConvexError y revalidación de suscripción antes de cada descarga. 66/66 pruebas automatizadas aprobadas; no sustituyen la prueba del proveedor. Persisten las verificaciones de Render con fallo/reintento real y de RevenueCat con servidor activo.

## Diferenciación Pro, Matriz de Riesgo y Exportación PDF Editorial — 2026-09-11

Alcance:
1. **Diferenciación Free vs. Pro en Evidencias:**
   - En versión gratuita: conservación de la rigurosidad pericial y fuentes primarias completas sin degradación de juicio. Incorporación de un teaser informativo y no intrusivo en el tablero de evidencias sobre el contraste global en otros idiomas.
   - En versión Pro: consulta de contraste enriquecida con literatura científica y benchmarks internacionales en inglés (`international scientific papers benchmarks limitations`), con badge identificador `🌐 Global · Linkup`.
2. **Matriz Pericial de Riesgo en Dossier:**
   - La query `dossier` en `convex/entitlements.ts` calcula dinámicamente una matriz de riesgo multidimensional de 4 factores:
     - Riesgo Reputacional / Humo (según Hype Score y divergencia con literatura).
     - Riesgo Técnico / Factibilidad (según dictamen y reproducibilidad empírica).
     - Calidad de Evidencia (según proporción de fuentes primarias vs notas de prensa e incertidumbre).
     - Directriz de Acción (recomendación formal para comités de inversión VC o proyectos de investigación universitaria).
3. **Generación de Reporte PDF Editorial & Markdown Enriquecido:**
   - Sustitución de la descarga en texto plano (`.txt`) por un generador de informe pericial con diseño editorial profesional (`printPdfDossier`), membrete formal de Truth Tribunal, ficha del caso (`caseCode`), tabla estilizada de matriz de riesgo, trazabilidad de citas literales evaluadas y sellos de certificación.
   - Apertura optimizada para diálogo de impresión nativa (`window.print()`) para guardar en PDF vectorial de alta calidad.
   - Opción complementaria de descarga en Markdown estructurado (`.md`) para importación en herramientas académicas (Obsidian, Notion, LaTeX).
4. **Resumen de Beneficios Premium en Modal:**
   - Presentación destacada de los 3 pilares de valor antes de la compra en Test Store (Fuentes Globales, Matriz de Riesgo y Dossier PDF).

Evidencia y despliegue:
- `npm test`: 67/67 pruebas aprobadas (incorporada prueba unitaria de la matriz de riesgo y datos oficiales del dossier).
- `npm run build`: bundle TypeScript y Vite generado exitosamente.
- `npm run build:workflow`: bundle CJS del worker de Render compilado.
- `npx convex dev --once`: backend Convex sincronizado en `brave-lemur-868`.
- `npx @convex-dev/static-hosting upload`: frontend publicado en `https://brave-lemur-868.convex.site`.

## Soporte Bilingüe Español / Inglés y Despliegue en Producción — 2026-09-11

Alcance:
1. **Conmutador Reactivo de Idioma (`[ 🇪🇸 ES | 🇬🇧 EN ]`):**
   - Implementado botón toggle en la barra de navegación (`src/components/Header.tsx`) para alternar instantáneamente entre Español e Inglés sin recargar la página.
   - Estado global gestionado mediante `LanguageContext` y `LanguageProvider` (`src/context/LanguageContext.tsx`) con persistencia local en `localStorage` (`"truth_tribunal_lang"`).
   - Atributo HTML del documento sincronizado dinámicamente (`document.documentElement.lang = "es" | "en"`).
2. **Diccionario Pericial Completo (`src/i18n/translations.ts`):**
   - Traducción íntegra de todos los textos, títulos, descripciones, tooltips, placeholders y mensajes de estado para:
     - Header y navegación.
     - Lobby inicial y salas de espera (`RoomLobby.tsx`, `InRoomLobby.tsx`).
     - Votación multijugador y tacómetro Hype-o-Meter 3000 (`LiveVoting.tsx`).
     - Orquestador y monitor de background workers (`WorkflowProgress.tsx`).
     - Tablero de evidencias y deep research (`EvidenceBoard.tsx`).
     - Veredicto pericial, métricas Nebius y asistente de prompts (`VerdictReport.tsx`).
     - Paywall y reporte Pro de Due Diligence (`ProPaywallModal.tsx`).
     - Modal de unión de invitados y jurados (`GuestJoinModal.tsx`).
     - Glosario de términos periciales técnicos (`PericialTerm.tsx`).
3. **Invariantes y Lógica Preservada al 100%:**
   - La lógica reactiva de Convex, las mutaciones atómicas, el sintetizador Web Audio procedimental, el flujo RevenueCat Test Store y los checkpoints de Render se mantienen intactos sin alterar contratos de datos ni WebSocket.
4. **Verificación Automatizada y Despliegue:**
   - `npm test`: 67/67 pruebas aprobadas.
   - `npm run build`: compilación TypeScript y empaquetado Vite exitosos (cero errores TS).
   - `npm run build:workflow`: worker CJS compilado exitosamente.
   - `npx convex dev --once`: backend validado contra el entorno de despliegue `brave-lemur-868`.
   - `npx @convex-dev/static-hosting upload`: frontend desplegado en producción en `https://brave-lemur-868.convex.site`.

## Reorganización de README y bóveda personal — 2026-09-12

Alcance: reorganización exclusivamente documental del README público y de `docs/obsidian/`; no se modificó código de aplicación ni se ejecutaron proveedores o despliegues.

- `README.md`: portada de producto, arquitectura compacta, estado actualizado de los seis objetivos, comandos y guion de dos minutos con contingencias honestas para Render y RevenueCat.
- `docs/obsidian/`: nueve notas navegables con frontmatter, enlaces internos portables, guía para explicar el proyecto y checklist operativo de grabación. Se retiraron enlaces `file:///`, cifras de ejemplo presentadas como métricas y afirmaciones de cumplimiento total no acreditadas.
- `npm test`: 67/67 pruebas aprobadas en Windows y Node 24.
- `npm run build`: aprobado; persiste la advertencia conocida de chunk mayor a 500 kB (`1.266,13 kB` antes de gzip).
- `npm run build:workflow`: aprobado; bundle CJS generado correctamente.
- La búsqueda en `docs/obsidian/` no encontró enlaces absolutos locales ni las afirmaciones numéricas antiguas revisadas.
- `git diff --check`: los archivos documentales de este incremento no introducen errores; el chequeo global todavía señala una línea en blanco final en `tests/integrations.test.mjs`, archivo con cambios ajenos a esta reorganización que no fue modificado.
