import React, { useState } from "react";
import { Scale, UserCheck, Sparkles, Shield, ArrowRight } from "lucide-react";

interface GuestJoinModalProps {
  isOpen: boolean;
  roomCode: string;
  onConfirmNickname: (name: string) => void;
  initialNickname?: string;
}

const SUGGESTED_NICKNAMES = [
  "Jurado Alpha",
  "Fiscal de Startups",
  "Auditor Cripto",
  "Perito IA",
  "Juez Tech",
  "Verificador Web3",
];

export const GuestJoinModal: React.FC<GuestJoinModalProps> = ({
  isOpen,
  roomCode,
  onConfirmNickname,
  initialNickname = "",
}) => {
  const [nickname, setNickname] = useState(initialNickname);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onConfirmNickname(nickname.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-tribunal-card border border-purple-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-purple-950/80 space-y-5">
        {/* Glow */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-950/80 border border-purple-500/40 text-purple-400 rounded-xl shadow-inner">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Acreditación de Jurado
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-950/80 text-purple-300 border border-purple-800/60 rounded">
                {roomCode}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personaliza tu identidad para votar y deliberar en el Tribunal.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono text-purple-300 uppercase tracking-wider">
              Tu Apodo o Nickname de Jurado:
            </label>
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej. Fiscal Cripto, Jurado Alpha..."
                autoFocus
                maxLength={24}
                className="w-full bg-slate-900/90 border border-purple-900/60 focus:border-purple-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400 transition"
              />
              <UserCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60 pointer-events-none" />
            </div>
          </div>

          {/* Preset Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Sugerencias rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_NICKNAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setNickname(name)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition ${
                    nickname === name
                      ? "bg-purple-600/30 border-purple-400 text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-purple-300 hover:border-purple-900"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-purple-950/30 border border-purple-900/40 rounded-xl flex items-start gap-2 text-[11px] text-slate-300">
            <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              Tu apodo será visible para el Host y los demás jurados en la sala
              durante la votación y deliberación.
            </span>
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            <span>Entrar a la Sala como Jurado</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
