import { cosine, tokenize, type VectorIndex } from "./retrieval";

// Reference-free evaluator: splits a response into claims and scores each
// against the knowledge base using lexical coverage, embedding similarity,
// and entity/number consistency. Constants are exported so the UI can show
// exactly how scores are computed.

export const SCORING = {
  coverageWeight: 0.55,
  similarityWeight: 0.45,
  similarityScale: 0.45,
  entityPenalty: 0.22,
  maxPenalty: 0.5,
  supported: 0.52,
  weak: 0.32,
  relevanceCosineWeight: 0.7,
  relevanceCosineScale: 0.5,
  relevanceOverlapWeight: 0.3,
  qualityGroundedness: 0.45,
  qualityRelevance: 0.35,
  qualityFaithfulness: 0.2,
  confidenceSupport: 0.6,
  confidenceClaims: 0.4,
  claimsForFullConfidence: 3,
} as const;

export type ClaimStatus = "supported" | "weak" | "unsupported";

export type Claim = {
  text: string;
  support: number;
  coverage: number;
  similarity: number;
  status: ClaimStatus;
  evidence: string | null;
  unknownEntities: string[];
};

export type Evaluation = {
  relevance: number;
  groundedness: number;
  hallucinationRate: number;
  quality: number;
  confidence: number;
  claims: Claim[];
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function splitClaims(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9*"“])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
}

/** Numbers and capitalized names — the tokens hallucinations usually invent. */
function entities(sentence: string): string[] {
  const nums = sentence.match(/\d[\d,.]*(?:%|\+|x\b)?/g) ?? [];
  const caps: string[] = [];
  for (const m of sentence.matchAll(/\b[A-Z][a-zA-Z0-9.+-]{2,}\b/g)) {
    if (m.index === 0) continue; // sentence-initial capital is grammar, not an entity
    caps.push(m[0]);
  }
  return [...new Set([...nums, ...caps].map((e) => e.replace(/[.,]+$/, "")))].filter(Boolean);
}

export function evaluate(query: string, response: string, index: VectorIndex): Evaluation {
  const corpusLower = index.chunks.map((c) => `${c.title} ${c.text}`).join(" \n ").toLowerCase();
  const corpusTokens = new Set(index.chunks.flatMap((c) => c.tokens));
  const inCorpus = (e: string) => new RegExp(`(^|[^a-z0-9])${escapeRe(e.toLowerCase())}($|[^a-z0-9])`).test(corpusLower);

  const claims: Claim[] = splitClaims(response).map((text) => {
    const tokens = tokenize(text);
    const coverage = tokens.length ? tokens.filter((t) => corpusTokens.has(t)).length / tokens.length : 0;
    const vec = index.embed(tokens);
    let similarity = 0;
    let evidence: string | null = null;
    for (const c of index.chunks) {
      const s = cosine(vec, c.vector);
      if (s > similarity) {
        similarity = s;
        evidence = c.title;
      }
    }
    const unknownEntities = entities(text).filter((e) => !inCorpus(e));
    const penalty = Math.min(SCORING.maxPenalty, unknownEntities.length * SCORING.entityPenalty);
    const support = clamp(
      SCORING.coverageWeight * coverage + SCORING.similarityWeight * clamp(similarity / SCORING.similarityScale) - penalty,
    );
    const status: ClaimStatus = support >= SCORING.supported ? "supported" : support >= SCORING.weak ? "weak" : "unsupported";
    return { text, support, coverage, similarity, status, evidence, unknownEntities };
  });

  const qTokens = tokenize(query);
  const rTokens = tokenize(response);
  const overlap = qTokens.length ? qTokens.filter((t) => rTokens.includes(t)).length / qTokens.length : 0;
  const relevance = clamp(
    SCORING.relevanceCosineWeight * clamp(cosine(index.embed(qTokens), index.embed(rTokens)) / SCORING.relevanceCosineScale) +
      SCORING.relevanceOverlapWeight * overlap,
  );

  const n = claims.length || 1;
  const groundedness = claims.reduce((s, c) => s + (c.status === "supported" ? 1 : c.status === "weak" ? 0.5 : 0), 0) / n;
  const hallucinationRate = claims.filter((c) => c.status === "unsupported").length / n;
  const quality = clamp(
    SCORING.qualityGroundedness * groundedness + SCORING.qualityRelevance * relevance + SCORING.qualityFaithfulness * (1 - hallucinationRate),
  );
  const meanSupport = claims.reduce((s, c) => s + c.support, 0) / n;
  const confidence = clamp(
    SCORING.confidenceSupport * meanSupport + SCORING.confidenceClaims * Math.min(1, claims.length / SCORING.claimsForFullConfidence),
  );

  return { relevance, groundedness, hallucinationRate, quality, confidence, claims };
}
