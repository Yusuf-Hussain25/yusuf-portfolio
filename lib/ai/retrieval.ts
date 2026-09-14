// A small, real retrieval engine that runs identically on the server and in
// the browser: tokenization → query expansion → feature-hashed embeddings →
// cosine similarity search. No external model, no network.

export const EMBEDDING_DIM = 256;

export type Chunk = {
  id: string;
  title: string;
  source: "Profile" | "Experience" | "Project" | "Skills" | "Education" | "Achievements" | "Contact";
  text: string;
};

export type IndexedChunk = Chunk & { tokens: string[]; vector: Float32Array };

export type Hit = { chunk: IndexedChunk; score: number };

export type ProcessedQuery = {
  normalized: string;
  tokens: string[];
  removed: string[];
  expansions: { from: string; to: string[] }[];
  terms: string[];
};

const STOPWORDS = new Set(
  (
    "a an the and or but of to in on for with is are was were be been being by at as it its this that these those " +
    "what which who whom whose how why when where does do did has have had can could would should will shall may might " +
    "about tell me show give his he him yusuf yusufs hussain i you your my our we they them their from into than then " +
    "there here also any some most more very just so if not no yes please list describe explain whats hes s"
  ).split(" "),
);

const EXPANSIONS: Record<string, string[]> = {
  rag: ["retrieval", "augment", "generation"],
  llm: ["language", "model"],
  agent: ["agentic", "orchestration"],
  agentic: ["agent"],
  vector: ["embedding", "pinecone"],
  embedding: ["vector"],
  voice: ["speech"],
  mobile: ["flutter"],
  automation: ["n8n", "workflow"],
  cloud: ["aws"],
  deploy: ["aws", "cicd"],
  frontend: ["react", "nextjs", "interface"],
  backend: ["nodej", "api"],
  database: ["postgresql", "mongodb", "redis"],
  job: ["experience", "role"],
  work: ["experience"],
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/next\.js/g, "nextjs")
    .replace(/node\.js/g, "nodejs")
    .replace(/react\.js/g, "react")
    .replace(/express\.js/g, "express")
    .replace(/c\+\+/g, "cpp")
    .replace(/ci\/cd/g, "cicd")
    .replace(/[’']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function stem(word: string): string {
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.length > 5 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function rawTokens(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

export function tokenize(text: string): string[] {
  return rawTokens(text)
    .filter((t) => !STOPWORDS.has(t))
    .map(stem);
}

export function processQuery(query: string): ProcessedQuery {
  const raw = rawTokens(query);
  const removed = raw.filter((t) => STOPWORDS.has(t));
  const tokens = raw.filter((t) => !STOPWORDS.has(t)).map(stem);
  const expansions: ProcessedQuery["expansions"] = [];
  const extra: string[] = [];
  for (const t of tokens) {
    const to = EXPANSIONS[t];
    if (to) {
      expansions.push({ from: t, to });
      extra.push(...to);
    }
  }
  return { normalized: normalize(query), tokens, removed, expansions, terms: [...tokens, ...extra] };
}

// FNV-1a 32-bit
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function addFeature(vec: Float32Array, feature: string, weight: number) {
  const h = hash(feature);
  const sign = (h >>> 16) & 1 ? 1 : -1;
  vec[h % EMBEDDING_DIM] += sign * weight;
}

export type VectorIndex = {
  chunks: IndexedChunk[];
  dim: number;
  vocabulary: number;
  embed: (terms: string[]) => Float32Array;
  search: (terms: string[], k?: number) => Hit[];
};

export function createIndex(chunks: Chunk[]): VectorIndex {
  const tokenized = chunks.map((c) => tokenize(`${c.title} ${c.text}`));
  const df = new Map<string, number>();
  for (const tokens of tokenized) {
    for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const n = chunks.length;
  const idf = (t: string) => Math.log(1 + n / ((df.get(t) ?? 0) + 0.5));

  const embed = (terms: string[]): Float32Array => {
    const vec = new Float32Array(EMBEDDING_DIM);
    const counts = new Map<string, number>();
    for (const t of terms) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const [t, c] of counts) {
      const w = (1 + Math.log(c)) * idf(t);
      addFeature(vec, `w:${t}`, w);
      // character trigrams give some robustness to typos and word variants
      const padded = `^${t}$`;
      for (let i = 0; i < padded.length - 2; i++) addFeature(vec, `c:${padded.slice(i, i + 3)}`, w * 0.12);
    }
    for (let i = 0; i < terms.length - 1; i++) {
      addFeature(vec, `b:${terms[i]}_${terms[i + 1]}`, 0.5 * Math.min(idf(terms[i]), idf(terms[i + 1])));
    }
    let norm = 0;
    for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < vec.length; i++) vec[i] /= norm;
    return vec;
  };

  const indexed: IndexedChunk[] = chunks.map((c, i) => ({ ...c, tokens: tokenized[i], vector: embed(tokenized[i]) }));

  const search = (terms: string[], k = 4): Hit[] => {
    if (terms.length === 0) return [];
    const q = embed(terms);
    return indexed
      .map((chunk) => ({ chunk, score: cosine(q, chunk.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  };

  return { chunks: indexed, dim: EMBEDDING_DIM, vocabulary: df.size, embed, search };
}

export function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
