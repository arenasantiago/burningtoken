import React, { useState } from "react";
import { Sparkles, Radio, Wand2, Loader2, ArrowRight, UserCheck, Scale } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

interface InRoomLobbyProps {
  roomCode: string;
  isHost: boolean;
  nickname: string;
  onUpdateNickname: (name: string) => void;
  onLaunchNextClaim: (claimText: string) => void;
}

const PRESET_NEXT_CLAIMS = [
  {
    category: "Hardware & Robótica",
    title: "Humanoide doméstico que cocina, programa y limpia por $1,500 USD disponible el próximo mes",
  },
  {
    category: "AI & Startups",
    title: "Agente autónomo que reemplaza a todo tu equipo de ingeniería con 99.9% de precisión",
  },
  {
    category: "Cripto & Web3",
    title: "Nueva blockchain modular con 500,000 TPS y cero comisiones de gas garantizadas por física cuántica",
  },
];

export const InRoomLobby: React.FC<InRoomLobbyProps> = ({
  roomCode,
  isHost,
  nickname,
  onUpdateNickname,
  onLaunchNextClaim,
}) => {
  const [claimText, setClaimText] = useState("");
  const [editingNick, setEditingNick] = useState(nickname);
  const [nickSaved, setNickSaved] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ text: string; angle: string; verifiabilityScore: number; reasoning: string }>>([]);

  const suggestClaimsAction = useAction(api.actions.suggestAuditableClaims);

  const handleOptimizeClaim = async () => {
    if (!claimText.trim()) return;
    setIsLoadingSuggestions(true);
    try {
      const results = await suggestClaimsAction({ draftText: claimText });
      setSuggestions(results);
    } catch (err) {
      console.warn("Error getting claim suggestions:", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSaveNick = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNick.trim()) {
      onUpdateNickname(editingNick.trim());
      setNickSaved(true);
      setTimeout(() => setNickSaved(false), 2000);
    }
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimText.trim()) {
      onLaunchNextClaim(claimText.trim());
    }
  };

  return (
    <div className="bg-tribunal-card/90 backdrop-blur-xl border border-tribunal-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-w-4xl mx-auto relative overflow-hidden">
      {/* Header de la Sala de Espera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-950/70 border border-purple-500/40 rounded-xl text-purple-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <span>SALA ACTIVA:</span>
              <span className="font-mono text-purple-400">{roomCode}</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {isHost
                ? "Eres el Presidente del Tribunal. Define la siguiente afirmación para someterla a juicio."
                : "Permaneciendo en la sala. Esperando a que el anfitrión lance el siguiente caso."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Jurados conectados</span>
        </div>
      </div>

      {/* Editor de Nickname para todos los participantes */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Tu Identidad en el Jurado (Nickname):</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Este nombre aparecerá en el feed de votaciones en vivo y en los reportes del tribunal.
          </p>
        </div>

        <form onSubmit={handleSaveNick} className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            value={editingNick}
            onChange={(e) => setEditingNick(e.target.value)}
            placeholder="Tu apodo"
            maxLength={25}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-900/60 hover:bg-purple-800 border border-purple-600/50 text-purple-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0"
          >
            {nickSaved ? "¡Guardado!" : "Actualizar"}
          </button>
        </form>
      </div>

      {/* VISTA DEL HOST: Formulación del siguiente claim */}
      {isHost ? (
        <form onSubmit={handleSubmitClaim} className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Afirmación o Promesa Tecnológica:
              </label>
              <button
                type="button"
                onClick={handleOptimizeClaim}
                disabled={isLoadingSuggestions || !claimText.trim()}
                className="inline-flex items-center space-x-1 text-xs font-mono text-purple-400 hover:text-purple-300 transition disabled:opacity-40"
              >
                {isLoadingSuggestions ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Optimizando...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Optimizar con Asistente de Prompts</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder="Ej: Startup afirma que su nuevo modelo supera a ingenieros senior con 99% de precisión y cero alucinaciones..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none"
              required
            />
          </div>

          {/* Sugerencias del Prompt Architect */}
          {suggestions.length > 0 && (
            <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-300 font-mono">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Formulaciones de Alta Verificabilidad Sugeridas:</span>
              </div>
              <div className="space-y-2">
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onClick={() => setClaimText(sug.text)}
                    className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-lg cursor-pointer transition text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-purple-300 font-bold">{sug.angle}</span>
                      <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
                        {sug.verifiabilityScore}% Verificable
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium">"{sug.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Presets Rápidos */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">O elige un caso rápido:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_NEXT_CLAIMS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setClaimText(preset.title)}
                  className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 text-left transition text-xs space-y-1"
                >
                  <span className="text-[10px] font-mono text-purple-400 block">{preset.category}</span>
                  <span className="text-slate-300 font-medium line-clamp-2 leading-tight">"{preset.title}"</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-xl shadow-purple-600/30 transition transform hover:-translate-y-0.5 active:scale-95 text-sm"
          >
            <span>Lanzar Votación del Nuevo Caso a la Sala</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* VISTA DEL INVITADO: Sala de espera mientras el host redacta */
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-purple-950/50 border border-purple-500/40 flex items-center justify-center animate-pulse">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-ping" />
          </div>

          <div className="space-y-1 max-w-md">
            <h4 className="text-base font-bold text-white">
              El Presidente del Tribunal está redactando el siguiente caso
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              En cuanto el Host confirme la afirmación, tu pantalla cambiará automáticamente a la votación en vivo sin desconectarte de la sala.
            </p>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-mono text-purple-300/80 bg-purple-950/40 border border-purple-800/40 px-3 py-1 rounded-full">
              Jurado: {nickname} · Conectado y listo
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
