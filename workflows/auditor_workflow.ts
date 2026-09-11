import { task, type TaskContext } from "@renderinc/sdk/workflows";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { randomUUID } from "node:crypto";
export async function runAuditStages(input: { investigationId: string; executionToken: string }, invoke: (args: any) => Promise<any>) {
  for (const stage of ["initial", "contrast", "synthesis"] as const) {
    const result = await invoke({ ...input, stage, lease: randomUUID() });
    if (result.fail) throw new Error("Controlled failure after persisted checkpoint: initial");
    console.log(JSON.stringify({ investigationId: input.investigationId, stage, checkpointReused: result.skip === true }));
  }
  return { investigationId: input.investigationId, completed: true };
}
task({ name: "auditClaim", retry: { maxRetries: 3, waitDurationMs: 65000, backoffScaling: 1 }, timeoutSeconds: 600 },
  async (_ctx: TaskContext, input: { investigationId: string; executionToken: string }) => {
    const url = process.env.CONVEX_URL;
    const secret = process.env.WORKFLOW_SHARED_SECRET;
    if (!url || !secret) throw new Error("Missing worker configuration");
    const convex = new ConvexHttpClient(url);
    return runAuditStages(input, args => convex.action(makeFunctionReference("workflows:runStage"), { ...args, secret }));
  });
