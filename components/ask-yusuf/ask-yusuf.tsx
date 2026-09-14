"use client";

import { useEffect, useRef, useState } from "react";
import { streamChat, type ChatMeta, type ChatTurn } from "@/lib/ai/client";
import { processQuery } from "@/lib/ai/retrieval";
import { Reset, Send } from "@/components/ui/icons";
import { RichText } from "@/components/ui/rich-text";
import { SectionHeading } from "@/components/ui/section-heading";

const SUGGESTIONS = [
  "What AI projects has Yusuf built?",
  "Which project demonstrates RAG?",
  "What technologies does Yusuf work with?",
  "Tell me about his most interesting project.",
  "What makes Yusuf different from a traditional frontend developer?",
];

type Msg = {
  id: number;
  role: "user" | "assistant";
  content: string;
  status: "streaming" | "done" | "stopped" | "error";
  meta?: ChatMeta;
  error?: string;
  query?: string;
};

type Status = { llm: boolean; model: string | null; chunks: number; dim: number; vocabulary: number };

function modeLabel(meta: ChatMeta | undefined, status: Status | null) {
  if (meta) return meta.mode === "llm" ? `Claude · ${meta.model}` : "Local grounded mode";
  if (status) return status.llm ? `Claude · ${status.model}` : "Local grounded mode";
  return "Connecting…";
}

function Orb() {
  return (
    <div aria-hidden className="relative mx-auto mb-7 hidden h-24 w-24 place-items-center sm:grid">
      <span className="absolute inset-0 rounded-full border border-line" />
      <span className="breathe absolute inset-3 rounded-full border border-accent/30" />
      <span className="absolute inset-6 rounded-full bg-accent-muted" />
      <span className="relative h-3 w-3 rounded-full bg-accent dark:shadow-[var(--glow)]" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-foreground/30"
          style={{ transform: `rotate(${i * 60}deg) translateY(-48px)` }}
        />
      ))}
    </div>
  );
}

