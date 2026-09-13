import React, { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ConvexError } from "convex/values";
import type { Id } from "../../convex/_generated/dataModel";
import { useLanguage } from "../context/LanguageContext";
import {
  FileText,
  Globe,
  ShieldAlert,
  Printer,
  Download,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Eye,
  EyeOff,
  FileCode,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hasProAccess: boolean;
  onPurchaseSuccess: () => Promise<void>;
  onRefreshAccess: () => Promise<void>;
  purchaseAvailable: boolean;
  setupError: string | null;
  purchaseToken: string;
  sessionToken: string;
  investigationId?: Id<"investigations">;
  claimText?: string;
}

function escapeHtml(str?: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeMarkdown(value?: string): string {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/([\\`*_{}\[\]()#+.!|>-])/g, "\\$1")
    .replace(/[\r\n]+/g, " ")
    .trim();
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function generateDossierHtml(d: any): string {
  const risk = d.riskMatrix;
  const verdictColor =
    d.verdict === "CERTIFIED_SMOKE"
      ? "#ef4444"
      : d.verdict === "PLAUSIBLE"
      ? "#f59e0b"
      : d.verdict === "VERIFIED_LEGIT"
      ? "#10b981"
      : "#64748b";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dossier Pericial · ${escapeHtml(d.caseCode)} · Truth Tribunal</title>
  <style>
    @page { size: A4 portrait; margin: 16mm 18mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      font-size: 10pt;
      margin: 0 auto;
      padding: 18px;
      background: #ffffff;
      max-width: 860px;
    }
    .no-print-bar {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-btn {
      background: #6366f1;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 9pt;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
    }
    .header {
      border-bottom: 2px solid #6366f1;
      padding-bottom: 12px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title { font-size: 16pt; font-weight: 800; color: #1e1b4b; letter-spacing: -0.5px; margin: 0; }
    .brand-subtitle { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .badge-pro {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 8pt;
      font-family: monospace;
      color: #475569;
      text-align: right;
    }
    .section-title {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 8px;
    }
    .claim-box {
      background: #f8fafc;
      border-left: 4px solid #6366f1;
      padding: 10px 14px;
      font-size: 10.5pt;
      font-style: italic;
      color: #1e293b;
      margin-bottom: 12px;
    }
    .verdict-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 8px;
      padding: 10px 16px;
      margin-bottom: 14px;
    }
    .verdict-tag {
      display: inline-block;
      font-weight: 800;
      font-size: 11pt;
      color: ${verdictColor};
      letter-spacing: 0.5px;
    }
    .hype-score {
      font-family: monospace;
      font-size: 12pt;
      font-weight: 700;
      color: #475569;
    }
    .risk-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 14px;
      font-size: 9pt;
    }
    .risk-table th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
      font-weight: 700;
    }
    .risk-table td {
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }
    .evidence-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .evidence-title { font-weight: 700; font-size: 9.5pt; color: #1e293b; }
    .evidence-url { font-size: 7.5pt; color: #64748b; font-family: monospace; word-break: break-all; }
    .evidence-quote { font-size: 8.5pt; color: #334155; font-style: italic; background: #f8fafc; padding: 4px 8px; border-radius: 4px; margin: 4px 0; }
    .evidence-meta { font-size: 7.5pt; color: #475569; font-family: monospace; display: flex; gap: 12px; }
    .footer {
      border-top: 1px solid #e2e8f0;
      margin-top: 24px;
      padding-top: 8px;
      font-size: 7.5pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print no-print-bar">
    <span style="font-size: 8.5pt; color: #475569;">Dossier Oficial de Due Diligence · Guardable como PDF</span>
    <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
  </div>

  <div class="header">
    <div>
      <h1 class="brand-title">TRUTH TRIBUNAL · DOSSIER DE DUE DILIGENCE</h1>
      <div class="brand-subtitle">Auditoría Pericial Autónoma · Certificación de Hype & Falsabilidad</div>
    </div>
    <div class="badge-pro">
      <div><strong>CASO:</strong> ${escapeHtml(d.caseCode)}</div>
      <div><strong>FECHA:</strong> ${new Date(d.certifiedAt).toLocaleDateString("es-ES")}</div>
      <div><strong>ENTITLEMENT:</strong> PRO_AUDITOR_ACCESS</div>
    </div>
  </div>

  <div class="section-title">01 · Afirmación Auditada</div>
  <div class="claim-box">
    "${escapeHtml(d.claim)}"
  </div>

  <div class="verdict-banner">
    <div>
      <span class="verdict-tag">${escapeHtml(d.verdict)}</span>
      <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">${d.evaluable ? "Resultado evaluable con inferencia y evidencia trazables" : "Auditoría no evaluable; no constituye una clasificación de riesgo"}</div>
    </div>
    <div class="hype-score">
      Hype Score: <strong>${d.hypeScore !== undefined ? `${d.hypeScore}%` : "N/D"}</strong>
    </div>
  </div>

  <div style="font-size: 9.5pt; color: #334155; line-height: 1.6; margin-bottom: 14px;">
    <strong>Resumen Ejecutivo:</strong> ${escapeHtml(d.summary)}
  </div>

  <div class="section-title">02 · Matriz Pericial de Riesgo (Evaluación VC & Académica)</div>
  <table class="risk-table">
    <thead>
      <tr>
        <th style="width: 25%;">Dimensión</th>
        <th style="width: 25%;">Nivel Estimado</th>
        <th style="width: 50%;">Análisis y Justificación Pericial</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Riesgo Reputacional / Humo</strong></td>
        <td>${escapeHtml(risk?.reputationalRisk)}</td>
        <td>Divergencia entre promesas comerciales de marketing y el sustento verificable en literatura pública.</td>
      </tr>
      <tr>
        <td><strong>Factibilidad / Técnica</strong></td>
        <td>${escapeHtml(risk?.technicalRisk)}</td>
        <td>Evaluación de reproducibilidad técnica, benchmarks de terceros y estado del código o producto.</td>
      </tr>
      <tr>
        <td><strong>Calidad de Evidencia</strong></td>
        <td>${escapeHtml(risk?.evidenceQuality)}</td>
        <td>Proporción de fuentes primarias contrastadas versus notas de prensa o afirmaciones no validadas.</td>
      </tr>
    </tbody>
  </table>

  <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px;">
    <div style="font-size: 8.5pt; font-weight: 700; color: #475569; text-transform: uppercase;">Directriz de Acción Recomendada para Inversión / Aprobación:</div>
    <div style="font-size: 9.5pt; color: #1e293b; margin-top: 4px; font-weight: 600;">
      ${escapeHtml(risk?.recommendation)}
    </div>
  </div>

  <div class="section-title">03 · Registro de Evidencias Contrastadas (${d.evidence?.length ?? 0} fuentes analizadas)</div>
  ${(d.evidence || [])
    .map(
      (e: any, idx: number) => `
    <div class="evidence-card">
      <div class="evidence-title">#${idx + 1} · ${escapeHtml(e.title)}</div>
      <div class="evidence-url">${escapeHtml(e.url)}</div>
      ${e.supportingQuote ? `<div class="evidence-quote">“${escapeHtml(e.supportingQuote)}”</div>` : ""}
      <div style="font-size: 8.5pt; color: #475569; margin-top: 4px;">
        <strong>Interpretación:</strong> ${escapeHtml(e.reason || e.snippet)}
      </div>
      <div class="evidence-meta" style="margin-top: 4px;">
        <span>Evaluación: <strong>${escapeHtml(e.assessment)}</strong></span>
        <span>Incertidumbre: <strong>${escapeHtml(e.uncertainty)}</strong></span>
        <span>Fase: <strong>${escapeHtml(e.step)}</strong></span>
      </div>
    </div>`
    )
    .join("")}

  <div class="section-title">04 · Descargo Metodológico & Transparencia</div>
  <p style="font-size: 8pt; color: #64748b; line-height: 1.5;">
    Este informe fue generado automáticamente por <strong>Truth Tribunal</strong>. La procedencia, limitaciones y estado evaluable se indican en el propio expediente; un resultado incompleto no constituye certificación.
  </p>

  <div class="footer">
    <span>Truth Tribunal · Documento pericial confidencial generado con RevenueCat Web SDK Sandbox</span>
    <span>Certificación Criptográfica en Convex Cloud</span>
  </div>
</body>
</html>`;
}

export function ProPaywallModal(props: Props) {
  const convex = useConvex();
  const { language } = useLanguage();
  const isEs = language === "es";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewDossier, setPreviewDossier] = useState<any>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const run = async (task: () => Promise<void>) => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(
        e instanceof ConvexError && typeof e.data === "string"
          ? e.data
          : e instanceof Error
          ? e.message
          : "No pudimos completar la operación."
      );
    } finally {
      setPending(false);
    }
  };

  const fetchDossierData = async () => {
    if (!props.investigationId) throw new Error("No hay investigación seleccionada.");
    await props.onRefreshAccess();
    return await convex.query(api.entitlements.dossier, {
      token: props.purchaseToken,
      sessionToken: props.sessionToken,
      investigationId: props.investigationId,
    });
  };

  const printPdfDossier = async () => {
    await run(async () => {
      const d = await fetchDossierData();
      setPreviewDossier(d);
      const html = generateDossierHtml(d);

      // Imprimir mediante iframe oculto sin generar ventanas emergentes (100% anti-bloqueo)
      try {
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.setAttribute("aria-hidden", "true");
        document.body.appendChild(iframe);

        const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
        if (frameDoc) {
          frameDoc.open();
          frameDoc.write(html);
          frameDoc.close();

          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } catch (err) {
              console.warn("Iframe print fallback a descarga:", err);
              downloadBlob(html, `dossier-${d.caseCode || "pericial"}.html`, "text/html;charset=utf-8");
            } finally {
              setTimeout(() => {
                try { document.body.removeChild(iframe); } catch {}
              }, 3000);
            }
          }, 400);
          return;
        }
      } catch (e) {
        console.warn("Error creando iframe de impresión:", e);
      }

      // Fallback seguro: descarga directa del HTML formateado sin abrir popups
      downloadBlob(html, `dossier-${d.caseCode || "pericial"}.html`, "text/html;charset=utf-8");
    });
  };

  const downloadHtmlDossier = async () => {
    await run(async () => {
      const d = await fetchDossierData();
      setPreviewDossier(d);
      const html = generateDossierHtml(d);
      downloadBlob(html, `dossier-${d.caseCode || "pericial"}.html`, "text/html;charset=utf-8");
    });
  };

  const downloadMarkdownDossier = async () => {
    await run(async () => {
      const d = await fetchDossierData();
      setPreviewDossier(d);
      const risk = d.riskMatrix;
      const lines = [
        `# TRUTH TRIBUNAL · DOSSIER DE DUE DILIGENCE`,
        `**Caso:** ${d.caseCode} | **Fecha:** ${new Date(d.certifiedAt).toISOString()}`,
        `**Acceso:** Pro Auditor Access (RevenueCat verificado)`,
        `**Estado del resultado:** ${d.evaluable ? "Evaluable" : "No evaluable"}`,
        ``,
        `## 1. Afirmación Auditada`,
        `> "${escapeMarkdown(d.claim)}"`,
        ``,
        `* **Dictamen:** \`${d.verdict}\``,
        `* **Hype Score:** ${d.hypeScore !== undefined ? `${d.hypeScore}%` : "N/D"}`,
        `* **Resumen Ejecutivo:** ${escapeMarkdown(d.summary)}`,
        ``,
        `## 2. Matriz Pericial de Riesgo (VC & Universidad)`,
        `| Dimensión | Nivel | Descripción |`,
        `|---|---|---|`,
        `| **Riesgo Reputacional / Humo** | ${escapeMarkdown(risk?.reputationalRisk)} | Exageración de marketing vs evidencia empírica |`,
        `| **Factibilidad Técnica** | ${escapeMarkdown(risk?.technicalRisk)} | Reproducibilidad técnica y benchmarks |`,
        `| **Calidad de Evidencia** | ${escapeMarkdown(risk?.evidenceQuality)} | Solidez de fuentes primarias contrastadas |`,
        ``,
        `**Directriz de Acción Recomendada:**`,
        `${escapeMarkdown(risk?.recommendation)}`,
        ``,
        `## 3. Trazabilidad de Evidencias Contrastadas`,
        ...(d.evidence || []).map(
          (e: any, idx: number) =>
            `### ${idx + 1}. ${escapeMarkdown(e.title)}\n* **URL:** ${escapeMarkdown(e.url)}\n* **Postura:** \`${e.assessment}\` (Incertidumbre: \`${e.uncertainty}\`)\n* **Fragmento:** "${escapeMarkdown(e.snippet)}"\n${
              e.supportingQuote ? `* **Cita literal analizada:** "${escapeMarkdown(e.supportingQuote)}"\n` : ""
            }${e.reason ? `* **Razón:** ${escapeMarkdown(e.reason)}\n` : ""}`
        ),
        ``,
        `## 4. Limitaciones y Alcance Metodológico`,
        escapeMarkdown(d.limitations),
      ];

      downloadBlob(lines.filter(Boolean).join("\n\n"), `dossier-${d.caseCode || "pericial"}.md`, "text/markdown;charset=utf-8");
    });
  };

  const togglePreview = async () => {
    if (!showPreview && !previewDossier) {
      await run(async () => {
        const d = await fetchDossierData();
        setPreviewDossier(d);
        setShowPreview(true);
      });
    } else {
      setShowPreview(!showPreview);
    }
  };

  if (!props.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 p-3 sm:p-6 flex items-center justify-center backdrop-blur-sm"
      onKeyDown={(e) => {
        if (e.key === "Escape" && !pending) props.onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-title"
        className="w-full max-w-xl max-h-[92dvh] overflow-y-auto rounded-2xl border border-purple-500/40 bg-slate-950 p-5 sm:p-8 space-y-5 shadow-2xl shadow-purple-950/40"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <h2 id="pro-title" className="text-xl font-bold text-white">
                {props.hasProAccess
                  ? (isEs ? "Auditor Pro · Dossier & Exportación" : "Auditor Pro · Dossier & Export")
                  : (isEs ? "Actualizar a Auditor Pro" : "Upgrade to Auditor Pro")}
              </h2>
              <p className="text-xs text-purple-300">
                {props.hasProAccess
                  ? (isEs ? "Suscripción activa en Test Store · Desbloqueo pericial verificado" : "Active subscription on Test Store · Verified expert unlock")
                  : (isEs ? "Due Diligence pericial, análisis global y exportación profesional" : "Forensic Due Diligence, global research & professional export")}
              </p>
            </div>
          </div>
          <button
            autoFocus
            disabled={pending}
            onClick={props.onClose}
            aria-label={isEs ? "Cerrar" : "Close"}
            className="min-h-10 min-w-10 rounded-lg text-slate-400 hover:text-white transition flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Resumen de Beneficios Premium */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isEs ? "Beneficios del Nivel Auditor Pro:" : "Auditor Pro Tier Benefits:"}
          </p>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-start space-x-3 rounded-xl border border-purple-900/40 bg-purple-950/20 p-3">
              <Globe className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-purple-200">
                  {isEs ? "Fuentes Globales & Multilingües" : "Global & Multilingual Sources"}
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {isEs
                    ? "Búsqueda profunda cruzada con papers científicos, benchmarks internacionales y cobertura en inglés y otros países."
                    : "Deep cross-search across scientific papers, international benchmarks, and coverage in English and other languages."}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3">
              <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-indigo-200">
                  {isEs ? "Matriz Pericial de Riesgo" : "Forensic Risk Matrix"}
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {isEs
                    ? "Evaluación cuantitativa de riesgo reputacional, factibilidad técnica y calidad de evidencia empírica."
                    : "Quantitative evaluation of reputational risk, technical feasibility, and empirical evidence quality."}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-emerald-200">
                  {isEs ? "Dossier Ejecutivo & Académico en PDF" : "Executive & Academic PDF Dossier"}
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {isEs
                    ? "Generación de informe oficial estructurado con membrete editorial, listo para impresión o entrega en materias y comités VC."
                    : "Official structured report generation with editorial letterhead, ready for printing or delivery to VC committees."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="rounded-lg bg-amber-950/40 border border-amber-800/60 p-3 text-xs text-amber-200 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {isEs
              ? "RevenueCat Test Store Sandbox · Prueba 100% gratuita sin cargos bancarios reales."
              : "RevenueCat Test Store Sandbox · 100% free test without real bank charges."}
          </span>
        </p>

        {(error || props.setupError) && (
          <p role="alert" className="text-xs text-red-300 bg-red-950/40 border border-red-800/60 p-3 rounded-lg break-words">
            {error || props.setupError}
          </p>
        )}

        {/* Acciones principales */}
        {props.hasProAccess ? (
          <div className="space-y-3 pt-1">
            {/* Visualizador integrado en pantalla (sin ventanas emergentes) */}
            <button
              disabled={pending || !props.investigationId}
              onClick={() => void togglePreview()}
              className="w-full rounded-xl border border-purple-500/60 bg-purple-950/40 hover:bg-purple-900/50 p-2.5 text-xs font-bold text-purple-200 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-400" />}
              <span>
                {showPreview
                  ? (isEs ? "Ocultar Vista Previa del Expediente" : "Hide Dossier Preview")
                  : (isEs ? "Visualizar Expediente en Pantalla" : "View Dossier on Screen")}
              </span>
            </button>

            {showPreview && previewDossier && (
              <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3.5 space-y-2.5 text-xs max-h-72 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-purple-300 font-bold">{previewDossier.caseCode}</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    previewDossier.verdict === "CERTIFIED_SMOKE"
                      ? "bg-red-950 text-red-400 border border-red-800"
                      : previewDossier.verdict === "VERIFIED_LEGIT"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-amber-950 text-amber-400 border border-amber-800"
                  }`}>
                    {previewDossier.evaluable ? previewDossier.verdict : (isEs ? "NO EVALUABLE" : "NOT ASSESSABLE")} {previewDossier.evaluable && previewDossier.hypeScore !== undefined ? `(${previewDossier.hypeScore}% Hype)` : ""}
                  </span>
                </div>

                <p className="text-slate-300 italic border-l-2 border-purple-600 pl-2 text-[11px]">
                  "{previewDossier.claim}"
                </p>

                <p className="text-slate-300 leading-relaxed text-[11px]">
                  <strong>{isEs ? "Resumen:" : "Summary:"}</strong> {previewDossier.summary}
                </p>

                {previewDossier.riskMatrix && (
                  <div className="space-y-1.5 pt-1">
                    <p className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">
                      {isEs ? "Matriz Pericial de Riesgo" : "Forensic Risk Matrix"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-400 block">{isEs ? "Riesgo Humo:" : "Hype Risk:"}</span>
                        <span className="font-semibold text-slate-200">{previewDossier.riskMatrix.reputationalRisk}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-400 block">{isEs ? "Factibilidad:" : "Feasibility:"}</span>
                        <span className="font-semibold text-slate-200">{previewDossier.riskMatrix.technicalRisk}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-400 block">{isEs ? "Evidencia:" : "Evidence:"}</span>
                        <span className="font-semibold text-slate-200">{previewDossier.riskMatrix.evidenceQuality}</span>
                      </div>
                    </div>
                    <p className="text-purple-200 bg-purple-950/60 p-2 rounded border border-purple-800/50 text-[11px] leading-relaxed">
                      <strong>{isEs ? "Directriz:" : "Directive:"}</strong> {previewDossier.riskMatrix.recommendation}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                disabled={pending || !props.investigationId}
                onClick={() => void run(printPdfDossier)}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 p-2.5 text-xs font-bold text-white flex items-center justify-center space-x-1.5 shadow-md shadow-purple-900/30 transition disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isEs ? "Imprimir / PDF" : "Print / PDF"}</span>
              </button>

              <button
                disabled={pending || !props.investigationId}
                onClick={() => void run(downloadHtmlDossier)}
                className="w-full rounded-xl border border-indigo-500/50 bg-slate-900 hover:bg-slate-800 p-2.5 text-xs font-semibold text-indigo-200 flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isEs ? "Descargar .html" : "Download .html"}</span>
              </button>

              <button
                disabled={pending || !props.investigationId}
                onClick={() => void run(downloadMarkdownDossier)}
                className="w-full rounded-xl border border-purple-500/50 bg-slate-900 hover:bg-slate-800 p-2.5 text-xs font-semibold text-purple-200 flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>{isEs ? "Descargar .md" : "Download .md"}</span>
              </button>
            </div>

            {!props.investigationId && (
              <p className="text-xs text-slate-400 text-center">
                {isEs
                  ? "Completa una investigación en el tribunal para generar su informe pericial."
                  : "Complete an investigation in the tribunal to generate its expert report."}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <button
              disabled={pending || !props.purchaseAvailable}
              onClick={() => void run(props.onPurchaseSuccess)}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 p-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/40 transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {pending
                  ? (isEs ? "Procesando…" : "Processing…")
                  : (isEs ? "Activar Auditor Pro en Test Store (Gratis)" : "Activate Auditor Pro on Test Store (Free)")}
              </span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            disabled={pending}
            onClick={() => void run(props.onRefreshAccess)}
            className="text-xs text-slate-400 hover:text-slate-200 transition underline underline-offset-4 disabled:opacity-50"
          >
            {isEs ? "Revalidar suscripción con servidor" : "Revalidate subscription with server"}
          </button>
          <span className="text-[10px] font-mono text-slate-500">RevenueCat v1 REST</span>
        </div>
      </section>
    </div>
  );
}
