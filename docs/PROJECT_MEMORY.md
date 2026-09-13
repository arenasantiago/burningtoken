# Memoria del proyecto — Truth Tribunal

Actualizada: **2026-09-12 (tarde, sprint en curso, árbol local sin commit)**. Contexto persistente dentro del repositorio para retomar el trabajo; contrastar siempre con el código y el registro de comprobaciones.
Plan de cierre vigente: `docs/FINAL_PUSH_PLAN.md` (propuesta del 2026-09-11, no es evidencia de ejecución). Contrato del sprint: sección de abajo en este mismo archivo. Estado verificado: `docs/IMPLEMENTATION_STATUS.md` (pendiente de actualizar al cerrar).

## Producto y dirección

Truth Tribunal convierte la revisión de afirmaciones exageradas de IA, startups y redes sociales en un tribunal multijugador. El público vota LEGIT/SMOKE; dos búsquedas de Linkup y una evaluación de Nebius contrastan la afirmación. La opinión del jurado y la evidencia tienen papeles distintos. La incertidumbre y la abstención son resultados válidos.

La experiencia incluye salas continuas, apodos, asistencia para reformular claims, un medidor de hype y audio procedural. Pro explora un dossier de due diligence, con implementación todavía demostrativa. La prioridad inmediata es una demo convincente y verificable para Burning Token 2026, preservando los seis objetivos de sponsors.

## Contexto del usuario

- El usuario pidió actualizar esta memoria y presentar la idea con un README cuidado y claro, en español.
- Quiere una valoración honesta sobre las posibilidades de ganar. No se dispone de información suficiente sobre competidores ni decisiones del jurado para asignar probabilidades.
- La fortaleza del proyecto es combinar participación, investigación trazable y una identidad lúdica. La prioridad para competir es demostrar la ejecución y cerrar brechas antes de ampliar el alcance.

## Estado al retomar

- Leer [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md), incluidas las correcciones del 11 de septiembre. Las pruebas y despliegues anteriores son evidencia histórica, no una nueva comprobación de producción.
- Investigación: dos fases implementadas; prueba real Linkup/Nebius registrada el 8 de septiembre. Tokens y latencia con origen definido; costo y confianza aún no disponibles.
- Convex: creación atómica, estado reactivo, continuidad de sala y hosting. Recorrido simultáneo Host/Invitado verificado el 11/09; frontend UX publicado. Falta grabación de entrega.
- Render: worker SDK y despacho desde Convex implementados en `2a0967b`, con leases y checkpoints. El repositorio ya es accesible; crear Workflow está bloqueado por Add Card. Secreto compartido autorizado y guardado en Convex; servicio y ejecución real pendientes.
- RevenueCat: bypasses eliminados y verificación servidor implementada. Producto, entitlement y offering asociados; compra válida sandbox visible en el dashboard, cancelación y fallo mantienen Free. Falta clave privada autorizada en Convex para comprobar desbloqueo, restauración, dossier y expiración end-to-end.
- `npm run deploy` publica sólo el frontend. Backend: `npx convex dev --once` sobre el deployment configurado.

## Sprint final de estabilización — contrato aprobado

Estado de esta sección: **objetivo de implementación**, todavía no es evidencia de ejecución. Al cerrar el sprint, cada punto debe trasladarse a [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) con su comprobación real.

- La release final debe ser reproducible desde un commit limpio e incluir el contexto y diccionario de idioma que actualmente existen sólo en el árbol local.
- Render será la ruta principal cuando el backend tenga configuración completa. Si Render no está disponible, el host podrá iniciar una ruta directa en Convex claramente identificada como continuidad sin Render; esa ruta demuestra Linkup/Nebius, no el reto Render.
- Los códigos de sala tendrán un espacio mayor y se comprobará su disponibilidad antes de insertar, preservando la creación atómica de sala y claim.
- Claims, títulos, apodos, IDs y acciones con consumo de IA tendrán validación y límites server-side acordes con una demo pública.
- La evidencia reservada a Pro no se enviará completa a un cliente Free. El backend aplicará la proyección según entitlement y conservará visibles las citas necesarias para explicar el resultado principal.
- El dossier reutilizará la política de resultado del tribunal: una auditoría insuficiente, fallida o fuera de alcance será no evaluable, sin riesgos por defecto ni lenguaje de certificación.
- Nebius no convertirá ausencia de validación en falsedad. Un veredicto acusatorio requerirá contradicción trazable; costo sólo se calculará con tarifa versionada y confianza permanecerá no disponible hasta contar con metodología calibrada.
- Los fallos transitorios de proveedores no contarán como checkpoints reales por contener tarjetas Demo y deberán poder reintentarse sin duplicar registros.
- El monitor del workflow representará checkpoints reales y distinguirá ruta Render de continuidad Convex. El audio reutilizará un único `AudioContext` y la aplicación mostrará una pantalla independiente si Convex no está configurado.
- El cierre exige pruebas automatizadas, build frontend, build del workflow, validación Convex, recorrido Host/Invitado sobre la release publicada y evidencia end-to-end separada para Render y RevenueCat.

## Sprint 2026-09-12 — avance real (código en árbol local, NO commiteado, NO verificado en producción)

Checklist binaria del contrato (Cumplido = código presente en árbol local + pruebas locales; Pendiente = falta código o verificación externa):

