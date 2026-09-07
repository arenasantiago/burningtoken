import React from "react";
import { Search, ExternalLink, ShieldAlert, CheckCircle2, XCircle, HelpCircle } from "lucide-react";

interface EvidenceItem {
  _id: string;
  step: "initial_search" | "follow_up_contrast";
  queryUsed: string;
  title: string;
  url: string;
  snippet: string;
  uncertaintyLevel: "LOW" | "MEDIUM" | "HIGH";
  supportsClaim: boolean;
}

interface EvidenceBoardProps {
  evidenceList: EvidenceItem[];
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({ evidenceList }) => {
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
          {evidenceList.length} fuentes contrastadas
        </span>
      </div>

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
                <div
                  key={item._id}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-200 hover:text-purple-400 transition flex items-center space-x-1"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase shrink-0 ${
                        item.uncertaintyLevel === "LOW"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : item.uncertaintyLevel === "MEDIUM"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-red-950 text-red-400 border border-red-800"
                      }`}
                    >
                      Incertidumbre: {item.uncertaintyLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "{item.snippet}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-900 pt-2">
                    <span className="font-mono truncate max-w-[200px]">Query: {item.queryUsed}</span>
                    <span className="flex items-center space-x-1">
                      {item.supportsClaim ? (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Respaldado</span>
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>Sin soporte</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
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
                <div
                  key={item._id}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-200 hover:text-red-400 transition flex items-center space-x-1"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                      Incertidumbre: {item.uncertaintyLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "{item.snippet}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-900 pt-2">
                    <span className="font-mono truncate max-w-[200px]">Query: {item.queryUsed}</span>
                    <span className="text-red-400 flex items-center space-x-1">
                      <XCircle className="w-3 h-3" />
                      <span>Desmiente claim</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
