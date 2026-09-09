import test from "node:test";
import assert from "node:assert/strict";
import { parseNebiusResponse, resolveAuditOutcome } from "../convex/lib/auditPolicy.ts";

const completeSources = {
  initialSearch: "live",
  contrastSearch: "live",
  synthesis: "live",
};
const validAssessment = {
  verdict: "VERIFIED_LEGIT",
  hypeScore: 0,
  summary: "La evidencia disponible respalda esta afirmación concreta.",
};

function responseFor(assessment = validAssessment, usage) {
  return {
    choices: [{ message: { content: JSON.stringify(assessment) } }],
    ...(usage === undefined ? {} : { usage }),
  };
}

for (const initialSearch of ["live", "demo"]) {
  for (const contrastSearch of ["live", "demo"]) {
    for (const synthesis of ["live", "demo"]) {
      if ([initialSearch, contrastSearch, synthesis].every((source) => source === "live")) continue;
      test(`se abstiene con fuentes ${initialSearch}/${contrastSearch}/${synthesis}`, () => {
        const sources = { initialSearch, contrastSearch, synthesis };
        for (const verdict of ["CERTIFIED_SMOKE", "PLAUSIBLE", "VERIFIED_LEGIT"]) {
          const outcome = resolveAuditOutcome(sources, { ...validAssessment, verdict });
          assert.equal(outcome.verdict, "INSUFFICIENT_EVIDENCE");
          assert.equal(outcome.hypeScore, undefined);
          assert.ok(outcome.summary.trim());
        }
      });
    }
  }
}

test("todas las etapas reales conservan el resultado validado, incluido hype cero", () => {
  const parsed = parseNebiusResponse(responseFor());
  assert.ok(parsed);
  assert.deepEqual(resolveAuditOutcome(completeSources, parsed.assessment), validAssessment);
});

test("etapas reales sin evaluación válida también requieren abstención", () => {
  const outcome = resolveAuditOutcome(completeSources);
  assert.equal(outcome.verdict, "INSUFFICIENT_EVIDENCE");
  assert.equal(outcome.hypeScore, undefined);
});

test("acepta las categorías previstas y ambos extremos del hype", () => {
  for (const verdict of ["CERTIFIED_SMOKE", "PLAUSIBLE", "VERIFIED_LEGIT"]) {
    for (const hypeScore of [0, 100]) {
      const assessment = { ...validAssessment, verdict, hypeScore };
      assert.deepEqual(parseNebiusResponse(responseFor(assessment))?.assessment, assessment);
    }
  }
});

test("rechaza respuestas que no contienen una evaluación JSON válida", () => {
  const malformedResponses = [
    undefined,
    null,
    [],
    {},
    { choices: [] },
    { choices: [{ message: {} }] },
    { choices: [{ message: { content: validAssessment } }] },
    { choices: [{ message: { content: "{JSON incompleto" } }] },
    { choices: [{ message: { content: "null" } }] },
    { choices: [{ message: { content: "[]" } }] },
  ];
  for (const response of malformedResponses) {
    assert.equal(parseNebiusResponse(response), undefined);
  }
});

test("rechaza categorías, resúmenes y rangos que no cumplen el contrato", () => {
  const invalidAssessments = [
    {},
    { ...validAssessment, verdict: "ABSOLUTE_TRUTH" },
    { ...validAssessment, verdict: null },
    { ...validAssessment, summary: "   " },
    { ...validAssessment, summary: 17 },
    { ...validAssessment, summary: undefined },
    { ...validAssessment, hypeScore: -1 },
    { ...validAssessment, hypeScore: 101 },
    { ...validAssessment, hypeScore: "0" },
    { ...validAssessment, hypeScore: null },
    { ...validAssessment, hypeScore: undefined },
  ];
  for (const assessment of invalidAssessments) {
    assert.equal(parseNebiusResponse(responseFor(assessment)), undefined);
  }
});

test("INSUFFICIENT_EVIDENCE no publica hype aunque el proveedor lo incluya", () => {
  for (const hypeScore of [undefined, 88]) {
    const parsed = parseNebiusResponse(responseFor({
      verdict: "INSUFFICIENT_EVIDENCE",
      hypeScore,
      summary: " No hay fuentes suficientes para concluir. ",
    }));
    assert.ok(parsed);
    assert.equal(parsed.assessment.verdict, "INSUFFICIENT_EVIDENCE");
    assert.equal(parsed.assessment.hypeScore, undefined);
    assert.equal(parsed.assessment.summary, "No hay fuentes suficientes para concluir.");
    assert.equal(resolveAuditOutcome(completeSources, parsed.assessment).hypeScore, undefined);
  }
});

test("conserva tokens reportados por el proveedor, incluso cero", () => {
  for (const [promptTokens, completionTokens] of [[0, 0], [124, 37], [0, 19], [51, 0]]) {
    const parsed = parseNebiusResponse(responseFor(validAssessment, {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
    }));
    assert.ok(parsed);
    assert.equal(parsed.inputTokens, promptTokens);
    assert.equal(parsed.outputTokens, completionTokens);
  }
});

test("no inventa tokens cuando usage está ausente o mal formado", () => {
  for (const usage of [undefined, null, {}, [], "unknown"]) {
    const parsed = parseNebiusResponse(responseFor(validAssessment, usage));
    assert.ok(parsed);
    assert.equal(parsed.inputTokens, undefined);
    assert.equal(parsed.outputTokens, undefined);
  }
});

test("descarta conteos inválidos sin perder el conteo válido de la otra dirección", () => {
  for (const invalidCount of [-1, 0.5, "12", null, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const invalidInput = parseNebiusResponse(responseFor(validAssessment, {
      prompt_tokens: invalidCount,
      completion_tokens: 0,
    }));
    assert.ok(invalidInput);
    assert.equal(invalidInput.inputTokens, undefined);
    assert.equal(invalidInput.outputTokens, 0);

    const invalidOutput = parseNebiusResponse(responseFor(validAssessment, {
      prompt_tokens: 12,
      completion_tokens: invalidCount,
    }));
    assert.ok(invalidOutput);
    assert.equal(invalidOutput.inputTokens, 12);
    assert.equal(invalidOutput.outputTokens, undefined);
  }
});

test("el filtro de alcance preserva afirmaciones históricas y medibles sobre religión", async () => {
  const { isOutsideScope } = await import("../convex/lib/auditPolicy.ts");
  assert.equal(isOutsideScope("¿Dios existe?"), true);
  assert.equal(isOutsideScope("Dios no existe."), true);
  assert.equal(isOutsideScope("La Biblia de Gutenberg se imprimió en el siglo XV"), false);
  assert.equal(isOutsideScope("El libro Dios existe se publicó en 2020"), false);
});
