import type { CSSProperties } from "react";

/** Linear product pipeline: nodes light in sequence while signal travels the wires. */
export function FlowDiagram({ steps }: { steps: string[] }) {
  return (
    <ol className={`cs-flow ${steps.length > 5 ? "cs-flow-long" : ""}`} style={{ "--steps": steps.length } as CSSProperties}>
      {steps.map((step, i) => (
        <li key={step} data-cs-reveal className="cs-flow-node" style={{ "--i": i, "--d": `${i * 90}ms` } as CSSProperties}>
          <div className="cs-flow-card">
            <span className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</span>
            <span className="mt-2.5 block text-[15px] font-medium leading-snug text-foreground">{step}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
