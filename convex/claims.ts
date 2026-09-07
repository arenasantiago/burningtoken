import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    roomId: v.id("rooms"),
    authorName: v.string(),
    content: v.string(),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const claimId = await ctx.db.insert("claims", {
      roomId: args.roomId,
      authorName: args.authorName,
      content: args.content,
      sourceUrl: args.sourceUrl,
      createdAt: Date.now(),
    });

    // Activar inmediatamente este claim en la sala y cambiar estado a voting
    await ctx.db.patch(args.roomId, {
      activeClaimId: claimId,
      status: "voting",
    });

    return claimId;
  },
});

export const get = query({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.claimId);
  },
});

export const listByRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("claims")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .collect();
  },
});
