import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";

interface PericialTermProps {
  term: string;
  explanation?: string;
  children?: React.ReactNode;
  className?: string;
}

const GLOSSARY_TERMS: Record<string, { title: string; explanation: string }> = {
  "hype score": {
    title: "Índice de Hype (0 - 100%)",
    explanation: "Mide cuantitativamente qué tan inflada o exagerada es una afirmación comercial en comparación con las evidencias empíricas y benchmarks reales disponibles.",
  },
  "inferencia forense": {
    title: "Inferencia Forense con LLM",
    explanation: "Análisis pericial ejecutado por un modelo de lenguaje de alta precisión optimizado para detectar vacíos técnicos, contradicciones y ausencia de pruebas.",
  },
  "deep research": {
    title: "Deep Research en 2 Fases",
    explanation: "Protocolo de búsqueda iterativa: la Fase 1 recopila afirmaciones y la Fase 2 busca activamente brechas, limitaciones no mencionadas y contraejemplos.",
  },
  "idempotencia": {
    title: "Idempotencia de Auditoría",
    explanation: "Propiedad de ingeniería que garantiza que si un paso de la auditoría se ejecuta varias veces por error o reintento, produce el mismo resultado sin duplicar registros en la base de datos.",
  },
  "checkpoints": {
    title: "Puntos de Control (Checkpoints)",
    explanation: "Marcas guardadas de forma duradera en la base de datos que permiten reanudar la auditoría exactamente desde el último paso completado en caso de fallo técnico.",
  },
  "tolerancia a fallos": {
    title: "Tolerancia a Fallos y Resiliencia",
    explanation: "Capacidad del sistema para absorber interrupciones de red o caídas de workers en segundo plano y recuperarse automáticamente sin perder los datos ya recolectados.",
  },
  "due diligence": {
    title: "Due Diligence Técnico para VCs",
    explanation: "Investigación exhaustiva de arquitectura, patentes y código fuente previa a una inversión de capital de riesgo para verificar que la tecnología realmente funciona.",
  },
  "caso límite": {
    title: "Caso Límite (Edge Case)",
    explanation: "Escenario técnico específico documentado donde el modelo de inteligencia artificial o la búsqueda web pueden presentar incertidumbre o requerir criterio humano.",
  },
  "falsabilidad": {
    title: "Criterio de Falsabilidad",
    explanation: "Principio científico que establece que una afirmación sólo es comprobable si es posible diseñar un experimento o prueba que demuestre empíricamente si es falsa.",
  },
  "latencia de inferencia": {
    title: "Latencia de Inferencia",
    explanation: "Tiempo exacto en milisegundos que tardó el modelo pericial de Nebius Token Factory en procesar las pruebas y emitir el dictamen.",
  },
  "tokens": {
    title: "Conteo de Tokens",
    explanation: "Unidades mínimas de texto (palabras o fragmentos) procesadas por el modelo. Permiten calcular con precisión el costo real de cómputo del peritaje.",
  },
  "entitlement": {
    title: "Entitlement de Suscripción",
    explanation: "Identificador criptográfico de permisos en RevenueCat que valida si el jurado tiene acceso activo a los reportes confidenciales Pro.",
  },
  "tps": {
    title: "TPS (Transacciones Por Segundo)",
    explanation: "Capacidad real de procesamiento de operaciones de una blockchain bajo condiciones de estrés, comúnmente inflada en el marketing cripto.",
  },
};

export const PericialTerm: React.FC<PericialTermProps> = ({
  term,
  explanation,
  children,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const termKey = term.toLowerCase().trim();
  const definition = GLOSSARY_TERMS[termKey] || {
    title: term,
    explanation: explanation || "Término técnico de auditoría pericial.",
  };

  const finalExplanation = explanation || definition.explanation;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <span className={`inline-flex items-center gap-1 relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`¿Qué significa ${definition.title}?`}
        className="inline-flex items-center gap-1 group text-left underline decoration-dotted decoration-purple-400/60 hover:decoration-purple-300 underline-offset-4 focus:outline-none transition cursor-help"
      >
        <span>{children || term}</span>
        <HelpCircle className="w-3.5 h-3.5 text-purple-400/70 group-hover:text-purple-300 transition-colors shrink-0" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={definition.title}
          className="absolute z-50 bottom-full left-0 mb-2 w-72 sm:w-80 p-3.5 bg-slate-900/95 backdrop-blur-xl border border-purple-500/40 rounded-xl shadow-2xl shadow-purple-950/80 text-left animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-start justify-between gap-2 border-b border-purple-900/40 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-purple-200 uppercase tracking-wider">
                {definition.title}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded focus:outline-none"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {finalExplanation}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Glosario Pericial</span>
            <span className="text-purple-400">Truth Tribunal</span>
          </div>
        </div>
      )}
    </span>
  );
};
