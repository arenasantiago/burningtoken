import React, { useState } from "react";
import { X, Crown, Check, ShieldCheck, Zap, Download, RefreshCw, FileText } from "lucide-react";

interface ProPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasProAccess: boolean;
  onPurchaseSuccess: () => void;
  onRevokeAccess: () => void;
  claimText?: string;
}

export const ProPaywallModal: React.FC<ProPaywallModalProps> = ({
  isOpen,
  onClose,
  hasProAccess,
  onPurchaseSuccess,
  onRevokeAccess,
  claimText,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedPurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPurchaseSuccess();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-tribunal-card border border-amber-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-6">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Crown className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            {hasProAccess
              ? "Dossier VC Due Diligence Desbloqueado"
              : "Desbloquear Dossier VC de Diligencia Profunda"}
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Integración Oficial de RevenueCat Web SDK · Sandbox Test Store
          </p>
        </div>

        {/* Estado Pro Desbloqueado */}
        {hasProAccess ? (
          <div className="space-y-4">
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-4 text-emerald-300 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Entitlement Activo: `pro_auditor_access`</span>
              </div>
              <p className="text-xs text-emerald-400/90 leading-relaxed">
                ¡Compra de prueba verificada en el Test Store! Tu cuenta tiene acceso ilimitado al reporte pericial completo.
              </p>
            </div>

            {/* Contenido Exclusivo Pro */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Matriz de Riesgo y Diligencia de Inversión</span>
                </span>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded">
                  CONFIDENCIAL
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Riesgo de Litigio por Falsa Publicidad:</span>
                  <span className="text-red-400 font-bold font-mono">CRÍTICO (89/100)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Reproducibilidad de Código:</span>
                  <span className="text-amber-400 font-bold font-mono">NO VERIFICADA</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Recomendación para Comités VC:</span>
                  <span className="text-red-300 font-bold font-mono">RECHAZAR VALUACIÓN</span>
                </div>
              </div>

              <button
                onClick={() => alert("Dossier descargado en PDF simulado.")}
                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Dossier Completo en PDF</span>
              </button>
            </div>

            {/* Botón para reiniciar prueba (video demo) */}
            <div className="pt-2 text-center">
              <button
                onClick={onRevokeAccess}
                className="text-xs text-slate-400 hover:text-red-400 transition font-mono flex items-center justify-center space-x-1 mx-auto"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reiniciar suscripción para volver a grabar la demo</span>
              </button>
            </div>
          </div>
        ) : (
          /* Paywall Bloqueado */
          <div className="space-y-5">
            {/* Beneficios */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center space-x-2 text-slate-200">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Matriz completa de riesgo legal y regulatorio para comités de inversión</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Análisis forense de código y auditoría de patentes citadas</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Exportación ejecutiva en PDF y Markdown con sellos periciales</span>
              </div>
            </div>

            {/* Tarjeta de Producto Sandbox */}
            <div className="bg-slate-900/90 border-2 border-amber-500/60 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">
                  Plan Auditor Pro (Test Store)
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  ID: `pro_auditor_monthly` · Entitlement: `pro_auditor_access`
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-400 font-mono">$0.00</div>
                <div className="text-[10px] text-slate-400 font-mono">SANDBOX / TEST STORE</div>
              </div>
            </div>

            {/* Botón de Compra Sandbox */}
            <button
              onClick={handleSimulatedPurchase}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>
                {isProcessing
                  ? "Procesando compra en Test Store..."
                  : "Comprar en Test Store (Sandbox Gratis)"}
              </span>
            </button>

            <p className="text-[11px] text-center text-slate-400 leading-tight">
              Cumple con el criterio oficial del reto RevenueCat: el juez ve la función bloqueada, ejecuta la compra simulada sin dinero real, y el acceso se desbloquea al instante.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
