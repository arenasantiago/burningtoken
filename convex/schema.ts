import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. Salas multijugador (Convex Multiplayer)
  rooms: defineTable({
    code: v.string(),             // Código de acceso (ej: "HYPE-404")
    title: v.string(),            // Nombre o tema de la sesión
    hostUserId: v.string(),       // Identificador del creador
    status: v.union(
      v.literal("lobby"),
      v.literal("voting"),
      v.literal("auditing"),
      v.literal("verdict")
    ),
    activeClaimId: v.optional(v.id("claims")),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  // 2. Afirmaciones sometidas a juicio
  claims: defineTable({
    roomId: v.id("rooms"),
    authorName: v.string(),
    content: v.string(),          // Texto del claim (ej: "Lanzamos AGI autónomo con 99.9% de precisión")
    sourceUrl: v.optional(v.string()), // URL de origen (Tweet, LinkedIn, etc.)
    createdAt: v.number(),
  }).index("by_room", ["roomId"]),

  // 3. Votos de los usuarios en tiempo real (Multiplayer)
  votes: defineTable({
    claimId: v.id("claims"),
    roomId: v.id("rooms"),
    voterId: v.string(),          // Session ID anónima de cada ventana
    voterName: v.string(),
    choice: v.union(v.literal("SMOKE"), v.literal("LEGIT")), // ¿Humo o Real?
    timestamp: v.number(),
  })
    .index("by_claim", ["claimId"])
    .index("by_claim_voter", ["claimId", "voterId"]),

  // 4. Orquestación y estado del workflow (Render Workflows)
  investigations: defineTable({
    claimId: v.id("claims"),
    roomId: v.id("rooms"),
    workflowRunId: v.string(),    // ID idempotente para evitar ejecuciones duplicadas
    currentStep: v.union(
      v.literal("idle"),
      v.literal("extracting_claims"),
      v.literal("linkup_initial_search"),
      v.literal("linkup_deep_search"),
      v.literal("nebius_synthesizing"),
      v.literal("completed"),
      v.literal("recovered_from_failure") // Demostración de resiliencia
    ),
    progressPercentage: v.number(),
    simulatedFailureTriggered: v.boolean(), // Flag para la demo del reto Render
    retryCount: v.number(),
    
    // Resultados de Nebius Token Factory (Applied AI)
    verdict: v.optional(v.union(v.literal("CERTIFIED_SMOKE"), v.literal("PLAUSIBLE"), v.literal("VERIFIED_LEGIT"))),
    hypeScore: v.optional(v.number()),      // 0 a 100% de humo
    summary: v.optional(v.string()),
    edgeCaseWarning: v.optional(v.string()), // Caso límite documentado donde falla el LLM
    
    // Métricas cuantitativas exigidas por Nebius
    metrics: v.optional(
      v.object({
        latencyMs: v.number(),
        inputTokens: v.number(),
        outputTokens: v.number(),
        estimatedCostUsd: v.number(),
        confidenceScore: v.number(),
      })
    ),
    updatedAt: v.number(),
  }).index("by_claim", ["claimId"]),

  // 5. Evidencias recolectadas por Linkup (Deep Research iterativo)
  evidence: defineTable({
    investigationId: v.id("investigations"),
    step: v.union(v.literal("initial_search"), v.literal("follow_up_contrast")),
    queryUsed: v.string(),
    title: v.string(),
    url: v.string(),
    snippet: v.string(),
    uncertaintyLevel: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
    supportsClaim: v.boolean(),
    createdAt: v.number(),
  }).index("by_investigation", ["investigationId"]),

  // 6. Entitlements y suscripciones (RevenueCat Test Store)
  userEntitlements: defineTable({
    userId: v.string(),
    hasProAccess: v.boolean(),    // Desbloquea el "VC Due Diligence Dossier"
    entitlementId: v.string(),    // "pro_auditor_access"
    expirationDate: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
