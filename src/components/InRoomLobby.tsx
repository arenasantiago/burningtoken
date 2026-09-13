import React, { useState, useMemo } from "react";
import { Sparkles, Radio, Wand2, Loader2, ArrowRight, Scale } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../context/LanguageContext";

interface InRoomLobbyProps {
  sessionToken: string;
  roomCode: string;
  isHost: boolean;
  nickname: string;
  onLaunchNextClaim: (claimText: string) => void | Promise<void>;
}

export const InRoomLobby: React.FC<InRoomLobbyProps> = ({
  sessionToken,
  roomCode,
  isHost,
  nickname,
  onLaunchNextClaim,
}) => {
  const { language } = useLanguage();
  const isEs = language === "es";

  const presetNextClaims = useMemo(
    () =>
      isEs
        ? [
            {
              category: "Viral & Fake News",
              title: "Agua con sal del Himalaya en ayunas desintoxica metales pesados y cura la hipertensión en 7 días",
            },
            {
              category: "AI & Startups",
              title: "Agente autónomo que reemplaza a todo tu equipo de ingeniería con 99.9% de precisión",
            },
            {
              category: "Hardware & Robótica",
              title: "Humanoide doméstico que cocina, programa y limpia por $1,500 USD disponible el próximo mes",
            },
          ]
        : [
            {
              category: "Viral & Fake News",
              title: "Fasting with Himalayan salt water detoxifies heavy metals and cures hypertension in 7 days",
            },
            {
              category: "AI & Startups",
              title: "Autonomous agent replaces your entire engineering team with 99.9% accuracy",
            },
            {
              category: "Hardware & Robotics",
              title: "Domestic humanoid that cooks, codes, and cleans for $1,500 USD available next month",
            },
          ],
    [isEs]
  );

  const [claimText, setClaimText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = React.useRef(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ text: string; angle: string; verifiabilityScore: number; reasoning: string }>>([]);

  const suggestClaimsAction = useAction(api.actions.suggestAuditableClaims);

  const handleOptimizeClaim = async () => {
    if (!claimText.trim()) return;
    setIsLoadingSuggestions(true);
    try {
      const results = await suggestClaimsAction({ draftText: claimText, sessionToken });
      setSuggestions(results);
    } catch (err) {
      setError(
        isEs
          ? "El asistente no está disponible. Puedes continuar con tu texto original."
          : "The prompt assistant is unavailable. You may continue with your original text."
      );
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimText.trim() || submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      await onLaunchNextClaim(claimText.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : isEs ? "No pudimos abrir el caso. Intenta de nuevo." : "Could not open case. Please try again.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-tribunal-card/90 backdrop-blur-xl border border-tribunal-border rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-5 sm:space-y-6 max-w-4xl mx-auto relative overflow-hidden">
      {/* Header de la Sala de Espera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-950/70 border border-purple-500/40 rounded-xl text-purple-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
              <span>{isEs ? "SALA ACTIVA:" : "ACTIVE ROOM:"}</span>
              <span className="font-mono text-purple-400">{roomCode}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono">
              {isHost
                ? (isEs ? "Eres el Presidente del Tribunal. Define la siguiente afirmación para someterla a juicio." : "You are the Tribunal President. Enter the next claim to bring to trial.")
                : (isEs ? "Permaneciendo en la sala. Esperando a que el anfitrión lance el siguiente caso." : "Staying in the room. Waiting for the host to launch the next case.")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-mono text-slate-300 shrink-0">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>{isEs ? "Jurados conectados" : "Connected jurors"}</span>
        </div>
      </div>

      {/* VISTA DEL HOST: Formulación del siguiente claim */}
      {isHost ? (
        <form onSubmit={handleSubmitClaim} className="space-y-5">
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="next-claim" className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                {isEs ? "Noticia, Afirmación o Promesa Comercial:" : "News, Claim, or Commercial Promise:"}
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
                    <span>{isEs ? "Optimizando..." : "Optimizing..."}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isEs ? "Optimizar con Asistente de Prompts" : "Optimize with Prompt Assistant"}</span>
                  </>
                )}
              </button>
            </div>

            <textarea id="next-claim"
              maxLength={1000}
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder={isEs ? "Pega aquí la noticia viral, tweet, pitch de startup o promesa comercial..." : "Paste viral news, tweet, startup pitch, or commercial promise here..."}
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
                <span>{isEs ? "Formulaciones de Alta Verificabilidad Sugeridas:" : "Suggested High-Verifiability Formulations:"}</span>
              </div>
              <div className="space-y-2">
                {suggestions.map((sug, idx) => (
                  <button type="button"
                    key={idx}
                    onClick={() => { setClaimText(sug.text); setSuggestions([]); }}
                    className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-lg cursor-pointer transition text-xs space-y-1 text-left w-full"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-purple-300 font-bold">{sug.angle}</span>
                      <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
                        {sug.verifiabilityScore}% {isEs ? "Verificable" : "Verifiable"}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium">"{sug.text}"</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Presets Rápidos */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">{isEs ? "O elige un caso rápido:" : "Or choose a quick preset case:"}</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presetNextClaims.map((preset, idx) => (
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
            disabled={isSubmitting || !claimText.trim()} className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl flex items-center justify-center space-x-2 shadow-xl shadow-purple-600/30 transition transform hover:-translate-y-0.5 active:scale-95 text-xs sm:text-sm"
          >
            <span>{isSubmitting ? (isEs ? "Abriendo caso…" : "Opening case…") : (isEs ? "Abrir votación" : "Open voting")}</span>
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
              {isEs ? "Esperando el siguiente caso" : "Waiting for the next case"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isEs
                ? "En cuanto el Host confirme la afirmación, tu pantalla cambiará automáticamente a la votación en vivo sin desconectarte de la sala."
                : "As soon as the Host confirms the claim, your screen will automatically switch to live voting without leaving the room."}
            </p>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-mono text-purple-300/80 bg-purple-950/40 border border-purple-800/40 px-3 py-1 rounded-full">
              {isEs ? `Jurado: ${nickname} · Conectado y listo` : `Juror: ${nickname} · Connected and ready`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
