import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { INPUT_LIMITS } from "./lib/inputValidation";
import { sessionUserId } from "./lib/session";

const WINDOW_MS = 60_000;

export const consume = internalMutation({
  args: { token: v.string(), action: v.literal("claim_suggestions") },
  handler: async (ctx, args) => {
    const userId = await sessionUserId(args.token);
    const now = Date.now();
    const record = await ctx.db
      .query("aiRateLimits")
      .withIndex("by_user_action", (q) => q.eq("userId", userId).eq("action", args.action))
      .first();

    if (!record || now - record.windowStartedAt >= WINDOW_MS) {
      if (record) await ctx.db.patch(record._id, { windowStartedAt: now, count: 1 });
      else await ctx.db.insert("aiRateLimits", { userId, action: args.action, windowStartedAt: now, count: 1 });
      return;
    }

    if (record.count >= INPUT_LIMITS.aiRequestsPerMinute) {
      throw new Error("Límite del asistente alcanzado. Espera un minuto antes de reintentar.");
    }
    await ctx.db.patch(record._id, { count: record.count + 1 });
  },
});
