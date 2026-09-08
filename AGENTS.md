# 🤖 AGENTS.md — Truth Tribunal: The Bullshit & Hype Auditor
> **NERDCONF Hackathon 2026 ("Burning Token")**  
> *Project Repo:* [https://github.com/arenasantiago/burningtoken](https://github.com/arenasantiago/burningtoken)  
> *Live Production Site:* [https://brave-lemur-868.convex.site](https://brave-lemur-868.convex.site)  
> *Convex Backend:* [https://brave-lemur-868.convex.cloud](https://brave-lemur-868.convex.cloud)

---

## 🧭 1. Resumen Ejecutivo & Misión del Proyecto

**Truth Tribunal** es una plataforma colaborativa y multijugador en tiempo real diseñada para auditar afirmaciones grandilocuentes, publicaciones hiperbólicas de redes sociales (X, LinkedIn) y pitches desmedidos de startups de IA y Web3.

El sistema somete cualquier *claim* al juicio de una audiencia distribuida y a un escuadrón de agentes autónomos que ejecutan búsqueda iterativa profunda, contraste de evidencias y evaluación pericial con LLMs, complementado con un paywall de suscripciones para informes confidenciales de *Due Diligence*.

---

## 🏆 2. Matriz de los 6 Retos Patrocinados (Obligatorios)

Todo agente que trabaje en esta base de código **debe preservar intacta la funcionalidad y los requisitos técnicos de cada sponsor**:

| # | Patrocinador | Reto & Premio | Módulos Clave | Requisito Técnico No Negociable |
|---|---|---|---|---|
| **1** | **Convex** | *Multiplayer* ($500 USD) | `convex/schema.ts`<br>`convex/rooms.ts`<br>`convex/claims.ts`<br>`convex/votes.ts` | Estado reactivo sincronizado en tiempo real entre múltiples participantes (votos, salas, etapas de auditoría). Desplegado oficialmente en `convex.site` mediante `@convex-dev/static-hosting`. |
| **2** | **Linkup** | *Deep Research* ($500 USD) | `convex/actions.ts`<br>`src/components/EvidenceBoard.tsx` | Búsqueda iterativa en **dos fases**: Fase 1 (búsqueda inicial y benchmarks) y Fase 2 (contraste de brechas y búsqueda de contradicciones), con citas URL y niveles de incertidumbre (`LOW`, `MEDIUM`, `HIGH`). |
| **3** | **Nebius** | *Applied AI* ($500 USD) | `convex/actions.ts`<br>`src/components/VerdictReport.tsx` | Inferencia pericial utilizando **Nebius Token Factory** (API OpenAI-compatible). Despliegue en UI de métricas cuantitativas en vivo: latencia (ms), conteo de tokens, costo estimado en USD, score de confianza y caso límite (*Edge Case*) documentado. |
| **4** | **Render** | *Workflows* ($900 créditos) | `workflows/render.yaml`<br>`workflows/auditor_workflow.ts`<br>`src/components/WorkflowProgress.tsx` | Orquestador de background workers resiliente y desacoplado con botón en UI para *"Inducir Falla Controlada"* demostrando reanudación e idempotencia sin duplicación de registros. |
| **5** | **RevenueCat** | *Subscriptions* ($500 USD) | `src/components/ProPaywallModal.tsx`<br>`convex/entitlements.ts` | Integración web con **RevenueCat Test Store** (sandbox sin cobro real). Entitlement `pro_auditor_access` y producto `pro_auditor_monthly`. Desbloquea en vivo el *"Dossier Confidencial de Due Diligence para VCs"*. |
| **6** | **NERDCONF** | *Fun Build* ($500 USD) | `src/hooks/useAudioTribunal.ts`<br>`src/components/LiveVoting.tsx` | Experiencia adictiva con Web Audio API procedural (martillazo de juez acústico `playGavel`, sirena `playSmokeSiren`, acordes de veredicto, sonido de caja registradora), medidor animado de Hype (0-100%) y confetti. |

---

## 🏛️ 3. Arquitectura del Sistema

```
                        ┌───────────────────────────────────────────────┐
                        │              TRUTH TRIBUNAL                   │
                        │   SPA Frontend (React 18 + Vite + Tailwind)   │
                        │       Desplegado en convex.site               │
                        └───────┬──────────────┬──────────────┬─────────┘
                                │              │              │
       WebSocket Reactivo       │              │              │ Compras Web
    (Rooms, Votes, Verdicts)    │              │              │ (Test Store Sandbox)
                                ▼              │              ▼
                    ┌──────────────────────┐   │    ┌──────────────────┐
                    │    CONVEX CLOUD      │   │    │    REVENUECAT    │
                    │   Backend Serverless │   │    │ Purchases Web JS │
                    │   & Database (7 tbls)│   │    └──────────────────┘
                    └──────────┬───────────┘   │
                               │               │ Disparo de auditoría
        Actions Asíncronas     │               ▼
        ┌──────────────────────┼────────────────────────┐
        │                      │                        │
        ▼                      ▼                        ▼
┌──────────────┐      ┌─────────────────┐     ┌───────────────────┐
│  LINKUP API  │      │  NEBIUS AI      │     │  RENDER WORKFLOW  │
│Deep Research │      │ Token Factory   │     │Background Worker  │
│ 2 Iterations │      │ LLM Inferencia  │     │ Resilient Queue   │
└──────────────┘      └─────────────────┘     └───────────────────┘
```

### Esquema de Datos Convex (`convex/schema.ts`)
- `rooms`: Código (`HYPE-XXX`), estado (`lobby`, `voting`, `auditing`, `verdict`), claim activo, host user ID.
- `claims`: Texto de la afirmación, fuente o autor, categoría, hype score inicial.
- `votes`: Votos individuales (`LEGIT` vs `SMOKE`) con identificador único de votante.
- `investigations`: Estado del workflow, progreso (0-100%), paso actual, veredicto final, métricas de Nebius (latencia, tokens, costo).
- `evidence`: Hallazgos recolectados por Linkup, clasificados por fase (`initial` vs `contrast`), con URL, snippet e incertidumbre.
- `userEntitlements`: Estado de suscripción verificado por RevenueCat.

---

## 📁 4. Mapa del Repositorio

```
.
├── .env.example              # Plantilla de variables de entorno requeridas
├── .env.local                # Secretos locales (IGNORADO EN GIT, NO SUBIR)
├── AGENTS.md                 # Este documento de contexto para agentes y Codex
├── README.md                 # Resumen público, tabla de sponsors y guion de video
├── package.json              # Dependencias de Vite, React, Convex, RevenueCat
├── tsconfig.json             # Configuración TypeScript del frontend
├── vite.config.ts            # Configuración de empaquetado de Vite
├── tailwind.config.js        # Estilos, temas periciales y animaciones
│
├── convex/                   # Backend Serverless en Convex
│   ├── _generated/           # Tipos TypeScript autogenerados por Convex
│   ├── actions.ts            # Integración externa: Linkup Deep Research & Nebius LLM
│   ├── auth.config.ts        # Configuración de autenticación
│   ├── claims.ts             # Mutaciones y queries para claims
│   ├── convex.config.ts      # Registro del componente @convex-dev/static-hosting
│   ├── entitlements.ts       # Verificación y persistencia de suscripciones Pro
│   ├── evidence.ts           # Almacenamiento y consulta reactiva de pruebas
│   ├── investigations.ts     # Manejo del ciclo de vida de la auditoría pericial
│   ├── rooms.ts              # Creación atómica de salas, normalización y consultas
│   ├── schema.ts             # Definición formal de tablas e índices
│   ├── tsconfig.json         # Tipos específicos para el runtime de Convex
│   └── votes.ts              # Conteo de votos y registro reactivo anti-duplicados
│
├── src/                      # Frontend Single Page Application
│   ├── App.tsx               # Orquestador principal de vistas y estados
│   ├── main.tsx              # Punto de entrada de React con ConvexProvider
│   ├── index.css             # Tailwind y estilos globales
│   ├── components/
│   │   ├── Header.tsx        # Barra de navegación, estado del tribunal y botón Pro
│   │   ├── RoomLobby.tsx     # Creación/unión de salas y presets de claims
│   │   ├── LiveVoting.tsx    # Votación multijugador en tiempo real y Hype-o-Meter
│   │   ├── WorkflowProgress.tsx # Monitor de Render con botón de falla inducida
│   │   ├── EvidenceBoard.tsx # Visualizador de evidencias Linkup (Fase 1 y 2)
│   │   ├── VerdictReport.tsx # Veredicto final, métricas Nebius y caso límite
│   │   └── ProPaywallModal.tsx # Modal de compra RevenueCat Test Store
│   └── hooks/
│       └── useAudioTribunal.ts # Sintetizador procedural con Web Audio API
│
└── workflows/                # Orquestación de Background Workers (Reto Render)
    ├── auditor_workflow.ts   # Worker asíncrono con tolerancia a fallos
    └── render.yaml           # Manifiesto declarativo de infraestructura Render
```

---

## ⚙️ 5. Configuración y Ejecución

### 5.1 Variables de Entorno (`.env.local`)
```ini
# Reto Convex (URL de desarrollo o producción)
VITE_CONVEX_URL=https://brave-lemur-868.convex.cloud
CONVEX_DEPLOYMENT=dev:brave-lemur-868
VITE_CONVEX_SITE_URL=https://brave-lemur-868.convex.site

# Reto Linkup (Deep Research API Key)
LINKUP_API_KEY=tu_api_key_de_linkup

# Reto Nebius (Token Factory API Key)
NEBIUS_API_KEY=tu_api_key_de_nebius

# Reto RevenueCat (API Key pública de Web SDK)
VITE_REVENUECAT_PUBLIC_KEY=test_CzcNmdaQDmrSXFAEvdAVHbAJjJZ
```

> **Nota para Agentes:** En Convex Cloud, las variables `LINKUP_API_KEY` y `NEBIUS_API_KEY` también deben estar configuradas en el entorno del backend mediante `npx convex env set LINKUP_API_KEY ...`.

### 5.2 Comandos de Desarrollo
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar Convex en modo desarrollo
npx convex dev

# 3. Iniciar servidor Vite local
npm run dev
```

### 5.3 Comandos de Despliegue en Producción
```bash
# 1. Desplegar funciones de backend a Convex
npx convex dev --once

# 2. Compilar el cliente web
npm run build

# 3. Subir assets estáticos a convex.site
npx @convex-dev/static-hosting upload
```

---

## 🛡️ 6. Reglas Operativas para Agentes de IA

1. **Atomicidad en Base de Datos:**
   - Toda creación de `room` y su `claim` asociado debe ser atómica (`createWithClaim` en `convex/rooms.ts`). Nunca realizar llamadas mutacionales secuenciales desacopladas en el cliente que dejen a un invitado con `activeClaimId: undefined`.
2. **Audio Procedural (Sin Archivos Externos):**
   - Nunca añadir archivos `.mp3`, `.wav` o bibliotecas pesadas de audio. Todo el diseño de sonido reside en `src/hooks/useAudioTribunal.ts` sintetizado matemáticamente con osciladores y filtros del Web Audio API.
3. **Manejo de Errores en APIs Externas:**
   - Si Linkup o Nebius fallan por cuota o latencia, `convex/actions.ts` contiene fallbacks con datos estructurados para garantizar que la experiencia interactiva nunca se rompa durante una demo o evaluación de jurado.
4. **Seguridad de Secretos:**
   - Jamás commitear `.env.local` ni imprimir las API Keys de Linkup, Nebius o RevenueCat en el repositorio público de GitHub.
5. **Compatibilidad Multiplataforma en Terminales:**
   - El entorno de ejecución primario en Windows usa PowerShell. No encadenar comandos con `&&`. Usar `;` o comandos independientes.

---

## 🗺️ 7. Proyecciones y Hoja de Ruta (Roadmap)

### Fase 1: Hackathon Final Polish & Demo Submission (Inmediato - Sept 2026)
- [x] Arquitectura de los 6 retos implementada y funcional.
- [x] Despliegue oficial en `https://brave-lemur-868.convex.site`.
- [x] Soporte atómico multi-inquilino para invitados y normalización de códigos `HYPE-XXX`.
- [ ] Grabación del video demo de 2 minutos siguiendo el guion en `README.md`.
- [ ] Publicación en X etiquetando a `@nerdconf_ar`.
- [ ] Envío del formulario oficial en `app.burningtoken.dev`.

### Fase 2: Social Embeds & Extensiones de Navegador (Q4 2026)
- **Extensión Chrome Manifest V3:** Botón integrado en X (Twitter) y LinkedIn para hacer clic derecho sobre cualquier tweet o post y *"Enviar al Tribunal"*.
- **Bot de X (@TruthTribunalBot):** Mencionar al bot en un tweet sospechoso (`@TruthTribunalBot audita esto`) para abrir automáticamente una sala y devolver un reporte sintético con Linkup + Nebius.

### Fase 3: Decentralized Truth Network & Token Burn (Q1 2027)
- **Staking y Quema de Tokens ($TRUTH / $BURN):** Los acusados o defensores pueden apostar tokens para respaldar sus afirmaciones. Si la investigación demuestra >85% de Hype, los tokens apostados se queman (*Burning Token mechanic*).
- **Incentivos a la Comunidad:** Recompensas a usuarios que aporten fuentes verídicas o reproducciones técnicas que desmientan fraudes.

### Fase 4: Enterprise Due Diligence for VCs (Q2 2027)
- **Integración profunda con RevenueCat:** Niveles de suscripción corporativa (`Tier Enterprise / VC Partner`).
- **Analizador de Pitch Decks (PDF/Doc):** Carga masiva de presentaciones de startups con extracción OCR y auditoría pericial punto por punto contra repositorios de GitHub, patentes y balances públicos.

### Fase 5: Malla de Agentes Distribuidos Multi-Modelo (Q3 2027)
- Orquestación adversarial: Un agente "Fiscal" (optimizado con Nebius para buscar contradicciones) debate contra un agente "Defensor" (que busca validaciones técnicas), supervisados por un "Juez Supremo" que emite el veredicto final ponderando ambas posturas.

---

## 🚀 8. Guía de Mudanza y Trabajo en OpenAI Codex

Para transferir y operar este proyecto de manera óptima dentro de **Codex** (o cualquier entorno de agentes como OpenAI Codex CLI, Cursor, o GitHub Copilot Workspace), sigue esta guía de inicialización:

### Paso 1: Configurar el Espacio de Trabajo en Codex
1. Clona el repositorio oficial:
   ```bash
   git clone https://github.com/arenasantiago/burningtoken.git
   cd burningtoken
   ```
2. Asegúrate de tener **Node.js v20+** o superior y npm instalados:
   ```bash
   node -v
   npm -v
   ```

### Paso 2: Configurar Secretos en el Entorno de Codex
Crea el archivo `.env.local` en la raíz (usa `.env.example` como base) y define:
- `VITE_CONVEX_URL`
- `LINKUP_API_KEY`
- `NEBIUS_API_KEY`
- `VITE_REVENUECAT_PUBLIC_KEY`
- `CONVEX_DEPLOYMENT`

### Paso 3: Contextualizar el Agente de Codex
Al iniciar una nueva sesión en Codex, proporciona este comando o prompt de contexto inicial:

> *"Actúa como el Tech Lead de 'Truth Tribunal'. Lee `AGENTS.md` para comprender la arquitectura de los 6 retos (Convex, Linkup, Nebius, Render, RevenueCat, NERDCONF). Mantén la atomicidad de las mutaciones de Convex, el sintetizador procedimental en Web Audio API y la tolerancia a fallos del workflow."*

### Paso 4: Checklist de Verificación en Codex
Antes de dar por completada cualquier tarea o modificación:
1. `npm run build` debe compilar sin advertencias de tipos TypeScript.
2. `npx convex dev --once` debe validar las funciones del backend.
3. Todo cambio en el flujo de votación debe probarse simulando dos sesiones simultáneas (Host e Invitado).
4. El video demo y los timestamps deben alinearse con la tabla de `README.md`.
