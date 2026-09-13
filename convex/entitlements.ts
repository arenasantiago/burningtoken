import { action, internalMutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { requireHost, sessionUserId } from "./lib/session";
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
    if (!key) throw new ConvexError("La verificación de suscripciones aún no está configurada.");
    const response = await fetch("https://api.revenuecat.com/v1/subscribers/" + encodeURIComponent(userId), {
      headers: { Authorization: "Bearer " + key, Accept: "application/json" }, signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new ConvexError("No pudimos verificar la suscripción. Intenta de nuevo.");
    const result = readTestStoreEntitlement(await response.json());
    await ctx.runMutation(internal.entitlements.storeVerified, { userId, ...result });
    return { hasProAccess: result.hasProAccess, expirationDate: result.expirationDate };
  },
});
export const dossier = query({
  args: { token: v.string(), sessionToken: v.string(), investigationId: v.id("investigations") },
  handler: async (ctx, { token, sessionToken, investigationId }) => {
    const userId = await sessionUserId(token);
    const access = await ctx.db.query("userEntitlements").withIndex("by_user", q => q.eq("userId", userId)).first();
    if (!verifiedAccess(access)) throw new ConvexError("Verifica una suscripción activa antes de abrir el dossier.");
    const investigation = await ctx.db.get(investigationId);
    if (!investigation || investigation.currentStep !== "completed") throw new ConvexError("El dossier estará disponible al terminar la investigación.");
    await requireHost(ctx, investigation.roomId, sessionToken);
    const claim = await ctx.db.get(investigation.claimId);
    const room = await ctx.db.get(investigation.roomId);
    if (!claim || claim.roomId !== investigation.roomId || !room) throw new ConvexError("El caso solicitado no es válido.");
    const evidence = await ctx.db.query("evidence").withIndex("by_investigation", q => q.eq("investigationId", investigationId)).collect();

    const evaluable = investigation.completionReason === "assessed" && investigation.hypeScore !== undefined && investigation.verdict !== undefined;
    const hype = investigation.hypeScore ?? 0;
    const verdict = investigation.verdict ?? "INSUFFICIENT_EVIDENCE";
    const realEvidence = evidence.filter(e => e.source === "linkup");
    const supporting = realEvidence.filter(e => e.assessment === "supports").length;
    const contradicting = realEvidence.filter(e => e.assessment === "contradicts").length;
    const highUncertainty = realEvidence.filter(e => e.uncertaintyLevel === "HIGH").length;

    const reputationalRisk = !evaluable ? "No evaluable" : hype >= 75 ? "Crítico (Hype desmedido)" : hype >= 45 ? "Moderado (Exageración parcial)" : "Bajo (Respaldado empíricamente)";
    const technicalRisk = !evaluable ? "No evaluable" : verdict === "CERTIFIED_SMOKE" ? "Alto (Contradicción técnica trazable)" : verdict === "PLAUSIBLE" ? "Medio (Metodología plausible con reservas)" : "Bajo (Respaldado por benchmarks / literatura)";
    const evidenceQuality = realEvidence.length === 0 ? "Nula (Sin fuentes contrastables)" : highUncertainty > realEvidence.length / 2 ? "Baja (Predominio de fuentes secundarias o prensa)" : "Alta (Fuentes primarias y contrastadas)";

    const recommendation = !evaluable
      ? "Auditoría no evaluable: no emitir una clasificación de riesgo hasta completar evidencia e inferencia trazables."
      : verdict === "CERTIFIED_SMOKE"
      ? "Rechazar adopción o tesis de inversión sin auditoría de caja blanca y pruebas de carga reproducibles."
      : verdict === "PLAUSIBLE"
      ? "Aceptar condicionalmente: someter a revisión de benchmarks específicos y limitar promesas de plazos."
      : verdict === "VERIFIED_LEGIT"
      ? "Sustentabilidad técnica acreditada. Proceder con debida diligencia operativa y económica estándar."
      : "Investigación no concluyente: abstenerse de emitir juicio hasta recopilar fuentes primarias.";

    return {
      caseCode: room?.code ?? "CASO-PERICIAL",
      roomTitle: room?.title,
      claim: claim?.content,
      summary: investigation.summary,
      verdict: investigation.verdict,
      hypeScore: investigation.hypeScore,
      evaluable,
      completionReason: investigation.completionReason,
      limitations: investigation.edgeCaseWarning,
      certifiedAt: investigation.updatedAt ?? Date.now(),
      metrics: investigation.metrics,
      researchPlan: investigation.researchPlan,
      riskMatrix: {
        reputationalRisk,
        technicalRisk,
        evidenceQuality,
        recommendation,
        supportingCount: supporting,
        contradictingCount: contradicting,
        sourcesCount: realEvidence.length,
      },
      evidence: realEvidence.map(e => ({
        title: e.title,
        url: e.url,
        snippet: e.snippet,
        assessment: e.assessment ?? "unassessed",
        uncertainty: e.uncertaintyLevel,
        supportingQuote: e.supportingQuote,
        reason: e.assessmentReason,
        queryUsed: e.queryUsed,
        step: e.step,
      })),
    };
  },
});