export function AskYusuf() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickRef = useRef(true);
  const idRef = useRef(0);

  const busy = messages.some((m) => m.status === "streaming");
  const lastAnswer = [...messages].reverse().find((m) => m.role === "assistant");

  useEffect(() => {
    let alive = true;
    fetch("/api/status")
      .then((r) => r.json())
      .then((s: Status) => alive && setStatus(s))
      .catch(() => {});
    return () => {
      alive = false;
      abortRef.current?.abort();
    };
  }, []);

  // keep the message list pinned to the bottom while streaming — scrolls the list, never the page
  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current && messages.length > 0) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const update = (id: number, fn: (m: Msg) => Msg) => setMessages((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));

  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  async function ask(raw: string, base: Msg[] = messages) {
    const query = raw.trim();
    if (!query || busy) return;
    const history: ChatTurn[] = base
      .filter((m) => (m.status === "done" || m.status === "stopped") && m.content)
      .map((m) => ({ role: m.role, content: m.content }));
    const uid = ++idRef.current;
    const aid = ++idRef.current;
    setMessages([
      ...base,
      { id: uid, role: "user", content: query, status: "done" },
      { id: aid, role: "assistant", content: "", status: "streaming", query },
    ]);
    setInput("");
    requestAnimationFrame(resizeInput);
    stickRef.current = true;

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await streamChat({
        query,
        history,
        signal: ctrl.signal,
        onMeta: (meta) => update(aid, (m) => ({ ...m, meta })),
        onDelta: (text) => update(aid, (m) => ({ ...m, content: m.content + text })),
      });
      update(aid, (m) => ({ ...m, status: "done" }));
    } catch (e) {
      if (ctrl.signal.aborted) {
        update(aid, (m) => (m.content ? { ...m, status: "stopped" } : { ...m, status: "error", error: "Stopped before a response arrived." }));
      } else {
        update(aid, (m) => ({ ...m, status: "error", error: e instanceof Error ? e.message : "Something went wrong." }));
      }
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
    }
  }

  const retry = (msg: Msg) => {
    const idx = messages.findIndex((m) => m.id === msg.id);
    if (idx < 1 || !msg.query) return;
    void ask(msg.query, messages.slice(0, idx - 1));
  };

  const clear = () => {
    abortRef.current?.abort();
    setMessages([]);
    setExpanded(null);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void ask(input);
    }
  };

  const traceTerms = lastAnswer?.query ? processQuery(lastAnswer.query) : null;
  const sources = lastAnswer?.meta?.sources ?? [];
  const maxScore = Math.max(0.001, ...sources.map((s) => s.score));

  return (
    <section id="ask" className="relative border-t border-line">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(50%_60%_at_50%_0%,var(--ambient),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
        <SectionHeading index="06" eyebrow="Ask Yusuf" title="Ask Yusuf">
          Ask anything about my experience, projects, skills, and engineering work.
        </SectionHeading>

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Console */}
          <div data-reveal className="min-w-0 lg:col-span-8">
            <div className="panel beam flex h-[min(660px,82svh)] flex-col overflow-hidden">
              <div className="flex items-center gap-3 border-b border-line bg-surface/70 px-4 py-3 backdrop-blur-md sm:px-5">
                <span className="status-dot shrink-0" aria-hidden />
                <span className="font-mono text-[12px] text-foreground">yusuf.assistant</span>
                <span className="hidden min-w-0 sm:inline-flex">
                  <span className="chip truncate">{modeLabel(lastAnswer?.meta, status)}</span>
                </span>
                <span className="ml-auto hidden font-mono text-[11px] text-subtle md:inline">
                  {status ? `${status.chunks} chunks · ${status.dim}-d index` : "indexing…"}
                </span>
                <button
                  type="button"
                  onClick={clear}
                  disabled={messages.length === 0}
                  className="ml-auto grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-foreground disabled:opacity-30 md:ml-2"
                  aria-label="Clear conversation"
                >
                  <Reset />
                </button>
              </div>

              <div
                ref={listRef}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
                }}
                className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6"
                aria-live="polite"
                aria-busy={busy}
              >
                {messages.length === 0 ? (
                  <div className="flex min-h-full flex-col items-center justify-center py-4 text-center">
                    <Orb />
                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">What would you like to know?</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                      Answers are retrieved from {status ? `${status.chunks} knowledge chunks` : "the knowledge base"} built from Yusuf&apos;s real experience — no invented facts.
                    </p>
                    <div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => void ask(s)}
                          className={`spotlight group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-line bg-surface/70 px-4 py-3 text-left text-[13.5px] text-muted transition-colors hover:border-line-strong hover:text-foreground ${i === SUGGESTIONS.length - 1 ? "sm:col-span-2" : ""}`}
                        >
                          {s}
                          <span className="font-mono text-subtle transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ol className="space-y-7">
                    {messages.map((m) =>
                      m.role === "user" ? (
                        <li key={m.id} className="flex justify-end">
                          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 text-[14.5px] leading-relaxed text-background">
                            {m.content}
                          </div>
                        </li>
                      ) : (
                        <li key={m.id} className="flex gap-3">
                          <span aria-hidden className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line bg-sunken font-mono text-[11px] font-semibold">
                            Y
                          </span>
                          <div className="min-w-0 flex-1 text-[14.5px] leading-relaxed text-foreground/85">
                            {m.status === "streaming" && !m.content ? (
                              <div className="space-y-2 pt-1">
                                <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                                  {m.meta ? `Retrieved ${m.meta.sources.length} chunks · generating` : "Embedding query · searching"}
                                </div>
                                <div className="shimmer h-3 w-3/4 rounded-full bg-sunken" />
                                <div className="shimmer h-3 w-1/2 rounded-full bg-sunken" />
                              </div>
                            ) : m.status === "error" ? (
                              <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3">
                                <p className="text-danger">{m.error}</p>
                                <button type="button" onClick={() => retry(m)} disabled={busy} className="btn btn-ghost mt-3 h-9 px-4 text-[13px]">
                                  Retry
                                </button>
                              </div>
                            ) : (
                              <>
                                <RichText text={m.content} />
                                {m.status === "streaming" && <span className="caret" aria-hidden />}
                                {m.status === "stopped" && <div className="mt-2 font-mono text-[11px] text-subtle">— stopped</div>}
                              </>
                            )}

                            {m.meta && m.status !== "streaming" && m.status !== "error" && (
                              <div className="mt-4">
                                <button
                                  type="button"
                                  aria-expanded={expanded === m.id}
                                  onClick={() => setExpanded((x) => (x === m.id ? null : m.id))}
                                  className="inline-flex h-8 items-center gap-2 rounded-full border border-line px-3 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-foreground"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
                                  Grounded in {m.meta.sources.length} sources
                                  <span aria-hidden className={`transition-transform ${expanded === m.id ? "rotate-180" : ""}`}>▾</span>
                                </button>
                                {expanded === m.id && (
                                  <ul className="fade-up mt-3 flex flex-wrap gap-1.5">
                                    {m.meta.sources.map((s) => (
                                      <li key={s.id} className="chip h-7">
                                        <span className="text-foreground/80">{s.title}</span>
                                        <span className="text-accent">{s.score.toFixed(2)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      ),
                    )}
                  </ol>
                )}
              </div>

              <div className="border-t border-line bg-surface/60 p-3 sm:p-4">
                {messages.length > 0 && !busy && (
                  <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => void ask(s)} className="chip h-8 shrink-0 transition-colors hover:border-line-strong hover:text-foreground">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void ask(input);
                  }}
                  className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-1.5 pl-4 transition-colors focus-within:border-line-strong"
                >
                  <label htmlFor="ask-input" className="sr-only">Ask a question about Yusuf</label>
                  <textarea
                    id="ask-input"
                    ref={inputRef}
                    rows={1}
                    value={input}
                    maxLength={500}
                    onChange={(e) => {
                      setInput(e.target.value);
                      resizeInput();
                    }}
                    onKeyDown={onKeyDown}
                    placeholder="Ask about his projects…"
                    className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-6 text-foreground outline-none placeholder:text-subtle"
                  />
                  {busy ? (
                    <button type="button" onClick={() => abortRef.current?.abort()} className="btn btn-ghost shrink-0" style={{ width: 40, height: 40, padding: 0 }} aria-label="Stop generating">
                      <span className="h-3 w-3 rounded-[3px] bg-foreground" aria-hidden />
                    </button>
                  ) : (
                    <button type="submit" disabled={!input.trim()} className="btn btn-primary shrink-0" style={{ width: 40, height: 40, padding: 0 }} aria-label="Send question">
                      <Send />
                    </button>
                  )}
                </form>
                <div className="mt-2 flex justify-between px-1 font-mono text-[10.5px] text-subtle">
                  <span className="hidden sm:inline">Enter to send · Shift+Enter for a new line</span>
                  <span>Answers use portfolio data only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Retrieval trace */}
          <aside data-reveal style={{ "--d": "120ms" } as React.CSSProperties} className="min-w-0 lg:col-span-4" aria-label="Retrieval trace">
            <div className="panel glass h-full p-5 sm:p-6">
              <div className="eyebrow flex items-center justify-between">
                <span>Retrieval trace</span>
                <span className={busy ? "text-accent breathe" : ""}>{busy ? "live" : lastAnswer ? "last query" : "idle"}</span>
              </div>

              <ol className="mt-6 space-y-5">
                <li>
                  <div className="flex items-center gap-2 text-[13px] font-medium">
                    <span className="font-mono text-[11px] text-accent">01</span> Query terms
                  </div>
                  <div className="mt-2 flex min-h-8 flex-wrap gap-1.5">
                    {traceTerms?.terms.length ? (
                      traceTerms.terms.slice(0, 10).map((t, i) => (
                        <span key={`${t}-${i}`} className="chip h-6">{t}</span>
                      ))
                    ) : (
                      <span className="text-[13px] text-subtle">Waiting for a question</span>
                    )}
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-2 text-[13px] font-medium">
                    <span className="font-mono text-[11px] text-accent">02</span> Vector search · cosine
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {sources.length ? (
                      sources.map((s, i) => (
                        <li key={s.id} className="fade-up" style={{ "--d": `${i * 60}ms` } as React.CSSProperties}>
                          <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                            <span className="truncate text-foreground/85">{s.title}</span>
                            <span className="font-mono text-[11px] text-muted">{s.score.toFixed(3)}</span>
                          </div>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-sunken">
                            <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${(s.score / maxScore) * 100}%` }} />
                          </div>
                        </li>
                      ))
                    ) : (
                      Array.from({ length: 4 }, (_, i) => (
                        <li key={i} className="h-1 rounded-full bg-line-strong opacity-60" style={{ width: `${90 - i * 16}%` }} />
                      ))
                    )}
                  </ul>
                </li>
                <li>
                  <div className="flex items-center gap-2 text-[13px] font-medium">
                    <span className="font-mono text-[11px] text-accent">03</span> Generation
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    {lastAnswer?.meta?.mode === "llm"
                      ? "Retrieved chunks are passed to Claude with instructions to answer only from that context."
                      : "No model key is configured, so a local composer answers strictly from retrieved facts. Set ANTHROPIC_API_KEY to switch to Claude."}
                  </p>
                </li>
              </ol>

              <div className="mt-7 grid grid-cols-3 gap-2 border-t border-line pt-5 text-center">
                {[
                  [status?.chunks ?? "—", "chunks"],
                  [status?.dim ?? "—", "dims"],
                  [status?.vocabulary ?? "—", "terms"],
                ].map(([v, l]) => (
                  <div key={l as string}>
                    <div className="text-lg font-semibold tabular-nums tracking-tight">{v}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
