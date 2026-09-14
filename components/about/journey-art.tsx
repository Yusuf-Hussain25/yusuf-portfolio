import type { CSSProperties } from "react";
import { education } from "@/lib/content/profile";

// Thin-line drawings for the Journey: strokes draw in when revealed (.jr-draw),
// then a small loop keeps each one alive. Pure SVG + CSS, styles in about.css.

const k = (n: number) => ({ "--k": n }) as CSSProperties;

/** Four-point sparkle centred on (x, y). */
const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r} L${x + r * 0.25} ${y - r * 0.25} L${x + r} ${y} L${x + r * 0.25} ${y + r * 0.25} L${x} ${y + r} L${x - r * 0.25} ${y + r * 0.25} L${x - r} ${y} L${x - r * 0.25} ${y - r * 0.25} Z`;

export type GlyphKind = "college" | "laptop" | "ship";

/** Inline icon that sits beside a phrase in the Journey headline. */
export function HeadingGlyph({ kind, order }: { kind: GlyphKind; order: number }) {
  return (
    <span className="jr-glyph" style={{ "--i": order * 2 } as CSSProperties} aria-hidden>
      <svg viewBox="0 0 48 48">
        {kind === "college" && (
          <>
            <path className="jr-draw" pathLength={1} style={k(0)} d="M6 19 L24 8 L42 19 Z" />
            <path className="jr-draw" pathLength={1} style={k(1)} d="M12 23 V36 M20 23 V36 M28 23 V36 M36 23 V36" />
            <path className="jr-draw" pathLength={1} style={k(2)} d="M6 40 H42" />
          </>
        )}
        {kind === "laptop" && (
          <>
            <rect className="jr-draw" pathLength={1} style={k(0)} x="9" y="9" width="30" height="21" rx="2" />
            <path className="jr-draw" pathLength={1} style={k(1)} d="M4 35 H44 L41 39 H7 Z" />
            <line className="jr-type jr-fade" style={k(0)} x1="14" y1="16" x2="30" y2="16" />
            <line className="jr-type jr-fade" style={k(1)} x1="14" y1="23" x2="25" y2="23" />
          </>
        )}
        {kind === "ship" && (
          <>
            <path className="jr-draw" pathLength={1} style={k(0)} d="M24 5 C32 12 33 23 30 32 H18 C15 23 16 12 24 5 Z" />
            <circle className="jr-draw" pathLength={1} style={k(1)} cx="24" cy="18" r="3.5" />
            <path className="jr-draw" pathLength={1} style={k(2)} d="M18 25 L11 34 L18 32 M30 25 L37 34 L30 32" />
            <path className="jr-flame jr-fade" d="M20.5 35 L24 44 L27.5 35" />
          </>
        )}
      </svg>
    </span>
  );
}

function Campus() {
  const fill = 1 - Number(education.grade) / Number(education.scale);
  return (
    <>
      <path className="jr-draw" pathLength={1} style={k(0)} d="M22 36 L56 22 L90 36 L56 50 Z" />
      <path className="jr-draw" pathLength={1} style={k(1)} d="M38 43 V58 C38 66 74 66 74 58 V43" />
      <path className="jr-draw" pathLength={1} style={k(2)} d="M90 36 V55" />
      <circle className="jr-solid jr-fade" cx="90" cy="58" r="2.5" />
      <path className="jr-dim" d="M118 66 A30 30 0 0 1 178 66" />
      <path className="jr-meter" pathLength={1} style={{ "--m": fill } as CSSProperties} d="M118 66 A30 30 0 0 1 178 66" />
      <text className="jr-text jr-fade" x="148" y="62" textAnchor="middle" fontSize="15" fontWeight="600">
        {education.grade}
      </text>
      <text className="jr-text jr-sub jr-fade" x="148" y="79" textAnchor="middle" fontSize="7" letterSpacing="1">
        CGPA
      </text>
    </>
  );
}

function Grind() {
  return (
    <>
      <path className="jr-draw" pathLength={1} style={k(0)} d="M44 12 A15 15 0 1 0 60 34 A11 11 0 1 1 44 12 Z" />
      <path className="jr-spark jr-fade" style={k(0)} d={star(24, 24, 3.5)} />
      <path className="jr-spark jr-fade" style={k(2)} d={star(64, 58, 3)} />
      <rect className="jr-draw" pathLength={1} style={k(1)} x="80" y="24" width="58" height="38" rx="3" />
      <path className="jr-draw" pathLength={1} style={k(2)} d="M72 68 H146 L140 74 H78 Z" />
      <line className="jr-type jr-fade" style={k(0)} x1="87" y1="34" x2="118" y2="34" />
      <line className="jr-type jr-fade" style={k(1)} x1="87" y1="43" x2="128" y2="43" />
      <line className="jr-type jr-fade" style={k(2)} x1="93" y1="52" x2="113" y2="52" />
      {[0, 1, 2].map((n) => (
        <g key={n} className="jr-tick jr-fade" style={k(n)}>
          <rect className="jr-dim" x="156" y={20 + n * 18} width="10" height="10" rx="2" />
          <path d={`M158 ${25 + n * 18} l2.5 2.5 l5 -5`} />
          <line className="jr-dim" x1="172" y1={25 + n * 18} x2="190" y2={25 + n * 18} />
        </g>
      ))}
    </>
  );
}

function Hired() {
  return (
    <>
      <g className="jr-rise">
        <rect className="jr-draw jr-occlude" pathLength={1} style={k(0)} x="74" y="16" width="52" height="44" rx="2" />
        <path className="jr-dim jr-fade" d="M82 27 H112 M82 35 H118 M82 43 H102" />
      </g>
      <path className="jr-draw jr-occlude" pathLength={1} style={k(1)} d="M60 44 H140 V80 H60 Z" />
      <path className="jr-draw" pathLength={1} style={k(2)} d="M60 44 L100 66 L140 44" />
      <g className="jr-pop">
        <circle className="jr-occlude" cx="154" cy="26" r="10" />
        <path d="M149 26 l3.5 3.5 l6.5 -7" />
      </g>
    </>
  );
}

function Network() {
  const layers = [
    [24, 44, 64].map((y) => [40, y]),
    [16, 36, 56, 76].map((y) => [100, y]),
    [34, 54].map((y) => [160, y]),
  ];
  const edges = [0, 1].flatMap((l) => layers[l].flatMap((a) => layers[l + 1].map((b) => [a, b])));
  const signal = [
    [layers[0][0], layers[1][1]],
    [layers[1][1], layers[2][0]],
    [layers[0][2], layers[1][2]],
    [layers[1][2], layers[2][1]],
  ];
  return (
    <>
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} className="jr-dim jr-fade" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      ))}
      {signal.map(([a, b]) => (
        <line key={`s${a}-${b}`} className="jr-flow jr-fade" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      ))}
      {layers.map((nodes, l) =>
        nodes.map(([x, y]) => <circle key={`${x}-${y}`} className="jr-node jr-draw" pathLength={1} style={k(l)} cx={x} cy={y} r="4.5" />),
      )}
    </>
  );
}

function Award() {
  return (
    <>
      <circle className="jr-draw" pathLength={1} style={k(0)} cx="100" cy="22" r="12" />
      <path className="jr-dim jr-fade" d="M92 18 Q100 14 108 18 M90 25 Q100 30 110 25" />
      <path className="jr-draw" pathLength={1} style={k(1)} d="M93 35 H107 L105 39 H95 Z" />
      <path className="jr-draw" pathLength={1} style={k(1)} d="M95 39 L97 62 H103 L105 39" />
      <path className="jr-draw" pathLength={1} style={k(2)} d="M84 62 H116 L122 80 H78 Z" />
      <path className="jr-dim jr-fade" d="M90 71 H110" />
      {[
        [66, 20, 4],
        [136, 16, 5],
        [142, 48, 3.5],
        [60, 54, 3],
      ].map(([x, y, r], n) => (
        <path key={n} className="jr-spark jr-fade" style={k(n)} d={star(x, y, r)} />
      ))}
    </>
  );
}

const scenes: Record<string, () => React.JSX.Element> = {
  campus: Campus,
  grind: Grind,
  hired: Hired,
  ai: Network,
  award: Award,
};

/** Drawing for one Journey chapter, keyed by chapter id. */
export function JourneyArt({ id }: { id: string }) {
  const Scene = scenes[id];
  if (!Scene) return null;
  return (
    <div className="jr-art-box" aria-hidden>
      <svg viewBox="0 0 200 88" className="jr-art">
        <Scene />
      </svg>
    </div>
  );
}
