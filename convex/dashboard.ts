/**
 * Dashboard Read-Only Queries
 *
 * Used exclusively by the Convex Data Dashboard (sibling application)
 * for data exploration and visualization.
 *
 * ALL functions in this file are read-only queries — no mutations,
 * no actions, no side effects. They never modify data.
 *
 * NOTE: Convex does not support aggregate COUNT operations.
 * For small-to-medium datasets (hackathon scale), collecting and
 * counting in memory is acceptable. For production scale, consider
 * maintaining counter documents or adding search indexes.
 */
import { query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// ═══════════════════════════════════════════════════════════════
// OVERVIEW & STATISTICS
// ═══════════════════════════════════════════════════════════════

export const getTableCounts = query({
  args: {},
  handler: async (ctx) => {
    const [rooms, claims, votes, investigations, evidence, entitlements, rateLimits] =
      await Promise.all([
        ctx.db.query("rooms").collect(),
        ctx.db.query("claims").collect(),
        ctx.db.query("votes").collect(),
        ctx.db.query("investigations").collect(),
        ctx.db.query("evidence").collect(),
        ctx.db.query("userEntitlements").collect(),
        ctx.db.query("aiRateLimits").collect(),
      ]);

    return {
      rooms: rooms.length,
      claims: claims.length,
      votes: votes.length,
      investigations: investigations.length,
      evidence: evidence.length,
      userEntitlements: entitlements.length,
      aiRateLimits: rateLimits.length,
      total:
        rooms.length +
        claims.length +
        votes.length +
        investigations.length +
        evidence.length +
        entitlements.length +
        rateLimits.length,
    };
  },
});

export const getOverviewStats = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db.query("rooms").collect();
    const investigations = await ctx.db.query("investigations").collect();
    const votes = await ctx.db.query("votes").collect();

    // Room status distribution
    const roomsByStatus: Record<string, number> = {};
    for (const r of rooms) {
      roomsByStatus[r.status] = (roomsByStatus[r.status] || 0) + 1;
    }

    // Investigation step distribution
    const investigationsByStep: Record<string, number> = {};
    for (const inv of investigations) {
      investigationsByStep[inv.currentStep] =
        (investigationsByStep[inv.currentStep] || 0) + 1;
    }

    // Vote choice distribution
    let smokeCount = 0;
    let legitCount = 0;
    for (const vote of votes) {
      if (vote.choice === "SMOKE") smokeCount++;
      else legitCount++;
    }

    // Verdict distribution
    const verdictCounts: Record<string, number> = {};
    for (const inv of investigations) {
      if (inv.verdict) {
        verdictCounts[inv.verdict] = (verdictCounts[inv.verdict] || 0) + 1;
      }
    }

    return {
      roomsByStatus,
      investigationsByStep,
      voteDistribution: {
        smoke: smokeCount,
        legit: legitCount,
        total: votes.length,
      },
      verdictCounts,
    };
  },
});

export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 15;

    const [recentRooms, recentClaims, recentInvestigations, recentEvidence] =
      await Promise.all([
        ctx.db.query("rooms").order("desc").take(limit),
        ctx.db.query("claims").order("desc").take(limit),
        ctx.db.query("investigations").order("desc").take(limit),
        ctx.db.query("evidence").order("desc").take(limit),
      ]);

    type ActivityItem = {
      table: string;
      id: string;
      label: string;
      time: number;
    };
    const items: ActivityItem[] = [];

    for (const r of recentRooms) {
      items.push({
        table: "rooms",
        id: r._id,
        label: `Room ${r.code}: "${r.title}"`,
        time: r._creationTime,
      });
    }
    for (const c of recentClaims) {
      items.push({
        table: "claims",
        id: c._id,
        label: `Claim: "${c.content.length > 80 ? c.content.slice(0, 80) + "…" : c.content}"`,
        time: c._creationTime,
      });
    }
    for (const inv of recentInvestigations) {
      items.push({
        table: "investigations",
        id: inv._id,
        label: `Investigation [${inv.currentStep}]${inv.verdict ? ` → ${inv.verdict}` : ""}`,
        time: inv._creationTime,
      });
    }
    for (const e of recentEvidence) {
      items.push({
        table: "evidence",
        id: e._id,
        label: `Evidence: "${e.title.length > 80 ? e.title.slice(0, 80) + "…" : e.title}"`,
        time: e._creationTime,
      });
    }

    items.sort((a, b) => b.time - a.time);
    return items.slice(0, limit);
  },
});

// ═══════════════════════════════════════════════════════════════
// PAGINATED LIST QUERIES
// ═══════════════════════════════════════════════════════════════

