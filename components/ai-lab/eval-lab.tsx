"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Reset } from "@/components/ui/icons";
import { evaluate, SCORING, type Claim, type ClaimStatus, type Evaluation } from "@/lib/ai/evaluate";
import { getIndex } from "@/lib/ai/knowledge";
import { useReducedMotion } from "@/lib/hooks";
import { evalScenarios, type EvalResponse } from "./eval-scenarios";

type Side = "a" | "b";
type Pair = Record<Side, string>;

const CARD = "rounded-2xl border border-line bg-surface shadow-[var(--shadow-panel)]";
const pct = (v: number) => `${Math.round(v * 100)}%`;
const tone = (v: number, invert = false) => {
  const s = invert ? 1 - v : v;
  return s >= 0.75 ? "text-success" : s >= 0.5 ? "text-warning" : "text-danger";
};

const STATUS: Record<ClaimStatus, { label: string; dot: string; mark: string }> = {
  supported: {
    label: "Supported",
    dot: "bg-success",
    mark: "decoration-success/70 bg-success/[0.04] hover:bg-success/10 data-[active=true]:bg-success/12",
  },
  weak: {
    label: "Weak support",
    dot: "bg-warning",
    mark: "decoration-warning/80 bg-warning/[0.05] hover:bg-warning/12 data-[active=true]:bg-warning/15",
  },
  unsupported: {
    label: "Unsupported",
    dot: "bg-danger",
    mark: "decoration-danger/80 bg-danger/[0.08] hover:bg-danger/15 data-[active=true]:bg-danger/18",
  },
};

function segment(text: string, claims: Claim[]) {
  const out: { text: string; claim?: number }[] = [];
  let cursor = 0;
  claims.forEach((c, i) => {
    const at = text.indexOf(c.text, cursor);
    if (at < 0) return;
    if (at > cursor) out.push({ text: text.slice(cursor, at) });
    out.push({ text: c.text, claim: i });
    cursor = at + c.text.length;
  });
  if (cursor < text.length) out.push({ text: text.slice(cursor) });
  return out;
}

/** Counts up toward `value` (0–1) as a whole percentage; instant under reduced motion. */
function AnimatedPercent({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = from.current;
    from.current = value;
    if (reduced || Math.abs(start - value) < 0.005) {
      el.textContent = String(Math.round(value * 100));
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round((start + (value - start) * eased) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  return <span ref={ref} />;
}

function MetricRow({
  label,
  value,
  invert = false,
  display,
  note,
  mounted,
}: {
  label: string;
  value: number;
  invert?: boolean;
  display?: string;
  note?: string;
  mounted: boolean;
}) {
  const color = tone(value, invert);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-2">
      <div className="flex min-w-0 items-baseline gap-2 text-[13px] text-foreground">
        <span className="truncate">{label}</span>
        {note && <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">{note}</span>}
      </div>
      <div className={`font-mono text-[13px] tabular-nums ${color}`}>
        {display ?? (
          <>
            <AnimatedPercent value={value} />%
          </>
        )}
      </div>
      <div className="col-span-2 h-1 overflow-hidden rounded-full bg-sunken">
        <div
          className={`h-full rounded-full bg-current transition-[width] duration-700 ease-out dark:shadow-[0_0_10px_0_currentColor] ${color}`}
          style={{ width: `${(mounted ? Math.min(1, value) : 0) * 100}%` }}
        />
      </div>
    </div>
  );
}

function ClaimText({ text, evaluation, active, onActive }: { text: string; evaluation: Evaluation; active: number | null; onActive: (i: number) => void }) {
  const segs = segment(text, evaluation.claims);
  return (
    <p className="text-[15px] leading-[1.9] text-foreground">
      {segs.map((s, i) => {
        if (s.claim === undefined) return <span key={i}>{s.text}</span>;
        const claim = evaluation.claims[s.claim];
        const idx = s.claim;
        return (
          <mark
            key={i}
            role="button"
            tabIndex={0}
            data-active={active === idx}
            aria-label={`${STATUS[claim.status].label} claim, ${pct(claim.support)} support: ${claim.text}`}
            onMouseEnter={() => onActive(idx)}
            onFocus={() => onActive(idx)}
            onClick={() => onActive(idx)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onActive(idx);
              }
            }}
            className={`cursor-help rounded-[4px] px-0.5 text-inherit underline decoration-2 underline-offset-[5px] outline-none transition-colors [box-decoration-break:clone] focus-visible:ring-2 focus-visible:ring-accent ${STATUS[claim.status].mark}`}
          >
            {s.text}
          </mark>
        );
      })}
    </p>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-subtle">
      {k}
      <span className="truncate text-foreground">{v}</span>
    </span>
  );
}

function Inspector({ claim }: { claim: Claim | null }) {
  if (!claim) {
    return <p className="font-mono text-[11.5px] leading-6 text-subtle">Hover, focus, or tap an underlined claim to inspect its evidence.</p>;
  }
  const s = STATUS[claim.status];
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-live="polite">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sunken/60 px-2.5 py-1 text-[12px] font-medium text-foreground">
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
      <Stat k="support" v={pct(claim.support)} />
      <Stat k="coverage" v={pct(claim.coverage)} />
      <Stat k="similarity" v={claim.similarity.toFixed(2)} />
      <Stat k="evidence" v={claim.evidence ?? "none"} />
      {claim.unknownEntities.map((e) => (
        <span key={e} className="inline-flex items-center rounded-full border border-danger/30 bg-danger/10 px-2.5 py-1 font-mono text-[11px] text-danger">
          not in KB: {e}
        </span>
      ))}
    </div>
  );
}

