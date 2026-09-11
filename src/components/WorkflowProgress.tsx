import React from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, Server, Search, FileText, Cpu, Sparkles } from "lucide-react";
import { PericialTerm } from "./PericialTerm";

interface WorkflowProgressProps {
  currentStep:
    | "idle"
    | "extracting_claims"
    | "linkup_initial_search"
    | "linkup_deep_search"
    | "nebius_synthesizing"
    | "completed"
    | "recovered_from_failure";
  progressPercentage: number;
  simulatedFailureTriggered: boolean;
  retryCount: number;
  onTriggerFailureSimulation: () => void;
}

const STEPS = [
  {
    id: "extracting_claims",
    label: "Extracción y Normalización de Claims",
    icon: Sparkles,
    provider: "Background Worker",
  },
  {
    id: "linkup_initial_search",
    label: "Rastreo Web Profundo: Búsqueda Inicial",
    icon: Search,
    provider: "Deep Research Engine",
  },
  {
    id: "linkup_deep_search",
    label: "Contraste Cruzado y Detección de Brechas",
    icon: Search,
    provider: "Multi-Source Verification",
  },
  {
    id: "nebius_synthesizing",
    label: "Evaluación Pericial y Análisis de Hype",
    icon: Cpu,
    provider: "LLM Forense de Alta Precisión",
  },
];

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentStep,
  progressPercentage,
  simulatedFailureTriggered,
  retryCount,
  onTriggerFailureSimulation,
}) => {
  const isCompleted = currentStep === "completed";
  const isRecovered = currentStep === "recovered_from_failure";

  return (
    <div className="bg-tribunal-card border border-tribunal-border rounded-xl p-6 shadow-xl space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">
            Orquestación Pericial de Tareas Asíncronas
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-indigo-950 border border-indigo-700/50 text-indigo-300 font-mono px-2 py-0.5 rounded">
            Job de Auditoría #rw-{retryCount > 0 ? `retry-${retryCount}` : "active"}
          </span>
          <span className="text-xs font-mono font-bold text-purple-400">
            {progressPercentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ease-out ${
              isRecovered
                ? "bg-amber-400"
                : isCompleted
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>Estado del Worker: {currentStep.toUpperCase().replace(/_/g, " ")}</span>
          {retryCount > 0 && (
            <span className="text-amber-400 font-bold">
              <PericialTerm term="Idempotencia">Reintentos Idempotentes</PericialTerm>: {retryCount}
            </span>
          )}
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isCurrent = currentStep === step.id;
          const isPassed =
            progressPercentage > (idx + 1) * 20 || isCompleted || isRecovered;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                isCurrent
                  ? "bg-purple-900/20 border-purple-500 text-white ring-1 ring-purple-500"
                  : isPassed
                  ? "bg-slate-900/50 border-slate-800 text-slate-300"
                  : "bg-slate-950/40 border-slate-900 text-slate-400"
              }`}
            >
              <div className="flex items-center space-x-2.5 text-xs">
                <StepIcon
                  className={`w-4 h-4 ${
                    isCurrent
                      ? "text-purple-400 animate-spin"
                      : isPassed
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }`}
                />
                <div>
                  <div className="font-semibold">{step.label}</div>
                  <div className="text-[10px] text-slate-400">{step.provider}</div>
                </div>
              </div>

              <div>
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">Paso 0{idx + 1}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner de Simulación de Fallo Controlado */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Prueba de <PericialTerm term="Tolerancia a Fallos">Resiliencia y Tolerancia a Fallos</PericialTerm></span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-xl">
            Inyecta una interrupción controlada en el nodo de procesamiento. El orquestador restaura el estado desde el último <PericialTerm term="Checkpoints">checkpoint persistente</PericialTerm> y reanuda la auditoría garantizando <PericialTerm term="Idempotencia">cero duplicación de evidencias</PericialTerm>.
          </p>
          {simulatedFailureTriggered && (
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Checkpoint restaurado · Cero duplicados en base de datos</span>
            </div>
          )}
        </div>

        <button
          onClick={onTriggerFailureSimulation}
          className={`shrink-0 px-3.5 py-2.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1.5 active:scale-95 ${
            simulatedFailureTriggered
              ? "bg-amber-500/20 text-amber-300 border-amber-500 cursor-default"
              : "bg-red-950/30 hover:bg-red-900/40 text-red-300 border-red-800 hover:border-red-600 shadow-md"
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${simulatedFailureTriggered ? "text-amber-400" : "text-red-400"}`} />
          <span>
            {simulatedFailureTriggered
              ? "Recuperado Exitosamente (Reintento #1)"
              : "Inducir Falla Controlada"}
          </span>
        </button>
      </div>
    </div>
  );
};
