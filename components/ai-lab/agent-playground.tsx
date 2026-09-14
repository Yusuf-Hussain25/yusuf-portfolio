"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { Play, Reset } from "@/components/ui/icons";
import { presetTasks, simulatedRuntime, type AgentEvent, type AgentId, type AgentState } from "@/lib/ai/agents";
import { estimateTokens } from "@/lib/ai/retrieval";
import { useReducedMotion } from "@/lib/hooks";

const AGENTS: AgentId[] = ["orchestrator", "research", "analysis", "review", "synthesizer"];
const NAMES: Record<AgentId, string> = {
  orchestrator: "Orchestrator",
  research: "Research",
  analysis: "Analysis",
  review: "Review",
  synthesizer: "Synthesizer",
};
const ROLES: Record<AgentId, string> = {
  orchestrator: "Plans and delegates",
  research: "Gathers context",
  analysis: "Weighs options",
  review: "Checks risks",
  synthesizer: "Merges results",
};

type LogEntry = { t: number; agent: AgentId | "system"; text: string; kind: "state" | "tool" | "done" | "error" };
type RunStatus = "idle" | "running" | "done" | "error";
type RunState = {
  status: RunStatus;
  states: Record<AgentId, AgentState>;
  outputs: Record<AgentId, string>;
  tools: Record<AgentId, { tool: string; input: string }[]>;
  log: LogEntry[];
  elapsed: number;
};

function perAgent<T>(make: () => T): Record<AgentId, T> {
  return Object.fromEntries(AGENTS.map((a) => [a, make()])) as Record<AgentId, T>;
}

const initialState = (): RunState => ({
  status: "idle",
  states: perAgent<AgentState>(() => "idle"),
  outputs: perAgent(() => ""),
  tools: perAgent<{ tool: string; input: string }[]>(() => []),
  log: [],
  elapsed: 0,
});

type Action =
  | { type: "start" }
  | { type: "reset" }
  | { type: "error"; message: string }
  | { type: "event"; evt: AgentEvent & { t: number } };

function reducer(s: RunState, a: Action): RunState {
  switch (a.type) {
    case "reset":
      return initialState();
    case "start":
      return { ...initialState(), status: "running", log: [{ t: 0, agent: "system", text: "run started", kind: "state" }] };
    case "error":
      return { ...s, status: "error", log: [...s.log, { t: s.elapsed, agent: "system", text: a.message, kind: "error" }] };
    case "event": {
      const e = a.evt;
      if (e.type === "token") return { ...s, elapsed: e.t, outputs: { ...s.outputs, [e.agent]: s.outputs[e.agent] + e.text } };
      if (e.type === "state")
        return {
          ...s,
          elapsed: e.t,
          states: { ...s.states, [e.agent]: e.state },
          log: [...s.log, { t: e.t, agent: e.agent, text: e.state, kind: "state" }],
        };
      if (e.type === "tool")
        return {
          ...s,
          elapsed: e.t,
          tools: { ...s.tools, [e.agent]: [...s.tools[e.agent], { tool: e.tool, input: e.input }] },
          log: [...s.log, { t: e.t, agent: e.agent, text: `${e.tool}("${e.input}")`, kind: "tool" }],
        };
      return { ...s, elapsed: e.t, status: "done", log: [...s.log, { t: e.t, agent: "system", text: "run complete", kind: "done" }] };
    }
  }
}

// ───────────── Graph geometry ─────────────

type GraphNodeId = AgentId | "user" | "result";
type Geo = {
  width: number;
  height: number;
  font: number;
  badge: number;
  nodes: Record<GraphNodeId, { x: number; y: number; w: number; h: number; label: string }>;
};

const WIDE: Geo = {
  width: 520,
  height: 480,
  font: 11,
  badge: 8.5,
  nodes: {
    user: { x: 260, y: 30, w: 112, h: 34, label: "User" },
    orchestrator: { x: 260, y: 118, w: 168, h: 54, label: "Orchestrator" },
    research: { x: 90, y: 238, w: 150, h: 54, label: "Research" },
    analysis: { x: 260, y: 238, w: 150, h: 54, label: "Analysis" },
    review: { x: 430, y: 238, w: 150, h: 54, label: "Review" },
    synthesizer: { x: 260, y: 358, w: 168, h: 54, label: "Synthesizer" },
    result: { x: 260, y: 446, w: 112, h: 34, label: "Result" },
  },
};

