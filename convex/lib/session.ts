import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
// Possession of a 256-bit browser secret is the anonymous session credential.
// Public IDs are one-way hashes; they never authorize an operation themselves.
export async function sessionUserId(token: string): Promise<string> {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("Sesión inválida. Recarga la página.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return "tt_" + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}
export async function requireHost(ctx: QueryCtx | MutationCtx, roomId: Id<"rooms">, token: string) {
  const room = await ctx.db.get(roomId);
  if (!room || room.hostUserId !== await sessionUserId(token)) throw new Error("Sólo el anfitrión puede controlar esta sala.");
  return room;
}
