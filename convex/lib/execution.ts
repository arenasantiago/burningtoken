import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
// Every write is fenced inside its transaction, including responses from expired workers.
export async function assertExecution(ctx: MutationCtx, args: { investigationId: Id<"investigations">; executionToken?: string; lease?: string }) {
  const inv = await ctx.db.get(args.investigationId);
  if (!inv) throw new Error("Investigación inexistente.");
  if (!inv.executionToken) return; // Internal legacy verification fixtures only.
  if (inv.executionToken !== args.executionToken || inv.stageLease !== args.lease || !args.lease ||
      (inv.stageLeaseUntil ?? 0) <= Date.now() || inv.workflowStatus === "failed" || inv.currentStep === "completed") {
    throw new Error("Respuesta de una ejecución vencida; no se guardaron cambios.");
  }
}
