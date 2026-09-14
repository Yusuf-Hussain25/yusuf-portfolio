"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { RagExplorer } from "./rag-explorer";
import "./lab.css";

function LabSkeleton() {
  return (
    <div className="grid min-h-[600px] gap-4 p-5 md:p-8" aria-busy="true" aria-label="Loading experiment">
      <div className="shimmer h-11 w-full max-w-xl rounded-xl border border-line" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="shimmer h-80 rounded-2xl border border-line" />
        <div className="shimmer h-80 rounded-2xl border border-line" />
      </div>
    </div>
  );
}

const AgentPlayground = dynamic(() => import("./agent-playground"), { ssr: false, loading: LabSkeleton });
const VisionLab = dynamic(() => import("./vision-lab"), { ssr: false, loading: LabSkeleton });
const EvalLab = dynamic(() => import("./eval-lab"), { ssr: false, loading: LabSkeleton });

const TABS = [
  { id: "rag", index: "01", label: "RAG Explorer", status: "Runs in your browser" },
  { id: "agents", index: "02", label: "Agent Playground", status: "Simulated runtime" },
  { id: "vision", index: "03", label: "Vision AI", status: "Local pixel analysis" },
  { id: "eval", index: "04", label: "Evaluation", status: "Heuristic evaluator" },
] as const;

export function AILab() {
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number, focus = false) => {
    setActive(i);
    setVisited((v) => (v.includes(i) ? v : [...v, i]));
    if (focus) tabRefs.current[i]?.focus();
    tabRefs.current[i]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = TABS.length - 1;
    const map: Record<string, number> = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    if (e.key in map) {
      e.preventDefault();
      select(map[e.key], true);
    }
  };

  return (
    <section id="lab" className="relative overflow-hidden border-t border-line">
      <div aria-hidden className="bg-grid grid-fade absolute inset-0 opacity-90" />
      <div className="relative mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
        <SectionHeading
          index="07"
          eyebrow="AI Lab"
          title={
            <>
              The AI Lab.
              <br />
              <span className="text-subtle">Systems you can inspect.</span>
            </>
          }
        >
          Four live experiments that show how the systems behind AI products actually work — retrieval, orchestration,
          perception, and evaluation. Nothing here is a video.
        </SectionHeading>

        <div data-reveal style={{ "--d": "120ms" } as React.CSSProperties} className="panel lab-instrument overflow-hidden">
          <div className="flex items-stretch justify-between gap-4 border-b border-line pl-1 pr-3 md:pl-2 md:pr-5">
            <div role="tablist" aria-label="Experiments" onKeyDown={onKeyDown} className="lab-scroll flex min-w-0 overflow-x-auto">
              {TABS.map((tab, i) => {
                const selected = active === i;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    id={`lab-tab-${tab.id}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls={`lab-panel-${tab.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(i)}
                    className={`group relative flex h-14 shrink-0 items-center gap-2.5 px-4 font-mono text-[11.5px] uppercase tracking-[0.1em] transition-colors md:px-5 ${
                      selected ? "text-foreground" : "text-subtle hover:text-foreground"
                    }`}
                  >
                    <span className={selected ? "text-accent" : "text-subtle"}>{tab.index}</span>
                    <span className="whitespace-nowrap">{tab.label}</span>
                    <span
                      aria-hidden
                      className={`lab-glow absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-accent transition-all duration-500 ${
                        selected ? "scale-x-100 opacity-100" : "scale-x-50 opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="hidden shrink-0 items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle lg:flex">
              <span className="status-dot" aria-hidden />
              <span key={active} className="lab-fade">
                {TABS[active].status}
              </span>
            </div>
          </div>

          {TABS.map((tab, i) => (
            <div
              key={tab.id}
              id={`lab-panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`lab-tab-${tab.id}`}
              hidden={active !== i}
              className="lab-fade min-h-[600px]"
            >
              {visited.includes(i) &&
                (i === 0 ? (
                  <RagExplorer />
                ) : i === 1 ? (
                  <AgentPlayground />
                ) : (
                  // Vision and Evaluation render edge-to-edge; give them the same inset as the other experiments
                  <div className="p-4 md:p-8">{i === 2 ? <VisionLab /> : <EvalLab />}</div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
