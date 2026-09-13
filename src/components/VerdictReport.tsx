import React, { useEffect } from "react";
import { Flame, ShieldCheck, AlertOctagon, Cpu, Zap, DollarSign, Scale, Clock, Lock, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { PericialTerm } from "./PericialTerm";
import { useLanguage } from "../context/LanguageContext";

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
  onLeaveRoom?: () => void;
  isHost?: boolean;
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
  onLeaveRoom,
  isHost = true,
}) => {
  const { language } = useLanguage();
  const isEs = language === "es";

  const hasLiveAudit = auditSources?.initialSearch === "live"
    && auditSources.contrastSearch === "live"
    && auditSources.synthesis === "live";
  const effectiveVerdict = hasLiveAudit ? verdict : "INSUFFICIENT_EVIDENCE";
  const effectiveSummary =
    completionReason === "out_of_scope"
      ? summary
      : completionReason === "technical_failure"
      ? isEs
        ? "La auditoría no pudo completarse por un fallo técnico. Esto no demuestra que la afirmación sea falsa. Los diagnósticos indican la etapa afectada."
        : "The audit could not be completed due to a technical failure. This does not prove the claim is false. Diagnostics indicate the affected stage."
      : hasLiveAudit
      ? summary ?? (isEs ? "Resumen no disponible." : "Summary not available.")
      : auditSources
      ? isEs
        ? "La auditoría incluye datos de demo. Se requieren búsquedas y una síntesis reales para evaluar esta afirmación."
        : "The audit includes demo data. Live searches and real synthesis are required to assess this claim."
      : isEs
      ? "El origen de las búsquedas y la síntesis no quedó registrado. Este reporte no permite verificar la afirmación."
      : "The origin of searches and synthesis was not recorded. This report cannot verify the claim.";

  const resultLabel =
    completionReason === "out_of_scope"
      ? (isEs ? "FUERA DE ALCANCE" : "OUT OF SCOPE")
      : completionReason === "technical_failure"
      ? (isEs ? "AUDITORÍA INTERRUMPIDA" : "AUDIT INTERRUPTED")
      : !auditSources
      ? (isEs ? "REPORTE ANTIGUO" : "LEGACY REPORT")
      : (isEs ? "EVIDENCIA INSUFICIENTE" : "INSUFFICIENT EVIDENCE");

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
  const unavailableMetric = <span className="text-xs font-normal text-slate-400">{isEs ? "No disponible" : "Not available"}</span>;
  const hypeLabel = hypeScore !== undefined && Number.isFinite(hypeScore)
    ? `${hypeScore}%`
    : (isEs ? "No disponible" : "Not available");
  const sourceLabel = (value: "live" | "demo") => value === "live" ? (isEs ? "Real" : "Live") : "Demo";

  return (
    <div className="bg-tribunal-card border border-tribunal-border rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-6 max-w-4xl mx-auto">
      <div className={`rounded-lg border p-3 text-xs space-y-1 ${
        hasLiveAudit
          ? "bg-emerald-950/30 border-emerald-800 text-emerald-200"
          : "bg-amber-950/30 border-amber-800 text-amber-200"
      }`}>
        <p className="font-bold">
          {completionReason === "out_of_scope"
            ? (isEs ? "Evaluación de alcance · Sin búsquedas ni inferencia" : "Scope assessment · No searches or inference performed")
            : hasLiveAudit
            ? (isEs ? "Auditoría con fuentes reales" : "Audit with live sources")
            : auditSources
            ? (isEs ? "Auditoría con datos de demo" : "Audit with demo data")
            : (isEs ? "Origen no registrado" : "Unrecorded origin")}
        </p>
        {auditSources ? (
          <>
            <p>
              {isEs ? "Búsqueda inicial:" : "Initial search:"} {sourceLabel(auditSources.initialSearch)} · {isEs ? "Contraste:" : "Contrast:"} {sourceLabel(auditSources.contrastSearch)} · {isEs ? "Síntesis:" : "Synthesis:"} {sourceLabel(auditSources.synthesis)}
            </p>
            {!hasLiveAudit && (
              <p>
                {isEs
                  ? "Los datos de demo muestran el flujo y no permiten verificar esta afirmación."
                  : "Demo data illustrates pipeline flow and does not verify this claim."}
              </p>
            )}
          </>
        ) : (
          <p>
            {completionReason === "out_of_scope"
              ? (isEs ? "No se generaron fuentes: esta pregunta no puede resolverse con evidencia web." : "No sources generated: this question cannot be resolved with web evidence.")
              : (isEs ? "Este reporte antiguo no registra la procedencia. Requiere una nueva auditoría con el backend actualizado." : "This legacy report does not record provenance. It requires a new audit with the updated backend.")}
          </p>
        )}
      </div>

      {diagnostics && diagnostics.length > 0 && <ul className="text-sm text-amber-200">{diagnostics.map((item, index) => <li key={index}>{item}</li>)}</ul>}

      {/* Veredicto Central */}
      <div className="text-center space-y-3 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
          <Scale className="w-4 h-4 text-purple-400" />
          <span>{isEs ? "Veredicto Emitido por el Tribunal de la Verdad" : "Verdict Issued by the Truth Tribunal"}</span>
        </div>

        <div className="py-2">
          {isInsufficient && (
            <div className="inline-block bg-amber-950/40 border-2 border-amber-600 rounded-2xl px-6 py-4">
              <div className="flex items-center justify-center space-x-3 text-amber-300">
                <AlertOctagon className="w-8 h-8 shrink-0" />
                <span className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
                  {resultLabel}
                </span>
              </div>
              <p className="text-xs text-amber-200 font-mono mt-2">
                {isEs
                  ? "No se emite una conclusión sobre la afirmación ni un índice de hype."
                  : "No conclusion or hype score is issued for this claim."}
              </p>
            </div>
          )}

          {isSmoke && (
            <div className="inline-block bg-red-950/60 border-2 border-red-500 rounded-2xl px-6 py-4 shadow-xl shadow-red-500/20">
              <div className="flex items-center justify-center space-x-3 text-red-400">
                <Flame className="w-8 h-8 text-red-500 animate-bounce" />
                <span className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
                  {isEs ? "CERTIFIED SMOKE · PURO HUMO" : "CERTIFIED SMOKE · PURE HYPE"}
                </span>
              </div>
              <p className="text-xs text-red-300 font-mono mt-1">
                {isEs ? "Índice de Exageración / Hype:" : "Hype / Exaggeration Index:"} {hypeLabel}
              </p>
            </div>
          )}

          {isPlausible && (
            <div className="inline-block bg-amber-950/60 border-2 border-amber-500 rounded-2xl px-6 py-4 shadow-xl shadow-amber-500/20">
              <div className="flex items-center justify-center space-x-3 text-amber-400">
                <AlertOctagon className="w-8 h-8 text-amber-500" />
                <span className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
                  {isEs ? "PLAUSIBLE CON RESERVAS" : "PLAUSIBLE WITH RESERVATIONS"}
                </span>
              </div>
              <p className="text-xs text-amber-300 font-mono mt-1">
                {isEs ? "Índice de Exageración / Hype:" : "Hype / Exaggeration Index:"} {hypeLabel}
              </p>
            </div>
          )}

          {effectiveVerdict === "VERIFIED_LEGIT" && (
            <div className="inline-block bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl px-6 py-4 shadow-xl shadow-emerald-500/20">
              <div className="flex items-center justify-center space-x-3 text-emerald-400">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <span className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
                  {isEs ? "VERIFIED LEGIT · SUSTENTADO" : "VERIFIED LEGIT · GROUNDED"}
                </span>
              </div>
              <p className="text-xs text-emerald-300 font-mono mt-1">
                {isEs ? "Índice de Exageración / Hype:" : "Hype / Exaggeration Index:"} {hypeLabel}
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
          <span>
            {isEs ? "Métricas Cuantitativas de " : "Quantitative "}
            <PericialTerm term="Inferencia Forense">{isEs ? "Inferencia" : "Inference"}</PericialTerm>
            {isEs ? " (Nebius Token Factory)" : " Metrics (Nebius Token Factory)"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-slate-400 text-[10px] font-mono flex items-center justify-center space-x-1">
              <Clock className="w-3 h-3 text-purple-400" />
              <span><PericialTerm term="Latencia de Inferencia">{isEs ? "LATENCIA DE INFERENCIA" : "INFERENCE LATENCY"}</PericialTerm></span>
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
              <span><PericialTerm term="Tokens">{isEs ? "TOKENS E/S" : "I/O TOKENS"}</PericialTerm></span>
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
              <span>{isEs ? "COSTO ESTIMADO" : "ESTIMATED COST"}</span>
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
              <span>{isEs ? "CONFIANZA" : "CONFIDENCE"}</span>
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
          <span><PericialTerm term="Caso Límite">{isEs ? "Caso Límite" : "Edge Case"}</PericialTerm> {isEs ? "y Alcance Técnico:" : "& Technical Scope:"}</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
          {edgeCaseWarning ?? (isEs ? "Limitación específica no registrada para este reporte." : "Specific limitation not recorded for this report.")}
        </p>
      </div>

      {/* Asistente Pericial: Sugerencias Proactivas cuando no hay suficiente evidencia */}
      {isInsufficient && (
        <div className="border border-purple-800/40 bg-purple-950/20 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-purple-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{isEs ? "Asistente Pericial: Cómo reformular para que sea auditable" : "Forensic Assistant: How to rephrase to make it auditable"}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isEs
              ? "Esta afirmación no produjo pruebas suficientes o fue planteada como una cuestión subjetiva o no falsable. Para someterla a un juicio pericial concluyente, el Tribunal sugiere estas vías de reformulación:"
              : "This claim produced insufficient evidence or was posed as a subjective or unfalsifiable question. To submit it to a conclusive trial, the Tribunal suggests these rephrasings:"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
              <span className="text-[10px] font-mono bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">
                {isEs ? "Enfoque Empírico y Censal" : "Empirical & Census Focus"}
              </span>
              <p className="text-slate-200">
                {isEs
                  ? "Reemplaza afirmaciones absolutas por estudios estadísticos, encuestas o censos de fuentes reconocidas (Pew Research, Gartner, etc.)."
                  : "Replace absolute claims with statistical studies, surveys, or censuses from recognized sources (Pew Research, Gartner, etc.)."}
              </p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
              <span className="text-[10px] font-mono bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded">
                {isEs ? "Benchmarks Reproducibles" : "Reproducible Benchmarks"}
              </span>
              <p className="text-slate-200">
                {isEs
                  ? "Acota la afirmación a conjuntos de pruebas estándar (ej. SWE-bench, MLPerf, métricas de transacciones on-chain verificadas)."
                  : "Scope the claim to standardized benchmark testbeds (e.g., SWE-bench, MLPerf, verified on-chain metrics)."}
              </p>
            </div>
          </div>
          <div className="pt-1 text-center sm:text-left">
            <button
              type="button"
              onClick={onNewClaim}
              className="inline-flex items-center space-x-1.5 text-xs text-purple-200 hover:text-white bg-purple-900/50 hover:bg-purple-800/70 border border-purple-700/60 px-3 py-1.5 rounded-lg transition font-medium shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>{isEs ? "Abrir Asistente de Prompts para reformular un nuevo claim" : "Open Prompt Assistant to rephrase a new claim"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Bloque Pro / RevenueCat Paywall con +Fuentes y Generador de Prompts */}
      <div className="border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-950 to-amber-950/20 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-amber-400 font-bold text-sm">
                {isEs ? "Dossier Pericial Pro (" : "Pro Forensic Dossier ("}
                <PericialTerm term="Due Diligence">Due Diligence</PericialTerm>
                {isEs ? ") para Fondos VC e Inversionistas" : ") for VC Funds & Investors"}
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/40">
                {isEs ? "PLAN PRO" : "PRO PLAN"}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              {hasProAccess
                ? (isEs
                    ? "Suscripción Pro verificada. Tienes acceso al desglose exhaustivo de pruebas, matriz de riesgo de litigio y exportación pericial."
                    : "Verified Pro subscription. You have access to comprehensive evidence breakdown, risk matrix, and forensic export.")
                : (isEs
                    ? "Desbloquea el análisis forense profundo: amplía a +10 fuentes de rastreo cruzado, patentes citadas y generador de contra-interrogatorios."
                    : "Unlock deep forensic analysis: expand to +10 cross-check sources, cited patents, and cross-examination prompt generator.")}
            </p>
          </div>

          <button
            onClick={onOpenPaywall}
            className={`shrink-0 w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg ${
              hasProAccess
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30"
                : "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-500/20"
            }`}
          >
            {hasProAccess ? (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isEs ? "Ver Dossier VC Desbloqueado" : "View Unlocked VC Dossier"}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 shrink-0" />
                <span>{isEs ? "Desbloquear Funciones Pro" : "Unlock Pro Features"}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </>
            )}
          </button>
        </div>

        {/* Feature Pills Pro */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-500/20 text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-1.5 bg-slate-950/80 p-2 rounded-lg border border-amber-900/30">
            <span className="text-amber-400">●</span>
            <span className="text-[11px]">{isEs ? "+10 Fuentes de Rastreo Cruzado" : "+10 Cross-Research Sources"}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-950/80 p-2 rounded-lg border border-amber-900/30">
            <span className="text-amber-400">●</span>
            <span className="text-[11px]">{isEs ? "Generador Pericial de Prompts Pro" : "Pro Forensic Prompt Generator"}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-950/80 p-2 rounded-lg border border-amber-900/30">
            <span className="text-amber-400">●</span>
            <span className="text-[11px]">{isEs ? "Matriz de Riesgo Due Diligence" : "Due Diligence Risk Matrix"}</span>
          </div>
        </div>
      </div>

      {/* Botón Auditar Siguiente Caso en la Sala */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
        <div>
          {onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="text-xs text-slate-500 hover:text-slate-300 transition font-mono underline underline-offset-4"
            >
              {isEs ? "← Salir al Lobby Principal" : "← Exit to Main Lobby"}
            </button>
          )}
        </div>

        {isHost ? (
          <button
            onClick={onNewClaim}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold px-6 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5 active:scale-95 text-xs font-mono"
          >
            <Scale className="w-4 h-4 text-purple-200 shrink-0" />
            <span>{isEs ? "Auditar Siguiente Caso en esta Sala" : "Audit Next Case in this Room"}</span>
          </button>
        ) : (
          <div className="w-full sm:w-auto text-xs font-mono text-purple-300 bg-purple-950/40 border border-purple-800/40 px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>{isEs ? "Esperando a que el Host inicie el siguiente caso..." : "Waiting for Host to start next case..."}</span>
          </div>
        )}
      </div>
    </div>
  );
};
