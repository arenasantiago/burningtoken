import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { build } from "esbuild";

// Exercise the registered production handler with controlled provider responses.
const bundle = await build({
  stdin: {
    contents: `
      export { executeFullAudit } from "./convex/actions";
      export { getFunctionName } from "convex/server";
    `,
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  write: false,
  logLevel: "silent",
});
const temporaryDirectory = mkdtempSync(join(tmpdir(), "truth-tribunal-action-"));
const bundlePath = join(temporaryDirectory, "audit-action.cjs");
writeFileSync(bundlePath, bundle.outputFiles[0].text);
after(() => {
  unlinkSync(bundlePath);
  rmdirSync(temporaryDirectory);
});
const { executeFullAudit, getFunctionName } = createRequire(import.meta.url)(bundlePath);

const liveEvidence = {
  name: "Reporte técnico publicado",
  url: "https://sources.example/report",
  content: "El reporte describe el método y las limitaciones de un benchmark concreto.",
};
const liveAssessment = {
  verdict: "VERIFIED_LEGIT",
  hypeScore: 0,
  summary: "La fuente respalda el resultado descrito dentro de sus límites.",
};

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function nebiusResponse(usage) {
  return jsonResponse({
    choices: [{ message: { content: JSON.stringify(liveAssessment) } }],
    ...(usage === undefined ? {} : { usage }),
  });
}

async function runAudit({ linkupKey = false, nebiusKey = false, claimText = "El benchmark obtuvo el resultado publicado bajo estas condiciones.", respond } = {}) {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  const originalKeys = {
    LINKUP_API_KEY: process.env.LINKUP_API_KEY,
    NEBIUS_API_KEY: process.env.NEBIUS_API_KEY,
  };
  const calls = [];
  const mutations = [];
  const warnings = [];
  try {
    for (const [key, enabled] of [["LINKUP_API_KEY", linkupKey], ["NEBIUS_API_KEY", nebiusKey]]) {
      if (enabled) process.env[key] = "audit-test-placeholder";
      else delete process.env[key];
    }
    console.warn = (...parts) => warnings.push(parts);
    globalThis.fetch = async (url, init) => {
      const call = { url: String(url), body: JSON.parse(init.body) };
      calls.push(call);
      assert.ok(respond, "An unexpected provider call was attempted");
      return respond(call);
    };
    const result = await executeFullAudit._handler({
      runMutation: async (reference, args) => {
        mutations.push({ name: getFunctionName(reference), args: structuredClone(args) });
        return "record-" + mutations.length;
      },
      runQuery: async (reference) => {
        assert.equal(getFunctionName(reference), "evidence:listByInvestigation");
        return mutations.flatMap(({ name, args }, index) => name === "evidence:add" ? [{ ...args, _id: "record-" + (index + 1) }] : []);
      },
    }, {
      investigationId: "investigation-test",
      roomId: "room-test",
      claimText,
    });
    const evidence = mutations.filter(({ name }) => name === "evidence:add").map(({ args }) => args);
    const verdicts = mutations.filter(({ name }) => name === "investigations:saveVerdict");
    assert.equal(verdicts.length, 1, "Each run must finish by saving one outcome");
    return { result, evidence, saved: verdicts[0].args, calls, warnings, mutations };
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
    for (const [key, value] of Object.entries(originalKeys)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function assertInsufficient({ result, saved }) {
  assert.equal(result.success, true);
  assert.equal(result.verdict, "INSUFFICIENT_EVIDENCE");
  assert.equal(saved.verdict, "INSUFFICIENT_EVIDENCE");
  assert.equal(saved.hypeScore, undefined);
  assert.equal(result.hypeScore, undefined);
  assert.equal(saved.metrics.estimatedCostUsd, undefined);
  assert.equal(saved.metrics.confidenceScore, undefined);
}

function assertUnavailableMetrics(saved) {
  assert.equal(saved.metrics.measurementSource, "unavailable");
  assert.equal(saved.metrics.inputTokens, undefined);
  assert.equal(saved.metrics.outputTokens, undefined);
  assert.equal(saved.metrics.estimatedCostUsd, undefined);
  assert.equal(saved.metrics.confidenceScore, undefined);
}

test("sin claves completa una demo sin red, enlaces externos ni conclusión inventada", async () => {
  const run = await runAudit();
  assert.equal(run.calls.length, 0);
  assert.equal(run.evidence.length, 3);
  for (const evidence of run.evidence) {
    assert.equal(evidence.source, "demo");
    assert.equal(evidence.url, "");
    assert.equal(evidence.assessment, "unassessed");
  }
  assert.deepEqual(run.saved.auditSources, {
    initialSearch: "demo", contrastSearch: "demo", synthesis: "demo",
  });
  assertInsufficient(run);
  assertUnavailableMetrics(run.saved);
});

test("Nebius recibe sólo fuentes reales y conserva usage, pero un contraste vacío exige abstención", async () => {
  const run = await runAudit({
    linkupKey: true,
    nebiusKey: true,
    respond: ({ url, body }) => {
      if (url.includes("api.linkup.so")) return jsonResponse({ results: body.q.startsWith("Investiga") ? [] : [liveEvidence] });
      return nebiusResponse({ prompt_tokens: 0, completion_tokens: 17 });
    },
  });
  assert.equal(run.calls.length, 3);
  const prompt = JSON.parse(run.calls[2].body.messages.find(({ role }) => role === "user").content);
  assert.equal(prompt.sources.length, 1);
  assert.ok(prompt.sources.every(({ source }) => source === "linkup"));
  assert.equal(prompt.sources[0].url, liveEvidence.url);
  assert.equal(run.evidence.filter(({ source }) => source === "demo").length, 1);
  assert.deepEqual(run.saved.auditSources, {
    initialSearch: "live", contrastSearch: "demo", synthesis: "live",
  });
  assert.equal(run.saved.metrics.measurementSource, "provider");
  assert.equal(run.saved.metrics.inputTokens, 0);
  assert.equal(run.saved.metrics.outputTokens, 17);
  assert.ok(Number.isFinite(run.saved.metrics.latencyMs));
  assert.ok(run.saved.metrics.latencyMs >= 0);
  assertInsufficient(run);
});

test("una síntesis válida sin usage no inventa conteos de tokens", async () => {
  const run = await runAudit({
    linkupKey: true,
    nebiusKey: true,
    respond: ({ url }) => url.includes("api.linkup.so")
      ? jsonResponse({ results: [liveEvidence] })
      : nebiusResponse(),
  });
  assert.equal(run.saved.metrics.measurementSource, "provider");
  assert.equal(run.saved.metrics.inputTokens, undefined);
  assert.equal(run.saved.metrics.outputTokens, undefined);
  assertInsufficient(run);
});

for (const [scenario, respond] of [
  ["HTTP 429", () => jsonResponse({ error: "rate limited" }, 429)],
  ["error de transporte", () => { throw new Error("controlled transport failure"); }],
  ["JSON inválido", () => new Response("{broken", { status: 200 })],
  ["esquema inválido", () => jsonResponse({ results: { unexpected: true } })],
  ["fuentes sin URL o contenido utilizables", () => jsonResponse({ results: [
    null,
    { ...liveEvidence, url: 123 },
    { ...liveEvidence, url: "javascript:alert(1)" },
    { ...liveEvidence, content: { text: "unexpected" } },
    { ...liveEvidence, content: "   " },
  ] })],
]) {
  test(`Linkup con ${scenario} produce demo visible y no llama a Nebius`, async () => {
    const run = await runAudit({ linkupKey: true, nebiusKey: true, respond });
    assert.equal(run.calls.length, 1);
    assert.equal(run.evidence.length, 3);
    assert.ok(run.evidence.every(({ source, url }) => source === "demo" && url === ""));
    assert.equal(run.saved.auditSources.initialSearch, "demo");
    assert.equal(run.saved.auditSources.synthesis, "demo");
    assertInsufficient(run);
    assertUnavailableMetrics(run.saved);
  });
}

for (const [scenario, respondNebius] of [
  ["HTTP 429", () => jsonResponse({ error: "rate limited" }, 429)],
  ["error de transporte", () => { throw new Error("controlled transport failure"); }],
  ["JSON inválido", () => new Response("{broken", { status: 200 })],
  ["evaluación inválida", () => jsonResponse({
    choices: [{ message: { content: JSON.stringify({ ...liveAssessment, verdict: "INVENTED" }) } }],
    usage: { prompt_tokens: 123, completion_tokens: 45 },
  })],
]) {
  test(`Nebius con ${scenario} termina sin conclusión ni métricas inventadas`, async () => {
    const run = await runAudit({
      linkupKey: true,
      nebiusKey: true,
      respond: ({ url }) => url.includes("api.linkup.so")
        ? jsonResponse({ results: [liveEvidence] })
        : respondNebius(),
    });
    assert.equal(run.calls.length, 3);
    assert.equal(run.saved.auditSources.initialSearch, "live");
    assert.equal(run.saved.auditSources.synthesis, "demo");
    assertInsufficient(run);
    if (scenario === "JSON inválido" || scenario === "evaluación inválida") {
      assert.equal(run.saved.metrics.measurementSource, "provider");
      assert.equal(run.saved.metrics.inputTokens, scenario === "evaluación inválida" ? 123 : undefined);
      assert.equal(run.saved.metrics.outputTokens, scenario === "evaluación inválida" ? 45 : undefined);
    } else assertUnavailableMetrics(run.saved);
  });
}

test("campos name/title mal tipados no contaminan las evidencias persistidas", async () => {
  const run = await runAudit({
    linkupKey: true,
    respond: () => jsonResponse({ results: [
      { ...liveEvidence, name: { unexpected: true }, title: "Título alternativo válido" },
      { ...liveEvidence, url: "https://sources.example/second", name: 42, title: [] },
    ] }),
  });
  const actualEvidence = run.evidence.filter(({ source, step }) => source === "linkup" && step === "initial_search");
  assert.equal(actualEvidence.length, 2);
  assert.equal(actualEvidence[0].title, "Título alternativo válido");
  for (const evidence of actualEvidence) {
    assert.equal(typeof evidence.title, "string");
    assert.ok(evidence.title.trim());
    assert.equal(typeof evidence.url, "string");
    assert.equal(typeof evidence.snippet, "string");
  }
  assertInsufficient(run);
});

test("dos búsquedas reales usan hallazgos guardados y un modelo con citas puede concluir", async () => {
  const run = await runAudit({
    linkupKey: true,
    nebiusKey: true,
    respond: ({ url, body }) => {
      if (url.includes("api.linkup.so")) return jsonResponse({ results: [{ ...liveEvidence, url: body.q.startsWith("Investiga") ? "https://sources.example/independent" : liveEvidence.url }] });
      const { sources } = JSON.parse(body.messages.find(({ role }) => role === "user").content);
      return jsonResponse({
        choices: [{ message: { content: JSON.stringify({ ...liveAssessment, evidenceAssessments: sources.map((source) => ({
          evidenceId: source.evidenceId, assessment: "supports", uncertaintyLevel: "MEDIUM",
          reason: "El fragmento identifica método y límites del resultado.", quote: source.snippet,
        })) }) } }],
        usage: { prompt_tokens: 120, completion_tokens: 80 },
      });
    },
  });
  assert.equal(run.calls.length, 3);
  assert.notEqual(run.calls[0].body.q, run.calls[1].body.q);
  assert.ok(run.calls[1].body.q.includes(liveEvidence.url));
  assert.ok(run.calls[1].body.q.includes(liveEvidence.content));
  assert.ok(run.calls.slice(0, 2).every(({ body }) => body.depth === "deep"));
  assert.deepEqual(run.calls[1].body.excludeDomains, ["sources.example"]);
  const plan = run.mutations.find(({ name }) => name === "investigations:setResearchPlan").args;
  assert.equal(plan.query, run.calls[1].body.q);
  assert.equal(plan.basedOnEvidenceIds.length, 1);
  assert.ok(plan.gaps.length > 0);
  const updates = run.mutations.find(({ name }) => name === "evidence:applyAssessments").args.assessments;
  assert.equal(updates.length, 2);
  assert.equal(run.result.verdict, "VERIFIED_LEGIT");
  assert.equal(run.saved.hypeScore, 0);
  assert.deepEqual(run.saved.auditSources, { initialSearch: "live", contrastSearch: "live", synthesis: "live" });
  assert.equal(run.saved.metrics.inputTokens, 120);
});

test("un modelo que inventa citas no transforma búsquedas reales en un veredicto concluyente", async () => {
  const run = await runAudit({
    linkupKey: true, nebiusKey: true,
    respond: ({ url, body }) => {
      if (url.includes("api.linkup.so")) return jsonResponse({ results: [{ ...liveEvidence, url: body.q.startsWith("Investiga") ? "https://independent.example/report" : liveEvidence.url }] });
      const { sources } = JSON.parse(body.messages.find(({ role }) => role === "user").content);
      return jsonResponse({ choices: [{ message: { content: JSON.stringify({ ...liveAssessment, evidenceAssessments: [{
        evidenceId: sources[0].evidenceId, assessment: "supports", uncertaintyLevel: "LOW", reason: "Interpretación inventada", quote: "Este contenido no existe en ninguna fuente proporcionada.",
      }] }) } }] });
    },
  });
  assertInsufficient(run);
  assert.equal(run.saved.auditSources.contrastSearch, "live");
  assert.ok(!run.mutations.some(({ name }) => name === "evidence:applyAssessments"));
});

test("un fallo de contraste preserva fuentes iniciales y termina sin conclusión", async () => {
  const run = await runAudit({ linkupKey: true, nebiusKey: true, respond: ({ url, body }) => {
    if (url.includes("api.linkup.so")) return body.q.startsWith("Investiga") ? jsonResponse({}, 429) : jsonResponse({ results: [liveEvidence] });
    return nebiusResponse({ prompt_tokens: 12, completion_tokens: 10 });
  } });
  assertInsufficient(run);
  assert.equal(run.saved.auditSources.initialSearch, "live");
  assert.equal(run.saved.auditSources.contrastSearch, "demo");
  assert.equal(run.evidence[0].url, liveEvidence.url);
  assert.ok(run.evidence.filter(({ step }) => step === "follow_up_contrast").every(({ source }) => source === "demo"));
});

test("repetir la misma URL en el contraste no cuenta como evidencia adicional", async () => {
  const run = await runAudit({ linkupKey: true, respond: () => jsonResponse({ results: [liveEvidence] }) });
  assertInsufficient(run);
  assert.equal(run.saved.auditSources.contrastSearch, "demo");
  assert.equal(run.evidence.filter(({ source }) => source === "linkup").length, 1);
});

test("metafísica queda fuera de alcance sin APIs ni fuentes ficticias", async () => {
  const { saved, evidence, calls } = await runAudit({ claimText: "Dios existe" });
  assert.equal(saved.completionReason, "out_of_scope");
  assert.equal(evidence.length, 0);
  assert.equal(calls.length, 0);
  assert.equal(saved.hypeScore, undefined);
});
test("credenciales ausentes se distinguen de evidencia insuficiente", async () => {
  const { saved } = await runAudit();
  assert.equal(saved.completionReason, "technical_failure");
  assert.equal(saved.diagnostics.length, 2);
});
