import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { completionReasonValidator, auditMetricsValidator, auditSourcesValidator, verdictValidator } from "./auditValidators";

export const getByClaim = query({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investigations")
      .withIndex("by_claim", (q) => q.eq("claimId", args.claimId))
      .order("desc").first();
  },
});

export const startOrGet = mutation({
  args: {
    claimId: v.id("claims"),
    roomId: v.id("rooms"),
    workflowRunId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("investigations")
      .withIndex("by_claim", (q) => q.eq("claimId", args.claimId))
      .order("desc").first();

    if (existing) {
      return existing._id;
    }

    // Cambiar estado de la sala a auditing
    await ctx.db.patch(args.roomId, { status: "auditing" });

    return await ctx.db.insert("investigations", {
      claimId: args.claimId,
      roomId: args.roomId,
      workflowRunId: args.workflowRunId,
      currentStep: "extracting_claims",
      progressPercentage: 15,
      simulatedFailureTriggered: false,
      retryCount: 0,
      completedCheckpoints: [],
      updatedAt: Date.now(),
    });
  },
});

export const updateProgress = mutation({
  args: {
    investigationId: v.id("investigations"),
    currentStep: v.union(
      v.literal("idle"),
      v.literal("extracting_claims"),
      v.literal("linkup_initial_search"),
      v.literal("linkup_deep_search"),
      v.literal("nebius_synthesizing"),
      v.literal("completed"),
      v.literal("recovered_from_failure")
    ),
    progressPercentage: v.number(),
    checkpoint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.investigationId);
    const existingCheckpoints = inv?.completedCheckpoints || [];
    const updatedCheckpoints = args.checkpoint && !existingCheckpoints.includes(args.checkpoint)
      ? [...existingCheckpoints, args.checkpoint]
      : existingCheckpoints;

    await ctx.db.patch(args.investigationId, {
      currentStep: args.currentStep,
      progressPercentage: args.progressPercentage,
      completedCheckpoints: updatedCheckpoints,
      updatedAt: Date.now(),
    });
  },
});

export const setResearchPlan = internalMutation({
  args: {
    investigationId: v.id("investigations"),
    query: v.string(),
    gaps: v.array(v.string()),
    basedOnEvidenceIds: v.array(v.id("evidence")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.investigationId, {
      researchPlan: { query: args.query, gaps: args.gaps, basedOnEvidenceIds: args.basedOnEvidenceIds },
      updatedAt: Date.now(),
    });
  },
});

export const triggerSimulatedFailure = mutation({
  args: { investigationId: v.id("investigations") },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.investigationId);
    if (!inv) return;

    const newRetryCount = (inv.retryCount || 0) + 1;
    const currentDiagnostics = inv.diagnostics || [];
    const failureLog = `Render Worker: Caída inducida de nodo en paso '${inv.currentStep}' (Checkpoint restaurado, reintento #${newRetryCount})`;

    // Simulación de fallo y auto-recuperación idempotente (Render Workflows challenge)
    await ctx.db.patch(args.investigationId, {
      simulatedFailureTriggered: true,
      retryCount: newRetryCount,
      currentStep: "recovered_from_failure",
      progressPercentage: Math.max(inv.progressPercentage, 75),
      diagnostics: [...currentDiagnostics, failureLog],
      updatedAt: Date.now(),
    });
  },
});

export const saveVerdict = mutation({
  args: {
    investigationId: v.id("investigations"),
    roomId: v.id("rooms"),
    verdict: verdictValidator,
    hypeScore: v.optional(v.number()),
    auditSources: v.optional(auditSourcesValidator),
    completionReason: v.optional(completionReasonValidator),
    diagnostics: v.optional(v.array(v.string())),
    summary: v.string(),
    edgeCaseWarning: v.string(),
    metrics: auditMetricsValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.investigationId, {
      currentStep: "completed",
      progressPercentage: 100,
      verdict: args.verdict,
      auditSources: args.auditSources,
      completionReason: args.completionReason,
      diagnostics: args.diagnostics,
      hypeScore: args.hypeScore,
      summary: args.summary,
      edgeCaseWarning: args.edgeCaseWarning,
      metrics: args.metrics,
      updatedAt: Date.now(),
    });

    // Cambiar estado de sala a verdict
    await ctx.db.patch(args.roomId, { status: "verdict" });
  },
});

export const restart = internalMutation({
  args: { claimId: v.id("claims"), roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId);
    const room = await ctx.db.get(args.roomId);
    if (!claim || claim.roomId !== args.roomId || room?.activeClaimId !== args.claimId) throw new Error("Claim y sala incompatibles");
    if (room.status === "auditing") throw new Error("Auditoría en curso");
    await ctx.db.patch(args.roomId, { status: "auditing" });
    return await ctx.db.insert("investigations", { ...args, workflowRunId: "reaudit-" + Date.now(), currentStep: "extracting_claims", progressPercentage: 15, simulatedFailureTriggered: false, retryCount: 0, updatedAt: Date.now() });
  },
});
