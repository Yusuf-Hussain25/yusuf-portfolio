import type { ArchKind, CaseStudy } from "@/lib/content/projects";

const W = 150;
const H = 52;

const kindStyle: Record<ArchKind, { stroke: string; dot: string; label: string }> = {
  ai: { stroke: "stroke-accent", dot: "fill-accent", label: "AI" },
  service: { stroke: "stroke-line-strong", dot: "fill-subtle", label: "Service" },
  data: { stroke: "stroke-success", dot: "fill-success", label: "Data" },
  io: { stroke: "stroke-foreground/40", dot: "fill-foreground", label: "Interface" },
};

// Point where the segment from `a` toward `b` leaves a's box.
function exitPoint(a: { x: number; y: number }, b: { x: number; y: number }, pad = 6) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const sx = dx === 0 ? Infinity : (W / 2 + pad) / Math.abs(dx);
  const sy = dy === 0 ? Infinity : (H / 2 + pad) / Math.abs(dy);
  const s = Math.min(sx, sy);
  return { x: a.x + dx * s, y: a.y + dy * s };
}

export function ArchitectureDiagram({ study }: { study: CaseStudy }) {
  const { nodes, edges } = study.architecture;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const marker = `arch-arrow-${study.slug}`;

  return (
    <div>
      <div className="panel overflow-x-auto p-4 md:p-6">
        <svg viewBox="0 0 720 300" className="block h-auto w-full min-w-[640px]" role="img" aria-label={`${study.title} architecture diagram`}>
          <defs>
            <marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" className="fill-accent" />
            </marker>
          </defs>

          {edges.map((e, i) => {
            const from = byId.get(e.from);
            const to = byId.get(e.to);
            if (!from || !to) return null;
            const p1 = exitPoint(from, to);
            const p2 = exitPoint(to, from);
            const mx = (p1.x + p2.x) / 2;
            // horizontal edges have little room between boxes: float the label above the row
            const my = from.y === to.y ? from.y - H / 2 - 16 : (p1.y + p2.y) / 2;
            return (
              <g key={i}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="stroke-line-strong" strokeWidth={1.25} />
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="flow-dash stroke-accent" strokeWidth={1.5} markerEnd={`url(#${marker})`} />
                {e.label && (
                  <g>
                    <rect x={mx - e.label.length * 3.4 - 8} y={my - 10} width={e.label.length * 6.8 + 16} height={20} rx={10} className="fill-background stroke-line" />
                    <text x={mx} y={my + 3.5} textAnchor="middle" fontSize={10} className="fill-muted font-mono">
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {nodes.map((n) => {
            const s = kindStyle[n.kind];
            return (
              <g key={n.id}>
                <rect x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} rx={12} className={`fill-surface ${s.stroke}`} strokeWidth={1.25} />
                <circle cx={n.x - W / 2 + 14} cy={n.y - (n.sub ? 7 : 0)} r={3} className={s.dot} />
                <text x={n.x - W / 2 + 24} y={n.y + (n.sub ? -3 : 4)} fontSize={13} fontWeight={500} className="fill-foreground">
                  {n.label}
                </text>
                {n.sub && (
                  <text x={n.x - W / 2 + 14} y={n.y + 15} fontSize={8.5} className="fill-subtle font-mono">
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.1em] text-subtle">
        {(Object.keys(kindStyle) as ArchKind[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-2">
            <svg width="8" height="8" aria-hidden>
              <circle cx="4" cy="4" r="3.5" className={kindStyle[k].dot} />
            </svg>
            {kindStyle[k].label}
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <svg width="22" height="8" aria-hidden>
            <line x1="0" y1="4" x2="22" y2="4" className="flow-dash stroke-accent" strokeWidth="1.5" />
          </svg>
          Data flow
        </span>
      </div>
    </div>
  );
}
