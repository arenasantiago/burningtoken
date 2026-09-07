import React from "react";
import { Flame, Scale, Copy, Check, ShieldCheck, Crown } from "lucide-react";

interface HeaderProps {
  roomCode?: string;
  hasProAccess: boolean;
  onOpenPaywall: () => void;
  onPlayGavel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  hasProAccess,
  onOpenPaywall,
  onPlayGavel,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(`${window.location.origin}?room=${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-tribunal-border bg-tribunal-card/80 backdrop-blur sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onPlayGavel}>
          <div className="bg-purple-600/20 p-2 rounded-lg border border-purple-500/40 text-purple-400">
            <Scale className="w-6 h-6 animate-pulse-fast" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight">
                TRUTH TRIBUNAL
              </h1>
              <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs px-2 py-0.5 rounded-full font-mono flex items-center space-x-1">
                <Flame className="w-3 h-3 text-red-500" />
                <span>Hype Auditor</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              NERDCONF 2026 · Desmontando el humo con IA, Búsqueda Iterativa y Datos Duros
            </p>
          </div>
        </div>

        {/* Room Info & Controls */}
        <div className="flex items-center space-x-3">
          {roomCode && (
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 space-x-2">
              <span className="text-xs text-slate-400 font-mono">SALA:</span>
              <span className="text-xs font-bold text-purple-400 font-mono tracking-wider">
                {roomCode}
              </span>
              <button
                onClick={handleCopyLink}
                title="Copiar enlace para abrir en otro navegador (Multiplayer)"
                className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* RevenueCat Pro Entitlement Status */}
          <button
            onClick={onOpenPaywall}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              hasProAccess
                ? "bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10"
                : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/40"
            }`}
          >
            {hasProAccess ? (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Dossier Pro Activo</span>
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Desbloquear Pro</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
