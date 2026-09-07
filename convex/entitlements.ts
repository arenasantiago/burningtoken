import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("userEntitlements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      hasProAccess: record ? record.hasProAccess : false,
      entitlementId: record ? record.entitlementId : "free",
    };
  },
});

export const grantProAccess = mutation({
  args: {
    userId: v.string(),
    entitlementId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userEntitlements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        hasProAccess: true,
        entitlementId: args.entitlementId,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("userEntitlements", {
      userId: args.userId,
      hasProAccess: true,
      entitlementId: args.entitlementId,
      updatedAt: Date.now(),
    });
  },
});

export const revokeProAccess = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userEntitlements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        hasProAccess: false,
        updatedAt: Date.now(),
      });
    }
  },
});
