export type Verdict = "CERTIFIED_SMOKE" | "PLAUSIBLE" | "VERIFIED_LEGIT" | "INSUFFICIENT_EVIDENCE";
export interface AuditSources {
  initialSearch: "live" | "demo";
  contrastSearch: "live" | "demo";
  synthesis: "live" | "demo";
}
export interface ModelAssessment {
  verdict: Verdict;
  hypeScore?: number;
  summary: string;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
}

function tokenCount(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

export function readNebiusUsage(value: unknown) {
  const usage = asRecord(asRecord(value)?.usage);
  return { inputTokens: tokenCount(usage?.prompt_tokens), outputTokens: tokenCount(usage?.completion_tokens) };
}

// Reject malformed/model-invented categories before they reach Convex validators.
export function parseNebiusResponse(value: unknown) {
  const response = asRecord(value);
  const choices = response?.choices;
  const content = Array.isArray(choices) ? asRecord(asRecord(choices[0])?.message)?.content : undefined;
  if (typeof content !== "string") return undefined;
  let parsed: Record<string, unknown> | undefined;
  try { parsed = asRecord(JSON.parse(content)); } catch { return undefined; }
  const verdicts: unknown[] = ["CERTIFIED_SMOKE", "PLAUSIBLE", "VERIFIED_LEGIT", "INSUFFICIENT_EVIDENCE"];
  if (!parsed || !verdicts.includes(parsed.verdict) || typeof parsed.summary !== "string" || !parsed.summary.trim()) return undefined;
  const insufficient = parsed.verdict === "INSUFFICIENT_EVIDENCE";
  if (!insufficient && (typeof parsed.hypeScore !== "number" || !Number.isFinite(parsed.hypeScore) || parsed.hypeScore < 0 || parsed.hypeScore > 100)) return undefined;
  const usage = asRecord(response?.usage);
  return {
    assessment: {
      verdict: parsed.verdict as Verdict,
      ...(!insufficient ? { hypeScore: parsed.hypeScore as number } : {}),
      summary: parsed.summary.trim(),
    } satisfies ModelAssessment,
    inputTokens: tokenCount(usage?.prompt_tokens),
    outputTokens: tokenCount(usage?.completion_tokens),
    evidenceAssessments: parsed.evidenceAssessments,
  };
}

export function resolveAuditOutcome(sources: AuditSources, assessment?: ModelAssessment): ModelAssessment {
  if (sources.initialSearch !== "live" || sources.contrastSearch !== "live" || sources.synthesis !== "live" || !assessment) {
    return {
      verdict: "INSUFFICIENT_EVIDENCE",
      summary: "La auditoría está incompleta: una o más etapas usan demostraciones o no obtuvieron una respuesta válida. Las tarjetas de ejemplo no son pruebas y no permiten concluir si la afirmación es cierta o exagerada.",
    };
  }
  return assessment;
}

// Deliberately narrow: historical or measurable claims involving religion remain auditable.
export function isOutsideScope(claim: string): boolean {
  const normalized = claim.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[¿?¡!.]/g, "").trim();
  return /^(dios (no )?existe|god (does not exist|exists))$/.test(normalized);
}
