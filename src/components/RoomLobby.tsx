import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sparkles, Users, ArrowRight, Flame, ShieldAlert, Cpu, Wand2, Loader2, CheckCircle2, ShieldCheck, Scale } from "lucide-react";

interface RoomLobbyProps {
  onCreateRoom: (title: string, initialClaim: string) => void;
  onJoinRoom: (code: string) => void;
}

const PRESET_CLAIMS = [
  {
    category: "Noticias Virales & Fake News",
    title: "Científicos descubren que el ayuno de 3 días regenera el 100% del sistema inmune sin efectos secundarios",
    source: "https://x.com/viral_wellness/status/1948201",
  },
  {
    category: "AI & Startups",
    title: "Agente autónomo que reemplaza a todo tu equipo de ingeniería con 99.9% de precisión",
    source: "https://x.com/tech_hype/status/1832049",
  },
  {
    category: "Cripto & Web3",
    title: "Nueva blockchain cuántica con 500,000 TPS y cero comisiones de gas garantizadas",
    source: "https://linkedin.com/posts/crypto-founder-hype",
  },
  {
    category: "Ciencia & Hardware",
    title: "Batería de estado sólido que carga autos eléctricos en 2 minutos y dura 50 años disponible este año",
    source: "https://techcrunch.com/energy-announcement",
  },
];

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  onCreateRoom,
  onJoinRoom,
}) => {
  const [roomTitle, setRoomTitle] = useState("¿Noticia Real o Puro Humo?");
  const [claimText, setClaimText] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ text: string; angle: string; verifiabilityScore: number; reasoning: string }>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimText.trim()) return;
    onCreateRoom(roomTitle, claimText);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    let code = joinCode.trim().toUpperCase();
    if (!code.startsWith("HYPE-") && /^\d+$/.test(code)) {
      code = `HYPE-${code}`;
    }
    onJoinRoom(code);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-10">
      {/* Hero Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-purple-950/70 border border-purple-500/40 px-3.5 py-1.5 rounded-full text-xs text-purple-300 font-mono shadow-lg shadow-purple-950/40">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>¿Es Verdad, Fake News o Puro Humo? · Auditoría Colaborativa en Vivo</span>
        </div>
        
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
          ¿Promesa Real o{" "}
          <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 bg-clip-text text-transparent underline decoration-red-500/30">
            Puro Humo
          </span>
          ? Somete Cualquier Afirmación al Juicio de la Verdad
        </h2>

        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-normal">
          Crea una sala colaborativa, invita a tus colegas, voten en vivo si una promesa es real o puro marketing, y despliega un escuadrón autónomo de investigación profunda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Formulario Crear Sala y Claim */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-purple-500/20 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5 glow-purple">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base tracking-wide">
                  Crear Nueva Sala de Auditoría
                </h3>
                <p className="text-xs text-slate-400">Define el tema y somete una afirmación al juicio en vivo</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded">
              SALA EN VIVO
            </span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Título o Tema de la Sesión
              </label>
              <input
                type="text"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                placeholder="Ej. ¿Fake News o Revolución? Juicio de la Sala"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Afirmación / Noticia / Promesa a Someter a Juicio
              </label>
              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                rows={3}
                placeholder="Pega aquí la noticia viral, tweet, pitch de startup o promesa comercial que quieres auditar..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition leading-relaxed"
                required
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  ¿Afirmación ambigua, metafísica o subjetiva?
                </span>
                <button
                  type="button"
                  onClick={handleOptimizeClaim}
                  disabled={isLoadingSuggestions || !claimText.trim()}
                  className="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-purple-200 hover:text-white bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 px-3 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-950/40"
                >
                  {isLoadingSuggestions ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                  )}
                  <span>{isLoadingSuggestions ? "Analizando y reformulando..." : "✨ Optimizar con Asistente Pericial"}</span>
                </button>
              </div>

              {/* Sugerencias de reformulación auditable */}
              {suggestions.length > 0 && (
                <div className="mt-4 space-y-3 bg-slate-950/90 border border-purple-500/40 rounded-xl p-4 animate-in fade-in shadow-xl">
                  <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
                    <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Formulaciones Auditables Sugeridas por el Asistente:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSuggestions([])}
                      className="text-slate-400 hover:text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded hover:bg-slate-800"
                    >
                      Cerrar ✕
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-xl p-3.5 text-xs space-y-2 transition shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="bg-purple-900/50 border border-purple-700/50 text-purple-300 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                            {sug.angle}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {sug.verifiabilityScore}% Verificable
                          </span>
                        </div>
                        <p className="text-white font-medium leading-relaxed">{sug.text}</p>
                        <p className="text-[11px] text-slate-400 leading-normal">{sug.reasoning}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setClaimText(sug.text);
                            setSuggestions([]);
                          }}
                          className="w-full mt-1.5 bg-purple-950/80 hover:bg-purple-800 text-purple-200 hover:text-white text-xs py-2 px-3 rounded-lg border border-purple-600/50 transition flex items-center justify-center space-x-2 font-bold shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Usar esta formulación auditable</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Presets rápidos */}
            <div className="space-y-2 pt-1">
              <span className="text-xs text-slate-400 font-mono">O selecciona un caso típico de hype:</span>
              <div className="space-y-1.5">
                {PRESET_CLAIMS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setClaimText(preset.title)}
                    className="w-full text-left text-xs bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-2.5 rounded-xl transition text-slate-300 flex items-start space-x-2.5 group"
                  >
                    <span className="bg-purple-950 border border-purple-800/60 text-purple-300 text-[10px] px-2 py-0.5 rounded font-mono shrink-0 group-hover:border-purple-400 transition">
                      {preset.category}
                    </span>
                    <span className="truncate group-hover:text-white transition">{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-xl shadow-purple-600/30 transform active:scale-98"
            >
              <span>Abrir Sala e Iniciar Juicio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Unirse a Sala Existente */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5 backdrop-blur-md">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3.5">
              <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Unirse con Código
                </h3>
                <p className="text-xs text-slate-400">Ingresa como jurado o invitado</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Abre una segunda ventana o comparte el código con tu equipo para experimentar la <strong className="text-purple-300">votación reactiva multijugador</strong> en tiempo real.
            </p>

            <form onSubmit={handleJoin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Código de la Sala
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="HYPE-XXX"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-center font-mono font-bold text-purple-300 tracking-widest uppercase focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition active:scale-98 shadow-md"
              >
                Entrar a la Sala
              </button>
            </form>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-2.5">
            <div className="flex items-center space-x-1.5 text-purple-300 font-bold font-mono text-xs">
              <Scale className="w-4 h-4 text-purple-400" />
              <span>Protocolo Pericial de la Verdad</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cada afirmación se somete a un juicio colectivo en tiempo real y a un pipeline de investigación profunda con contraste cruzado de fuentes y análisis cuantitativo de exageración (Hype Score).
            </p>
            <div className="flex items-center space-x-2 pt-1 text-[10px] font-mono text-slate-500">
              <span className="inline-flex items-center text-emerald-400">● Consenso en vivo</span>
              <span>·</span>
              <span className="inline-flex items-center text-purple-400">● Deep Research bifásico</span>
              <span>·</span>
              <span className="inline-flex items-center text-amber-400">● Due Diligence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
