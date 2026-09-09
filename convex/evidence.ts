import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { evidenceAssessmentValidator, evidenceSourceValidator } from "./auditValidators";

export const add = mutation({
  args: {
    investigationId: v.id("investigations"),
    step: v.union(v.literal("initial_search"), v.literal("follow_up_contrast")),
    queryUsed: v.string(),
    title: v.string(),
    url: v.string(),
    snippet: v.string(),
    uncertaintyLevel: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
    supportsClaim: v.boolean(),
    source: v.optional(evidenceSourceValidator),
    assessment: v.optional(evidenceAssessmentValidator),
  },
  handler: async (ctx, args) => {
    // Idempotencia y deduplicación de evidencias (Reto Render Workflows)
    if (args.url && args.url.trim().length > 0) {
      const existing = await ctx.db
        .query("evidence")
        .withIndex("by_investigation", (q) => q.eq("investigationId", args.investigationId))
        .filter((q) => q.eq(q.field("url"), args.url))
        .first();
      if (existing) {
        return existing._id;
      }
    }

    return await ctx.db.insert("evidence", {
      investigationId: args.investigationId,
      step: args.step,
      queryUsed: args.queryUsed,
      title: args.title,
      url: args.url,
      snippet: args.snippet,
      uncertaintyLevel: args.uncertaintyLevel,
      supportsClaim: args.supportsClaim,
      ...(args.source ? { source: args.source } : {}),
      ...(args.assessment ? { assessment: args.assessment } : {}),
      createdAt: Date.now(),
    });
  },
});

export const listByInvestigation = query({
  args: { investigationId: v.id("investigations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("evidence")
      .withIndex("by_investigation", (q) => q.eq("investigationId", args.investigationId))
      .order("asc")
      .collect();
  },
});

export const applyAssessments = internalMutation({
  args: {
    investigationId: v.id("investigations"),
    assessments: v.array(v.object({
      evidenceId: v.id("evidence"),
      assessment: evidenceAssessmentValidator,
      uncertaintyLevel: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
      reason: v.string(),
      quote: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    for (const item of args.assessments) {
      const evidence = await ctx.db.get(item.evidenceId);
      if (!evidence || evidence.investigationId !== args.investigationId || evidence.source !== "linkup") continue;
      await ctx.db.patch(item.evidenceId, {
        assessment: item.assessment,
        supportsClaim: item.assessment === "supports",
        uncertaintyLevel: item.uncertaintyLevel,
        assessmentReason: item.reason,
        supportingQuote: item.quote,
      });
    }
  },
});
