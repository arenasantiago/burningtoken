# ⚖️ Truth Tribunal: The Bullshit & Hype Auditor
> **NERDCONF Hackathon — Burning Token 2026**  
> *"Build → Ship → Prove"* en 7 días.  
> 🌐 **Live Public App:** [https://brave-lemur-868.convex.site](https://brave-lemur-868.convex.site)

Truth Tribunal es una plataforma colaborativa y multijugador en tiempo real donde los usuarios someten afirmaciones grandilocuentes (posts virales de LinkedIn/Twitter, pitches exagerados de startups y promesas de IA o cripto) al juicio de un escuadrón de agentes autónomos que contrastan datos duros con búsqueda web iterativa y razonamiento pericial.

---

## 🏆 Cobertura de los 6 Retos Patrocinados

| Patrocinador | Reto | Implementación Técnica & Criterio de Demostración |
|---|---|---|
| **Convex** | Multiplayer ($500 USD) | React + Vite con estado compartido reactivo. Votación y resultados sincronizados entre 2 pestañas/navegadores simultáneos. **Despliegue estático oficial en `convex.site`** usando `@convex-dev/static-hosting`. |
| **Linkup** | Deep Research ($500 USD) | Búsqueda iterativa en dos fases: Fase 1 (hechos iniciales y benchmarks) + Fase 2 (evaluación de brechas, búsqueda de contraste y contradicciones con citas web y nivel de incertidumbre LOW/MEDIUM/HIGH). |
| **Nebius** | Applied AI ($500 USD) | Inferencia pericial con **Nebius Token Factory** (API compatible con OpenAI). Cálculo y visualización en tiempo real de métricas cuantitativas: latencia en ms, tokens procesados, costo estimado en USD y porcentaje de confianza. Incluye caso límite (Edge Case) documentado donde el modelo falla ante jerga densa. |
| **Render** | Workflows ($900 créditos) | Orquestador asíncrono en segundo plano (`workflows/auditor_workflow.ts` y `workflows/render.yaml`). El frontend incluye un botón para inducir una falla controlada demostrando auto-recuperación e idempotencia sin duplicar mutaciones. |
| **RevenueCat** | Subscriptions ($500 USD) | Paywall web con **RevenueCat Test Store**. Entitlement `pro_auditor_access` y producto `pro_auditor_monthly`. Desbloqueo en vivo de la función "Dossier VC Due Diligence" tras compra sandbox sin dinero real. |
| **NERDCONF** | Fun Build ($500 USD) | Dinámica interactiva y adictiva con Web Audio API: martillazo de juez acústico (`playGavel`), sirena de humo (`playSmokeSiren`), acordes de veredicto dramático, confetti y medidor animado de Hype (0 - 100%). |

---

## 🎬 Guion para el Video Demo de 2 Minutos (X / Twitter)

**Etiquetar a:** `@nerdconf_ar`  
**Duración máxima:** 120 segundos.  
**URL de la Demo:** [https://brave-lemur-868.convex.site](https://brave-lemur-868.convex.site)

- **0:00 - 0:25 · Convex Multiplayer:** Abre 2 ventanas del navegador lado a lado en la misma sala (`?room=HYPE-XXX`). Escribe un claim exagerado en la ventana 1. Emite un voto en la ventana 2 y muestra cómo los porcentajes y votos se actualizan instantáneamente sin recargar la página.
- **0:25 - 0:50 · Linkup Deep Research:** Presiona *"Desplegar Auditoría Autónoma"*. Muestra la recolección iterativa de evidencias: Fase 1 (búsqueda inicial) y Fase 2 (búsqueda de contraste con niveles de incertidumbre y enlaces web).
- **0:50 - 1:15 · Render Workflows:** Durante la ejecución, haz clic en *"Inducir Falla Controlada"*. Muestra la alerta de caída del worker y cómo el workflow se recupera automáticamente de forma idempotente.
- **1:15 - 1:40 · Nebius Applied AI & Fun Build:** Suena el martillazo y la sirena antismoke. Muestra el veredicto *"CERTIFIED SMOKE"* con el medidor de humo al 88%, la tabla de métricas cuantitativas (latencia 1240 ms, costo $0.00025 USD) y el caso límite documentado.
- **1:40 - 2:00 · RevenueCat Test Store:** Muestra el banner Pro bloqueado. Haz clic en *"Desbloquear con Test Store"*, pulsa *"Comprar en Test Store (Sandbox Gratis)"*, escucha el sonido de desbloqueo y muestra la matriz de riesgo del Dossier VC abierta en tiempo real.

---

## 🚀 Despliegue en Convex Site

```bash
# Subir cambios del frontend y backend en un solo comando
npm run deploy
```