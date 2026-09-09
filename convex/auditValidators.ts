import { v } from "convex/values";

export const verdictValidator = v.union(
  v.literal("CERTIFIED_SMOKE"),
  v.literal("PLAUSIBLE"),
  v.literal("VERIFIED_LEGIT"),
  v.literal("INSUFFICIENT_EVIDENCE")
);

const sourceMode = v.union(v.literal("live"), v.literal("demo"));
export const auditSourcesValidator = v.object({
  initialSearch: sourceMode,
  contrastSearch: sourceMode,
  synthesis: sourceMode,
});

// Optional fields preserve old records and represent unavailable measurements honestly.
export const auditMetricsValidator = v.object({
  latencyMs: v.number(),
  inputTokens: v.optional(v.number()),
  outputTokens: v.optional(v.number()),
  estimatedCostUsd: v.optional(v.number()),
  confidenceScore: v.optional(v.number()),
  measurementSource: v.optional(v.union(v.literal("provider"), v.literal("unavailable"))),
});

export const evidenceSourceValidator = v.union(v.literal("linkup"), v.literal("demo"));
export const evidenceAssessmentValidator = v.union(
  v.literal("unassessed"), v.literal("supports"), v.literal("contradicts")
);

export const completionReasonValidator = v.union(v.literal("out_of_scope"), v.literal("technical_failure"), v.literal("insufficient_evidence"), v.literal("assessed"));
