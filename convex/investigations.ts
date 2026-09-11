import { assertExecution } from "./lib/execution";
import { internal } from "./_generated/api";
import { requireHost } from "./lib/session";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { completionReasonValidator, auditMetricsValidator, auditSourcesValidator, verdictValidator } from "./auditValidators";

export const getByClaim = query({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    const inv = await ctx.db
      .query("investigations")
      .withIndex("by_claim", (q) => q.eq("claimId", args.claimId))
      .order("desc").first();
    if (!inv) return null;
    const { executionToken, stageLease, stageLeaseUntil, ...visible } = inv;
    return visible;
  },
});

export const startOrGet = internalMutation({
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

export const updateProgress = internalMutation({
  args: {
    executionToken: v.optional(v.string()), lease: v.optional(v.string()),
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
    await assertExecution(ctx, args);
    const inv = await ctx.db.get(args.investigationId);
    const existingCheckpoints = inv?.completedCheckpoints || [];
    const updatedCheckpoints = args.checkpoint && !existingCheckpoints.includes(args.checkpoint)
      ? [...existingCheckpoints, args.checkpoint]
      : existingCheckpoints;

    await ctx.db.patch(args.investigationId, {
      currentStep: inv && inv.progressPercentage > args.progressPercentage ? inv.currentStep : args.currentStep,
      progressPercentage: Math.max(inv?.progressPercentage ?? 0, args.progressPercentage),
      completedCheckpoints: updatedCheckpoints,
      updatedAt: Date.now(),
    });
  },
});

export const setResearchPlan = internalMutation({
  args: {
    executionToken: v.optional(v.string()), lease: v.optional(v.string()),
    investigationId: v.id("investigations"),
    query: v.string(),
    gaps: v.array(v.string()),
    basedOnEvidenceIds: v.array(v.id("evidence")),
  },
  handler: async (ctx, args) => {
    await assertExecution(ctx, args);
    await ctx.db.patch(args.investigationId, {
      researchPlan: { query: args.query, gaps: args.gaps, basedOnEvidenceIds: args.basedOnEvidenceIds },
      updatedAt: Date.now(),
    });
  },
});

export const triggerSimulatedFailure = mutation({
  args: { investigationId: v.id("investigations"), sessionToken: v.string() },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.investigationId);
    if (!inv) throw new Error("Investigación inexistente.");
    await requireHost(ctx, inv.roomId, args.sessionToken);
    if (!inv.executionToken || inv.currentStep === "completed" || inv.workflowStatus === "failed") throw new Error("No hay un workflow activo.");
    if (inv.currentStep === "nebius_synthesizing") throw new Error("La última etapa ya comenzó.");
    if (inv.failureConsumed || inv.failureRequested) return;
    await ctx.db.patch(inv._id, { failureRequested: true, updatedAt: Date.now() });
  },
});

