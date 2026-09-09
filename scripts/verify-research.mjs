import { build } from "esbuild";
import { mkdtempSync, writeFileSync, readFileSync, unlinkSync, rmdirSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

if (!process.argv.includes("--live")) {
  console.error("Usa --live para comprobar Linkup/Nebius con las credenciales locales. Consume cuota de los proveedores; no modifica Convex Cloud.");
  process.exit(1);
}
try { process.loadEnvFile(".env.local"); } catch { /* Existing environment may already be configured. */ }
const claim = "El paper original Attention Is All You Need de 2017 propone una arquitectura Transformer basada en atención, sin recurrencia ni convoluciones.";
const bundle = await build({
  stdin: { contents: 'export { executeFullAudit } from "./convex/actions"; export { getFunctionName } from "convex/server";', resolveDir: fileURLToPath(new URL("../", import.meta.url)), loader: "ts" },
  bundle: true, platform: "node", format: "cjs", write: false, logLevel: "silent",
});
const directory = mkdtempSync(join(tmpdir(), "tribunal-live-check-"));
const bundlePath = join(directory, "audit.cjs");
writeFileSync(bundlePath, bundle.outputFiles[0].text);
const originalFetch = globalThis.fetch;
const providerRequests = [];
const reuseResearch = process.argv.includes("--reuse-research");
const cache = reuseResearch ? JSON.parse(readFileSync(".research-cache.local", "utf8")) : undefined;
if (cache && cache.claim !== claim) throw new Error("El cache corresponde a otra afirmación; ejecuta --live sin --reuse-research.");
const searchResponses = cache?.searchResponses ?? [];
let searchIndex = 0;
const evidence = [];
let saved;
let plan;
try {
  const { executeFullAudit, getFunctionName } = createRequire(import.meta.url)(bundlePath);
  globalThis.fetch = async (url, init) => {
    const provider = new URL(url).hostname;
    if (reuseResearch && provider === "api.linkup.so") {
      const entry = searchResponses[searchIndex++];
      if (!entry) throw new Error("Missing cached search");
      providerRequests.push({ provider, status: "replayed-local-response", latencyMs: 0 });
      return new Response(JSON.stringify(entry), { status: 200 });
    }
    const start = Date.now();
    console.log("Comprobando " + provider + "...");
    try {
      const response = await originalFetch(url, init);
      const request = { provider, status: response.status, latencyMs: Date.now() - start };
      if (response.ok) {
        try {
          const payload = await response.clone().json();
          if (provider === "api.linkup.so") searchResponses.push(payload);
          else {
            const content = payload.choices?.[0]?.message?.content;
            let parsed;
            try { parsed = JSON.parse(content); } catch { /* Metadata records malformed JSON without printing content. */ }
            request.responseMetadata = {
              finishReason: payload.choices?.[0]?.finish_reason,
              contentLength: typeof content === "string" ? content.length : 0,
              validJson: Boolean(parsed),
              verdict: typeof parsed?.verdict === "string" ? parsed.verdict : null,
              hypeScore: typeof parsed?.hypeScore === "number" ? parsed.hypeScore : null,
              summaryPresent: typeof parsed?.summary === "string",
              assessmentCount: Array.isArray(parsed?.evidenceAssessments) ? parsed.evidenceAssessments.length : 0,
              usage: payload.usage,
            };
          }
        } catch { /* Malformed provider JSON is handled by the production handler. */ }
      }
      providerRequests.push(request);
      return response;
    } catch {
      providerRequests.push({ provider, status: "transport-error-or-timeout", latencyMs: Date.now() - start });
      throw new Error("Provider request unavailable");
    }
  };
  await executeFullAudit._handler({
    runMutation: async (reference, args) => {
      switch (getFunctionName(reference)) {
        case "evidence:add": {
          const _id = "check-source-" + (evidence.length + 1);
          evidence.push({ ...args, _id });
          return _id;
        }
        case "investigations:setResearchPlan": plan = args; break;
        case "evidence:applyAssessments":
          for (const assessment of args.assessments) {
            const item = evidence.find((item) => item._id === assessment.evidenceId);
            if (item) Object.assign(item, { assessment: assessment.assessment, uncertaintyLevel: assessment.uncertaintyLevel, reason: assessment.reason });
          }
          break;
        case "investigations:saveVerdict": saved = args; break;
      }
    },
    runQuery: async () => structuredClone(evidence),
  }, { investigationId: "local-provider-check", roomId: "local-provider-check", claimText: claim });
  const report = {
    checkedAt: new Date().toISOString(),
    scope: reuseResearch ? "Real Nebius request; Linkup responses replayed from a previous live check. Convex persistence simulated in memory. Does not verify deployment or an entire live run." : "Real Linkup/Nebius requests; Convex persistence simulated in memory. Does not verify deployment, multiplayer, accuracy benchmark, Render or RevenueCat.",
    claim, model: process.env.NEBIUS_MODEL || "Qwen/Qwen3-30B-A3B-Instruct-2507", providerRequests, verdict: saved?.verdict, summary: saved?.summary,
    auditSources: saved?.auditSources, metrics: saved?.metrics,
    followUpBasedOnStoredSources: plan?.basedOnEvidenceIds.length ?? 0,
    researchGaps: plan?.gaps,
    evidence: evidence.map(({ _id, source, step, url, assessment, uncertaintyLevel, reason }) => ({ id: _id, source, step, url, assessment, uncertaintyLevel, reason })),
  };
  const reportPath = "docs/verification/research-" + (reuseResearch ? "replay-" : "live-") + report.checkedAt.slice(0, 10) + ".json";
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  if (!reuseResearch && searchResponses.length > 0) writeFileSync(".research-cache.local", JSON.stringify({ claim, searchResponses }));
  console.log(JSON.stringify({ reportPath, providerRequests, verdict: report.verdict, auditSources: report.auditSources, metrics: report.metrics, sources: evidence.filter(({ source }) => source === "linkup").length }, null, 2));
  if (!report.auditSources || Object.values(report.auditSources).some((source) => source !== "live")) process.exitCode = 1;
} finally {
  globalThis.fetch = originalFetch;
  unlinkSync(bundlePath);
  rmdirSync(directory);
}
