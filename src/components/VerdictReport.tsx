import React, { useEffect } from "react";
import { Flame, ShieldCheck, AlertOctagon, Cpu, Zap, DollarSign, Scale, Clock, Lock, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface VerdictReportProps {
  verdict: "CERTIFIED_SMOKE" | "PLAUSIBLE" | "VERIFIED_LEGIT" | "INSUFFICIENT_EVIDENCE";
  completionReason?: "out_of_scope" | "technical_failure" | "insufficient_evidence" | "assessed";
  diagnostics?: string[];
  hypeScore?: number;
  summary?: string;
  edgeCaseWarning?: string;
  auditSources?: {
    initialSearch: "live" | "demo";
    contrastSearch: "live" | "demo";
    synthesis: "live" | "demo";
  };
  metrics?: {
    latencyMs: number;
    inputTokens?: number;
    outputTokens?: number;
    estimatedCostUsd?: number;
    confidenceScore?: number;
    measurementSource?: "provider" | "unavailable";
  };
  hasProAccess: boolean;
  onOpenPaywall: () => void;
  onNewClaim: () => void;
  claimText?: string;
  onReauditClaim?: (newClaimText: string) => void;
}

export const VerdictReport: React.FC<VerdictReportProps> = ({
  verdict,
  completionReason,
  diagnostics,
  hypeScore,
  summary,
  edgeCaseWarning,
  auditSources,
  metrics,
  hasProAccess,
  onOpenPaywall,
  onNewClaim,
}) => {
  const hasLiveAudit = auditSources?.initialSearch === "live"
    && auditSources.contrastSearch === "live"
    && auditSources.synthesis === "live";
  const effectiveVerdict = hasLiveAudit ? verdict : "INSUFFICIENT_EVIDENCE";
  const effectiveSummary = completionReason === "out_of_scope" ? summary : completionReason === "technical_failure" ? "La auditoría no pudo completarse por un fallo técnico. Esto no demuestra que la afirmación sea falsa. Los diagnósticos indican la etapa afectada." : hasLiveAudit
    ? summary ?? "Resumen no disponible."
    : auditSources
    ? "La auditoría incluye datos de demo. Se requieren búsquedas y una síntesis reales para evaluar esta afirmación."
    : "El origen de las búsquedas y la síntesis no quedó registrado. Este reporte no permite verificar la afirmación.";

  const resultLabel = completionReason === "out_of_scope" ? "FUERA DE ALCANCE" : completionReason === "technical_failure" ? "AUDITORÍA INTERRUMPIDA" : !auditSources ? "REPORTE ANTIGUO" : "EVIDENCIA INSUFICIENTE";

  useEffect(() => {
    if (effectiveVerdict === "VERIFIED_LEGIT") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [effectiveVerdict]);

  const isSmoke = effectiveVerdict === "CERTIFIED_SMOKE";
  const isPlausible = effectiveVerdict === "PLAUSIBLE";
  const isInsufficient = effectiveVerdict === "INSUFFICIENT_EVIDENCE";
  const hasProviderMetrics = metrics?.measurementSource === "provider";
  const { latencyMs, inputTokens, outputTokens, estimatedCostUsd, confidenceScore } = metrics ?? {};
  const isMeasured = (value: number | undefined): value is number =>
    hasProviderMetrics && value !== undefined && Number.isFinite(value);
  const unavailableMetric = <span className="text-xs font-normal text-slate-400">No disponible</span>;
  const hypeLabel = hypeScore !== undefined && Number.isFinite(hypeScore)
    ? `${hypeScore}%`
    : "No disponible";
  const sourceLabel = (value: "live" | "demo") => value === "live" ? "Real" : "Demo";

  return (
    <div className="bg-tribunal-card border border-tribunal-border rounded-xl p-6 shadow-2xl space-y-6 max-w-4xl mx-auto">
      <div className={`rounded-lg border p-3 text-xs space-y-1 ${
        hasLiveAudit
          ? "bg-emerald-950/30 border-emerald-800 text-emerald-200"
          : "bg-amber-950/30 border-amber-800 text-amber-200"
      }`}>
        <p className="font-bold">
          {completionReason === "out_of_scope" ? "Evaluación de alcance · Sin búsquedas ni inferencia" : hasLiveAudit ? "Auditoría con fuentes reales" : auditSources ? "Auditoría con datos de demo" : "Origen no registrado"}
        </p>
        {auditSources ? (
          <>
            <p>
              Búsqueda inicial: {sourceLabel(auditSources.initialSearch)} · Contraste: {sourceLabel(auditSources.contrastSearch)} · Síntesis: {sourceLabel(auditSources.synthesis)}
            </p>
            {!hasLiveAudit && <p>Los datos de demo muestran el flujo y no permiten verificar esta afirmación.</p>}
          </>
        ) : (
          <p>{completionReason === "out_of_scope" ? "No se generaron fuentes: esta pregunta no puede resolverse con evidencia web." : "Este reporte antiguo no registra la procedencia. Requiere una nueva auditoría con el backend actualizado."}</p>
        )}
      </div>

      {diagnostics && diagnostics.length > 0 && <ul className="text-sm text-amber-200">{diagnostics.map((item, index) => <li key={index}>{item}</li>)}</ul>}

      {/* Veredicto Central */}
      <div className="text-center space-y-3 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
          <Scale className="w-4 h-4 text-purple-400" />
          <span>Veredicto Emitido por el Tribunal de la Verdad</span>
        </div>

        <div className="py-2">
          {isInsufficient && (
            <div className="inline-block bg-amber-950/40 border-2 border-amber-600 rounded-2xl px-6 py-4">
              <div className="flex items-center justify-center space-x-3 text-amber-300">
                <AlertOctagon className="w-8 h-8 shrink-0" />
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
                  {resultLabel}
                </span>
              </div>
              <p className="text-xs text-amber-200 font-mono mt-2">
                No se emite una conclusión sobre la afirmación ni un índice de hype.
              </p>
            </div>
          )}

          {isSmoke && (
            <div className="inline-block bg-red-950/60 border-2 border-red-500 rounded-2xl px-6 py-4 shadow-xl shadow-red-500/20">
              <div className="flex items-center justify-center space-x-3 text-red-400">
                <Flame className="w-8 h-8 text-red-500 animate-bounce" />
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
                  CERTIFIED SMOKE · PURO HUMO
                </span>
              </div>
              <p className="text-xs text-red-300 font-mono mt-1">
                Índice de Exageración / Hype: {hypeLabel}
              </p>
            </div>
          )}

          {isPlausible && (
            <div className="inline-block bg-amber-950/60 border-2 border-amber-500 rounded-2xl px-6 py-4 shadow-xl shadow-amber-500/20">
              <div className="flex items-center justify-center space-x-3 text-amber-400">
                <AlertOctagon className="w-8 h-8 text-amber-500" />
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
                  PLAUSIBLE CON RESERVAS
                </span>
              </div>
              <p className="text-xs text-amber-300 font-mono mt-1">
                Índice de Exageración / Hype: {hypeLabel}
              </p>
            </div>
          )}

          {effectiveVerdict === "VERIFIED_LEGIT" && (
            <div className="inline-block bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl px-6 py-4 shadow-xl shadow-emerald-500/20">
              <div className="flex items-center justify-center space-x-3 text-emerald-400">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
                  VERIFIED LEGIT · SUSTENTADO
                </span>
              </div>
              <p className="text-xs text-emerald-300 font-mono mt-1">
                Índice de Exageración / Hype: {hypeLabel}
              </p>
            </div>
          )}
        </div>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {effectiveSummary}
        </p>
      </div>

      {/* Métricas Cuantitativas Exigidas por Nebius Token Factory */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>Métricas Cuantitativas de Inferencia (Nebius Token Factory)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-slate-400 text-[10px] font-mono flex items-center justify-center space-x-1">
              <Clock className="w-3 h-3 text-purple-400" />
              <span>LATENCIA DE INFERENCIA</span>
            </div>
            <div className="text-lg font-mono font-bold text-white mt-1">
              {isMeasured(latencyMs)
                ? <>{latencyMs} <span className="text-xs font-normal text-slate-400">ms</span></>
                : unavailableMetric}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-slate-400 text-[10px] font-mono flex items-center justify-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>TOKENS E/S</span>
            </div>
            <div className="text-lg font-mono font-bold text-white mt-1">
              {isMeasured(inputTokens) && isMeasured(outputTokens)
                ? `${inputTokens} / ${outputTokens}`
                : unavailableMetric}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-slate-400 text-[10px] font-mono flex items-center justify-center space-x-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>COSTO ESTIMADO</span>
            </div>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
              {isMeasured(estimatedCostUsd)
                ? <>${estimatedCostUsd} <span className="text-[10px] text-slate-400">USD</span></>
                : unavailableMetric}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-slate-400 text-[10px] font-mono flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>CONFIANZA</span>
            </div>
            <div className="text-lg font-mono font-bold text-indigo-400 mt-1">
              {isMeasured(confidenceScore) ? `${confidenceScore}%` : unavailableMetric}
            </div>
          </div>
        </div>
      </div>

      {/* Caso Límite y Alcance Técnico Documentado */}
      <div className="bg-purple-950/20 border border-purple-900/60 rounded-lg p-4 space-y-1 text-xs">
        <div className="font-bold text-purple-300 flex items-center space-x-1.5">
          <AlertOctagon className="w-4 h-4 text-purple-400" />
          <span>Caso Límite y Alcance Técnico:</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
          {edgeCaseWarning ?? "Limitación específica no registrada para este reporte."}
        </p>
      </div>

      {/* Asistente Pericial: Sugerencias Proactivas cuando no hay suficiente evidencia */}
      {isInsufficient && (
        <div className="border border-purple-800/40 bg-purple-950/20 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-purple-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Asistente Pericial: Cómo reformular para que sea auditable</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Esta afirmación no produjo pruebas suficientes o fue planteada como una cuestión subjetiva o no falsable. Para someterla a un juicio pericial concluyente, el Tribunal sugiere estas vías de reformulación:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
              <span className="text-[10px] font-mono bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">Enfoque Empírico y Censal</span>
              <p className="text-slate-200">Reemplaza afirmaciones absolutas por estudios estadísticos, encuestas o censos de fuentes reconocidas (Pew Research, Gartner, etc.).</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
              <span className="text-[10px] font-mono bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded">Benchmarks Reproducibles</span>
              <p className="text-slate-200">Acota la afirmación a conjuntos de pruebas estándar (ej. SWE-bench, MLPerf, métricas de transacciones on-chain verificadas).</p>
            </div>
          </div>
          <div className="pt-1 text-center sm:text-left">
            <button
              type="button"
              onClick={onNewClaim}
              className="inline-flex items-center space-x-1.5 text-xs text-purple-200 hover:text-white bg-purple-900/50 hover:bg-purple-800/70 border border-purple-700/60 px-3 py-1.5 rounded-lg transition font-medium shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Abrir Asistente de Prompts para reformular un nuevo claim</span>
            </button>
          </div>
        </div>
      )}

      {/* Bloque Pro / RevenueCat Paywall */}
      <div className="border border-amber-500/30 bg-gradient-to-r from-amber-950/30 to-slate-950 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <span className="text-amber-400 font-bold text-sm">
              Dossier Pericial Pro para Fondos VC e Inversionistas
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/40">
              REVENUECAT TEST STORE
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-lg">
            {hasProAccess
              ? "Acceso Pro verificado. Tu suscripción sandbox está activa. Puedes descargar y ver el análisis de riesgo profundo."
              : "Desbloquea el desglose pericial de vulnerabilidades del claim, matriz de riesgo legal y exportación completa de pruebas."}
          </p>
        </div>

        <button
          onClick={onOpenPaywall}
          className={`shrink-0 px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
            hasProAccess
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30"
              : "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20"
          }`}
        >
          {hasProAccess ? (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Ver Dossier VC Desbloqueado</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Desbloquear con Test Store</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Botón Auditar otro claim */}
      <div className="pt-2 text-center">
        <button
          onClick={onNewClaim}
          className="text-xs text-slate-400 hover:text-white transition font-mono underline underline-offset-4"
        >
          ← Juzgar otra afirmación en esta misma sala
        </button>
      </div>
    </div>
  );
};
