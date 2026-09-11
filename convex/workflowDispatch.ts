"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Render } from "@renderinc/sdk";
export const dispatch = internalAction({
  args: { investigationId: v.id("investigations") },
  handler: async (ctx, { investigationId }) => {
    const inv = await ctx.runQuery(internal.investigations.getInternal, { investigationId });
    if (!inv?.executionToken || inv.workflowStatus !== "queued" || inv.workflowRunId !== "pending") return;
    const executionToken = inv.executionToken;
    try {
      const render = new Render({ token: process.env.RENDER_API_KEY });
      const run = await render.workflows.startTask(process.env.RENDER_TASK_SLUG!, [{ investigationId, executionToken }], AbortSignal.timeout(20000));
      await ctx.runMutation(internal.investigations.setRun, { investigationId, executionToken, runId: run.taskRunId });
      await ctx.scheduler.runAfter(15000, internal.workflowDispatch.monitor, { investigationId, executionToken, runId: run.taskRunId });
    } catch {
      // A timeout may have happened after Render accepted the run. Invalidate this
      // generation before allowing an explicit retry, so a late worker cannot write.
      await ctx.runMutation(internal.investigations.setRun, { investigationId, executionToken, error: "No pudimos confirmar el inicio en Render. Reintenta la auditoría." });
    }
  },
});
export const monitor = internalAction({
  args: { investigationId: v.id("investigations"), executionToken: v.string(), runId: v.string() },
  handler: async (ctx, args) => {
    const inv = await ctx.runQuery(internal.investigations.getInternal, { investigationId: args.investigationId });
    if (!inv || inv.executionToken !== args.executionToken || inv.currentStep === "completed" || inv.workflowStatus === "failed") return;
    try {
      const run = await new Render({ token: process.env.RENDER_API_KEY }).workflows.getTaskRun(args.runId);
      if (["failed", "canceled"].includes(run.status)) {
        await ctx.runMutation(internal.investigations.setRun, { ...args, error: "Render agotó los reintentos o canceló el trabajo. Puedes reanudar desde los checkpoints." });
        return;
      }
      if (["succeeded", "completed"].includes(run.status)) {
        await ctx.runMutation(internal.investigations.setRun, { ...args, error: "Render terminó sin guardar el resultado. Reintenta desde los checkpoints." });
        return;
      }
    } catch { /* Preserve state on transient monitoring errors. */ }
    if (Date.now() - (inv.dispatchStartedAt ?? inv.updatedAt) > 30 * 60000) {
      await ctx.runMutation(internal.investigations.setRun, { ...args, error: "Se agotó el tiempo de espera de la investigación." });
      return;
    }
    await ctx.scheduler.runAfter(15000, internal.workflowDispatch.monitor, args);
  },
});
