import React, { useEffect } from "react";
import { Flame, ShieldCheck, AlertOctagon, Cpu, Zap, DollarSign, Scale, Clock, Lock, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface VerdictReportProps {
  verdict: "CERTIFIED_SMOKE" | "PLAUSIBLE" | "VERIFIED_LEGIT";
  hypeScore: number;
  summary: string;
  edgeCaseWarning: string;
  metrics: {
    latencyMs: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
    confidenceScore: number;
  };
  hasProAccess: boolean;
  onOpenPaywall: () => void;
  onNewClaim: () => void;
}

export const VerdictReport: React.FC<VerdictReportProps> = ({
  verdict,
  hypeScore,
  summary,
  edgeCaseWarning,
  metrics,
  hasProAccess,
  onOpenPaywall,
  onNewClaim,
}) => {
  useEffect(() => {
    if (verdict === "VERIFIED_LEGIT") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [verdict]);

  const isSmoke = verdict === "CERTIFIED_SMOKE";
  const isPlausible = verdict === "PLAUSIBLE";

  return (
    <div className="bg-tribunal-card border border-tribunal-border rounded-xl p-6 shadow-2xl space-y-6 max-w-4xl mx-auto">
      {/* Veredicto Central */}
      <div className="text-center space-y-3 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
          <Scale className="w-4 h-4 text-purple-400" />
          <span>Veredicto Emitido por el Tribunal de la Verdad</span>
        </div>

        <div className="py-2">
          {isSmoke && (
            <div className="inline-block bg-red-950/60 border-2 border-red-500 rounded-2xl px-6 py-4 shadow-xl shadow-red-500/20">
              <div className="flex items-center justify-center space-x-3 text-red-400">
                <Flame className="w-8 h-8 text-red-500 animate-bounce" />
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
                  CERTIFIED SMOKE · PURO HUMO
                </span>
              </div>
              <p className="text-xs text-red-300 font-mono mt-1">
                Índice de Exageración / Hype: {hypeScore}%
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
                Índice de Exageración / Hype: {hypeScore}%
              </p>
            </div>
          )}

          {!isSmoke && !isPlausible && (
            <div className="inline-block bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl px-6 py-4 shadow-xl shadow-emerald-500/20">
              <div className="flex items-center justify-center space-x-3 text-emerald-400">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
                  VERIFIED LEGIT · SUSTENTADO
                </span>
              </div>
              <p className="text-xs text-emerald-300 font-mono mt-1">
                Índice de Exageración / Hype: {hypeScore}%
              </p>
            </div>
          )}
        </div>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {summary}
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
              <span>LATENCIA</span>
            </div>
            <div className="text-lg font-mono font-bold text-white mt-1">
              {metrics.latencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-slate-400 text-[10px] font-mono flex items-center justify-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>TOKENS E/S</span>
            </div>
            <div className="text-lg font-mono font-bold text-white mt-1">
              {metrics.inputTokens + metrics.outputTokens}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-slate-400 text-[10px] font-mono flex items-center justify-center space-x-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>COSTO ESTIMADO</span>
            </div>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
              ${metrics.estimatedCostUsd} <span className="text-[10px] text-slate-400">USD</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-slate-400 text-[10px] font-mono flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>CONFIANZA</span>
            </div>
            <div className="text-lg font-mono font-bold text-indigo-400 mt-1">
              {metrics.confidenceScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Caso Límite Documentado (Obligatorio Reto Nebius) */}
      <div className="bg-purple-950/20 border border-purple-900/60 rounded-lg p-4 space-y-1 text-xs">
        <div className="font-bold text-purple-300 flex items-center space-x-1.5">
          <AlertOctagon className="w-4 h-4 text-purple-400" />
          <span>Caso Límite del Modelo (Documentación del Reto Nebius):</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
          {edgeCaseWarning}
        </p>
      </div>

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