// narrow phones: tighter columns so labels stay legible without horizontal scroll
const COMPACT: Geo = {
  width: 340,
  height: 440,
  font: 10,
  badge: 8,
  nodes: {
    user: { x: 170, y: 26, w: 96, h: 30, label: "User" },
    orchestrator: { x: 170, y: 106, w: 150, h: 48, label: "Orchestrator" },
    research: { x: 58, y: 216, w: 104, h: 48, label: "Research" },
    analysis: { x: 170, y: 216, w: 104, h: 48, label: "Analysis" },
    review: { x: 282, y: 216, w: 104, h: 48, label: "Review" },
    synthesizer: { x: 170, y: 326, w: 150, h: 48, label: "Synthesizer" },
    result: { x: 170, y: 410, w: 96, h: 30, label: "Result" },
  },
};

const WORKERS: AgentId[] = ["research", "analysis", "review"];

type EdgeState = "idle" | "flow" | "done";

function edgePath(geo: Geo, from: GraphNodeId, to: GraphNodeId) {
  const a = geo.nodes[from];
  const b = geo.nodes[to];
  const y1 = a.y + a.h / 2;
  const y2 = b.y - b.h / 2;
  const my = (y1 + y2) / 2;
  return `M ${a.x} ${y1} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${y2}`;
}

const isActive = (s: AgentState) => s === "thinking" || s === "processing";