1. Release reproducible desde commit limpio + incluir `src/context/` y `src/i18n/`: **Pendiente**. Árbol sucio con ~32 archivos modificados y 4 rutas nuevas sin commit (`convex/aiLimits.ts`, `convex/lib/inputValidation.ts`, `src/context/`, `src/i18n/`). `IMPLEMENTATION_STATUS.md` aún no registra este sprint.
2. Render principal + fallback directo Convex identificado: **Cumplido en código, pendiente verificación externa**. `workflows.launch` elige `executionRoute` según env, `investigations.enqueue` persiste `render`/`convex_direct`, nuevo `workflows.runDirect` + `investigations.activateDirectFallback` con rotación de `executionToken`, `workflowDispatch` deriva a continuidad local con mensaje explícito "no acredita Render". UI distingue ruta.
3. Códigos de sala ampliados + prevalidados, atómicos: **Cumplido en código**. `HYPE-` + 6 caracteres (`A-HJ-NP-Z2-9`), `availableRoomCode` con 12 intentos, `createWithClaim`/`create` atómicos.
4. Validación/límites server-side claims, títulos, apodos, IDs, IA: **Pendiente (parcial)**. Nuevo `convex/lib/inputValidation.ts` + `convex/aiLimits.ts` (cuota 5/min para `suggestAuditableClaims`, que ahora exige `sessionToken`). Aplicado en `rooms`, `claims`, `actions`, `claimSuggestions`. Brecha abierta: `convex/votes.ts` sigue aceptando `voterId`/`voterName` del cliente (sólo formato + longitud), sin derivar identidad de `sessionToken` ni reservar "Host" en backend.
5. Proyección backend Free vs Pro de evidencia: **Cumplido en código**. Nueva `evidence.listFullByInvestigation` interna + `evidence.listByInvestigation` pública con `token`, proyección Free máx. 2 por fase con priorización de citas trazables + `totalByStep` como teaser agregado. `App.tsx`/`EvidenceBoard.tsx` consumen `{items, totalByStep, accessLevel}`.
6. Dossier no evaluable + autorización por caso: **Cumplido en código**. `entitlements.dossier` exige `token` + `sessionToken`, `requireHost`, coherencia `claim.roomId`, flag `evaluable` (`completionReason==="assessed"` + hype + verdict), riesgos "No evaluable" y recomendación de abstención si no evaluable. Markdown/HTML saneados, sin lenguaje de certificación.
7. Política Nebius (ausencia ≠ falsedad, contradicción trazable, sin costo/confianza inventados): **Cumplido en código**. Nuevo `enforceTraceableVerdict` (CERTIFIED_SMOKE exige `contradicts` + quote ≥20), prompt exige contradicción directa, `summary` truncado a 500, métricas sólo `provider`/`unavailable`.
8. Fallos transitorios no son checkpoints + reintento sin duplicar: **Cumplido en código**. Etapas `initial`/`contrast`/`synthesis` lanzan error si la etapa quedó en `demo`; reuso sólo de filas `source==="linkup"`; deduplicación persistente conservada.
9. Monitor con checkpoints reales + ruta visible; audio un único `AudioContext`; pantalla sin Convex: **Cumplido en código**. `WorkflowProgress` usa `completedCheckpoints` + `executionRoute`, oculta botón de falla en ruta directa, muestra aviso de continuidad. `useAudioTribunal` reutiliza un `AudioContext` compartido. `main.tsx` muestra pantalla dedicada si falta `VITE_CONVEX_URL`.
10. Cierre con verificación completa: **Pendiente**. Local 2026-09-12: `npm test` 67/67, `npm run build` OK (aviso chunk ~1.268 MB), `npm run build:workflow` OK, `npx tsc --noEmit -p convex/tsconfig.json` OK, `npx convex codegen` OK. Falta: `npx convex dev --once`, recorrido Host/Invitado sobre release publicada, evidencia Render real (bloqueado por Add Card), RevenueCat end-to-end con `REVENUECAT_SECRET_KEY`, video y registro en `IMPLEMENTATION_STATUS.md`.

Comprobaciones de hoy (locales, no producción): suite 67/67; builds frontend/workflow/Convex OK. Sin ejecuciones Linkup/Nebius reales nuevas, sin Render real, sin compra sandbox nueva.

## Prioridades

1. Estabilizar y congelar una release reproducible; no abrir features nuevas.
2. Garantizar que Linkup/Nebius sigan siendo demostrables aunque Render no esté configurado, sin atribuir esa continuidad al sponsor.
3. Cerrar los contratos locales de salas, autorización Pro, abstención, workflow y dossier.
4. Verificar recuperación real en Render Workflows y compra/fracaso/expiración de RevenueCat cuando estén disponibles los accesos externos.
5. Probar claims sustentados, contradichos y ambiguos; repetir y grabar el flujo completo con dos participantes.
6. Congelar la demo, grabar hasta dos minutos y completar la entrega. Consultar [HACKATHON_PLAN.md](HACKATHON_PLAN.md) para la discrepancia de fechas; no asumir que está resuelta.

## Invariantes

Preservar AGENTS.md: sala/claim atómicos, audio sin archivos externos, fallbacks identificados, secretos fuera de Git y evidencia fechada para cada incremento. No convertir aspiraciones en capacidades verificadas. Bots, extensión, tokens y agentes adversariales pertenecen al roadmap.
