import React from "react";
import { Search, ExternalLink, CheckCircle2, XCircle, HelpCircle, Globe, Lock, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface EvidenceItem {
  _id: string;
  step: "initial_search" | "follow_up_contrast";
  queryUsed: string;
  title: string;
  url: string;
  snippet: string;
  uncertaintyLevel: "LOW" | "MEDIUM" | "HIGH";
  supportsClaim: boolean;
  source?: "linkup" | "demo";
  assessment?: "unassessed" | "supports" | "contradicts";
  assessmentReason?: string;
  supportingQuote?: string;
}

interface EvidenceBoardProps {
  evidenceList: EvidenceItem[];
  totalByStep?: { initial_search: number; follow_up_contrast: number };
  researchPlan?: { query: string; gaps: string[]; basedOnEvidenceIds: string[] };
  hasProAccess?: boolean;
  onOpenPaywall?: () => void;
}

const EvidenceCard: React.FC<{ item: EvidenceItem; isEs: boolean }> = ({ item, isEs }) => {
  const isLiveSource = item.source === "linkup";
  let sourceUrl: string | undefined;
  if (isLiveSource) {
    try {
      const parsedUrl = new URL(item.url);
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        sourceUrl = parsedUrl.href;
      }
    } catch {
      // An invalid provider URL remains visible as plain text, never as a link.
    }
  }
  const assessment = isLiveSource ? item.assessment : undefined;

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-slate-700 transition">
      <div className="flex flex-wrap items-start justify-between gap-2">
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-200 hover:text-purple-400 transition flex items-center space-x-1"
          >
            <span>{item.title}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        ) : (
          <span className="text-xs font-semibold text-slate-200">{item.title}</span>
        )}
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
          isLiveSource
            ? item.queryUsed?.includes("international")
              ? "bg-indigo-950 text-indigo-300 border-indigo-700"
              : "bg-emerald-950 text-emerald-400 border-emerald-800"
            : "bg-amber-950 text-amber-300 border-amber-800"
        }`}>
          {isLiveSource
            ? (item.queryUsed?.includes("international") ? "🌐 Global · Linkup" : (isEs ? "Fuente real · Linkup" : "Live source · Linkup"))
            : item.source === "demo" ? "Demo" : (isEs ? "Origen no registrado" : "Unrecorded origin")}
        </span>
      </div>
      {isLiveSource && (
        <p className="text-[10px] font-mono text-slate-500 break-all">{item.url}</p>
      )}
      <p className="text-xs text-slate-400 leading-relaxed italic">"{item.snippet}"</p>
      <span className={`inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border ${
        !isLiveSource
          ? "bg-slate-900 text-slate-400 border-slate-700"
          : item.uncertaintyLevel === "LOW"
          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
          : item.uncertaintyLevel === "MEDIUM"
          ? "bg-amber-950 text-amber-400 border-amber-800"
          : "bg-red-950 text-red-400 border-red-800"
      }`}>
        {isEs ? "Incertidumbre:" : "Uncertainty:"}{" "}
        {isLiveSource && assessment && assessment !== "unassessed" ? item.uncertaintyLevel : (isEs ? "No evaluada" : "Unassessed")}
      </span>
      {isLiveSource && item.assessmentReason && (
        <div className="text-xs text-slate-300 border-l-2 border-purple-700 pl-3 space-y-1">
          <p className="text-[10px] uppercase text-purple-300">
            {isEs ? "Interpretación del modelo" : "Model interpretation"}
          </p>
          <p>{item.assessmentReason}</p>
          {item.supportingQuote && <blockquote className="text-slate-400 italic">“{item.supportingQuote}”</blockquote>}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 border-t border-slate-900 pt-2">
        <span className="font-mono truncate max-w-[140px] sm:max-w-[200px]" title={item.queryUsed}>Query: {item.queryUsed}</span>
        {assessment === "supports" ? (
          <span className="text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isEs ? "Respalda el claim" : "Supports claim"}</span>
          </span>
        ) : assessment === "contradicts" ? (
          <span className="text-red-400 flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>{isEs ? "Contradice el claim" : "Contradicts claim"}</span>
          </span>
        ) : (
          <span className="text-slate-400 flex items-center space-x-1">
            <HelpCircle className="w-3 h-3" />
            <span>{isEs ? "Pendiente de evaluar" : "Pending assessment"}</span>
          </span>
        )}
      </div>
      <details className="text-[10px] text-slate-400">
        <summary className="cursor-pointer hover:text-white">
          {isEs ? "Ver consulta utilizada" : "View query used"}
        </summary>
        <p className="whitespace-pre-wrap break-words mt-2">{item.queryUsed}</p>
      </details>
    </div>
  );
};

const LockedEvidenceCard: React.FC<{
  count: number;
  label: string;
  onOpenPaywall?: () => void;
  isEs: boolean;
}> = ({ count, label, onOpenPaywall, isEs }) => (
  <div className="bg-slate-950/50 border border-dashed border-purple-800/70 rounded-lg p-3.5 text-center space-y-2 backdrop-blur-sm">
    <div className="flex items-center justify-center space-x-1.5 text-purple-400">
      <Lock className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold">
        +{count} {label}
      </span>
    </div>
    <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
      {isEs
        ? "Disponibles en el plan Pro con fuentes internacionales en otros idiomas, análisis exhaustivo y descarga de expediente PDF."
        : "Available in Pro plan with multilingual sources from other countries, in-depth analysis, and PDF export."}
    </p>
    {onOpenPaywall && (
      <button
        onClick={onOpenPaywall}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/60 text-xs font-medium text-purple-200 transition"
      >
        <span>{isEs ? "Desbloquear con Pro" : "Unlock with Pro"}</span>
        <Sparkles className="w-3 h-3 text-purple-300" />
      </button>
    )}
  </div>
);

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({
  evidenceList,
  totalByStep,
  researchPlan,
  hasProAccess,
  onOpenPaywall,
}) => {
  const { language } = useLanguage();
  const isEs = language === "es";

  const initialItems = evidenceList.filter((e) => e.step === "initial_search");
  const followUpItems = evidenceList.filter((e) => e.step === "follow_up_contrast");

  // Convex already projects Free/Pro rows. Counts are safe aggregate teasers.
  const visibleInitial = initialItems;
  const hiddenInitialCount = hasProAccess ? 0 : Math.max(0, (totalByStep?.initial_search ?? initialItems.length) - initialItems.length);
  const visibleFollowUp = followUpItems;
  const hiddenFollowUpCount = hasProAccess ? 0 : Math.max(0, (totalByStep?.follow_up_contrast ?? followUpItems.length) - followUpItems.length);
  const totalCount = (totalByStep?.initial_search ?? initialItems.length) + (totalByStep?.follow_up_contrast ?? followUpItems.length);

  return (
    <div className="bg-tribunal-card border border-tribunal-border rounded-xl p-4 sm:p-6 shadow-xl space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">
            {isEs ? "Deep Research: Evidencia Web Iterativa (Linkup SDK)" : "Deep Research: Iterative Web Evidence (Linkup SDK)"}
          </h3>
        </div>
        {hasProAccess ? (
          <span className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-700/60 px-2.5 py-1 rounded flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>
              {isEs ? `Auditor Pro · ${evidenceList.length} hallazgos completos` : `Pro Auditor · ${evidenceList.length} full findings`}
            </span>
          </span>
        ) : (
          <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
            {isEs
              ? `${totalCount} hallazgos (${visibleInitial.length + visibleFollowUp.length} visibles en versión gratuita)`
              : `${totalCount} findings (${visibleInitial.length + visibleFollowUp.length} visible in free tier)`}
          </span>
        )}
      </div>

      {researchPlan && researchPlan.basedOnEvidenceIds.length > 0 && (
        <div className="bg-purple-950/20 border border-purple-800/50 rounded-lg p-4 text-xs space-y-2">
          <p className="font-semibold text-purple-200">
            {isEs ? "Qué decidimos investigar después" : "What we decided to investigate next"}
          </p>
          <p className="text-slate-400">
            {isEs
              ? `La segunda búsqueda se prepara a partir de ${researchPlan.basedOnEvidenceIds.length} fuentes guardadas. Estas brechas orientan la búsqueda; aún no son conclusiones.`
              : `The follow-up search is prepared from ${researchPlan.basedOnEvidenceIds.length} saved sources. These gaps guide the search; they are not conclusions yet.`}
          </p>
          <ul className="list-disc pl-4 text-slate-300 space-y-1">
            {researchPlan.gaps.map((gap) => <li key={gap}>{gap}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ronda 1: Búsqueda Inicial */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-purple-400 uppercase tracking-wider">
              {isEs ? "01 · Búsqueda Inicial (Hechos y Benchmarks)" : "01 · Initial Search (Facts & Benchmarks)"}
            </span>
            <span className="text-[10px] bg-purple-950/60 border border-purple-800 text-purple-300 px-2 py-0.5 rounded">
              {isEs ? "Fase 1" : "Phase 1"}
            </span>
          </div>

          {initialItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
              {isEs ? "Esperando resultados de Linkup..." : "Waiting for Linkup research findings..."}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleInitial.map((item) => (
                <EvidenceCard key={item._id} item={item} isEs={isEs} />
              ))}
              {hiddenInitialCount > 0 && (
                <LockedEvidenceCard
                  count={hiddenInitialCount}
                  label={isEs ? "fuentes primarias adicionales reservadas" : "additional primary sources reserved"}
                  onOpenPaywall={onOpenPaywall}
                  isEs={isEs}
                />
              )}
            </div>
          )}
        </div>

        {/* Ronda 2: Búsqueda de Contraste y Escepticismo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-red-400 uppercase tracking-wider">
              {isEs ? "02 · Búsqueda de Contraste (Crítica y Reproducibilidad)" : "02 · Contrast Search (Skepticism & Reproducibility)"}
            </span>
            <span className="text-[10px] bg-red-950/60 border border-red-800 text-red-300 px-2 py-0.5 rounded">
              {isEs ? "Fase 2" : "Phase 2"}
            </span>
          </div>

          {followUpItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
              {isEs
                ? "Evaluando brechas de evidencia para la búsqueda de seguimiento..."
                : "Evaluating evidence gaps for follow-up search..."}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleFollowUp.map((item) => (
                <EvidenceCard key={item._id} item={item} isEs={isEs} />
              ))}
              {hiddenFollowUpCount > 0 && (
                <LockedEvidenceCard
                  count={hiddenFollowUpCount}
                  label={isEs ? "fuentes de contraste y análisis global reservadas" : "international contrast sources reserved"}
                  onOpenPaywall={onOpenPaywall}
                  isEs={isEs}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {!hasProAccess && (
        <div className="mt-4 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-purple-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-purple-950/20">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm font-bold text-purple-300">
              <Globe className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                {isEs
                  ? "🌐 Contraste Global & Fuentes en otros idiomas (Auditor Pro)"
                  : "🌐 Global Contrast & Multilingual Sources (Auditor Pro)"}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              {isEs
                ? "La versión gratuita audita rigurosamente fuentes primarias. La actualización Pro añade contraste multilingüe en inglés y otros países, benchmarks internacionales de papers y una Matriz de Riesgo exportable para academia y VCs."
                : "The free tier rigorously audits primary sources. Upgrading to Pro adds multilingual contrast in English and worldwide papers, international benchmarks, and an exportable Risk Matrix for academia and VCs."}
            </p>
          </div>
          {onOpenPaywall && (
            <button
              onClick={onOpenPaywall}
              className="shrink-0 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition flex items-center space-x-1.5 shadow-md shadow-purple-900/40"
            >
              <span>{isEs ? "Ver Beneficios Pro" : "View Pro Benefits"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
