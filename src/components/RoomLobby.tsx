import React, { useState } from "react";
import { Sparkles, Users, ArrowRight, Flame, ShieldAlert, Cpu } from "lucide-react";

interface RoomLobbyProps {
  onCreateRoom: (title: string, initialClaim: string) => void;
  onJoinRoom: (code: string) => void;
}

const PRESET_CLAIMS = [
  {
    category: "AI & Startups",
    title: "Agente autónomo que reemplaza a todo tu equipo de ingeniería con 99.9% de precisión",
    source: "https://x.com/tech_hype/status/1832049",
  },
  {
    category: "Cripto & Web3",
    title: "Nueva blockchain modular con 500,000 TPS y cero comisiones de gas garantizadas por física cuántica",
    source: "https://linkedin.com/posts/crypto-founder-hype",
  },
  {
    category: "Hardware & Robótica",
    title: "Humanoide doméstico que cocina, programa y limpia por $1,500 USD disponible el próximo mes",
    source: "https://techcrunch.com/robotics-announcement",
  },
];

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  onCreateRoom,
  onJoinRoom,
}) => {
  const [roomTitle, setRoomTitle] = useState("Sesión de Auditoría #1");
  const [claimText, setClaimText] = useState("");
  const [joinCode, setJoinCode] = useState("");

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
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Hero Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-full text-xs text-purple-300 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Multijugador en Tiempo Real · Despliegue en convex.site</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Somete el <span className="text-red-500 underline decoration-red-500/40">Humo Tecnológico</span> al Juicio de la Verdad
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Crea una sala colaborativa, invita a tu equipo, voten en vivo si una promesa es real o puro marketing, y activa el escuadrón autónomo de investigación profunda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario Crear Sala y Claim */}
        <div className="md:col-span-2 bg-tribunal-card border border-tribunal-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Flame className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-white text-base">
              Crear Nueva Sala de Auditoría
            </h3>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Título o Tema de la Sala
              </label>
              <input
                type="text"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                placeholder="Ej. Juicio a los VCs y Hype de IA"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Afirmación / Promesa a Someter a Juicio (Claim)
              </label>
              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                rows={3}
                placeholder="Pega aquí la afirmación exagerada de Twitter, LinkedIn o pitch deck que quieres auditar..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Presets rápidos */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-mono">O prueba con un claim común:</span>
              <div className="space-y-1">
                {PRESET_CLAIMS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setClaimText(preset.title)}
                    className="w-full text-left text-xs bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-2 rounded transition text-slate-300 flex items-start space-x-2"
                  >
                    <span className="bg-purple-900/50 text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0">
                      {preset.category}
                    </span>
                    <span className="truncate">{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition shadow-lg shadow-purple-600/30"
            >
              <span>Abrir Sala e Iniciar Juicio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Unirse a Sala Existente */}
        <div className="bg-tribunal-card border border-tribunal-border rounded-xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">
                Unirse con Código
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Abre una segunda ventana de incógnito o comparte el código para probar la reactividad multijugador en tiempo real.
            </p>

            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código de Sala (ej. HYPE-123)
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="HYPE-XXX"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-center font-mono font-bold text-purple-300 tracking-widest uppercase focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-lg transition"
              >
                Entrar a la Sala
              </button>
            </form>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-purple-400 font-medium">
              <Cpu className="w-3.5 h-3.5" />
              <span>Prueba de los 6 Retos:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cada sala orquesta Convex (Sync), Linkup (Web Research), Nebius (Token Factory), Render (Workflows) y RevenueCat (Test Store).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