export default function AgentPlayground() {
  const reduced = useReducedMotion();
  const [task, setTask] = useState<string>(presetTasks[0].task);
  const [run, dispatch] = useReducer(reducer, undefined, initialState);
  const bag = useRef({ abort: null as AbortController | null });
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const b = bag.current;
    return () => b.abort?.abort();
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [run.log.length]);

  const start = async (value = task) => {
    const text = value.trim();
    if (!text) return;
    bag.current.abort?.abort();
    const controller = new AbortController();
    bag.current.abort = controller;
    setTask(text);
    dispatch({ type: "start" });
    try {
      for await (const evt of simulatedRuntime.run(text, controller.signal)) {
        if (controller.signal.aborted) return;
        dispatch({ type: "event", evt });
      }
    } catch (e) {
      if (controller.signal.aborted || (e instanceof DOMException && e.name === "AbortError")) return;
      dispatch({ type: "error", message: e instanceof Error ? e.message : "run failed" });
    }
  };

  const reset = () => {
    bag.current.abort?.abort();
    dispatch({ type: "reset" });
  };

  const { states } = run;
  const nodeState = (id: GraphNodeId): AgentState => {
    if (id === "user") return run.status === "idle" ? "idle" : "complete";
    if (id === "result") return run.status === "done" ? "complete" : "idle";
    return states[id];
  };

  const edgeState = (from: GraphNodeId, to: GraphNodeId): EdgeState => {
    if (from === "user") return isActive(states.orchestrator) ? "flow" : states.orchestrator === "complete" ? "done" : "idle";
    if (from === "orchestrator") {
      const w = states[to as AgentId];
      return isActive(w) ? "flow" : w === "complete" ? "done" : "idle";
    }
    if (to === "synthesizer") {
      const w = states[from as AgentId];
      if (states.synthesizer === "complete") return "done";
      return w === "complete" ? "flow" : "idle";
    }
    return states.synthesizer === "processing" ? "flow" : states.synthesizer === "complete" ? "done" : "idle";
  };

  const edges: [GraphNodeId, GraphNodeId][] = [
    ["user", "orchestrator"],
    ...WORKERS.map((w) => ["orchestrator", w] as [GraphNodeId, GraphNodeId]),
    ...WORKERS.map((w) => [w, "synthesizer"] as [GraphNodeId, GraphNodeId]),
    ["synthesizer", "result"],
  ];

  const running = run.status === "running";
  const toolCount = AGENTS.reduce((n, a) => n + run.tools[a].length, 0);
  const totalTokens = AGENTS.reduce((n, a) => n + estimateTokens(run.outputs[a]), 0);

  return (
    <div className="p-5 md:p-8">
      {/* Task input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
        className="flex flex-col gap-3 lg:flex-row lg:items-end"
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="agent-task" className="eyebrow">
            Task
          </label>
          <input
            id="agent-task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            maxLength={160}
            placeholder="Give the agent team a task…"
            className="mt-3 h-11 w-full rounded-xl border border-line bg-background px-3.5 text-[14px] text-foreground placeholder:text-subtle transition-colors focus:border-line-strong"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary h-11 flex-1 px-5 lg:flex-none" disabled={!task.trim()}>
            <Play className="h-3.5 w-3.5" /> {running ? "Restart" : "Run agents"}
          </button>
          <button type="button" onClick={reset} className="btn btn-ghost h-11 px-4" disabled={run.status === "idle"} aria-label="Reset run">
            <Reset className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {presetTasks.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => start(p.task)}
            className={`min-h-9 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
              task === p.task ? "border-accent/40 bg-accent-muted text-accent" : "border-line bg-surface text-muted hover:border-line-strong hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-auto hidden font-mono text-[10.5px] uppercase tracking-[0.1em] text-subtle md:inline">
          Simulated runtime · deterministic trace — real orchestration pattern, scripted agent output
        </span>
      </div>
      <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-subtle md:hidden">
        Simulated runtime · scripted agent output
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* Graph + log */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-sunken/40">
            <div aria-hidden className="bg-grid absolute inset-0 opacity-70" />
            <div className="relative flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">
              <span className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${running ? "breathe bg-accent" : run.status === "done" ? "bg-success" : "bg-line-strong"}`} />
                {run.status}
              </span>
              <span>
                t+{run.elapsed}ms · {toolCount} tools · ≈{totalTokens} tok
              </span>
            </div>
            <div className="relative px-1 py-2">
              {([WIDE, COMPACT] as const).map((geo) => (
                <svg
                  key={geo.width}
                  viewBox={`0 0 ${geo.width} ${geo.height}`}
                  className={`mx-auto w-full ${geo === WIDE ? "hidden max-w-[560px] sm:block" : "block sm:hidden"}`}
                  role="img"
                  aria-label="Agent orchestration graph"
                >
                  {edges.map(([from, to]) => {
                    const st = edgeState(from, to);
                    const d = edgePath(geo, from, to);
                    return (
                      <g key={`${from}-${to}`}>
                        <path
                          d={d}
                          fill="none"
                          stroke={st === "idle" ? "var(--border-strong)" : "var(--accent)"}
                          strokeOpacity={st === "done" ? 0.55 : 1}
                          strokeWidth={st === "flow" ? 1.5 : 1}
                          className={st === "flow" && !reduced ? "flow-dash" : ""}
                        />
                        {st === "flow" && !reduced && (
                          <circle r={2.6} fill="var(--accent)" className="lab-node-active">
                            <animateMotion dur="1.3s" repeatCount="indefinite" path={d} />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                  {(Object.keys(geo.nodes) as GraphNodeId[]).map((id) => (
                    <GraphNode key={id} geo={geo} id={id} state={nodeState(id)} />
                  ))}
                </svg>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="eyebrow">Event log</span>
              <span className="font-mono text-[10.5px] text-subtle">{run.log.length} events</span>
            </div>
            <div ref={logRef} className="h-44 overflow-y-auto px-4 py-3 font-mono text-[11.5px] leading-[1.9]" aria-live="off">
              {run.log.length === 0 ? (
                <p className="text-subtle">Waiting for a run…</p>
              ) : (
                run.log.map((l, i) => (
                  <div key={i} className="grid grid-cols-[4.25rem_6.5rem_minmax(0,1fr)] gap-2">
                    <span className="text-subtle">+{String(l.t).padStart(5, "0")}</span>
                    <span className={l.agent === "system" ? "text-subtle" : "text-foreground"}>{l.agent}</span>
                    <span
                      className={`truncate ${
                        l.kind === "tool"
                          ? "text-accent"
                          : l.kind === "error"
                            ? "text-danger"
                            : l.kind === "done" || l.text === "complete"
                              ? "text-success"
                              : "text-muted"
                      }`}
                    >
                      {l.kind === "tool" ? "⟶ " : l.kind === "state" && l.agent !== "system" ? "→ " : ""}
                      {l.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Agent outputs */}
        <div className="grid min-w-0 content-start gap-3">
          {(["orchestrator", ...WORKERS] as AgentId[]).map((id) => (
            <AgentCard key={id} id={id} state={states[id]} output={run.outputs[id]} tools={run.tools[id]} />
          ))}
        </div>
      </div>

      {/* Result */}
      <div className={`mt-5 rounded-2xl border bg-surface p-5 transition-colors duration-500 md:p-6 ${run.status === "done" ? "beam border-success/30" : "border-line"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="eyebrow">Synthesizer → Result</span>
            <StateBadge state={states.synthesizer} />
          </div>
          {run.status === "done" && <span className="font-mono text-[11px] text-subtle">completed in {(run.elapsed / 1000).toFixed(1)}s</span>}
        </div>
        <p
          className={`mt-4 whitespace-pre-line text-[15px] leading-relaxed ${run.outputs.synthesizer ? "text-foreground" : "text-subtle"} ${
            states.synthesizer === "processing" ? "caret" : ""
          }`}
        >
          {run.outputs.synthesizer || (states.synthesizer === "thinking" ? "Merging agent outputs…" : "The synthesized answer will stream here once all agents report back.")}
        </p>
      </div>
    </div>
  );
}

function GraphNode({ geo, id, state }: { geo: Geo; id: GraphNodeId; state: AgentState }) {
  const n = geo.nodes[id];
  const active = isActive(state);
  const pill = id === "user" || id === "result";
  const stroke = state === "complete" ? "var(--success)" : active ? "var(--accent)" : "var(--border-strong)";
  const badge = state === "complete" ? "var(--success)" : active ? "var(--accent)" : "var(--subtle)";
  const x = n.x - n.w / 2;
  const y = n.y - n.h / 2;
  return (
    <g className={active ? "lab-node-active" : ""}>
      {state === "thinking" && (
        <rect x={x - 5} y={y - 5} width={n.w + 10} height={n.h + 10} rx={pill ? n.h / 2 + 5 : 17} fill="none" stroke="var(--accent)" strokeOpacity={0.4} className="breathe" />
      )}
      <rect x={x} y={y} width={n.w} height={n.h} rx={pill ? n.h / 2 : 12} fill="var(--surface)" stroke={stroke} strokeWidth={active ? 1.5 : 1} />
      {state === "processing" && <rect x={x} y={y} width={n.w} height={n.h} rx={12} fill="var(--accent-muted)" />}
      <text
        x={n.x}
        y={pill ? n.y + 4 : n.y - 4}
        textAnchor="middle"
        className="font-mono"
        fontSize={geo.font}
        letterSpacing={geo === WIDE ? 1.2 : 0.6}
        fill={state === "idle" && !pill ? "var(--muted)" : "var(--foreground)"}
      >
        {n.label.toUpperCase()}
      </text>
      {!pill && (
        <text x={n.x} y={n.y + 14} textAnchor="middle" className="font-mono" fontSize={geo.badge} letterSpacing={geo === WIDE ? 1.4 : 0.8} fill={badge}>
          {state === "complete" ? "✓ COMPLETE" : state.toUpperCase()}
        </text>
      )}
    </g>
  );
}

function StateBadge({ state }: { state: AgentState }) {
  const cls =
    state === "complete"
      ? "border-success/30 bg-success/10 text-success"
      : state === "processing"
        ? "border-accent/30 bg-accent-muted text-accent"
        : state === "thinking"
          ? "border-accent/30 text-accent"
          : "border-line text-subtle";
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${state === "thinking" ? "breathe" : ""}`} aria-hidden />
      {state}
    </span>
  );
}

function AgentCard({ id, state, output, tools }: { id: AgentId; state: AgentState; output: string; tools: { tool: string; input: string }[] }) {
  const active = isActive(state);
  return (
    <article
      className={`rounded-2xl border bg-surface p-4 transition-all duration-500 ${
        active ? "border-accent/40 dark:shadow-[var(--glow)]" : state === "complete" ? "border-line-strong" : "border-line"
      }`}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-foreground">{NAMES[id]} agent</h3>
          <p className="mt-0.5 text-[12px] text-subtle">{ROLES[id]}</p>
        </div>
        <StateBadge state={state} />
      </header>
      {tools.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tools.map((t, i) => (
            <span key={i} className="chip max-w-full border-accent/25 text-accent">
              <span className="truncate">
                {t.tool}(&quot;{t.input}&quot;)
              </span>
            </span>
          ))}
        </div>
      )}
      <p
        className={`mt-3 text-[13.5px] leading-relaxed ${output ? "text-muted" : "text-subtle"} ${state === "processing" ? "caret" : ""} ${
          state === "idle" ? "" : "min-h-[3rem]"
        }`}
      >
        {output || (state === "thinking" ? "Thinking…" : state === "idle" ? "Idle — waiting for delegation." : "")}
      </p>
    </article>
  );
}
