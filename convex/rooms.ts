import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generar código legible estilo "HYPE-742"
function generateRoomCode(): string {
  const num = Math.floor(100 + Math.random() * 900);
  return `HYPE-${num}`;
}

// Creación atómica de sala con su claim inicial
export const createWithClaim = mutation({
  args: {
    title: v.string(),
    hostUserId: v.string(),
    claimText: v.string(),
  },
  handler: async (ctx, args) => {
    const code = generateRoomCode();
    const roomId = await ctx.db.insert("rooms", {
      code,
      title: args.title,
      hostUserId: args.hostUserId,
      status: "voting",
      createdAt: Date.now(),
    });

    const claimId = await ctx.db.insert("claims", {
      roomId,
      authorName: "Host",
      content: args.claimText,
      createdAt: Date.now(),
    });

    await ctx.db.patch(roomId, {
      activeClaimId: claimId,
    });

    return { roomId, code, claimId };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    hostUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const code = generateRoomCode();
    const roomId = await ctx.db.insert("rooms", {
      code,
      title: args.title,
      hostUserId: args.hostUserId,
      status: "lobby",
      createdAt: Date.now(),
    });
    return { roomId, code };
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    let clean = args.code.toUpperCase().trim();
    if (!clean.startsWith("HYPE-") && /^\d+$/.test(clean)) {
      clean = `HYPE-${clean}`;
    }
    return await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", clean))
      .first();
  },
});

export const get = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.roomId);
  },
});

export const updateStatus = mutation({
  args: {
    roomId: v.id("rooms"),
    status: v.union(
      v.literal("lobby"),
      v.literal("voting"),
      v.literal("auditing"),
      v.literal("verdict")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, { status: args.status });
  },
});

export const setActiveClaim = mutation({
  args: {
    roomId: v.id("rooms"),
    claimId: v.id("claims"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, {
      activeClaimId: args.claimId,
      status: "voting",
    });
  },
});

// Preparar el siguiente caso (pone la sala en lobby manteniendo a todos los jugadores conectados)
export const prepareNextClaim = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, {
      status: "lobby",
    });
  },
});

// Iniciar un nuevo caso en la misma sala (atómico: crea claim y pasa a votación)
export const startNextClaim = mutation({
  args: {
    roomId: v.id("rooms"),
    claimText: v.string(),
    authorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const claimId = await ctx.db.insert("claims", {
      roomId: args.roomId,
      authorName: args.authorName || "Host",
      content: args.claimText,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.roomId, {
      activeClaimId: claimId,
      status: "voting",
    });

    return claimId;
  },
});

