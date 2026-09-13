import { sessionUserId, requireHost } from "./lib/session";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateClaimText, validateNickname, validateRoomCode, validateRoomTitle } from "./lib/inputValidation";

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRoomCode(): string {
  let suffix = "";
  for (let index = 0; index < 6; index += 1) {
    suffix += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return `HYPE-${suffix}`;
}

async function availableRoomCode(ctx: any): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateRoomCode();
    const existing = await ctx.db.query("rooms").withIndex("by_code", (q: any) => q.eq("code", code)).first();
    if (!existing) return code;
  }
  throw new Error("No pudimos reservar un código de sala. Intenta de nuevo.");
}

// Creación atómica de sala con su claim inicial
export const createWithClaim = mutation({
  args: {
    title: v.string(),
    sessionToken: v.string(),
    claimText: v.string(),
  },
  handler: async (ctx, args) => {
    const code = await availableRoomCode(ctx);
    const title = validateRoomTitle(args.title);
    const claimText = validateClaimText(args.claimText);
    const roomId = await ctx.db.insert("rooms", {
      code,
      title,
      hostUserId: await sessionUserId(args.sessionToken),
      status: "voting",
      createdAt: Date.now(),
    });

    const claimId = await ctx.db.insert("claims", {
      roomId,
      authorName: "Host",
      content: claimText,
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
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const code = await availableRoomCode(ctx);
    const title = validateRoomTitle(args.title);
    const roomId = await ctx.db.insert("rooms", {
      code,
      title,
      hostUserId: await sessionUserId(args.sessionToken),
      status: "lobby",
      createdAt: Date.now(),
    });
    return { roomId, code };
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const clean = validateRoomCode(args.code);
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

export const updateStatus = internalMutation({
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

export const setActiveClaim = internalMutation({
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
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await requireHost(ctx, args.roomId, args.sessionToken);
    if (room.status === "auditing") throw new Error("Espera a que termine la investigación.");
    await ctx.db.patch(args.roomId, {
      status: "lobby",
    });
  },
});

// Iniciar un nuevo caso en la misma sala (atómico: crea claim y pasa a votación)
export const startNextClaim = mutation({
  args: {
    roomId: v.id("rooms"),
    sessionToken: v.string(),
    claimText: v.string(),
    authorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const room = await requireHost(ctx, args.roomId, args.sessionToken);
    if (room.status !== "lobby" && room.status !== "verdict") throw new Error("Ya hay un caso activo.");
    const claimText = validateClaimText(args.claimText);
    const authorName = args.authorName ? validateNickname(args.authorName) : "Host";
    const claimId = await ctx.db.insert("claims", {
      roomId: args.roomId,
      authorName,
      content: claimText,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.roomId, {
      activeClaimId: claimId,
      status: "voting",
    });

    return claimId;
  },
});

