import React from "react";
import { Flame, Scale, Copy, Check, ShieldCheck, Crown, Radio } from "lucide-react";

interface HeaderProps {
  roomCode?: string;
  hasProAccess: boolean;
  onOpenPaywall: () => void;
  onPlayGavel: () => void;
  nickname?: string;
  onEditNickname?: () => void;
  onLeaveRoom?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  hasProAccess,
  onOpenPaywall,
  onPlayGavel,
  nickname,
  onEditNickname,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = React.useState(false);

  const [copyError, setCopyError] = React.useState(false);
  const handleCopyLink = async () => {
    if (!roomCode) return;
    setCopyError(false);
    const link = new URL(window.location.href);
    link.searchParams.set("room", roomCode);
    try {
      await navigator.clipboard.writeText(link.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopyError(true); }
  };

  return (
    <header className="border-b border-purple-900/30 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2.5 sm:py-3 shadow-xl shadow-black/40 transition">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={onPlayGavel}
            title="Golpear martillo de juez (Sintetizador Web Audio)"
            className="group relative bg-purple-950/70 hover:bg-purple-900/90 p-2 sm:p-2.5 rounded-xl border border-purple-500/40 text-purple-400 hover:text-purple-200 transition active:scale-90 shadow-lg shadow-purple-950/40 focus:outline-none shrink-0"
          >
            <Scale className="w-4 h-4 sm:w-5 sm:h-5 transition group-hover:rotate-12" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded border border-purple-800 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md">
              Golpear Martillo ⚖️
            </span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <h1 className="font-black text-base sm:text-lg md:text-xl text-white tracking-tight flex items-center gap-1 shrink-0">
                <span>TRUTH</span>
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  TRIBUNAL
                </span>
              </h1>
              <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-mono flex items-center space-x-1 truncate max-w-[130px] sm:max-w-none">
                <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Hype & Fake News Auditor</span>
                <span className="sm:hidden">Auditor</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
              ¿Noticia Real o Puro Humo? · Auditoría Colaborativa & Fact-Checking con IA
            </p>
          </div>
        </div>

        {/* Status, Room & Pro Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Badge WebSocket en vivo */}
          <div className="hidden lg:inline-flex items-center space-x-1.5 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>EN VIVO · SYNC</span>
          </div>

          {/* Sala activa */}
          {roomCode && (
            <div className="flex items-center bg-slate-900/90 border border-purple-500/30 rounded-lg px-2 sm:px-2.5 py-1 space-x-1 sm:space-x-1.5 shadow-sm">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden xs:inline">SALA:</span>
              <span className="text-[11px] sm:text-xs font-bold text-purple-300 font-mono tracking-wider">
                {roomCode}
              </span>
              <button
                onClick={handleCopyLink}
                aria-label="Copiar enlace de invitación"
                title="Copiar enlace de invitación"
                className="text-slate-400 hover:text-white transition min-h-11 min-w-11 flex items-center justify-center hover:bg-slate-800 rounded"
              >
                {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              </button>
            </div>
          )}

          <span role="status" className="text-xs text-emerald-300">{copied ? "Enlace copiado" : ""}</span>
          {/* Nickname del Jurado */}
          {nickname && (
            <button
              onClick={onEditNickname}
              title="Tu nombre en el tribunal (haz clic para editar)"
              disabled={!onEditNickname}
              className="flex min-h-11 items-center space-x-1.5 bg-slate-900 border border-slate-700/80 hover:border-purple-500/60 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300 transition"
            >
              <span className="text-purple-400">👤</span>
              <span className="font-semibold max-w-[100px] lg:max-w-[130px] truncate">{nickname}</span>
            </button>
          )}

          {onLeaveRoom && <button onClick={onLeaveRoom} className="min-h-11 px-3 text-xs text-slate-300 hover:text-white">Salir de la sala</button>}
          {/* RevenueCat Pro Entitlement Status */}
          <button
            onClick={onOpenPaywall}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-sm ${
              hasProAccess
                ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/50 shadow-amber-500/10 hover:border-amber-400"
                : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/50"
            }`}
          >
            {hasProAccess ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-[11px] sm:text-xs hidden sm:inline">Dossier VC Activo</span>
                <span className="font-mono text-[11px] sm:hidden">Pro</span>
              </>
            ) : (
              <>
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Desbloquear </span>
                <span>Pro</span>
              </>
            )}
          </button>
        </div>
      </div>
      {copyError && <p role="alert" className="max-w-7xl mx-auto text-xs text-amber-300 pt-2">No pudimos copiar el enlace. Comparte el código {roomCode} o la dirección del navegador.</p>}
    </header>
  );
};
