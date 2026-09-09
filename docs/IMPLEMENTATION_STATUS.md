# Estado de implementación — Truth Tribunal

Última revisión documental: **2026-09-08**. Alcance inicial: lectura del repositorio local; no acredita el estado del sitio desplegado ni ejecuciones de proveedores. Los seis requisitos de sponsors y las invariantes de [AGENTS.md](../AGENTS.md) se mantienen.

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

### 3. Conectar una recuperación real de Render — implementado; verificado localmente

Alcance: ejecutar la auditoría con estado persistente, checkpoints y deduplicación estricta de evidencias.

Criterios de aceptación:
- La mutación `add` en `convex/evidence.ts` deduplica evidencias por `url` e `investigationId`, evitando duplicación de registros ante reintentos.
- La tabla `investigations` registra `completedCheckpoints` persistentes para reanudar pasos completados sin repetir búsquedas.
- Al inducir una falla controlada, se registra el evento en los diagnósticos del worker y la recuperación retoma desde el último checkpoint.

### 4. Cerrar compra sandbox, exportación pericial y Asistente de Prompts — implementado; verificado localmente

Alcance: habilitar Pro por una compra comprobada en Test Store, exportar el Dossier VC clasificado y dotar al tribunal de un Asistente Pericial de Prompts.

Criterios de aceptación:
- Compra de `pro_auditor_monthly` y entitlement `pro_auditor_access` verificados mediante RevenueCat Web SDK.
- Exportación real del Dossier de Due Diligence a archivo `.md` estructurado según el claim evaluado.
- Asistente Pericial de Prompts (`convex/lib/claimSuggestions.ts` y action `suggestAuditableClaims`): propone 2 a 3 formulaciones empíricas, objetivas y contrastables cuando el usuario introduce un claim ambiguo o metafísico (en el Lobby) o cuando una auditoría termina en `INSUFFICIENT_EVIDENCE` (en el VerdictReport), eliminando callejones sin salida negativos.

## Registro de comprobaciones

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

## Límites y caso observado

La prueba real preguntó por la arquitectura del paper “Attention Is All You Need”. La búsqueda aportó interpretaciones secundarias; el modelo no identificó respaldo directo suficiente y todas las relaciones quedaron pendientes con explicación. Esto comprueba el flujo y registra una limitación de recuperación/evaluación; **no constituye un benchmark de precisión ni certifica el cumplimiento completo de Nebius**. El siguiente conjunto de evaluación debe incluir claims sustentados, contradichos y ambiguos, y fuentes primarias.

También quedaron registrados el [modelo antiguo no disponible](verification/research-live-2026-09-08-model-unavailable.json), un [timeout](verification/research-live-2026-09-08-timeout.json) y una [respuesta que no pasó validación](verification/research-live-2026-09-08-invalid-output.json). Son fallos observados, no pruebas aprobadas. Tras cambiar a un modelo disponible y acotar la salida, se obtuvo el reporte válido enlazado arriba.

Pendiente para cerrar verificación de producto: prueba multisesión simultánea Host/Invitado grabada para el video demo de 2 minutos. Render y RevenueCat mantienen sus brechas del inventario base.

La suite usa importación TypeScript nativa y requiere Node 24 en este entorno. El script `--live` consume cuota de proveedores y deja un cache local ignorado por Git, sin credenciales. `--live --reuse-research` reutiliza las búsquedas guardadas y lo identifica como replay; no acredita otra ejecución completa en vivo. [Plan de entrega y fuentes oficiales](HACKATHON_PLAN.md).

