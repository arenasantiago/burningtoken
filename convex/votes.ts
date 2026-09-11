import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const cast = mutation({
  args: {
    claimId: v.id("claims"),
    roomId: v.id("rooms"),
    voterId: v.string(),
    voterName: v.string(),
    choice: v.union(v.literal("SMOKE"), v.literal("LEGIT")),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "voting" || room.activeClaimId !== args.claimId) {
      throw new Error("La votación de este caso ya está cerrada.");
    }
    // Verificar si ya votó
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_claim_voter", (q) =>
        q.eq("claimId", args.claimId).eq("voterId", args.voterId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        choice: args.choice,
        voterName: args.voterName,
        timestamp: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("votes", {
      claimId: args.claimId,
      roomId: args.roomId,
      voterId: args.voterId,
      voterName: args.voterName,
      choice: args.choice,
      timestamp: Date.now(),
    });
  },
});

export const getCounts = query({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_claim", (q) => q.eq("claimId", args.claimId))
      .collect();

    const smoke = votes.filter((v) => v.choice === "SMOKE").length;
    const legit = votes.filter((v) => v.choice === "LEGIT").length;
    const total = votes.length;

    return {
      smoke,
      legit,
      total,
      smokePercentage: total > 0 ? Math.round((smoke / total) * 100) : 50,
      legitPercentage: total > 0 ? Math.round((legit / total) * 100) : 50,
      recentVoters: votes.slice(-5).map((v) => ({
        name: v.voterName,
        choice: v.choice,
      })),
    };
  },
});

export const getMyVote = query({
  args: {
    claimId: v.id("claims"),
    voterId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_claim_voter", (q) =>
        q.eq("claimId", args.claimId).eq("voterId", args.voterId)
      )
      .first();
  },
});