export const listRooms = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listClaims = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("claims")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listVotes = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listInvestigations = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investigations")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listEvidence = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("evidence")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listEntitlements = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userEntitlements")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listRateLimits = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiRateLimits")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// ═══════════════════════════════════════════════════════════════
// DETAIL QUERIES WITH RELATIONS
// ═══════════════════════════════════════════════════════════════

export const getRoomDetail = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const claims = await ctx.db
      .query("claims")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    const activeClaim = room.activeClaimId
      ? await ctx.db.get(room.activeClaimId)
      : null;

    const votes = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("roomId"), room._id))
      .collect();

    const investigations = [];
    for (const claim of claims) {
      const inv = await ctx.db
        .query("investigations")
        .withIndex("by_claim", (q) => q.eq("claimId", claim._id))
        .first();
      if (inv) investigations.push(inv);
    }

    return { room, claims, activeClaim, votes, investigations };
  },
});

export const getClaimDetail = query({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId);
    if (!claim) return null;

    const room = await ctx.db.get(claim.roomId);

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_claim", (q) => q.eq("claimId", claim._id))
      .collect();

    const investigation = await ctx.db
      .query("investigations")
      .withIndex("by_claim", (q) => q.eq("claimId", claim._id))
      .first();

    let evidenceItems = investigation
      ? await ctx.db
          .query("evidence")
          .withIndex("by_investigation", (q) =>
            q.eq("investigationId", investigation._id)
          )
          .collect()
      : [];

    return { claim, room, votes, investigation, evidence: evidenceItems };
  },
});

export const getInvestigationDetail = query({
  args: { investigationId: v.id("investigations") },
  handler: async (ctx, args) => {
    const investigation = await ctx.db.get(args.investigationId);
    if (!investigation) return null;

    const claim = await ctx.db.get(investigation.claimId);
    const room = await ctx.db.get(investigation.roomId);

    const evidence = await ctx.db
      .query("evidence")
      .withIndex("by_investigation", (q) =>
        q.eq("investigationId", investigation._id)
      )
      .collect();

    const votes = claim
      ? await ctx.db
          .query("votes")
          .withIndex("by_claim", (q) => q.eq("claimId", claim._id))
          .collect()
      : [];

    return { investigation, claim, room, evidence, votes };
  },
});

export const getEvidenceDetail = query({
  args: { evidenceId: v.id("evidence") },
  handler: async (ctx, args) => {
    const evidenceItem = await ctx.db.get(args.evidenceId);
    if (!evidenceItem) return null;

    const investigation = await ctx.db.get(evidenceItem.investigationId);
    const claim = investigation
      ? await ctx.db.get(investigation.claimId)
      : null;
    const room = investigation
      ? await ctx.db.get(investigation.roomId)
      : null;

    return { evidence: evidenceItem, investigation, claim, room };
  },
});

export const getEntitlementDetail = query({
  args: { entitlementId: v.id("userEntitlements") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.entitlementId);
  },
});

// ═══════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════

export const searchRecords = query({
  args: { searchText: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const text = args.searchText.toLowerCase().trim();
    if (!text) return { rooms: [], claims: [], investigations: [], evidence: [] };

    // Search rooms by code and title
    const allRooms = await ctx.db.query("rooms").collect();
    const rooms = allRooms
      .filter(
        (r) =>
          r.code.toLowerCase().includes(text) ||
          r.title.toLowerCase().includes(text) ||
          r._id.includes(text)
      )
      .slice(0, limit);

    // Search claims by content and author
    const allClaims = await ctx.db.query("claims").collect();
    const claims = allClaims
      .filter(
        (c) =>
          c.content.toLowerCase().includes(text) ||
          c.authorName.toLowerCase().includes(text) ||
          c._id.includes(text)
      )
      .slice(0, limit);

    // Search investigations by workflowRunId, verdict, summary
    const allInvestigations = await ctx.db.query("investigations").collect();
    const investigations = allInvestigations
      .filter(
        (inv) =>
          inv.workflowRunId.toLowerCase().includes(text) ||
          (inv.verdict && inv.verdict.toLowerCase().includes(text)) ||
          (inv.summary && inv.summary.toLowerCase().includes(text)) ||
          inv._id.includes(text)
      )
      .slice(0, limit);

    // Search evidence by title, url, snippet
    const allEvidence = await ctx.db.query("evidence").collect();
    const evidence = allEvidence
      .filter(
        (e) =>
          e.title.toLowerCase().includes(text) ||
          e.url.toLowerCase().includes(text) ||
          e.snippet.toLowerCase().includes(text) ||
          e._id.includes(text)
      )
      .slice(0, limit);

    return { rooms, claims, investigations, evidence };
  },
});
