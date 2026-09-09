import React from "react";
import { Search, ExternalLink, CheckCircle2, XCircle, HelpCircle } from "lucide-react";

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
  researchPlan?: { query: string; gaps: string[]; basedOnEvidenceIds: string[] };
}

const EvidenceCard: React.FC<{ item: EvidenceItem }> = ({ item }) => {
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
            ? "bg-emerald-950 text-emerald-400 border-emerald-800"
            : "bg-amber-950 text-amber-300 border-amber-800"
        }`}>
          {isLiveSource ? "Fuente real · Linkup" : item.source === "demo" ? "Demo" : "Origen no registrado"}
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
        Incertidumbre: {isLiveSource && assessment && assessment !== "unassessed" ? item.uncertaintyLevel : "No evaluada"}
      </span>
      {isLiveSource && item.assessmentReason && (
        <div className="text-xs text-slate-300 border-l-2 border-purple-700 pl-3 space-y-1">
          <p className="text-[10px] uppercase text-purple-300">Interpretación del modelo</p>
          <p>{item.assessmentReason}</p>
          {item.supportingQuote && <blockquote className="text-slate-400 italic">“{item.supportingQuote}”</blockquote>}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 border-t border-slate-900 pt-2">
        <span className="font-mono truncate max-w-[200px]" title={item.queryUsed}>Query: {item.queryUsed}</span>
        {assessment === "supports" ? (
          <span className="text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Respalda el claim</span>
          </span>
        ) : assessment === "contradicts" ? (
          <span className="text-red-400 flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Contradice el claim</span>
          </span>
        ) : (
          <span className="text-slate-400 flex items-center space-x-1">
            <HelpCircle className="w-3 h-3" />
            <span>Pendiente de evaluar</span>
          </span>
        )}
      </div>
      <details className="text-[10px] text-slate-400">
        <summary className="cursor-pointer hover:text-white">Ver consulta utilizada</summary>
        <p className="whitespace-pre-wrap break-words mt-2">{item.queryUsed}</p>
      </details>
    </div>
  );
};

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({ evidenceList, researchPlan }) => {
  const initialItems = evidenceList.filter((e) => e.step === "initial_search");
  const followUpItems = evidenceList.filter((e) => e.step === "follow_up_contrast");

  return (
    <div className="bg-tribunal-card border border-tribunal-border rounded-xl p-6 shadow-xl space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">
            Deep Research: Evidencia Web Iterativa (Linkup SDK)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
          {evidenceList.length} hallazgos recopilados
        </span>
      </div>

      {researchPlan && researchPlan.basedOnEvidenceIds.length > 0 && (
        <div className="bg-purple-950/20 border border-purple-800/50 rounded-lg p-4 text-xs space-y-2">
          <p className="font-semibold text-purple-200">Qué decidimos investigar después</p>
          <p className="text-slate-400">La segunda búsqueda se prepara a partir de {researchPlan.basedOnEvidenceIds.length} fuentes guardadas. Estas brechas orientan la búsqueda; aún no son conclusiones.</p>
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
              01 · Búsqueda Inicial (Hechos y Benchmarks)
            </span>
            <span className="text-[10px] bg-purple-950/60 border border-purple-800 text-purple-300 px-2 py-0.5 rounded">
              Fase 1
            </span>
          </div>

          {initialItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
              Esperando resultados de Linkup...
            </div>
          ) : (
            <div className="space-y-3">
              {initialItems.map((item) => (
                <EvidenceCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Ronda 2: Búsqueda de Contraste y Escepticismo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-red-400 uppercase tracking-wider">
              02 · Búsqueda de Contraste (Crítica y Reproducibilidad)
            </span>
            <span className="text-[10px] bg-red-950/60 border border-red-800 text-red-300 px-2 py-0.5 rounded">
              Fase 2
            </span>
          </div>

          {followUpItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
              Evaluando brechas de evidencia para la búsqueda de seguimiento...
            </div>
          ) : (
            <div className="space-y-3">
              {followUpItems.map((item) => (
                <EvidenceCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
