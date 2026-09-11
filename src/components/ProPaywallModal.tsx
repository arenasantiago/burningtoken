import React, { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
interface Props {
  isOpen: boolean; onClose: () => void; hasProAccess: boolean;
  onPurchaseSuccess: () => Promise<void>; onRefreshAccess: () => Promise<void>;
  purchaseAvailable: boolean; setupError: string | null; purchaseToken: string;
  investigationId?: Id<"investigations">; claimText?: string;
}
export function ProPaywallModal(props: Props) {
  const convex = useConvex();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (task: () => Promise<void>) => {
    if (pending) return;
    setPending(true); setError(null);
    try { await task(); } catch (e) { setError(e instanceof Error ? e.message : "No pudimos completar la operación."); }
    finally { setPending(false); }
  };
  const download = async () => {
    if (!props.investigationId) return;
    const dossier = await convex.query(api.entitlements.dossier, { token: props.purchaseToken, investigationId: props.investigationId });
    const text = ["TRUTH TRIBUNAL · DOSSIER DE DUE DILIGENCE", dossier.claim, dossier.verdict, dossier.summary, "Limitaciones", dossier.limitations, "Fuentes", ...dossier.evidence.map(e => `${e.title}\n${e.url}\n${e.snippet}\nEvaluación: ${e.assessment}; incertidumbre: ${e.uncertainty}`)].filter(Boolean).join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "truth-tribunal-dossier.txt"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (!props.isOpen) return null;
  return <div className="fixed inset-0 z-50 bg-black/80 p-3 sm:p-6 flex items-center justify-center" onKeyDown={e => { if (e.key === "Escape" && !pending) props.onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="pro-title" className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl border border-purple-500/40 bg-slate-950 p-5 sm:p-8 space-y-5">
      <div className="flex items-start justify-between gap-4"><h2 id="pro-title" className="text-xl font-bold text-white">{props.hasProAccess ? "Acceso Pro verificado" : "Dossier de Due Diligence"}</h2><button autoFocus disabled={pending} onClick={props.onClose} aria-label="Cerrar" className="min-h-11 min-w-11 text-slate-300">✕</button></div>
      <p className="text-sm text-slate-300">Exporta el análisis del caso, sus fuentes y sus limitaciones. El dossier utiliza los resultados de la investigación; no inventa puntuaciones de inversión.</p>
      <p className="rounded-lg bg-amber-950/40 p-3 text-sm text-amber-200">RevenueCat Test Store · Prueba sin cargos reales. La suscripción de prueba caduca automáticamente.</p>
      {(error || props.setupError) && <p role="alert" className="text-sm text-red-300 break-words">{error || props.setupError}</p>}
      {props.hasProAccess ? <><button disabled={pending || !props.investigationId} onClick={() => void run(download)} className="w-full rounded-lg bg-purple-600 p-3 font-semibold text-white disabled:opacity-50">Descargar dossier del caso</button>{!props.investigationId && <p className="text-sm text-slate-400">Termina una investigación para generar su dossier.</p>}</> : <button disabled={pending || !props.purchaseAvailable} onClick={() => void run(props.onPurchaseSuccess)} className="w-full rounded-lg bg-purple-600 p-3 font-semibold text-white disabled:opacity-50">{pending ? "Procesando…" : "Probar Pro en Test Store"}</button>}
      <button disabled={pending} onClick={() => void run(props.onRefreshAccess)} className="w-full min-h-11 rounded-lg border border-slate-700 p-3 text-slate-200 disabled:opacity-50">Actualizar suscripción</button>
      <p className="text-xs text-slate-400">El acceso pertenece a este navegador. El servidor confirma la compra y su vigencia con RevenueCat antes de habilitar la descarga.</p>
    </section>
  </div>;
}
