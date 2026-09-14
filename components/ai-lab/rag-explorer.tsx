"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check } from "@/components/ui/icons";
import { RichText } from "@/components/ui/rich-text";
import { streamChat, type ChatMeta } from "@/lib/ai/client";
import { getIndex } from "@/lib/ai/knowledge";
import { cosine, estimateTokens, processQuery, type IndexedChunk, type ProcessedQuery } from "@/lib/ai/retrieval";
import { useReducedMotion } from "@/lib/hooks";

const PRESETS = [
  "What is Yusuf's strongest AI project?",
  "Which project demonstrates RAG?",
  "What vector databases has Yusuf worked with?",
];

const CONTEXT_BUDGET = 1024;
const TOP_K = 5;
const FINISHED = 8;

const STAGES = [
  { label: "User query", title: "User query", explain: "The raw question exactly as typed. Nothing has been interpreted yet." },
  { label: "Query processing", title: "Query processing", explain: "Normalizes the text, removes stopwords, stems terms, and expands domain synonyms — so “RAG” also reaches “retrieval augmented generation”." },
  { label: "Embedding", title: "Embedding", explain: "Terms are feature-hashed into a 256-dimension vector — IDF-weighted, with bigrams and character trigrams for typo tolerance — then L2-normalized." },
  { label: "Vector search", title: "Vector search", explain: "Converts the query into an embedding and retrieves the most relevant knowledge from the vector store — cosine similarity against every chunk." },
  { label: "Relevant chunks", title: "Relevant chunks", explain: "The top-k chunks by similarity. These are the only facts the generator is allowed to use." },
  { label: "Context", title: "Context window", explain: "Retrieved chunks are numbered and assembled into a context block, sized against a token budget before anything reaches the model." },
  { label: "LLM", title: "Generation", explain: "Question + context go to the generator: Claude when an API key is configured, otherwise a local composer that only restates retrieved facts." },
  { label: "Answer", title: "Answer", explain: "Tokens stream back as they're produced, grounded in the retrieved context." },
];

type Scored = { chunk: IndexedChunk; score: number };

type Trace = {
  query: string;
  pq: ProcessedQuery;
  vector: Float32Array;
  scored: Scored[];
  hits: Scored[];
  context: string;
  contextTokens: number;
  searchMs: number;
};

type Status = "pending" | "running" | "done";

