/**
 * Asistente Pericial de Prompts y Claims
 * Genera reformulaciones auditables, empíricas y verificables
 * para evitar callejones sin salida ante claims ambiguos, metafísicos o sin métricas.
 */

export interface ClaimSuggestion {
  text: string;
  angle: string; // "Estudio Demográfico", "Benchmark Técnico", "Evidencia Histórica", etc.
  verifiabilityScore: number; // 0-100% de verificabilidad
  reasoning: string;
}

interface HeuristicRule {
  pattern: RegExp;
  suggestions: ClaimSuggestion[];
}

const HEURISTIC_RULES: HeuristicRule[] = [
  {
    pattern: /\b(dios|god|fe|alma|esp[ií]ritu|cielo|infierno|reencarnaci[oó]n)\b/i,
    suggestions: [
      {
        text: "El 84% de la población mundial se autoidentifica con un grupo religioso según datos demográficos consolidados de Pew Research Center.",
        angle: "Demografía y Sociología",
        verifiabilityScore: 95,
        reasoning: "Mide estadísticas censales y autoidentificación verificable en lugar de una cuestión metafísica no falsable.",
      },
      {
        text: "Investigaciones arqueológicas y análisis de carbono-14 en el Levante corroboran la existencia histórica de asentamientos y templos del siglo X a.C.",
        angle: "Arqueología e Historia",
        verifiabilityScore: 90,
        reasoning: "Sustituye la doctrina teológica por hallazgos materiales y datación científica contrastable.",
      },
      {
        text: "Estudios de neuroimagen en PubMed asocian estados de meditación y oración con cambios medibles en el lóbulo frontal y parietal.",
        angle: "Neurociencia Cognitiva",
        verifiabilityScore: 88,
        reasoning: "Plantea una hipótesis fisiológica y reproducible en laboratorio.",
      },
    ],
  },
  {
    pattern: /\b(ia|ai|llm|gpt|claude|gemini|deepseek|agente|aut[oó]nomo|agi)\b/i,
    suggestions: [
      {
        text: "En el benchmark público SWE-bench Verified, los agentes autónomos de última generación resuelven menos del 60% de los problemas de software reales de forma no supervisada.",
        angle: "Benchmark de Ingeniería (SWE-bench)",
        verifiabilityScore: 98,
        reasoning: "Transforma una promesa genérica en una medición contra un conjunto de pruebas estándar y reproducible.",
      },
      {
        text: "Modelos de frontera reportan una tasa de alucinación medible superior al 3% en recuperación fáctica según SimpleQA de OpenAI.",
        angle: "Fiabilidad y Precisión Fáctica",
        verifiabilityScore: 92,
        reasoning: "Permite contrastar datos de precisión técnica frente a publicaciones revisadas.",
      },
      {
        text: "La ley de rendimientos decrecientes y el costo computacional de pre-entrenamiento de modelos de frontera supera los $100M USD según estimaciones de Epoch AI.",
        angle: "Economía y Cómputo de IA",
        verifiabilityScore: 90,
        reasoning: "Evalúa viabilidad económica y métricas de escala publicadas por investigadores independientes.",
      },
    ],
  },
  {
    pattern: /\b(crypto|cripto|blockchain|tps|token|web3|solana|ethereum|bitcoin)\b/i,
    suggestions: [
      {
        text: "En condiciones de producción real y alta congestión, las redes de capa 1 reportan un promedio inferior a 4,000 TPS no triviales según exploradores públicos en cadena.",
        angle: "Métricas On-Chain Reales",
        verifiabilityScore: 96,
        reasoning: "Contrasta afirmaciones de marketing teórico contra transacciones efectivas registradas en ledger público.",
      },
      {
        text: "Auditorías de seguridad independientes reportan que más del 70% de las pérdidas en protocolos DeFi derivan de fallos de lógica en smart contracts y no de la capa de consenso.",
        angle: "Auditoría de Seguridad",
        verifiabilityScore: 91,
        reasoning: "Aterriza el análisis en reportes periciales de firmas de seguridad reconocidas.",
      },
    ],
  },
];

export function getHeuristicSuggestions(draft: string): ClaimSuggestion[] {
  for (const rule of HEURISTIC_RULES) {
    if (rule.pattern.test(draft)) {
      return rule.suggestions;
    }
  }

  // Sugerencias genéricas pero altamente estructuradas y verificables
  const clean = draft.trim().replace(/^["']|["']$/g, "");
  return [
    {
      text: `Publicaciones académicas o balances auditados demuestran que: "${clean}" cuenta con sustento técnico independiente.`,
      angle: "Auditoría de Fuentes Primarias",
      verifiabilityScore: 85,
      reasoning: "Enmarca la afirmación dentro de fuentes primarias auditadas.",
    },
    {
      text: `Existen benchmarks públicos y reproducibles que validan las métricas atribuidas a: "${clean}".`,
      angle: "Benchmarks y Reproducibilidad",
      verifiabilityScore: 88,
      reasoning: "Exige datos cuantitativos verificables por terceros.",
    },
    {
      text: `Reportes financieros oficiales o patentes registradas respaldan la viabilidad comercial de: "${clean}".`,
      angle: "Registros Legales y Financieros",
      verifiabilityScore: 82,
      reasoning: "Sustituye declaraciones en redes sociales por documentos regulatorios.",
    },
  ];
}

export async function generateSuggestionsWithNebius(
  apiKey: string,
  draft: string,
  modelName: string = "Qwen/Qwen3-30B-A3B-Instruct-2507"
): Promise<ClaimSuggestion[]> {
  try {
    const prompt = `Eres un auditor pericial en el 'Tribunal de la Verdad'. El usuario ingresó una afirmación o pregunta que puede ser demasiado vaga, subjetiva, publicitaria o metafísica para auditarse con fuentes web:
"${draft}"

Tu tarea: reformular esta afirmación en EXACTAMENTE 3 variantes empíricas, objetivas, verificables y falsables con datos web, estudios o benchmarks.
Devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "suggestions": [
    {
      "text": "Afirmación concreta y auditable con métrica o referencia específica",
      "angle": "Enfoque (ej: Benchmark Técnico, Registro Financiero, Estudio Demográfico)",
      "verifiabilityScore": 90,
      "reasoning": "Por qué esta versión sí puede auditarse de forma rigurosa"
    }
  ]
}`;

    const response = await fetch("https://api.studio.nebius.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return getHeuristicSuggestions(draft);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return getHeuristicSuggestions(draft);

    const parsed = JSON.parse(content);
    if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
      return parsed.suggestions.slice(0, 3).map((s: any) => ({
        text: String(s.text || "").trim(),
        angle: String(s.angle || "Enfoque Pericial"),
        verifiabilityScore: typeof s.verifiabilityScore === "number" ? Math.min(100, Math.max(0, s.verifiabilityScore)) : 85,
        reasoning: String(s.reasoning || "Formulación empírica contrastable."),
      }));
    }

    return getHeuristicSuggestions(draft);
  } catch {
    return getHeuristicSuggestions(draft);
  }
}
