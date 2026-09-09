import test from "node:test";
import assert from "node:assert/strict";
import { buildContrastPlan, normalizeLinkupResults, validateEvidenceAssessments } from "../convex/lib/research.ts";

const source = { evidenceId: "source-1", title: "Informe", url: "https://source.example/report", snippet: "La evaluación encontró límites y fallos bajo las condiciones descritas en el benchmark." };
test("el contraste cambia con la cobertura y conserva los hallazgos que lo motivan", () => {
  const covered = buildContrastPlan("Claim", [source]);
  const uncovered = buildContrastPlan("Claim", [{ ...source, snippet: "Anuncio de marketing sin detalles técnicos." }]);
  assert.notEqual(covered.query, uncovered.query);
  assert.ok(covered.query.includes(source.url));
  assert.ok(covered.query.includes(source.snippet));
  assert.ok(uncovered.gaps.some((gap) => gap.includes("mediciones")));
  assert.ok(!covered.gaps.some((gap) => gap.includes("mediciones")));
});
test("normaliza fuentes utilizables, deduplica URLs y rechaza esquemas inseguros", () => {
  const result = normalizeLinkupResults({ results: [
    null, { url: "https://", content: "texto" }, { url: "javascript:alert(1)", content: "texto" },
    { url: "https://user:password@source.example/", content: "texto" },
    { url: source.url, content: "  " },
    { url: source.url, content: source.snippet, name: 42, title: "Título alternativo" },
    { url: source.url + "#fragment", content: source.snippet, name: "Duplicado" },
    { url: "https://www.source.example/report", content: source.snippet, name: "Mismo sitio con www" },
  ] });
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "Título alternativo");
  assert.equal(result[0].assessment, "unassessed");
  assert.equal(result[0].uncertaintyLevel, "HIGH");
});
test("acepta una interpretación sólo con ID conocido, razón y cita literal suficiente", () => {
  const assessment = { evidenceId: source.evidenceId, assessment: "contradicts", uncertaintyLevel: "MEDIUM", reason: "Se describen fallos concretos.", quote: "La evaluación encontró límites y fallos" };
  assert.equal(validateEvidenceAssessments([assessment], [source]).length, 1);
  for (const change of [{ evidenceId: "otro" }, { quote: "Texto inventado que no pertenece a la fuente." }, { quote: "fallos" }, { reason: " " }, { uncertaintyLevel: "CERTAIN" }]) {
    assert.deepEqual(validateEvidenceAssessments([{ ...assessment, ...change }], [source]), []);
  }
});
test("unassessed mantiene incertidumbre alta y cada fuente se actualiza como máximo una vez", () => {
  const assessment = { evidenceId: source.evidenceId, assessment: "unassessed", uncertaintyLevel: "LOW", reason: "No permite evaluar el claim." };
  const result = validateEvidenceAssessments([assessment, assessment], [source]);
  assert.equal(result.length, 1);
  assert.equal(result[0].uncertaintyLevel, "HIGH");
  assert.equal(result[0].quote, undefined);
});