export function RagExplorer() {
  const reduced = useReducedMotion();
  const chunkCount = useMemo(() => getIndex().chunks.length, []);
  const [query, setQuery] = useState(PRESETS[0]);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [stage, setStage] = useState(-1);
  const [selected, setSelected] = useState(3);
  const [answer, setAnswer] = useState("");
  const [meta, setMeta] = useState<ChatMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bag = useRef({ timers: [] as number[], abort: null as AbortController | null, follow: true });

  useEffect(() => {
    const b = bag.current;
    return () => {
      b.timers.forEach(clearTimeout);
      b.abort?.abort();
    };
  }, []);

  const running = stage >= 0 && stage < FINISHED;

  const status = (i: number): Status => {
    if (stage < 0) return "pending";
    if (i < stage || stage >= FINISHED) return "done";
    return i === stage ? "running" : "pending";
  };

  const advance = (s: number) => {
    setStage(s);
    if (bag.current.follow) setSelected(Math.min(s, STAGES.length - 1));
  };

  const generate = (text: string) => {
    const controller = new AbortController();
    bag.current.abort = controller;
    let first = true;
    streamChat({
      query: text,
      signal: controller.signal,
      onMeta: setMeta,
      onDelta: (t) => {
        if (first) {
          first = false;
          advance(7);
        }
        setAnswer((a) => a + t);
      },
    })
      .then(() => {
        if (!controller.signal.aborted) setStage(FINISHED);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Generation failed.");
        setStage(FINISHED);
        if (bag.current.follow) setSelected(7);
      });
  };

  const run = (value = query) => {
    const text = value.trim();
    if (!text) return;
    const b = bag.current;
    b.timers.forEach(clearTimeout);
    b.timers = [];
    b.abort?.abort();
    b.follow = true;

    const index = getIndex();
    const pq = processQuery(text);
    const t0 = performance.now();
    const vector = index.embed(pq.terms);
    const scored = index.chunks
      .map((chunk) => ({ chunk, score: pq.terms.length ? cosine(vector, chunk.vector) : 0 }))
      .sort((a, b2) => b2.score - a.score);
    const searchMs = performance.now() - t0;
    const hits = scored.slice(0, TOP_K);
    const context = hits.map((h, i) => `[${i + 1}] ${h.chunk.title}: ${h.chunk.text}`).join("\n");

    setQuery(text);
    setTrace({ query: text, pq, vector, scored, hits, context, contextTokens: estimateTokens(context), searchMs });
    setAnswer("");
    setMeta(null);
    setError(null);
    advance(0);

    const step = reduced ? 120 : 460;
    for (let s = 1; s <= 6; s++) {
      b.timers.push(
        window.setTimeout(() => {
          advance(s);
          if (s === 6) generate(text);
        }, step * s),
      );
    }
  };

  const stageMeta = (i: number): string => {
    if (!trace) return "";
    switch (i) {
      case 0: return `${estimateTokens(trace.query)} tok`;
      case 1: return `${trace.pq.terms.length} terms`;
      case 2: return "256-d";
      case 3: return `${chunkCount} scored`;
      case 4: return `top ${trace.hits.length}`;
      case 5: return `${trace.contextTokens} tok`;
      case 6: return meta ? (meta.mode === "llm" ? "Claude" : "Local") : "";
      case 7: return answer ? `${estimateTokens(answer)} tok` : "";
      default: return "";
    }
  };

  const progress = stage < 0 ? 0 : Math.min(1, stage / (STAGES.length - 1));
  const sel = STAGES[selected];
  const selStatus = status(selected);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* Controls + pipeline */}
      <aside className="border-b border-line p-5 md:p-7 lg:border-b-0 lg:border-r">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <label htmlFor="rag-query" className="eyebrow">
            Query
          </label>
          <div className="mt-3 flex gap-2">
            <input
              id="rag-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={200}
              placeholder="Ask about Yusuf's work…"
              className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-background px-3.5 text-[14px] text-foreground placeholder:text-subtle transition-colors focus:border-line-strong"
            />
            <button type="submit" className="btn btn-primary h-11 shrink-0 px-4" disabled={!query.trim()}>
              {running ? "Rerun" : "Run"}
              <ArrowRight />
            </button>
          </div>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => run(p)}
              className="min-h-9 rounded-full border border-line bg-surface px-3 py-1.5 text-left text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <span className="eyebrow">Pipeline</span>
          <span className="font-mono text-[11px] text-subtle">
            {stage < 0 ? "idle" : stage >= FINISHED ? "complete" : `stage ${String(stage + 1).padStart(2, "0")}/08`}
          </span>
        </div>

        <div className="relative mt-3">
          <span aria-hidden className="absolute bottom-6 left-[24px] top-6 hidden w-px bg-line lg:block">
            <span
              className="lab-glow absolute inset-x-0 top-0 bg-accent transition-[height] duration-500 ease-out"
              style={{ height: `${progress * 100}%` }}
            />
          </span>
          <ol className="grid grid-cols-2 gap-1 lg:grid-cols-1 lg:gap-0.5">
            {STAGES.map((s, i) => {
              const st = status(i);
              const isSel = selected === i;
              return (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => {
                      bag.current.follow = false;
                      setSelected(i);
                    }}
                    aria-current={isSel ? "step" : undefined}
                    className={`relative flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition-colors duration-300 ${
                      isSel ? "bg-sunken" : "hover:bg-sunken/60"
                    }`}
                  >
                    <span
                      className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[10px] transition-all duration-300 ${
                        st === "done"
                          ? "border-accent bg-accent text-accent-contrast"
                          : st === "running"
                            ? "lab-glow border-accent bg-surface text-accent"
                            : "border-line-strong bg-surface text-subtle"
                      }`}
                    >
                      {st === "done" ? <Check className="h-3.5 w-3.5 text-accent-contrast" strokeWidth={2.4} /> : String(i + 1).padStart(2, "0")}
                      {st === "running" && <span aria-hidden className="breathe absolute -inset-1 rounded-full border border-accent/40" />}
                    </span>
                    <span
                      className={`min-w-0 flex-1 truncate font-mono text-[10.5px] uppercase tracking-[0.1em] sm:text-[11px] ${
                        st === "pending" ? "text-subtle" : "text-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                    <span className="hidden font-mono text-[10.5px] text-subtle lg:inline">
                      {st === "done" ? stageMeta(i) : st === "running" ? "···" : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      {/* Inspector */}
      <div className="min-w-0 p-5 md:p-8">
        <div key={selected} className="lab-fade">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="eyebrow">
              Stage <span className="text-accent">{String(selected + 1).padStart(2, "0")}</span> / 08
            </span>
            <StatusBadge status={trace ? selStatus : "pending"} idle={!trace} />
          </div>
          <h3 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.75rem)] leading-none">{sel.title}</h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted text-pretty">{sel.explain}</p>

          <div className="mt-7">
            {!trace ? (
              <EmptyState chunkCount={chunkCount} onRun={() => run()} />
            ) : selStatus === "pending" ? (
              <div className="shimmer rounded-2xl border border-dashed border-line-strong px-5 py-10 text-center font-mono text-[12px] text-subtle">
                Waiting for upstream stages…
              </div>
            ) : (
              <StageData
                index={selected}
                trace={trace}
                chunkCount={chunkCount}
                answer={answer}
                meta={meta}
                error={error}
                streaming={stage === 7 || (stage === 6 && selected === 7)}
                generating={stage === 6}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, idle }: { status: Status; idle?: boolean }) {
  const cls =
    status === "done"
      ? "border-success/30 bg-success/10 text-success"
      : status === "running"
        ? "border-accent/30 bg-accent-muted text-accent"
        : "border-line text-subtle";
  return (
    <span className={`inline-flex h-7 items-center gap-2 rounded-full border px-3 font-mono text-[10.5px] uppercase tracking-[0.12em] ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${status === "running" ? "breathe" : ""}`} aria-hidden />
      {idle ? "Not run" : status}
    </span>
  );
}

function EmptyState({ chunkCount, onRun }: { chunkCount: number; onRun: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-sunken/50 p-6 md:p-8">
      <div aria-hidden className="bg-grid absolute inset-0 opacity-60" />
      <div className="relative">
        <div className="grid grid-cols-3 gap-3 font-mono">
          {[
            [String(chunkCount), "chunks indexed"],
            ["256", "vector dims"],
            [String(TOP_K), "top-k"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-xl border border-line bg-surface p-3 md:p-4">
              <div className="text-2xl text-foreground md:text-3xl">{v}</div>
              <div className="mt-1 text-[10.5px] uppercase tracking-[0.1em] text-subtle">{l}</div>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-muted">
          Run a query to trace it through the pipeline. Every number you&apos;ll see — terms, vector components, similarity
          scores, token counts — is computed live from the portfolio&apos;s knowledge base.
        </p>
        <button type="button" onClick={onRun} className="btn btn-ghost mt-5">
          Trace the first query <ArrowRight />
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-line py-4 first:border-t-0 first:pt-0 md:grid-cols-[150px_minmax(0,1fr)] md:gap-6">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle md:pt-1">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ModeBadge({ meta }: { meta: ChatMeta | null }) {
  if (!meta) return <span className="chip shimmer">connecting…</span>;
  return (
    <span className="chip border-accent/30 text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
      {meta.mode === "llm" ? `Claude · ${meta.model}` : "Local grounded composer"}
    </span>
  );
}

function StageData({
  index,
  trace,
  chunkCount,
  answer,
  meta,
  error,
  streaming,
  generating,
}: {
  index: number;
  trace: Trace;
  chunkCount: number;
  answer: string;
  meta: ChatMeta | null;
  error: string | null;
  streaming: boolean;
  generating: boolean;
}) {
  const maxScore = Math.max(trace.scored[0]?.score ?? 0, 1e-6);

  switch (index) {
    case 0:
      return (
        <div className="rounded-2xl border border-line bg-sunken/50 p-6">
          <p className="text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug tracking-tight text-foreground">“{trace.query}”</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip">{trace.query.length} chars</span>
            <span className="chip">≈ {estimateTokens(trace.query)} tokens</span>
            <span className="chip">{trace.query.split(/\s+/).length} words</span>
          </div>
        </div>
      );

    case 1:
      return (
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
          <Field label="Normalized">
            <code className="block break-words rounded-lg bg-sunken px-3 py-2 font-mono text-[12.5px] text-foreground">{trace.pq.normalized}</code>
          </Field>
          <Field label="Stopwords">
            <div className="flex flex-wrap gap-1.5">
              {trace.pq.removed.length ? (
                trace.pq.removed.map((t, i) => (
                  <span key={i} className="chip text-subtle line-through decoration-danger/60">{t}</span>
                ))
              ) : (
                <span className="text-[13px] text-subtle">none</span>
              )}
            </div>
          </Field>
          <Field label="Terms (stemmed)">
            <div className="flex flex-wrap gap-1.5">
              {trace.pq.tokens.map((t, i) => (
                <span key={i} className="chip border-accent/30 bg-accent-muted text-accent">{t}</span>
              ))}
            </div>
          </Field>
          <Field label="Expansions">
            {trace.pq.expansions.length ? (
              <ul className="space-y-1.5 font-mono text-[12.5px]">
                {trace.pq.expansions.map((x) => (
                  <li key={x.from} className="text-muted">
                    <span className="text-foreground">{x.from}</span> <span className="text-subtle">→</span> {x.to.join(", ")}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-[13px] text-subtle">No domain synonyms matched.</span>
            )}
          </Field>
        </div>
      );

    case 2: {
      const dims = Array.from(trace.vector);
      const max = Math.max(...dims.map((v) => Math.abs(v)), 1e-6);
      const active = dims.map((v, i) => ({ v, i })).filter((d) => Math.abs(d.v) > 1e-6);
      const nonZero = active.length;
      const norm = Math.sqrt(dims.reduce((s, v) => s + v * v, 0));
      return (
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
          <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">
            <span>d0 — d255 · full vector</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent" />+</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-foreground/35" />−</span>
            </span>
          </div>
          <div className="relative mt-4 flex h-44 items-stretch gap-px rounded-xl bg-sunken/60 px-2" role="img" aria-label="All 256 embedding dimensions">
            <span aria-hidden className="absolute inset-x-2 top-1/2 h-px bg-line" />
            {dims.map((v, i) => (
              <span key={i} className="relative flex-1" title={`d${i}: ${v.toFixed(4)}`}>
                {Math.abs(v) > 1e-6 && (
                  <span
                    className={`absolute inset-x-0 min-h-[2px] rounded-[1px] transition-[height] duration-700 ${v >= 0 ? "bottom-1/2 bg-accent" : "top-1/2 bg-foreground/40"}`}
                    style={{ height: `${Math.sqrt(Math.abs(v) / max) * 46}%` }}
                  />
                )}
              </span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 font-mono md:grid-cols-4">
            {[
              ["256", "dimensions"],
              [String(nonZero), "non-zero"],
              [norm.toFixed(3), "L2 norm"],
              [String(trace.pq.terms.length), "input terms"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-line p-3">
                <div className="text-lg text-foreground">{v}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-subtle">{l}</div>
              </div>
            ))}
          </div>
          <code className="mt-4 block overflow-x-auto whitespace-nowrap font-mono text-[11px] text-subtle">
            {"{ "}
            {active
              .sort((a, b) => Math.abs(b.v) - Math.abs(a.v))
              .slice(0, 6)
              .map((d) => `d${d.i}: ${d.v.toFixed(3)}`)
              .join(", ")}
            {nonZero > 6 ? ", … }" : " }"}
          </code>
        </div>
      );
    }

    case 3:
      return (
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13px] text-muted">
              Scored <span className="text-foreground">{chunkCount}</span> chunks in{" "}
              <span className="font-mono text-foreground">{trace.searchMs < 0.1 ? "< 0.1" : trace.searchMs.toFixed(2)} ms</span>
            </span>
            <span className="chip">cosine similarity</span>
          </div>
          <div className="mt-4 flex h-16 items-end gap-[3px] rounded-xl bg-sunken/60 p-2" role="img" aria-label="Similarity distribution across all chunks">
            {trace.scored.map((s, i) => (
              <span
                key={s.chunk.id}
                title={`${s.chunk.title}: ${s.score.toFixed(3)}`}
                className={`flex-1 rounded-t-[2px] ${i < TOP_K ? "bg-accent" : "bg-line-strong"}`}
                style={{ height: `${Math.max(4, (Math.max(0, s.score) / maxScore) * 100)}%` }}
              />
            ))}
          </div>
          <ol className="mt-5 space-y-2.5">
            {trace.scored.slice(0, 8).map((s, i) => (
              <li key={s.chunk.id} className="grid grid-cols-[1.75rem_minmax(0,1fr)_3.5rem] items-center gap-3">
                <span className={`font-mono text-[11px] ${i < TOP_K ? "text-accent" : "text-subtle"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className={`block truncate text-[13px] ${i < TOP_K ? "text-foreground" : "text-subtle"}`}>{s.chunk.title}</span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-sunken">
                    <span
                      className={`block h-full rounded-full transition-[width] duration-700 ${i < TOP_K ? "bg-accent" : "bg-line-strong"}`}
                      style={{ width: `${(Math.max(0, s.score) / maxScore) * 100}%` }}
                    />
                  </span>
                </span>
                <span className="text-right font-mono text-[12px] text-muted">{s.score.toFixed(3)}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case 4:
      return (
        <div className="grid gap-3">
          {trace.hits.map((h, i) => (
            <article key={h.chunk.id} className="spotlight rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong md:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-accent">[{i + 1}]</span>
                <span className="chip">{h.chunk.source}</span>
                <span className="ml-auto font-mono text-[12px] text-muted">score {h.score.toFixed(3)}</span>
              </div>
              <h4 className="mt-2.5 text-[15px] font-medium text-foreground">{h.chunk.title}</h4>
              <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-relaxed text-muted">{h.chunk.text}</p>
            </article>
          ))}
        </div>
      );

    case 5: {
      const pct = Math.min(100, (trace.contextTokens / CONTEXT_BUDGET) * 100);
      return (
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="uppercase tracking-[0.12em] text-subtle">Token budget</span>
            <span className="text-muted">
              <span className="text-foreground">{trace.contextTokens}</span> / {CONTEXT_BUDGET.toLocaleString()} tokens
            </span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-sunken">
            <div className="lab-glow h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
          <pre className="mt-5 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-sunken/60 p-4 font-mono text-[11.5px] leading-relaxed text-muted">
            <span className="text-subtle">{"<context>\n"}</span>
            {trace.context}
            <span className="text-subtle">{"\n</context>\n<question>"}</span>
            {trace.query}
            <span className="text-subtle">{"</question>"}</span>
          </pre>
        </div>
      );
    }

    case 6:
      return (
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
          <Field label="Generator">
            <ModeBadge meta={meta} />
          </Field>
          <Field label="Receives">
            <ul className="space-y-1.5 text-[13.5px] text-muted">
              <li>System rules — answer only from context, never invent facts</li>
              <li>Context — {trace.hits.length} retrieved chunks, ≈ {trace.contextTokens} tokens</li>
              <li>The question</li>
            </ul>
          </Field>
          <Field label="Transport">
            <p className="text-[13.5px] text-muted">
              <code className="font-mono text-foreground">POST /api/chat</code> re-runs this retrieval server-side and streams NDJSON events back.
            </p>
          </Field>
          {generating && (
            <div className="shimmer mt-2 rounded-xl border border-dashed border-line-strong px-4 py-3 font-mono text-[12px] text-subtle">
              Waiting for first token…
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="beam rounded-2xl border border-line bg-surface p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ModeBadge meta={meta} />
            <span className="font-mono text-[11px] text-subtle">≈ {estimateTokens(answer)} tokens</span>
          </div>
          <div className={`rag-answer mt-4 text-[15px] leading-relaxed text-muted ${streaming ? "is-streaming" : ""}`}>
            {error ? <p className="text-danger">{error}</p> : answer ? <RichText text={answer} /> : <span className="text-subtle">Streaming…</span>}
          </div>
        </div>
      );
  }
}