function ModelCard({
  side,
  meta,
  committed,
  draft,
  editing,
  dirty,
  evaluation,
  mounted,
  onToggleEdit,
  onChange,
  onReset,
}: {
  side: Side;
  meta: EvalResponse;
  committed: string;
  draft: string;
  editing: boolean;
  dirty: boolean;
  evaluation: Evaluation;
  mounted: boolean;
  onToggleEdit: () => void;
  onChange: (v: string) => void;
  onReset: () => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const synthetic = side === "b";
  const counts = { supported: 0, weak: 0, unsupported: 0 };
  evaluation.claims.forEach((c) => counts[c.status]++);
  const activeClaim = active !== null ? evaluation.claims[active] ?? null : null;

  return (
    <article className={`${CARD} flex min-w-0 flex-col overflow-hidden`} aria-label={meta.name}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-[13px] font-semibold ${synthetic ? "bg-warning/12 text-warning" : "bg-accent-muted text-accent dark:shadow-[var(--glow)]"}`}
          >
            {side.toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-foreground">{meta.name}</div>
            <div className="truncate font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle">
              {synthetic ? "Synthetic · ungrounded" : "Grounded · knowledge base"}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {dirty && (
            <button
              type="button"
              onClick={onReset}
              className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-foreground"
              aria-label={`Reset ${meta.name} response`}
            >
              <Reset width={14} height={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleEdit}
            aria-pressed={editing}
            className={`h-8 rounded-full border px-3 font-mono text-[11.5px] transition-colors ${editing ? "border-accent/40 bg-accent-muted text-foreground" : "border-line text-muted hover:border-line-strong hover:text-foreground"}`}
          >
            {editing ? "Done" : "Edit response"}
          </button>
        </div>
      </header>

      {synthetic && (
        <div role="note" className="mx-4 mt-4 flex gap-2.5 rounded-xl border border-dashed border-warning/50 bg-warning/[0.06] px-3.5 py-2.5 text-[12.5px] leading-snug text-warning md:mx-5">
          <span aria-hidden className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
          Synthetic response — intentionally contains fabricated claims to demonstrate hallucination detection. Not a claim about Yusuf.
        </div>
      )}

      <div className="px-4 pt-4 md:px-5">
        {editing ? (
          <>
            <textarea
              value={draft}
              onChange={(e) => onChange(e.target.value)}
              rows={5}
              aria-label={`${meta.name} response`}
              className="w-full resize-y rounded-xl border border-line bg-sunken/60 p-3.5 text-[14.5px] leading-relaxed text-foreground outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
            />
            <p className="mt-1.5 font-mono text-[11px] text-subtle">Re-evaluates as you type — try inventing a metric or a company.</p>
          </>
        ) : (
          <ClaimText text={committed} evaluation={evaluation} active={active} onActive={setActive} />
        )}
        <div className="mt-3 min-h-[44px] border-t border-line py-3">
          <Inspector claim={editing ? null : activeClaim} />
        </div>
      </div>

      <div className="mt-auto border-t border-line px-4 py-4 md:px-5">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-subtle">
          <span>{evaluation.claims.length} claims</span>
          {(Object.keys(counts) as ClaimStatus[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${STATUS[k].dot}`} />
              {counts[k]} {k}
            </span>
          ))}
        </div>
        <div className="divide-y divide-line">
          <MetricRow mounted={mounted} label="Response quality" value={evaluation.quality} />
          <MetricRow mounted={mounted} label="Groundedness" value={evaluation.groundedness} />
          <MetricRow mounted={mounted} label="Relevance" value={evaluation.relevance} />
          <MetricRow mounted={mounted} label="Hallucination rate" value={evaluation.hallucinationRate} invert />
          <MetricRow mounted={mounted} label="Confidence" value={evaluation.confidence} />
          <MetricRow
            mounted={mounted}
            label="Latency"
            note="simulated"
            value={Math.min(1, meta.latencyMs / 4000)}
            invert
            display={`${(meta.latencyMs / 1000).toFixed(2)}s`}
          />
        </div>
      </div>
    </article>
  );
}

