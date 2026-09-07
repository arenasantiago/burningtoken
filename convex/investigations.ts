import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByClaim = query({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investigations")
      .withIndex("by_claim", (q) => q.eq("claimId", args.claimId))
      .first();
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
      .first();

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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.investigationId, {
      currentStep: args.currentStep,
      progressPercentage: args.progressPercentage,
      updatedAt: Date.now(),
    });
  },
});

export const triggerSimulatedFailure = mutation({
  args: { investigationId: v.id("investigations") },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.investigationId);
    if (!inv) return;

    // Simulación de fallo en el step actual (Render Workflows challenge)
    await ctx.db.patch(args.investigationId, {
      simulatedFailureTriggered: true,
      retryCount: (inv.retryCount || 0) + 1,
      currentStep: "recovered_from_failure",
      progressPercentage: Math.max(inv.progressPercentage, 75),
      updatedAt: Date.now(),
    });
  },
});

export const saveVerdict = mutation({
  args: {
    investigationId: v.id("investigations"),
    roomId: v.id("rooms"),
    verdict: v.union(v.literal("CERTIFIED_SMOKE"), v.literal("PLAUSIBLE"), v.literal("VERIFIED_LEGIT")),
    hypeScore: v.number(),
    summary: v.string(),
    edgeCaseWarning: v.string(),
    metrics: v.object({
      latencyMs: v.number(),
      inputTokens: v.number(),
      outputTokens: v.number(),
      estimatedCostUsd: v.number(),
      confidenceScore: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.investigationId, {
      currentStep: "completed",
      progressPercentage: 100,
      verdict: args.verdict,
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
