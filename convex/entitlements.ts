import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { sessionUserId } from "./lib/session";
import { readTestStoreEntitlement, verifiedAccess } from "./lib/subscription";
export const getStatus = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const userId = await sessionUserId(token);
    const record = await ctx.db.query("userEntitlements").withIndex("by_user", q => q.eq("userId", userId)).first();
    return { hasProAccess: verifiedAccess(record), expirationDate: record?.expirationDate, verifiedAt: record?.updatedAt, userId };
  },
});
export const storeVerified = internalMutation({
  args: { userId: v.string(), hasProAccess: v.boolean(), expirationDate: v.optional(v.number()), entitlementId: v.string(), productId: v.string(), environment: v.literal("SANDBOX") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("userEntitlements").withIndex("by_user", q => q.eq("userId", args.userId)).first();
    const data = { ...args, verifiedBy: "revenuecat" as const, updatedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, data); else await ctx.db.insert("userEntitlements", data);
  },
});
export const sync = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<{ hasProAccess: boolean; expirationDate?: number }> => {
    const userId = await sessionUserId(token);
    const key = process.env.REVENUECAT_SECRET_KEY;
    if (!key) throw new Error("La verificación de suscripciones aún no está configurada.");
    const response = await fetch("https://api.revenuecat.com/v1/subscribers/" + encodeURIComponent(userId), {
      headers: { Authorization: "Bearer " + key, Accept: "application/json" }, signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("No pudimos verificar la suscripción. Intenta de nuevo.");
    const result = readTestStoreEntitlement(await response.json());
    await ctx.runMutation(internal.entitlements.storeVerified, { userId, ...result });
    return { hasProAccess: result.hasProAccess, expirationDate: result.expirationDate };
  },
});
export const dossier = query({
  args: { token: v.string(), investigationId: v.id("investigations") },
  handler: async (ctx, { token, investigationId }) => {
    const userId = await sessionUserId(token);
    const access = await ctx.db.query("userEntitlements").withIndex("by_user", q => q.eq("userId", userId)).first();
    if (!verifiedAccess(access)) throw new Error("Verifica una suscripción activa antes de abrir el dossier.");
    const investigation = await ctx.db.get(investigationId);
    if (!investigation || investigation.currentStep !== "completed") throw new Error("El dossier estará disponible al terminar la investigación.");
    const claim = await ctx.db.get(investigation.claimId);
    const evidence = await ctx.db.query("evidence").withIndex("by_investigation", q => q.eq("investigationId", investigationId)).collect();
    return { claim: claim?.content, summary: investigation.summary, verdict: investigation.verdict, limitations: investigation.edgeCaseWarning,
      evidence: evidence.filter(e => e.source === "linkup").map(e => ({ title: e.title, url: e.url, snippet: e.snippet, assessment: e.assessment ?? "unassessed", uncertainty: e.uncertaintyLevel })) };
  },
});
