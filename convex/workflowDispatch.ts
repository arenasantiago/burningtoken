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
      const rawSlug = process.env.RENDER_TASK_SLUG || "";
      const slug = rawSlug.includes("/") ? rawSlug : `${rawSlug}/auditClaim`;
      const run = await render.workflows.startTask(slug, [{ investigationId, executionToken }], AbortSignal.timeout(20000));
      await ctx.runMutation(internal.investigations.setRun, { investigationId, executionToken, runId: run.taskRunId });
      await ctx.scheduler.runAfter(15000, internal.workflowDispatch.monitor, { investigationId, executionToken, runId: run.taskRunId });
    } catch (err) {
      console.error("Render workflow dispatch error:", err);
      // Rotate the generation before continuing locally: a late Render worker
      // cannot write after Convex takes over the same investigation.
      await ctx.runMutation(internal.investigations.activateDirectFallback, {
        investigationId,
        executionToken,
        nextExecutionToken: crypto.randomUUID(),
        reason: "Render no pudo confirmar el inicio. Convex asumió la continuidad directa; esta ejecución no acredita Render.",
      });
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