export const saveVerdict = internalMutation({
  args: {
    executionToken: v.optional(v.string()), lease: v.optional(v.string()),
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
    await assertExecution(ctx, args);
    await ctx.db.patch(args.investigationId, {
      currentStep: "completed",
      workflowStatus: "completed",
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
    const room = await ctx.db.get(args.roomId);
    const inv = await ctx.db.get(args.investigationId);
    if (room?.activeClaimId === inv?.claimId) await ctx.db.patch(args.roomId, { status: "verdict" });
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

export const getInternal = internalQuery({ args: { investigationId: v.id("investigations") }, handler: (ctx, args) => ctx.db.get(args.investigationId) });
export const enqueue = internalMutation({
  args: { roomId: v.id("rooms"), sessionToken: v.string(), executionToken: v.string(), proAccess: v.boolean() },
  handler: async (ctx, args) => {
    const room = await requireHost(ctx, args.roomId, args.sessionToken);
    if (!room.activeClaimId) throw new Error("No hay un caso activo.");
    const previous = await ctx.db.query("investigations").withIndex("by_claim", q => q.eq("claimId", room.activeClaimId!)).order("desc").first();
    if (previous && previous.workflowStatus !== "failed") return previous._id;
    if (room.status !== "voting" && room.status !== "auditing") throw new Error("Esta ronda ya terminó.");
    let id;
    if (previous) {
      if (previous.stageLease && (previous.stageLeaseUntil ?? 0) > Date.now()) throw new Error("Espera a que cierre la etapa anterior antes de reintentar.");
      id = previous._id;
      await ctx.db.patch(id, { executionToken: args.executionToken, workflowStatus: "queued", workflowError: undefined, stageLease: undefined, stageLeaseUntil: undefined, workflowRunId: "pending", dispatchStartedAt: Date.now() });
    } else {
      id = await ctx.db.insert("investigations", { roomId: room._id, claimId: room.activeClaimId, workflowRunId: "pending", currentStep: "idle", progressPercentage: 0, simulatedFailureTriggered: false, retryCount: 0,
        completedCheckpoints: [], executionToken: args.executionToken, workflowStatus: "queued", proAccess: args.proAccess, updatedAt: Date.now(), dispatchStartedAt: Date.now() });
    }
    await ctx.db.patch(room._id, { status: "auditing" });
    await ctx.scheduler.runAfter(0, internal.workflowDispatch.dispatch, { investigationId: id });
    return id;
  },
});
export const setRun = internalMutation({
  args: { investigationId: v.id("investigations"), executionToken: v.string(), runId: v.optional(v.string()), error: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.investigationId);
    if (!inv || inv.executionToken !== args.executionToken || inv.currentStep === "completed") return;
    await ctx.db.patch(inv._id, args.error ? { workflowStatus: "failed", workflowError: args.error, updatedAt: Date.now() } : { workflowRunId: args.runId!, updatedAt: Date.now() });
  },
});
export const claimStage = internalMutation({
  args: { investigationId: v.id("investigations"), executionToken: v.string(), lease: v.string(), stage: v.string() },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.investigationId);
    if (!inv || inv.executionToken !== args.executionToken || inv.workflowStatus === "failed") throw new Error("Ejecución inválida.");
    if (inv.currentStep === "completed" || inv.completedCheckpoints?.includes(args.stage)) return { skip: true, fail: false };
    if (inv.stageLease && (inv.stageLeaseUntil ?? 0) > Date.now()) throw new Error("La etapa ya está en ejecución.");
    const prerequisite = args.stage === "contrast" ? "initial" : args.stage === "synthesis" ? "contrast" : null;
    if (prerequisite && !inv.completedCheckpoints?.includes(prerequisite)) throw new Error("Checkpoint anterior pendiente.");
    const room = await ctx.db.get(inv.roomId);
    if (room?.activeClaimId !== inv.claimId || room.status !== "auditing") throw new Error("Caso inactivo.");
    if (inv.failureRequested && !inv.failureConsumed && inv.completedCheckpoints?.includes("initial")) {
      await ctx.db.patch(inv._id, { failureConsumed: true, simulatedFailureTriggered: true, workflowStatus: "retrying", retryCount: inv.retryCount + 1, updatedAt: Date.now() });
      return { skip: false, fail: true };
    }
    await ctx.db.patch(inv._id, { stageLease: args.lease, stageLeaseUntil: Date.now() + 180000, workflowStatus: "running", updatedAt: Date.now() });
    return { skip: false, fail: false };
  },
});
export const releaseStage = internalMutation({
  args: { investigationId: v.id("investigations"), executionToken: v.string(), lease: v.string(), stage: v.string(), success: v.boolean() },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.investigationId);
    if (!inv || inv.executionToken !== args.executionToken || inv.stageLease !== args.lease) return;
    await ctx.db.patch(inv._id, { stageLease: undefined, stageLeaseUntil: undefined,
      completedCheckpoints: args.success ? [...new Set([...(inv.completedCheckpoints ?? []), args.stage])] : inv.completedCheckpoints,
      workflowStatus: inv.currentStep === "completed" ? "completed" : args.success ? "running" : "retrying", updatedAt: Date.now() });
  },
});