function Verdict({ a, b, la, lb }: { a: Evaluation; b: Evaluation; la: number; lb: number }) {
  const leader: "A" | "B" = a.quality >= b.quality ? "A" : "B";
  const lead = leader === "A" ? a : b;
  const trail = leader === "A" ? b : a;
  const gDiff = Math.round((a.groundedness - b.groundedness) * 100);
  const unsupported = (e: Evaluation) => e.claims.filter((c) => c.status === "unsupported").length;
  const faster: "A" | "B" = la <= lb ? "A" : "B";
  const fasterUnsupported = unsupported(faster === "A" ? a : b);
  const speed = (Math.abs(la - lb) / 1000).toFixed(2);

  const items = [
    { k: "Quality", v: `Model ${leader} leads ${Math.round(lead.quality * 100)} vs ${Math.round(trail.quality * 100)}` },
    { k: "Grounding", v: gDiff === 0 ? "Both equally grounded" : `Model ${gDiff > 0 ? "A" : "B"} is +${Math.abs(gDiff)} pts more grounded` },
    {
      k: "Latency",
      v: `Model ${faster} is ${speed}s faster${fasterUnsupported ? ` but has ${fasterUnsupported} unsupported claim${fasterUnsupported > 1 ? "s" : ""}` : ""}`,
    },
  ];
  const reason =
    faster !== leader && fasterUnsupported > 0
      ? "Speed doesn't compensate for hallucinated claims."
      : "Best balance of grounding and relevance.";

  return (
    <section aria-label="Verdict" className={`${CARD} beam grid gap-5 p-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] md:items-center md:p-6`}>
      <div>
        <div className="eyebrow">Verdict</div>
        <p className="display mt-3 text-[clamp(1.75rem,3.2vw,2.5rem)] leading-none text-foreground">
          Ship Model <span className="text-accent">{leader}</span>
        </p>
        <p className="mt-2 text-[13.5px] text-muted">{reason}</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {items.map((it) => (
          <li key={it.k} className="rounded-xl border border-line bg-sunken/50 px-3.5 py-3">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-subtle">{it.k}</div>
            <div className="mt-1.5 text-[13.5px] leading-snug text-foreground">{it.v}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const EXPLAINERS = [
  {
    title: "Relevance",
    body: "Does the answer address the question? Measured as similarity between the query and response embeddings, plus query-term overlap.",
    art: (
      <svg viewBox="0 0 160 64" className="h-16 w-full" fill="none" aria-hidden>
        <line x1="24" y1="54" x2="146" y2="54" className="stroke-line-strong" />
        <line x1="24" y1="54" x2="138" y2="24" className="stroke-accent" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="54" x2="118" y2="8" className="stroke-foreground/50" strokeWidth="2" strokeLinecap="round" />
        <path d="M66 43.5 A 44 44 0 0 0 61 34" className="stroke-subtle" />
        <text x="142" y="22" className="fill-accent font-mono text-[9px]">query</text>
        <text x="122" y="10" className="fill-subtle font-mono text-[9px]">answer</text>
      </svg>
    ),
  },
  {
    title: "Grounding",
    body: "Is every claim backed by the knowledge base? Each sentence is matched against retrieved evidence chunks.",
    art: (
      <svg viewBox="0 0 160 64" className="h-16 w-full" fill="none" aria-hidden>
        {[8, 27, 46].map((y) => (
          <rect key={y} x="10" y={y} width="58" height="10" rx="3" className="fill-sunken stroke-line-strong" />
        ))}
        <rect x="108" y="6" width="44" height="52" rx="5" className="fill-surface stroke-line-strong" />
        {[16, 24, 32, 40, 48].map((y) => (
          <line key={y} x1="116" y1={y} x2={y % 16 === 0 ? 136 : 144} y2={y} className="stroke-line-strong" />
        ))}
        {[13, 32, 51].map((y, i) => (
          <path key={y} d={`M68 ${y} C 88 ${y}, 88 ${18 + i * 14}, 108 ${18 + i * 14}`} className="stroke-success" strokeWidth="1.5" />
        ))}
      </svg>
    ),
  },
  {
    title: "Hallucination",
    body: "Claims with no support — invented names, numbers, or facts that don't exist anywhere in the evidence.",
    art: (
      <svg viewBox="0 0 160 64" className="h-16 w-full" fill="none" aria-hidden>
        <rect x="10" y="10" width="58" height="10" rx="3" className="fill-sunken stroke-line-strong" />
        <rect x="10" y="36" width="72" height="14" rx="4" className="fill-danger/10 stroke-danger" strokeDasharray="3 3" />
        <path d="M68 15 C 88 15, 88 20, 108 20" className="stroke-success" strokeWidth="1.5" />
        <rect x="108" y="6" width="44" height="52" rx="5" className="fill-surface stroke-line-strong" />
        <path d="M90 38 l8 8 M98 38 l-8 8" className="stroke-danger" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Latency",
    body: "Time to answer. Faster only matters if the answer is right — a quick hallucination is still a wrong answer.",
    art: (
      <svg viewBox="0 0 160 64" className="h-16 w-full" fill="none" aria-hidden>
        {[10, 50, 90, 130].map((x) => (
          <line key={x} x1={x} y1="8" x2={x} y2="58" className="stroke-line" />
        ))}
        <rect x="10" y="16" width="112" height="10" rx="5" className="fill-accent/80" />
        <rect x="10" y="38" width="68" height="10" rx="5" className="fill-warning/80" />
        <text x="126" y="25" className="fill-subtle font-mono text-[9px]">A</text>
        <text x="82" y="47" className="fill-subtle font-mono text-[9px]">B</text>
      </svg>
    ),
  },
];

const f = (n: number) => String(n);
const FORMULAS: [string, string][] = [
  ["claim support", `${f(SCORING.coverageWeight)}·coverage + ${f(SCORING.similarityWeight)}·min(1, similarity ÷ ${f(SCORING.similarityScale)}) − min(${f(SCORING.maxPenalty)}, ${f(SCORING.entityPenalty)}·unknown entities)`],
  ["claim status", `supported ≥ ${f(SCORING.supported)} · weak ≥ ${f(SCORING.weak)} · otherwise unsupported`],
  ["groundedness", "(supported + 0.5·weak) ÷ claims"],
  ["relevance", `${f(SCORING.relevanceCosineWeight)}·min(1, cos(query, response) ÷ ${f(SCORING.relevanceCosineScale)}) + ${f(SCORING.relevanceOverlapWeight)}·query-term overlap`],
  ["hallucination rate", "unsupported ÷ claims"],
  ["quality", `${f(SCORING.qualityGroundedness)}·groundedness + ${f(SCORING.qualityRelevance)}·relevance + ${f(SCORING.qualityFaithfulness)}·(1 − hallucination rate)`],
  ["confidence", `${f(SCORING.confidenceSupport)}·mean support + ${f(SCORING.confidenceClaims)}·min(1, claims ÷ ${f(SCORING.claimsForFullConfidence)})`],
];

export default function EvalLab() {
  const index = useMemo(() => getIndex(), []);
  const [scenarioId, setScenarioId] = useState(evalScenarios[0].id);
  const scenario = evalScenarios.find((s) => s.id === scenarioId) ?? evalScenarios[0];
  const [draft, setDraft] = useState<Pair>({ a: scenario.a.response, b: scenario.b.response });
  const [committed, setCommitted] = useState<Pair>(draft);
  const [editing, setEditing] = useState<Record<Side, boolean>>({ a: false, b: false });
  const [mounted, setMounted] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    const pending = timer;
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(pending.current);
    };
  }, []);

  const evals = useMemo(
    () => ({ a: evaluate(scenario.query, committed.a, index), b: evaluate(scenario.query, committed.b, index) }),
    [scenario.query, committed, index],
  );

  const selectScenario = (id: string) => {
    const next = evalScenarios.find((s) => s.id === id);
    if (!next) return;
    window.clearTimeout(timer.current);
    const pair = { a: next.a.response, b: next.b.response };
    setScenarioId(id);
    setDraft(pair);
    setCommitted(pair);
    setEditing({ a: false, b: false });
  };

  const change = (side: Side, value: string) => {
    const next = { ...draft, [side]: value };
    setDraft(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCommitted(next), 280);
  };

  const toggleEdit = (side: Side) => {
    if (editing[side]) {
      window.clearTimeout(timer.current);
      setCommitted(draft);
    }
    setEditing((e) => ({ ...e, [side]: !e[side] }));
  };

  const reset = (side: Side) => {
    const original = scenario[side].response;
    window.clearTimeout(timer.current);
    const next = { ...draft, [side]: original };
    setDraft(next);
    setCommitted(next);
  };

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="eyebrow">Query under evaluation</div>
          <p className="mt-2.5 text-[clamp(1.25rem,2.4vw,1.75rem)] font-medium leading-tight tracking-tight text-foreground">“{scenario.query}”</p>
          <p className="mt-2 font-mono text-[11.5px] text-subtle">
            Reference-free evaluator · {index.chunks.length} knowledge chunks · runs in your browser
          </p>
        </div>
        <div role="group" aria-label="Scenario" className="flex max-w-full self-start overflow-x-auto rounded-full border border-line bg-sunken/60 p-1 lg:self-auto">
          {evalScenarios.map((s) => {
            const on = s.id === scenarioId;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => selectScenario(s.id)}
                className={`h-9 whitespace-nowrap rounded-full px-4 text-[13px] transition-all duration-300 ${on ? "bg-surface text-foreground shadow-[var(--shadow-panel)]" : "text-muted hover:text-foreground"}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
        {(["a", "b"] as const).map((side) => (
          <ModelCard
            key={`${scenario.id}-${side}`}
            side={side}
            meta={scenario[side]}
            committed={committed[side]}
            draft={draft[side]}
            editing={editing[side]}
            dirty={draft[side] !== scenario[side].response}
            evaluation={evals[side]}
            mounted={mounted}
            onToggleEdit={() => toggleEdit(side)}
            onChange={(v) => change(side, v)}
            onReset={() => reset(side)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 font-mono text-[11px] text-subtle">
        <span>Claim highlighting:</span>
        {(Object.keys(STATUS) as ClaimStatus[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={`h-1.5 w-3 rounded-full ${STATUS[k].dot}`} />
            {STATUS[k].label}
          </span>
        ))}
      </div>

      <Verdict a={evals.a} b={evals.b} la={scenario.a.latencyMs} lb={scenario.b.latencyMs} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EXPLAINERS.map((ex) => (
          <div key={ex.title} className={`${CARD} spotlight p-4`}>
            <div className="rounded-xl border border-line bg-sunken/40 px-2 py-1.5">{ex.art}</div>
            <h3 className="mt-4 text-[14.5px] font-medium text-foreground">{ex.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{ex.body}</p>
          </div>
        ))}
      </div>

      <details className={`${CARD} group`}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="text-[14px] font-medium text-foreground">How scores are computed</span>
          <span aria-hidden className="font-mono text-[18px] leading-none text-subtle transition-transform duration-300 group-open:rotate-45">+</span>
        </summary>
        <div className="grid gap-5 border-t border-line px-5 py-5">
          <dl className="grid gap-2 overflow-x-auto">
            {FORMULAS.map(([k, v]) => (
              <div key={k} className="grid gap-1 font-mono text-[12px] sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
                <dt className="text-accent">{k}</dt>
                <dd className="text-foreground">= {v}</dd>
              </div>
            ))}
          </dl>
          <ul className="grid gap-1.5 text-[13px] leading-relaxed text-muted">
            <li><span className="text-foreground">coverage</span> — share of a claim&apos;s terms that appear in the knowledge base.</li>
            <li><span className="text-foreground">similarity</span> — best cosine similarity to any chunk, using 256-d feature-hashed embeddings.</li>
            <li><span className="text-foreground">unknown entities</span> — numbers and capitalized names that appear nowhere in the knowledge base.</li>
          </ul>
          <p className="rounded-xl border border-line bg-sunken/50 px-4 py-3 text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-foreground">Limitations.</span> Lexical and hashed-embedding checks can&apos;t catch a wrong combination of true facts — e.g. attributing RAG to the wrong project can still score as supported. Production evaluation adds an LLM-as-judge, labeled test sets, and human review.
          </p>
        </div>
      </details>
    </div>
  );
}
