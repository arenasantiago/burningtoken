import test from "node:test";
import assert from "node:assert/strict";
import { getHeuristicSuggestions } from "../convex/lib/claimSuggestions.ts";

test("afirmación metafísica propone alternativas demográficas, históricas y científicas", () => {
  const suggestions = getHeuristicSuggestions("¿Dios existe?");
  assert.equal(suggestions.length, 3);
  for (const s of suggestions) {
    assert.ok(s.text.length > 20);
    assert.ok(s.angle.length > 3);
    assert.ok(s.verifiabilityScore >= 80 && s.verifiabilityScore <= 100);
    assert.ok(s.reasoning.length > 10);
  }
  assert.ok(suggestions.some((s) => s.angle.includes("Demografía") || s.text.includes("Pew Research")));
});

test("afirmación sobre IA propone alternativas con benchmarks como SWE-bench o SimpleQA", () => {
  const suggestions = getHeuristicSuggestions("Un nuevo agente de IA reemplaza a todo el equipo");
  assert.equal(suggestions.length, 3);
  assert.ok(suggestions.some((s) => s.text.includes("SWE-bench") || s.text.includes("benchmark")));
  for (const s of suggestions) {
    assert.ok(s.verifiabilityScore >= 80);
  }
});

test("afirmación genérica sin coincidencia directa genera variantes estructuradas y falsables", () => {
  const suggestions = getHeuristicSuggestions("La cura definitiva para la fatiga");
  assert.equal(suggestions.length, 3);
  for (const s of suggestions) {
    assert.ok(s.text.includes("La cura definitiva para la fatiga"));
    assert.ok(s.verifiabilityScore > 0);
  }
});
