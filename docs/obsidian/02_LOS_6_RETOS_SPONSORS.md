---
tags:
  - sponsors
  - hackathon
  - verificacion
updated: 2026-09-12
---

# 02 · Los Seis Retos Sponsors

Volver a [[00_INDICE_TRUTH_TRIBUNAL|Índice]].

> [!IMPORTANT]
> Esta nota responde cuatro preguntas por sponsor: qué pide, dónde está, qué se comprobó y qué falta. La referencia auditable es `docs/IMPLEMENTATION_STATUS.md`.

## Matriz Ejecutiva

| Sponsor | Requisito central | Situación actual | Prueba que debe verse |
|---|---|---|---|
| Convex | Multiplayer reactivo y hosting en `convex.site`. | Implementado y verificado. | Dos navegadores cambian juntos. |
| Linkup | Investigación iterativa en dos fases. | Implementada; proveedores verificados. | Brecha inicial → nueva consulta → fuente. |
| Nebius | Inferencia aplicada, métricas y caso límite. | Implementada; ejecución real registrada. | Cita, tokens, latencia y limitación. |
| Render | Workflow resiliente con fallo y reintento. | Código y pruebas listos; servicio real pendiente. | Run real, error, retry y cero duplicados. |
| RevenueCat | Test Store y entitlement Pro. | Compra cliente observada; cierre server-side pendiente. | Free → compra sandbox → Pro validado. |
| NERDCONF | Experiencia original y divertida. | Implementada; interacción multisesión comprobada. | Votos, tacómetro, audio y reacción. |

## 1. Convex · Multiplayer

**Qué pide:** estado compartido en tiempo real y frontend alojado oficialmente en Convex Static Hosting.

**Código clave:**

- `convex/rooms.ts`: sala y claim atómicos, transición de casos.
- `convex/votes.ts`: voto por participante y conteos.
- `convex/sessions.ts` y `convex/lib/session.ts`: identidad ligera y autorización del host.
- `convex/convex.config.ts`: static hosting.

**Comprobado:** dos sesiones distintas crearon/se unieron, votaron, cambiaron voto, avanzaron a investigación, recibieron resultado y conservaron la sala para otro caso. La URL pública respondió con los assets desplegados.

**Para el video:** mostrar dos vistas legibles y un cambio reactivo. No basta enseñar el código.

## 2. Linkup · Deep Research

**Qué pide:** búsqueda profunda e iterativa, donde los primeros hallazgos determinan el siguiente paso.

**Código clave:**

- `convex/actions.ts`: llamadas privadas a Linkup.
- `convex/lib/research.ts`: plan de brechas, URLs y citas.
- `src/components/EvidenceBoard.tsx`: fase, procedencia, incertidumbre y relación.

**Comprobado:** una ejecución real del 08/09 obtuvo respuestas HTTP 200 en ambas búsquedas y ocho fuentes. La segunda consulta se construye a partir de cobertura faltante y evita repetir dominios/URLs.

**Límite:** las heurísticas de brechas no demuestran exhaustividad. Un fallback se etiqueta y no verifica el claim.

## 3. Nebius · Applied AI

**Qué pide:** Token Factory dentro del flujo principal, métricas cuantitativas y un caso difícil explícito.

**Código clave:**

- `convex/actions.ts`: llamada OpenAI-compatible y medición.
- `convex/lib/auditPolicy.ts`: contrato del resultado y política de abstención.
- `convex/lib/research.ts`: validación de citas.
- `src/components/VerdictReport.tsx`: resultado, métricas y límites.

**Comprobado:** ejecución real con modelo configurable, 3.792 tokens de entrada, 894 de salida y 18.306 ms de latencia en la petición registrada. El resultado fue `INSUFFICIENT_EVIDENCE`, un caso válido de abstención.

**Límite:** costo y confianza no tienen medición sustentada actualmente; deben verse como no disponibles, no como números de ejemplo.

## 4. Render · Workflows

**Qué pide:** ejecución desacoplada, fallo controlado real, recuperación y ausencia de efectos duplicados.

**Código clave:**

- `workflows/auditor_workflow.ts`: tarea basada en `@renderinc/sdk/workflows`.
- `convex/workflowDispatch.ts`: despacho privado.
- `convex/workflows.ts`: callbacks autenticados y leases.
- `convex/investigations.ts`: checkpoints y estado.
- `convex/evidence.ts`: deduplicación persistente.

**Implementado:** run idempotente, lease, checkpoints, fallo consumible una vez, reintento y bloqueo de callbacks obsoletos. Las pruebas automatizadas cubren esos contratos.

**Pendiente:** crear/activar el workflow real en Render y registrar logs de una ejecución con fallo. El bloqueo observado es el paso de facturación/Add Card. No presentar el botón como prueba de Render hasta tener ese run.

## 5. RevenueCat · Subscriptions

**Qué pide:** compra web mediante Test Store, producto `pro_auditor_monthly` y entitlement `pro_auditor_access`.

**Código clave:**

- `src/hooks/useRevenueCat.ts`: SDK, offering, compra y sincronización.
- `convex/entitlements.ts`: consulta privada y validación del acceso.
- `src/components/ProPaywallModal.tsx`: compra, dossier y exportación.

**Comprobado:** producto, entitlement y offering asociados en el dashboard. Compra válida visible como `New Sub`; cancelar o seleccionar compra fallida conserva Free. Los bypasses fueron eliminados.

**Pendiente:** configurar `REVENUECAT_SECRET_KEY` en Convex y comprobar desbloqueo, restauración, exportación y expiración con el mismo cliente.

## 6. NERDCONF · Fun Build

**Qué pide:** una experiencia funcional, original y divertida.

**Código clave:**

- `src/hooks/useAudioTribunal.ts`: audio generado con Web Audio API.
- `src/components/LiveVoting.tsx`: votos, Hype-o-Meter y feed.
- `src/components/VerdictReport.tsx`: cierre visual y confetti.

**Comprobado:** recorrido multisesión, medidor reactivo y audio procedural sin archivos `.mp3`/`.wav`.

**Para el video:** habilitar audio mediante un gesto, usar una sola reacción corta y mantener legible la evolución del medidor.

## Frases Que Sí Puedo Defender

- “Implementamos los seis objetivos en el producto.”
- “Convex, Linkup, Nebius y la experiencia multijugador tienen comprobaciones registradas.”
- “Render está preparado en código, pero su ejecución real sigue pendiente.”
- “RevenueCat procesó una compra Test Store; falta cerrar la autorización server-side end-to-end.”

## Frases Que No Debo Usar Todavía

- “Los seis retos están verificados al 100 %.”
- “Render ya recuperó una ejecución real” sin run ID y logs.
- “RevenueCat desbloqueó el dossier desde servidor” sin la prueba posterior a configurar la clave privada.
- “Nebius tiene 88 % de confianza” o un costo concreto si la UI no posee una medición real.

Siguiente: [[03_INTERFAZ_Y_SIGNIFICADO_DE_RESULTADOS|Interfaz y significado de resultados]].
