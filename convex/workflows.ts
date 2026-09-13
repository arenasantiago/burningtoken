import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
export const launch = action({
  args: { roomId: v.id("rooms"), sessionToken: v.string(), purchaseToken: v.string() },
  handler: async (ctx, args): Promise<Id<"investigations">> => {
    // Only verified, fresh backend state can enable the expanded research quota.
    const status = await ctx.runQuery(api.entitlements.getStatus, { token: args.purchaseToken });
    const renderConfigured = Boolean(process.env.RENDER_API_KEY && process.env.RENDER_TASK_SLUG && process.env.WORKFLOW_SHARED_SECRET);
    return await ctx.runMutation(internal.investigations.enqueue, {
      roomId: args.roomId,
      sessionToken: args.sessionToken,
      executionToken: crypto.randomUUID(),
      proAccess: status.hasProAccess,
      executionRoute: renderConfigured ? "render" : "convex_direct",
    });
  },
});

const stageValidator = v.union(v.literal("initial"), v.literal("contrast"), v.literal("synthesis"));

export const runStage = action({
  args: { investigationId: v.id("investigations"), executionToken: v.string(), secret: v.string(), lease: v.string(), stage: stageValidator },
  handler: async (ctx, args): Promise<{ skip?: boolean; fail?: boolean; completed?: boolean }> => {
    if (!process.env.WORKFLOW_SHARED_SECRET || args.secret !== process.env.WORKFLOW_SHARED_SECRET) throw new Error("Worker no autorizado.");
    return executeStage(ctx, argsWithoutSecret(args));
  },
});

export const runDirect = internalAction({
  args: { investigationId: v.id("investigations"), executionToken: v.string() },
  handler: async (ctx, args) => {
    try {
      for (const stage of ["initial", "contrast", "synthesis"] as const) {
        const result = await executeStage(ctx, { ...args, stage, lease: crypto.randomUUID() });
        if (result.fail) throw new Error("La falla controlada sólo está disponible en la ruta Render.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "La continuidad directa se detuvo.";
      await ctx.runMutation(internal.investigations.setRun, { ...args, error: message });
    }
  },
});

async function executeStage(ctx: any, args: { investigationId: Id<"investigations">; executionToken: string; lease: string; stage: "initial" | "contrast" | "synthesis" }) {
    const state = await ctx.runMutation(internal.investigations.claimStage, args);
    if (state.skip || state.fail) return state;
    let success = false;
    try {
      const inv = await ctx.runQuery(internal.investigations.getInternal, { investigationId: args.investigationId });
      if (!inv) throw new Error("Investigación inexistente.");
      const claim = await ctx.runQuery(api.claims.get, { claimId: inv.claimId });
      if (!claim) throw new Error("Caso inexistente.");
      await ctx.runAction(internal.actions.executeFullAudit, { investigationId: inv._id, roomId: inv.roomId, claimText: claim.content, isPro: inv.proAccess === true, stage: args.stage, executionToken: args.executionToken, lease: args.lease });
      success = true;
      return { completed: args.stage === "synthesis" };
    } finally {
      await ctx.runMutation(internal.investigations.releaseStage, { ...args, success });
    }
}

function argsWithoutSecret(args: { investigationId: Id<"investigations">; executionToken: string; lease: string; stage: "initial" | "contrast" | "synthesis" }) {
  return { investigationId: args.investigationId, executionToken: args.executionToken, lease: args.lease, stage: args.stage };
}
