import React, { useMemo } from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, Server, Search, Cpu } from "lucide-react";
import { PericialTerm } from "./PericialTerm";
import { useLanguage } from "../context/LanguageContext";

interface WorkflowProgressProps {
  isHost: boolean; workflowStatus?: string; workflowRunId?: string; workflowError?: string; failureRequested?: boolean; onRetry: () => void;
  executionRoute?: "render" | "convex_direct";
  completedCheckpoints?: string[];
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

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  isHost, workflowStatus, workflowRunId, workflowError, failureRequested, onRetry,
  executionRoute = "render", completedCheckpoints = [],
  currentStep,
  progressPercentage,
  simulatedFailureTriggered,
  retryCount,
  onTriggerFailureSimulation,
}) => {
  const { language } = useLanguage();
  const isEs = language === "es";

  const isCompleted = currentStep === "completed";
  const isRecovered = simulatedFailureTriggered && completedCheckpoints.includes("initial") && workflowStatus === "running";
  const isDirect = executionRoute === "convex_direct";

  const steps = useMemo(
    () => [
      {
        id: "initial",
        activeStep: "linkup_initial_search",
        label: isEs ? "Rastreo Web Profundo: Búsqueda Inicial" : "Deep Web Research: Initial Search",
        icon: Search,
        provider: isEs ? "Motor Deep Research" : "Deep Research Engine",
      },
      {
        id: "contrast",
        activeStep: "linkup_deep_search",
        label: isEs ? "Contraste Cruzado y Detección de Brechas" : "Cross-Validation & Gap Detection",
        icon: Search,
        provider: isEs ? "Verificación Multi-Fuente" : "Multi-Source Verification",
      },
      {
        id: "synthesis",
        activeStep: "nebius_synthesizing",
        label: isEs ? "Evaluación Pericial y Análisis de Hype" : "Forensic Assessment & Hype Analysis",
        icon: Cpu,
        provider: isEs ? "LLM Forense de Alta Precisión" : "High-Precision Forensic LLM",
      },
    ],
    [isEs]
  );

  return (
    <div className="bg-tribunal-card border border-tribunal-border rounded-xl p-4 sm:p-6 shadow-xl space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">
            {isEs ? "Orquestación Pericial de Tareas Asíncronas" : "Async Forensic Task Orchestration"}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-indigo-950 border border-indigo-700/50 text-indigo-300 font-mono px-2 py-0.5 rounded break-all">
            {isDirect
              ? (isEs ? "Continuidad directa · Convex" : "Direct continuity · Convex")
              : workflowRunId && workflowRunId !== "pending" ? workflowRunId : (isEs ? "Esperando Render" : "Waiting for Render")}
          </span>
          <span className="text-xs font-mono font-bold text-purple-400">
            {progressPercentage}%
          </span>
        </div>
      </div>

      {workflowStatus === "failed" && (
        <div role="alert" className="text-red-300 text-sm space-y-3">
          <p>{workflowError || (isEs ? "El workflow se detuvo." : "The workflow was stopped.")}</p>
          {isHost && (
            <button onClick={onRetry} className="rounded-lg border border-red-400 p-3">
              {isEs ? "Reintentar desde el último checkpoint" : "Retry from last checkpoint"}
            </button>
          )}
        </div>
      )}
      {isDirect && workflowError && workflowStatus !== "failed" && (
        <p role="status" className="rounded-lg border border-amber-700/50 bg-amber-950/30 p-3 text-sm text-amber-200">
          {workflowError}
        </p>
      )}
      {isDirect && (
        <p className="text-xs text-slate-400">
          {isEs
            ? "Esta ruta ejecuta Linkup y Nebius desde Convex para mantener la auditoría disponible. No acredita una ejecución de Render."
            : "This route runs Linkup and Nebius from Convex to keep the audit available. It does not prove a Render execution."}
        </p>
      )}
      {workflowStatus === "retrying" && (
        <p role="status" className="text-amber-300 text-sm">
          {isDirect
            ? (isEs ? "La etapa directa queda pendiente para reintento." : "The direct stage is pending a retry.")
            : isEs
            ? "Render reintentará la tarea automáticamente. Los checkpoints guardados se conservan."
            : "Render will automatically retry the task. Saved checkpoints are preserved."}
        </p>
      )}
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
          <span>{isEs ? "Estado del Worker:" : "Worker Status:"} {currentStep.toUpperCase().replace(/_/g, " ")}</span>
          {retryCount > 0 && (
            <span className="text-amber-400 font-bold">
              <PericialTerm term="Idempotencia">{isEs ? "Reintentos Idempotentes" : "Idempotent Retries"}</PericialTerm>: {retryCount}
            </span>
          )}
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCurrent = currentStep === step.activeStep;
          const isPassed = completedCheckpoints.includes(step.id) || isCompleted;

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
                  <span className="text-[10px] font-mono text-slate-400">
                    {isEs ? "Paso" : "Step"} 0{idx + 1}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner de Simulación de Fallo Controlado */}
      {!isDirect && <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {isEs ? "Prueba de " : "Testing "}
              <PericialTerm term="Tolerancia a Fallos">
                {isEs ? "Resiliencia y Tolerancia a Fallos" : "Resilience and Fault Tolerance"}
              </PericialTerm>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-xl">
            {isEs
              ? "Inyecta una interrupción controlada en el nodo de procesamiento. El orquestador restaura el estado desde el último "
              : "Inject a controlled disruption into the processing node. The orchestrator restores state from the last "}
            <PericialTerm term="Checkpoints">
              {isEs ? "checkpoint persistente" : "persistent checkpoint"}
            </PericialTerm>
            {isEs
              ? " y reanuda la auditoría reutilizando las evidencias ya guardadas."
              : " and resumes the audit reusing already persisted evidence."}
          </p>
          {simulatedFailureTriggered && (
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{isEs ? "Falla ejecutada · Checkpoints conservados" : "Failure executed · Checkpoints preserved"}</span>
            </div>
          )}
        </div>

        {isHost && (
          <button
            disabled={Boolean(failureRequested || simulatedFailureTriggered || currentStep === "nebius_synthesizing" || workflowStatus === "failed")}
            onClick={onTriggerFailureSimulation}
            className={`shrink-0 w-full sm:w-auto justify-center px-3.5 py-2.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1.5 active:scale-95 ${
              simulatedFailureTriggered
                ? "bg-amber-500/20 text-amber-300 border-amber-500 cursor-default"
                : "bg-red-950/30 hover:bg-red-900/40 text-red-300 border-red-800 hover:border-red-600 shadow-md"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulatedFailureTriggered ? "text-amber-400" : "text-red-400"}`} />
            <span>
              {simulatedFailureTriggered
                ? (isEs ? "Falla ejecutada" : "Failure executed")
                : failureRequested
                ? (isEs ? "Falla solicitada" : "Failure requested")
                : (isEs ? "Inducir Falla Controlada" : "Induce Controlled Failure")}
            </span>
          </button>
        )}
      </div>}
    </div>
  );
};
