import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("evidence", {
      investigationId: args.investigationId,
      step: args.step,
      queryUsed: args.queryUsed,
      title: args.title,
      url: args.url,
      snippet: args.snippet,
      uncertaintyLevel: args.uncertaintyLevel,
      supportsClaim: args.supportsClaim,
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
