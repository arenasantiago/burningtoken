import React from "react";
import { Flame, CheckCircle2, Play, Users, BarChart3 } from "lucide-react";

interface LiveVotingProps {
  claimContent: string;
  authorName: string;
  counts: {
    smoke: number;
    legit: number;
    total: number;
    smokePercentage: number;
    legitPercentage: number;
    recentVoters: Array<{ name: string; choice: string }>;
  };
  myVoteChoice?: "SMOKE" | "LEGIT";
  onCastVote: (choice: "SMOKE" | "LEGIT") => void;
  onLaunchInvestigation: () => void;
  isHost: boolean;
}

export const LiveVoting: React.FC<LiveVotingProps> = ({
  claimContent,
  authorName,
  counts,
  myVoteChoice,
  onCastVote,
  onLaunchInvestigation,
  isHost,
}) => {
  return (
    <div className="bg-tribunal-card border border-tribunal-border rounded-xl p-6 shadow-2xl space-y-6 max-w-4xl mx-auto">
      {/* Claim Headline */}
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>CASO EN TRIBUNAL · PROPUESTO POR {authorName.toUpperCase()}</span>
          <span className="flex items-center space-x-1 text-purple-400">
            <Users className="w-3.5 h-3.5" />
            <span>{counts.total} {counts.total === 1 ? "voto emitido" : "votos en vivo"}</span>
          </span>
        </div>
        <blockquote className="text-xl sm:text-2xl font-bold text-white leading-snug border-l-4 border-purple-500 pl-4 py-1 italic bg-slate-950/40 rounded-r-lg">
          "{claimContent}"
        </blockquote>
      </div>

      {/* Voting Buttons (Interactive Multiplayer) */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
          Votación Comunitaria en Tiempo Real (Convex Sync)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onCastVote("SMOKE")}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all transform active:scale-95 ${
              myVoteChoice === "SMOKE"
                ? "bg-red-500/20 border-red-500 text-red-300 shadow-lg shadow-red-500/20 ring-2 ring-red-500"
                : "bg-slate-900/80 hover:bg-red-950/30 border-slate-800 hover:border-red-500/50 text-slate-200"
            }`}
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-base">¡Es Puro Humo!</div>
                <div className="text-xs text-slate-400">Promesa inflada / Marketing</div>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-2xl font-black text-red-400">{counts.smokePercentage}%</div>
              <div className="text-[11px] text-slate-400">{counts.smoke} votos</div>
            </div>
          </button>

          <button
            onClick={() => onCastVote("LEGIT")}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all transform active:scale-95 ${
              myVoteChoice === "LEGIT"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500"
                : "bg-slate-900/80 hover:bg-emerald-950/30 border-slate-800 hover:border-emerald-500/50 text-slate-200"
            }`}
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-base">Tiene Sustento</div>
                <div className="text-xs text-slate-400">Técnicamente viable y real</div>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-2xl font-black text-emerald-400">{counts.legitPercentage}%</div>
              <div className="text-[11px] text-slate-400">{counts.legit} votos</div>
            </div>
          </button>
        </div>
      </div>

      {/* Realtime Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="bg-red-500 transition-all duration-500 ease-out"
            style={{ width: `${counts.smokePercentage}%` }}
          />
          <div
            className="bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${counts.legitPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span className="text-red-400 flex items-center space-x-1">
            <span>● Humo: {counts.smoke}</span>
          </span>
          <span className="text-slate-400">Sincronizado entre todos los navegadores</span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <span>● Legit: {counts.legit}</span>
          </span>
        </div>
      </div>

      {/* Disparar Investigación con Render Workflows */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          Al iniciar, se despacha un trabajo resiliente en **Render Workflows** que ejecutará **Linkup** y **Nebius Token Factory**.
        </div>
        <button
          onClick={onLaunchInvestigation}
          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25 transition transform active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Desplegar Auditoría Autónoma</span>
        </button>
      </div>
    </div>
  );
};
