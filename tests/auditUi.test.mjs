import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { build } from "esbuild";

// Render the actual React components without a browser, network, or backend.
const bundle = await build({
  stdin: {
    contents: `
      import React from "react";
      import { renderToStaticMarkup } from "react-dom/server";
      import { EvidenceBoard } from "./src/components/EvidenceBoard";
      import { VerdictReport } from "./src/components/VerdictReport";
      export const renderEvidence = (evidenceList) => renderToStaticMarkup(
        React.createElement(EvidenceBoard, { evidenceList })
      );
      export const renderVerdict = (props) => renderToStaticMarkup(
        React.createElement(VerdictReport, {
          hasProAccess: false,
          onOpenPaywall: () => {},
          onNewClaim: () => {},
          ...props,
        })
      );
    `,
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
    loader: "tsx",
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  write: false,
  logLevel: "silent",
});
const temporaryDirectory = mkdtempSync(join(tmpdir(), "truth-tribunal-ui-"));
const bundlePath = join(temporaryDirectory, "audit-ui.cjs");
writeFileSync(bundlePath, bundle.outputFiles[0].text);
after(() => {
  unlinkSync(bundlePath);
  rmdirSync(temporaryDirectory);
});
const { renderEvidence, renderVerdict } = createRequire(import.meta.url)(bundlePath);

const completeSources = {
  initialSearch: "live",
  contrastSearch: "live",
  synthesis: "live",
};
const evidence = {
  _id: "evidence-1",
  step: "initial_search",
  queryUsed: "Claim sometido al tribunal",
  title: "Hallazgo del proveedor",
  url: "https://example.com/evidence",
  snippet: "La fuente describe un resultado concreto.",
  uncertaintyLevel: "HIGH",
  supportsClaim: true,
};

for (const source of [undefined, "demo"]) {
  test(`evidencia de origen ${source ?? "desconocido"} no publica enlaces ni respaldo heredado`, () => {
    const html = renderEvidence([{ ...evidence, source }]);
    assert.doesNotMatch(html, /<a\b|href=/);
    assert.doesNotMatch(html, /https:\/\/example\.com|Respalda el claim|Contradice el claim/);
    assert.match(html, source === "demo" ? />Demo</ : /Origen no registrado/);
    assert.match(html, /Pendiente de evaluar/);
  });
}

for (const step of ["initial_search", "follow_up_contrast"]) {
  test(`hallazgo real ${step} sin evaluación mantiene relación pendiente`, () => {
    for (const assessment of [undefined, "unassessed"]) {
      const html = renderEvidence([{ ...evidence, step, source: "linkup", assessment }]);
      assert.match(html, /href="https:\/\/example\.com\/evidence"/);
      assert.match(html, /Fuente real · Linkup/);
      assert.match(html, /Pendiente de evaluar/);
      assert.doesNotMatch(html, /Respalda el claim|Contradice el claim|Desmiente claim/);
    }
  });
}

test("URL insegura de un hallazgo real no crea un enlace", () => {
  const html = renderEvidence([{ ...evidence, source: "linkup", url: "javascript:alert(1)" }]);
  assert.doesNotMatch(html, /<a\b|href=/);
});

for (const auditSources of [undefined, { ...completeSources, contrastSearch: "demo" }]) {
  test(`reporte ${auditSources ? "con demo" : "heredado"} se abstiene aunque conserve un juicio concluyente`, () => {
    for (const verdict of ["CERTIFIED_SMOKE", "PLAUSIBLE", "VERIFIED_LEGIT"]) {
      const html = renderVerdict({
        verdict,
        auditSources,
        hypeScore: 85,
        summary: "Juicio anterior que no debe presentarse como comprobado.",
        metrics: {
          latencyMs: 1180,
          inputTokens: 820,
          outputTokens: 310,
          estimatedCostUsd: 0.00021,
          confidenceScore: 94.8,
        },
      });
      assert.match(html, auditSources ? /EVIDENCIA INSUFICIENTE/ : /REPORTE ANTIGUO/);
      assert.match(html, auditSources ? /Auditoría con datos de demo/ : /Origen no registrado/);
      assert.doesNotMatch(html, /CERTIFIED SMOKE|PLAUSIBLE CON RESERVAS|VERIFIED LEGIT/);
      assert.doesNotMatch(html, /Juicio anterior|85%|94\.8|1180|0\.00021/);
      assert.equal((html.match(/No disponible/g) ?? []).length, 4);
    }
  });
}

test("evidencia insuficiente con etapas reales tampoco publica un porcentaje de hype", () => {
  const html = renderVerdict({
    verdict: "INSUFFICIENT_EVIDENCE",
    auditSources: completeSources,
    hypeScore: 99,
    summary: "La documentación disponible no alcanza para evaluar la afirmación.",
  });
  assert.match(html, /EVIDENCIA INSUFICIENTE/);
  assert.match(html, /La documentación disponible no alcanza/);
  assert.doesNotMatch(html, /99%|Índice de Exageración/);
});

test("reporte real conserva hype y métricas medidos en cero", () => {
  const html = renderVerdict({
    verdict: "VERIFIED_LEGIT",
    auditSources: completeSources,
    hypeScore: 0,
    summary: "Evaluación real de esta afirmación concreta.",
    metrics: {
      latencyMs: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      confidenceScore: 0,
      measurementSource: "provider",
    },
  });
  assert.match(html, /VERIFIED LEGIT/);
  assert.match(html, /Índice de Exageración \/ Hype: 0%/);
  assert.match(html, />0 \/ 0</);
  assert.match(html, />0 <span[^>]*>ms</);
  assert.match(html, />\$0 <span[^>]*>USD</);
  assert.match(html, />0%</);
  assert.doesNotMatch(html, /No disponible|85%|94\.8/);
});

test("métricas incompletas del proveedor muestran disponibilidad por campo", () => {
  const html = renderVerdict({
    verdict: "PLAUSIBLE",
    auditSources: completeSources,
    metrics: { latencyMs: 120, measurementSource: "provider" },
  });
  assert.match(html, />120 <span[^>]*>ms</);
  assert.equal((html.match(/No disponible/g) ?? []).length, 4); // Hype plus three unavailable metric cards.
  assert.doesNotMatch(html, /NaN|undefined%/);
});

for (const [completionReason, label] of [["out_of_scope", "FUERA DE ALCANCE"], ["technical_failure", "AUDITORÍA INTERRUMPIDA"]]) {
  test(`distingue ${completionReason} de falta de evidencia`, () => {
    const html = renderVerdict({ verdict: "INSUFFICIENT_EVIDENCE", completionReason, summary: "Fuera del alcance empírico", diagnostics: completionReason === "technical_failure" ? ["Linkup: HTTP 429"] : [] });
    assert.ok(html.includes(label));
    assert.doesNotMatch(html, /EVIDENCIA INSUFICIENTE|Índice de Exageración/);
    if (completionReason === "technical_failure") assert.match(html, /Linkup: HTTP 429/);
    else assert.match(html, /Sin búsquedas ni inferencia/);
  });
}
