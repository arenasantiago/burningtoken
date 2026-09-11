import React, { useMemo } from "react";
import {
  Flame,
  CheckCircle2,
  Play,
  Users,
  Loader2,
  Volume2,
  Shield,
  Activity,
  AlertTriangle,
  Gavel,
  Radio,
} from "lucide-react";
import { useAudioTribunal } from "../hooks/useAudioTribunal";
import { PericialTerm } from "./PericialTerm";

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
  const audio = useAudioTribunal();

  // Sanitización de porcentajes
  const smokePct = useMemo(() => {
    const val = counts.smokePercentage;
    return Number.isFinite(val) ? Math.min(100, Math.max(0, Math.round(val))) : 50;
  }, [counts.smokePercentage]);

  const legitPct = 100 - smokePct;

  // Cálculo del ángulo de aguja del tacómetro (-90deg a +90deg)
  // 0% Humo (100% Legit) = -90deg (izquierda)
  // 50% = 0deg (arriba)
  // 100% Humo = +90deg (derecha)
  const needleAngle = useMemo(() => {
    return (smokePct / 100) * 180 - 90;
  }, [smokePct]);

  // Nivel y estilo del Hype-o-Meter
  const hypeLevel = useMemo(() => {
    if (counts.total === 0) {
      return {
        label: "SALA EN ESPERA DE VOTACIÓN",
        sublabel: "Emite el primer veredicto para calibrar el tacómetro",
        colorClass: "text-slate-400 border-slate-700 bg-slate-800/40",
        glowClass: "",
        badgeBg: "bg-slate-700/50",
      };
    }
    if (smokePct <= 25) {
      return {
        label: "BAJO HUMO · ALTA CONFIANZA TÉCNICA",
        sublabel: "La audiencia considera factible y sustentada esta propuesta",
        colorClass: "text-emerald-400 border-emerald-500/40 bg-emerald-950/30",
        glowClass: "shadow-[0_0_25px_rgba(16,185,129,0.25)]",
        badgeBg: "bg-emerald-500/20 text-emerald-300",
      };
    }
    if (smokePct <= 50) {
      return {
        label: "HYPE LEVE · FUNDAMENTOS PROMISORIOS",
        sublabel: "Balance positivo con reservas sobre métricas o plazos",
        colorClass: "text-sky-400 border-sky-500/40 bg-sky-950/30",
        glowClass: "shadow-[0_0_25px_rgba(14,165,233,0.25)]",
        badgeBg: "bg-sky-500/20 text-sky-300",
      };
    }
    if (smokePct <= 75) {
      return {
        label: "HYPE SEVERO · MARKETING AGRESIVO",
        sublabel: "La comunidad detecta exageraciones e inconsistencias técnicas",
        colorClass: "text-amber-400 border-amber-500/40 bg-amber-950/30",
        glowClass: "shadow-[0_0_25px_rgba(245,158,11,0.25)]",
        badgeBg: "bg-amber-500/20 text-amber-300",
      };
    }
    return {
      label: "¡HUMO CRÍTICO! BULLSHIT DETECTADO",
      sublabel: "Alerta máxima del tribunal: promesa inverosímil o vaporware",
      colorClass: "text-red-400 border-red-500/60 bg-red-950/40",
      glowClass: "shadow-[0_0_35px_rgba(239,68,68,0.35)] animate-pulse",
      badgeBg: "bg-red-500/20 text-red-300",
    };
  }, [smokePct, counts.total]);

  // Longitud de arco del semicírculo (R = 82 => L = pi * 82 ≈ 257.6)
  const arcLength = 257.6;
  const strokeOffset = arcLength * (1 - smokePct / 100);

  return (
    <div className="bg-tribunal-card/90 backdrop-blur-xl border border-tribunal-border rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-6 sm:space-y-8 max-w-4xl mx-auto relative overflow-hidden">
      {/* Luz ambiental sutil según nivel de humo */}
      <div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${
          smokePct > 75
            ? "bg-red-600/20"
            : smokePct > 50
            ? "bg-amber-600/15"
            : "bg-emerald-600/15"
        }`}
      />

      {/* Claim Headline */}
      <div className="space-y-3 border-b border-slate-800/80 pb-4 sm:pb-5 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="flex items-center space-x-2 text-purple-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-400 shrink-0" />
            <span className="tracking-wider text-[11px] sm:text-xs">CASO BAJO JURADO · PROPUESTO POR {authorName.toUpperCase()}</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/60 text-[11px] sm:text-xs">
            <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>
              {counts.total} {counts.total === 1 ? "voto en vivo" : "votos sincronizados"}
            </span>
          </span>
        </div>
        <blockquote className="text-base sm:text-xl md:text-2xl font-extrabold text-white leading-snug border-l-4 border-purple-500 pl-3 sm:pl-4 py-1.5 sm:py-2 italic bg-slate-950/60 rounded-r-xl tracking-tight break-words">
          "{claimContent}"
        </blockquote>
      </div>

      {/* ========================================================= */}
      {/* 🚀 EL HYPE-O-METER: TACÓMETRO ANALÓGICO-DIGITAL REACTIVO  */}
      {/* ========================================================= */}
      <div className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col items-center">
        {/* Cabecera del tacómetro */}
        <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span className="flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="tracking-widest uppercase font-semibold">
              <PericialTerm term="Hype Score">Hype-o-Meter 3000</PericialTerm> · Sensor Colectivo
            </span>
          </span>
          <span className="text-[11px] text-purple-300/80 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
            Medición de Hype en Vivo
          </span>
        </div>

        {/* SVG Tacómetro */}
        <div className="relative w-full max-w-[320px] aspect-[260/150] flex items-center justify-center">
          <svg viewBox="0 0 260 150" className="w-full h-full overflow-visible">
            <defs>
              {/* Gradiente del arco del tacómetro */}
              <linearGradient id="hypeGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="35%" stopColor="#38bdf8" />
                <stop offset="65%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>

              {/* Filtro de brillo para la aguja */}
              <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Pista base graduada (fondo completo con gradiente siempre visible) */}
            <path
              d="M 48 130 A 82 82 0 0 1 212 130"
              fill="none"
              stroke="#0f172a"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 48 130 A 82 82 0 0 1 212 130"
              fill="none"
              stroke="url(#hypeGaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.65"
            />

            {/* Pista activa con resplandor según el valor de humo */}
            {smokePct > 0 && (
              <path
                d="M 48 130 A 82 82 0 0 1 212 130"
                fill="none"
                stroke="url(#hypeGaugeGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-700 ease-out"
                filter={smokePct > 70 ? "url(#needleGlow)" : undefined}
                opacity="1"
              />
            )}

            {/* Marcador de punto 0% (Verde esmeralda activo si es bajo humo) */}
            <circle
              cx="48"
              cy="130"
              r={smokePct <= 25 ? "7" : "4"}
              fill="#10b981"
              className="transition-all duration-500"
              filter={smokePct <= 25 ? "url(#needleGlow)" : undefined}
            />

            {/* Marcador de punto 100% (Rojo carmesí activo si es alto humo) */}
            <circle
              cx="212"
              cy="130"
              r={smokePct >= 75 ? "7" : "4"}
              fill="#ef4444"
              className="transition-all duration-500"
              filter={smokePct >= 75 ? "url(#needleGlow)" : undefined}
            />

            {/* Ticks y Marcas de referencia (0%, 25%, 50%, 75%, 100%) */}
            {/* 0% (Extremo izquierdo: Sólido) */}
            <line x1="48" y1="130" x2="36" y2="130" stroke="#10b981" strokeWidth="2.5" />
            <text x="30" y="142" fill="#10b981" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              0%
            </text>

            {/* 50% (Centro superior: Dividido) */}
            <line x1="130" y1="48" x2="130" y2="36" stroke="#f59e0b" strokeWidth="2" />
            <text x="130" y="30" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              50%
            </text>

            {/* 100% (Extremo derecho: Puro Humo) */}
            <line x1="212" y1="130" x2="224" y2="130" stroke="#ef4444" strokeWidth="2.5" />
            <text x="230" y="142" fill="#ef4444" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              100%
            </text>

            {/* Aguja del tacómetro */}
            <g
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transformOrigin: "130px 130px",
                transition: "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {/* Cuerpo cónico de la aguja */}
              <polygon
                points="127,130 133,130 131,52 129,52"
                fill="#ffffff"
                filter="url(#needleGlow)"
              />
              {/* Punta estilizada roja/morada */}
              <polygon points="128.5,52 131.5,52 130,42" fill="#ef4444" />
            </g>

            {/* Hub / Pivote central */}
            <circle cx="130" cy="130" r="11" fill="#0f172a" stroke="#8b5cf6" strokeWidth="3" />
            <circle
              cx="130"
              cy="130"
              r="4"
              fill={smokePct > 75 ? "#ef4444" : smokePct > 50 ? "#f59e0b" : "#10b981"}
              className="transition-colors duration-500"
            />
          </svg>
        </div>

        {/* Lectura Digital Central */}
        <div className="flex flex-col items-center -mt-3 space-y-2 text-center">
          <div className="flex items-baseline space-x-2 font-mono">
            <span
              className={`text-4xl sm:text-5xl font-black tracking-tight transition-colors duration-500 ${
                smokePct > 75
                  ? "text-red-400"
                  : smokePct > 50
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {counts.total === 0 ? "50/50" : `${smokePct}%`}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">
              {counts.total === 0 ? "Sin votos aún" : "Índice de Humo"}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <span>● {counts.total === 0 ? 50 : legitPct}% Sólido</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-red-400 font-semibold flex items-center space-x-1">
              <span>● {counts.total === 0 ? 50 : smokePct}% Humo</span>
            </span>
          </div>

          {/* Badge dinámico de veredicto popular */}
          <div
            className={`px-4 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wide flex items-center space-x-2 transition-all duration-500 ${hypeLevel.colorClass} ${hypeLevel.glowClass}`}
          >
            {smokePct > 75 ? (
              <Flame className="w-4 h-4 text-red-400 animate-bounce" />
            ) : smokePct > 50 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <Shield className="w-4 h-4 text-emerald-400" />
            )}
            <span>{hypeLevel.label}</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-md">{hypeLevel.sublabel}</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTONES DE VOTACIÓN MULTIJUGADOR TACTIL                   */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span className="uppercase tracking-wider">Tu Juicio en Tiempo Real (Votación en Vivo)</span>
          {myVoteChoice && (
            <span className="text-purple-300 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voto registrado en tiempo real</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Botón SMOKE */}
          <button
            onClick={() => onCastVote("SMOKE")}
            className={`p-3.5 sm:p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 transform active:scale-95 group relative overflow-hidden ${
              myVoteChoice === "SMOKE"
                ? "bg-red-950/40 border-red-500 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.3)] ring-2 ring-red-500/80"
                : "bg-slate-900/80 hover:bg-red-950/20 border-slate-800 hover:border-red-500/50 text-slate-200"
            }`}
          >
            <div className="flex items-center space-x-2.5 sm:space-x-3.5 text-left z-10 min-w-0">
              <div
                className={`p-2.5 sm:p-3.5 rounded-xl transition-colors shrink-0 ${
                  myVoteChoice === "SMOKE"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
                    : "bg-red-500/10 text-red-400 group-hover:bg-red-500/20"
                }`}
              >
                <Flame className={`w-5 h-5 sm:w-6 sm:h-6 ${myVoteChoice === "SMOKE" ? "animate-pulse" : ""}`} />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm sm:text-base flex items-center space-x-1.5 sm:space-x-2">
                  <span>¡Es Puro Humo!</span>
                  {myVoteChoice === "SMOKE" && (
                    <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 sm:px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 shrink-0">
                      Tu Voto
                    </span>
                  )}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">Promesa inflada / Sin sustento</div>
              </div>
            </div>
            <div className="text-right font-mono z-10 shrink-0 pl-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-red-400">
                {counts.total === 0 ? "50%" : `${smokePct}%`}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                {counts.smoke} {counts.smoke === 1 ? "voto" : "votos"}
              </div>
            </div>
          </button>

          {/* Botón LEGIT */}
          <button
            onClick={() => onCastVote("LEGIT")}
            className={`p-3.5 sm:p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 transform active:scale-95 group relative overflow-hidden ${
              myVoteChoice === "LEGIT"
                ? "bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/80"
                : "bg-slate-900/80 hover:bg-emerald-950/20 border-slate-800 hover:border-emerald-500/50 text-slate-200"
            }`}
          >
            <div className="flex items-center space-x-2.5 sm:space-x-3.5 text-left z-10 min-w-0">
              <div
                className={`p-2.5 sm:p-3.5 rounded-xl transition-colors shrink-0 ${
                  myVoteChoice === "LEGIT"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                    : "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 sm:w-6 sm:h-6 ${myVoteChoice === "LEGIT" ? "animate-pulse" : ""}`} />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm sm:text-base flex items-center space-x-1.5 sm:space-x-2">
                  <span>Tiene Sustento</span>
                  {myVoteChoice === "LEGIT" && (
                    <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                      Tu Voto
                    </span>
                  )}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">Técnicamente viable y fundamentado</div>
              </div>
            </div>
            <div className="text-right font-mono z-10 shrink-0 pl-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-400">
                {counts.total === 0 ? "50%" : `${legitPct}%`}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                {counts.legit} {counts.legit === 1 ? "voto" : "votos"}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Barra de progreso comparativa en vivo */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div
            className="bg-red-500 rounded-l-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            style={{ width: `${smokePct}%` }}
          />
          <div
            className="bg-emerald-500 rounded-r-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${legitPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span className="text-red-400 flex items-center space-x-1">
            <span>🔥 Humo: {counts.smoke} ({smokePct}%)</span>
          </span>
          <span className="text-slate-500 hidden sm:inline">Reactividad WebSocket instantánea</span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <span>🛡️ Sólido: {counts.legit} ({legitPct}%)</span>
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ACTIVIDAD DE VOTANTES EN VIVO (TICKER FEED)               */}
      {/* ========================================================= */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
            <span className="uppercase text-[11px] tracking-wider">Feed de Jurados en Vivo</span>
          </span>
          <span className="text-[10px] text-slate-500">Últimos votos emitidos</span>
        </div>

        {counts.recentVoters && counts.recentVoters.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {counts.recentVoters.map((voter, index) => (
              <span
                key={index}
                className={`inline-flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border transition-all ${
                  voter.choice === "SMOKE"
                    ? "bg-red-950/40 border-red-800/60 text-red-300"
                    : "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                }`}
              >
                <span className="font-semibold">{voter.name}:</span>
                <span className="flex items-center space-x-1">
                  {voter.choice === "SMOKE" ? (
                    <>
                      <span>HUMO</span>
                      <Flame className="w-3 h-3 text-red-400" />
                    </>
                  ) : (
                    <>
                      <span>SÓLIDO</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </>
                  )}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-slate-500 py-1 italic">
            Esperando los primeros sufragios de los jurados en la sala...
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* PANEL DE SONIDOS PROCEDURALES                             */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-purple-950/30 via-slate-950/50 to-indigo-950/30 border border-purple-900/40 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-purple-300">
          <Volume2 className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
          <span className="font-semibold">Efectos Acústicos:</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Sintetizador Web Audio en tiempo real
          </span>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end gap-1.5 sm:gap-2">
          <button
            onClick={() => audio.playGavel()}
            title="Martillazo acústico de juez"
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-900/40 border border-slate-700/80 hover:border-purple-500/60 text-[10px] sm:text-[11px] font-mono text-slate-300 flex items-center space-x-1 transition active:scale-95"
          >
            <Gavel className="w-3 h-3 text-amber-400" />
            <span>Martillazo</span>
          </button>
          <button
            onClick={() => audio.playSmokeSiren()}
            title="Sirena de humo / Bullshit alarm"
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-red-900/40 border border-slate-700/80 hover:border-red-500/60 text-[10px] sm:text-[11px] font-mono text-slate-300 flex items-center space-x-1 transition active:scale-95"
          >
            <Flame className="w-3 h-3 text-red-400" />
            <span>Sirena</span>
          </button>
          <button
            onClick={() => audio.playHypeAlert()}
            title="Alerta de hype crítico"
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-900/40 border border-slate-700/80 hover:border-amber-500/60 text-[10px] sm:text-[11px] font-mono text-slate-300 flex items-center space-x-1 transition active:scale-95"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Alerta Hype</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN INICIAR AUDITORÍA (HOST VS INVITADO)              */}
      {/* ========================================================= */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          {isHost ? (
            <span className="space-y-0.5 block">
              <span className="text-purple-300 font-semibold block">Eres el Presidente del Tribunal (Host).</span>
              <span>Cuando la deliberación pública finalice, despliega el escuadrón autónomo.</span>
            </span>
          ) : (
            <span className="space-y-0.5 block">
              <span className="text-purple-300 font-semibold block">Participando como Jurado (Invitado).</span>
              <span>Tus votos modifican el tacómetro del Host en tiempo real.</span>
            </span>
          )}
        </div>

        {isHost ? (
          <button
            onClick={onLaunchInvestigation}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl flex items-center justify-center space-x-2.5 shadow-xl shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95 group text-xs sm:text-sm"
          >
            <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
            <span>Desplegar Auditoría Autónoma</span>
          </button>
        ) : (
          <div className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-purple-950/40 border border-purple-800/60 text-purple-300 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
            <span>Esperando a que el Host inicie la auditoría...</span>
          </div>
        )}
      </div>
    </div>
  );
};

