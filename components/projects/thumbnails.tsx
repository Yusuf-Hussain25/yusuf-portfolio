import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { ThumbVariant } from "@/lib/content/projects";
import "./thumb-signatures.css";

// 3D glass compositions — one per project. Client products place a real
// screenshot in a browser frame at the back of the scene, with that product's
// animated overlays floating in front; own projects are fully code-drawn.
// Each variant has a signature "hot" choreography (see thumb-signatures.css)
// and its own card-level 3D motion.

type Motion = "separate" | "push" | "sweep" | "parallax" | "orbit";

const motionFor: Record<ThumbVariant, Motion> = {
  "repo-graph": "separate",
  voice: "push",
  workflow: "sweep",
  retrieval: "parallax",
  "video-score": "orbit",
  "agents-pipeline": "separate",
  chatbot: "push",
  "vision-pose": "sweep",
  map: "parallax",
  pos: "orbit",
  showcase: "parallax",
};

type SceneProps = { image?: string | null; phone?: string | null };

type LayerProps = { x: number; y: number; w: number; h: number; z: number; delay?: number; bare?: boolean; className?: string; children?: ReactNode };

function Layer({ x, y, w, h, z, delay = 0, bare, className = "", children }: LayerProps) {
  return (
    <div
      className={`gt-layer ${bare ? "" : "gt-glass"} ${className}`}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, "--z": z, "--fd": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

const Line = ({ w, accent }: { w: number; accent?: boolean }) => (
  <span className={`gt-line ${accent ? "gt-line-accent" : ""}`} style={{ width: `${w}%` }} />
);
const Label = ({ children }: { children: ReactNode }) => <span className="gt-label">{children}</span>;
const Dots = () => (
  <span className="gt-dots">
    <i />
    <i />
    <i />
  </span>
);
const CheckMark = () => (
  <svg viewBox="0 0 24 24">
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
);
const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/** Browser chrome around a real product screenshot. Decorative (the scene is aria-hidden). */
export function BrowserFrame({ src, sizes = "(min-width: 1024px) 40vw, 90vw" }: { src: string; sizes?: string }) {
  return (
    <>
      <div className="gt-browser-bar">
        <Dots />
        <span className="gt-url" />
      </div>
      <div className="gt-shot">
        <Image src={src} alt="" fill sizes={sizes} className="object-cover object-top" />
      </div>
    </>
  );
}

function Frame({ image, x = 0, y = 0, w, h, className = "", children }: { image: string; x?: number; y?: number; w: number; h: number; className?: string; children?: ReactNode }) {
  return (
    <Layer x={x} y={y} w={w} h={h} z={0} className={`gt-browser ${className}`}>
      <BrowserFrame src={image} />
      {children}
    </Layer>
  );
}

// ───────────── Own projects (code-drawn) ─────────────

// Hot: edges draw in, nodes pop, the graph turns in 3D, agent bars fill.
function RepoGraph() {
  const nodes: [number, number][] = [[50, 32], [18, 14], [80, 12], [14, 48], [84, 50], [40, 56], [62, 8], [72, 34], [30, 32]];
  const edges: [number, number][] = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 7], [1, 8], [8, 3], [2, 6], [7, 4], [6, 0]];
  const tree: [number, number][] = [[0, 70], [1, 52], [1, 60], [2, 40], [2, 48], [1, 56], [0, 64], [1, 44], [2, 36], [0, 58]];
  return (
    <>
      <Layer x={0} y={2} w={54} h={88} z={0}>
        <Dots />
        {tree.map(([d, w], i) => (
          <div key={i} className="gt-tree" style={{ paddingLeft: `${d * 9}%` }}>
            <span className={`gt-sq ${i === 4 ? "gt-sq-accent" : ""}`} />
            <Line w={w} accent={i === 4} />
          </div>
        ))}
      </Layer>
      <Layer x={36} y={10} w={62} h={60} z={6} delay={900}>
        <Label>repo graph</Label>
        <div className="rg-persp">
          <svg viewBox="0 0 100 64" className="gt-svg rg-graph">
            {edges.map(([a, b], i) =>
              i % 3 === 0 ? (
                <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} className="gt-edge gt-edge-flow gt-anim rg-flow" />
              ) : (
                <line key={i} pathLength={1} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} className="gt-edge rg-edge" style={v({ "--i": i })} />
              ),
            )}
            <circle cx={50} cy={32} r={8} className="gt-pulse gt-anim" />
            {nodes.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i === 0 ? 4.2 : 2.4} className={`${i === 0 ? "gt-node-accent" : "gt-node"} rg-node`} style={v({ "--i": i })} />
            ))}
          </svg>
        </div>
      </Layer>
      <Layer x={4} y={62} w={54} h={32} z={12} delay={1800}>
        <Label>agents</Label>
        {[["map", 0.55], ["summarize", 0.8], ["answer", 0.35]].map(([t, s], i) => (
          <div key={t} className="gt-row">
            <span className="gt-mini">{t}</span>
            <span className="gt-track">
              <span className="gt-fill rg-fill" style={v({ "--s": s, "--i": i })} />
            </span>
          </div>
        ))}
      </Layer>
    </>
  );
}

// Hot: the waveform surges, the mic orb swells with a glow, rings pulse.
function Voice() {
  const bars = Array.from({ length: 30 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)));
  return (
    <>
      <Layer x={0} y={6} w={72} h={58} z={0}>
        <div className="flex items-center justify-between">
          <Label>listening</Label>
          <span className="gt-rec" />
        </div>
        <div className="gt-wave">
          {bars.map((h, i) => (
            <span key={i} className="gt-bar gt-anim vo-bar" style={v({ "--h": h.toFixed(2), "--i": i })} />
          ))}
        </div>
        <Line w={62} />
        <Line w={40} />
      </Layer>
      <Layer x={46} y={38} w={50} h={44} z={7} delay={1000}>
        <Label>intent</Label>
        <div className="gt-chips">
          {["search", "media", "utility"].map((c, i) => (
            <span key={c} className="gt-chip gt-chip-cycle gt-anim" style={v({ "--i": i })}>
              {c}
            </span>
          ))}
        </div>
      </Layer>
      <Layer x={8} y={58} w={30} h={38} z={14} delay={2000} bare>
        <div className="gt-orb vo-orb">
          <span className="vo-glow" />
          <span className="gt-ring gt-anim" />
          <span className="gt-ring gt-anim" style={v({ "--i": 1 })} />
          <svg viewBox="0 0 24 24" className="gt-mic">
            <rect x="9" y="3" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </div>
      </Layer>
    </>
  );
}

// Hot: a packet runs the pipeline and each node lights in sequence; tasks slide in; check pops.
function Workflow() {
  const boxes = [
    { x: 3, label: "trigger" },
    { x: 33, label: "n8n" },
    { x: 63, label: "LLM", accent: true },
    { x: 93, label: "action" },
  ];
  return (
    <>
      <Layer x={0} y={2} w={70} h={40} z={0}>
        <Label>pipeline</Label>
        <svg viewBox="0 0 120 34" className="gt-svg">
          {boxes.slice(0, -1).map((b, i) => (
            <path key={i} d={`M${b.x + 24} 17 H${boxes[i + 1].x}`} className="gt-edge gt-edge-flow gt-anim" />
          ))}
          {boxes.map((b, i) => (
            <g key={b.label} className="wf-step" style={v({ "--i": i })}>
              <rect x={b.x} y={9} width={24} height={16} rx={3} className={b.accent ? "gt-box-accent" : "gt-box"} />
              <text x={b.x + 12} y={18.6} className={b.accent ? "gt-svg-text gt-svg-text-accent" : "gt-svg-text"}>
                {b.label}
              </text>
            </g>
          ))}
          <circle cx={0} cy={17} r={1.8} className="wf-packet" />
        </svg>
      </Layer>
      <Layer x={40} y={44} w={56} h={52} z={7} delay={1100}>
        <Label>automated</Label>
        {["reminder", "plan", "task"].map((t, i) => (
          <div key={t} className="gt-notif wf-notif" style={v({ "--i": i })}>
            <span className="gt-sq gt-sq-accent" />
            <span className="gt-mini">{t}</span>
            <Line w={34 + i * 10} />
          </div>
        ))}
      </Layer>
      <Layer x={6} y={52} w={28} h={34} z={13} delay={2100}>
        <div className="gt-check wf-check">
          <CheckMark />
        </div>
        <Line w={70} />
      </Layer>
    </>
  );
}

// Hot: the corpus converges on the query, the radius locks on, top-k bars fill, the answer types out.
function Retrieval() {
  const pts = Array.from({ length: 34 }, (_, i) => [8 + ((i * 37) % 84), 6 + ((i * 53) % 52)] as [number, number]);
  const q: [number, number] = [54, 30];
  const near = [...pts].sort((a, b) => Math.hypot(a[0] - q[0], a[1] - q[1]) - Math.hypot(b[0] - q[0], b[1] - q[1])).slice(0, 3);
  return (
    <>
      <Layer x={0} y={2} w={58} h={72} z={0}>
        <Label>vector space</Label>
        <svg viewBox="0 0 100 64" className="gt-svg">
          <circle cx={q[0]} cy={q[1]} r={14} className="gt-radius rt-radius" />
          {near.map(([x, y], i) => (
            <line key={i} x1={q[0]} y1={q[1]} x2={x} y2={y} className="gt-edge gt-edge-flow gt-anim" />
          ))}
          {pts.map(([x, y], i) =>
            near.includes(pts[i]) ? (
              <circle key={i} cx={x} cy={y} r={2.2} className="gt-node-accent rt-near" />
            ) : (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={1.3}
                className="gt-dot rt-pt"
                style={v({ "--dx": `${((q[0] - x) * 0.32).toFixed(2)}px`, "--dy": `${((q[1] - y) * 0.32).toFixed(2)}px` })}
              />
            ),
          )}
          <circle cx={q[0]} cy={q[1]} r={3} className="gt-node-query" />
        </svg>
      </Layer>
      <Layer x={38} y={22} w={56} h={46} z={7} delay={1000}>
        <Label>top-k</Label>
        {[0.92, 0.74, 0.61, 0.3].map((s, i) => (
          <div key={i} className="gt-row">
            <span className="gt-mini">#{i + 1}</span>
            <span className="gt-track">
              <span className={`gt-fill rt-fill ${i === 3 ? "gt-fill-muted" : ""}`} style={v({ "--s": s, "--i": i })} />
            </span>
          </div>
        ))}
      </Layer>
      <Layer x={14} y={64} w={64} h={30} z={13} delay={2000}>
        <Label>grounded answer</Label>
        <div className="rt-type">
          <Line w={88} />
        </div>
        <div className="flex items-center">
          <div className="rt-type rt-type-2 w-[56%]">
            <Line w={100} />
          </div>
          <span className="gt-caret gt-anim" />
        </div>
      </Layer>
    </>
  );
}

// ───────────── Client products (real screenshot + overlays) ─────────────

// Hot: the gauge sweeps up while the score counts, the play button pings, checks stamp in.
function VideoScore({ image }: SceneProps) {
  return (
    <>
      {image ? (
        <Frame image={image} w={72} h={78} />
      ) : (
        <Layer x={0} y={4} w={64} h={66} z={0}>
          <div className="gt-video">
            <span className="gt-play vs-play" />
          </div>
          <span className="gt-track gt-track-full">
            <span className="gt-progress gt-anim" />
          </span>
          <Line w={70} />
        </Layer>
      )}
      <Layer x={image ? 57 : 52} y={image ? 16 : 12} w={image ? 39 : 42} h={56} z={8} delay={1100}>
        <Label>viral score</Label>
        <div className="vs-gauge">
          <svg viewBox="0 0 40 40" className="gt-svg gt-gauge">
            <circle cx="20" cy="20" r="15" className="gt-gauge-track" />
            <circle cx="20" cy="20" r="15" className="gt-gauge-value vs-value" />
          </svg>
          <span className="vs-score" />
        </div>
      </Layer>
      <Layer x={6} y={image ? 73 : 70} w={image ? 56 : 66} h={22} z={13} delay={2200}>
        <div className="gt-chips">
          <span className="gt-chip gt-chip-ok vs-chip" style={v({ "--i": 0 })}>
            hook
          </span>
          <span className="gt-chip gt-chip-ok vs-chip" style={v({ "--i": 1 })}>
            title
          </span>
          <span className="gt-chip gt-chip-warn vs-chip vs-warn" style={v({ "--i": 2 })}>
            thumbnail
          </span>
        </div>
      </Layer>
    </>
  );
}

// Hot: the five agents come online one by one; the proposal slides in and gets its check.
function AgentsPipeline({ image }: SceneProps) {
  return (
    <>
      {image ? (
        <Frame image={image} w={74} h={70} />
      ) : (
        <Layer x={0} y={4} w={72} h={56} z={0}>
          <Label>pipeline</Label>
          <div className="gt-kanban">
            {[3, 2, 2, 1].map((n, c) => (
              <div key={c} className="gt-col">
                <Line w={60} accent={c === 0} />
                {Array.from({ length: n }, (_, i) => (
                  <span key={i} className="gt-card" />
                ))}
              </div>
            ))}
            <span className="gt-card gt-card-move gt-anim" />
          </div>
        </Layer>
      )}
      <Layer x={image ? 22 : 26} y={image ? 60 : 48} w={70} h={24} z={8} delay={1000}>
        <div className="gt-agents">
          {["C", "S", "M", "P", "O"].map((a, i) => (
            <span key={a} className="gt-avatar ag-avatar" style={v({ "--i": i })}>
              {a}
              <i className="gt-status ag-status" />
            </span>
          ))}
        </div>
      </Layer>
      <Layer x={image ? 58 : 56} y={6} w={image ? 38 : 40} h={30} z={14} delay={2000}>
        <div className="ag-proposal">
          <div className="flex items-center gap-[1.2cqw]">
            <span className="gt-check gt-check-sm ag-check">
              <CheckMark />
            </span>
            <Label>proposal</Label>
          </div>
          <Line w={84} />
          <Line w={60} />
        </div>
      </Layer>
    </>
  );
}

// Hot: the visitor's message lands, a typing indicator runs, then the reply bubble slides in.
function Chatbot({ image }: SceneProps) {
  return (
    <>
      {image ? (
        <Frame image={image} w={66} h={82}>
          <span className="gt-abs gt-scan gt-anim" />
        </Frame>
      ) : (
        <Layer x={0} y={2} w={60} h={86} z={0}>
          <div className="flex items-center justify-between">
            <Dots />
            <Line w={40} />
          </div>
          <span className="gt-block gt-block-hero" />
          <div className="gt-grid3">
            <span className="gt-block" />
            <span className="gt-block" />
            <span className="gt-block" />
          </div>
          <Line w={80} />
          <Line w={64} />
          <span className="gt-abs gt-scan gt-anim" />
        </Layer>
      )}
      <Layer x={image ? 50 : 42} y={image ? 6 : 12} w={34} h={34} z={6} delay={1000}>
        <Label>knowledge</Label>
        {[70, 54, 62].map((w, i) => (
          <div key={i} className="gt-tree cb-doc" style={v({ "--i": i })}>
            <span className="gt-doc" />
            <Line w={w} />
          </div>
        ))}
      </Layer>
      <Layer x={48} y={50} w={48} h={44} z={13} delay={2000}>
        <div className="gt-bubble gt-bubble-me cb-me">
          <Line w={70} />
        </div>
        <div className="cb-slot">
          <div className="gt-bubble cb-reply">
            <Line w={80} />
            <Line w={50} />
          </div>
          <div className="gt-typing cb-typing">
            <i className="gt-anim" />
            <i className="gt-anim" style={v({ "--i": 1 })} />
            <i className="gt-anim" style={v({ "--i": 2 })} />
          </div>
        </div>
      </Layer>
    </>
  );
}

function PoseFigure() {
  const joints: [number, number][] = [[18, 26], [42, 26], [12, 40], [49, 39], [16, 52], [46, 52], [22, 48], [38, 48], [20, 64], [40, 64], [19, 76], [41, 76], [30, 24]];
  return (
    <>
      <span className="gt-abs gt-bracket gt-bracket-tl" />
      <span className="gt-abs gt-bracket gt-bracket-br" />
      <svg viewBox="0 0 60 82" className="gt-svg gt-pose gt-anim">
        <circle cx="30" cy="14" r="6" className="gt-limb" />
        <path d="M30 20V48M18 26H42M18 26L12 40L16 52M42 26L49 39L46 52M22 48H38M22 48L20 64L19 76M38 48L40 64L41 76" className="gt-limb" />
        {joints.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.7" className="gt-node-accent vp-joint" style={v({ "--t": (y / 82).toFixed(3) })} />
        ))}
      </svg>
      <span className="gt-abs vp-scan">
        <i />
      </span>
    </>
  );
}

// Hot: a scan line sweeps the body and keypoints light up as it passes; brackets widen; meters fill.
function VisionPose({ image }: SceneProps) {
  const meters = (
    <>
      {[["posture", 0.82], ["attention", 0.64]].map(([t, s], i) => (
        <div key={t} className="gt-meter">
          <span className="gt-mini">{t}</span>
          <span className="gt-track gt-track-full">
            <span className="gt-fill vp-fill" style={v({ "--s": s, "--i": i })} />
          </span>
        </div>
      ))}
    </>
  );
  const onDevice = (
    <>
      <div className="flex items-center gap-[1.4cqw]">
        <svg viewBox="0 0 24 24" className="gt-shield vp-shield">
          <path d="M12 3 5 6v5c0 4.4 3 8.4 7 10 4-1.6 7-5.6 7-10V6z" />
        </svg>
        <Label>on-device</Label>
      </div>
      <Line w={70} />
    </>
  );
  if (image) {
    return (
      <>
        <Frame image={image} w={70} h={80} />
        <Layer x={50} y={6} w={30} h={68} z={6} delay={900}>
          <PoseFigure />
        </Layer>
        <Layer x={3} y={60} w={40} h={30} z={10} delay={1500}>
          {meters}
        </Layer>
        <Layer x={60} y={74} w={36} h={20} z={14} delay={2100}>
          {onDevice}
        </Layer>
      </>
    );
  }
  return (
    <>
      <Layer x={4} y={2} w={52} h={92} z={0}>
        <PoseFigure />
      </Layer>
      <Layer x={50} y={12} w={46} h={38} z={7} delay={1000}>
        {meters}
      </Layer>
      <Layer x={46} y={58} w={40} h={26} z={13} delay={2000}>
        {onDevice}
      </Layer>
    </>
  );
}

// Hot: the map tilts back in 3D, pins drop in with a bounce, the listing card rises.
function MapScene({ image }: SceneProps) {
  const pins: [number, number][] = image ? [[66, 46], [79, 63], [88, 34]] : [[28, 30], [58, 48], [76, 22]];
  const box = image ? { x: 0, y: 0, w: 76, h: 80 } : { x: 0, y: 2, w: 74, h: 78 };
  return (
    <>
      {image ? (
        <Frame image={image} w={box.w} h={box.h} className="mp-tilt" />
      ) : (
        <Layer {...box} z={0} className="mp-tilt">
          <svg viewBox="0 0 100 76" preserveAspectRatio="none" className="gt-svg gt-map">
            {[[6, 6, 22, 16], [34, 4, 18, 22], [60, 8, 30, 12], [8, 30, 16, 22], [58, 30, 14, 20], [78, 34, 16, 18], [30, 56, 24, 14], [64, 58, 28, 12]].map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx="1.5" className="gt-lot" />
            ))}
            <path d="M0 26 C30 22 60 30 100 24" className="gt-road" />
            <path d="M30 0 C28 30 34 50 26 76" className="gt-road" />
            <path d="M0 52 C40 46 70 58 100 50" className="gt-road" />
          </svg>
        </Layer>
      )}
      <Layer {...box} z={7} bare delay={900} className="mp-tilt">
        {pins.map(([x, y], i) => (
          <span key={i} className="gt-pin mp-pin" style={{ left: `${x}%`, top: `${y}%`, "--i": i } as CSSProperties}>
            <i className="gt-pin-pulse gt-anim" style={v({ "--i": i })} />
          </span>
        ))}
      </Layer>
      <Layer x={image ? 2 : 50} y={image ? 54 : 48} w={image ? 40 : 46} h={image ? 42 : 46} z={14} delay={1900}>
        <div className="mp-card">
          <span className="gt-block gt-block-photo" />
          <Line w={76} />
          <div className="flex items-center justify-between">
            <Line w={40} />
            <span className="gt-chip gt-chip-ok">verified</span>
          </div>
        </div>
      </Layer>
    </>
  );
}

// Hot: a new ticket drops in, the receipt prints out, "paid" stamps, revenue bars grow.
function Pos({ image }: SceneProps) {
  const bars = [0.35, 0.55, 0.42, 0.8, 0.62, 0.92];
  return (
    <>
      {image ? (
        <Frame image={image} w={68} h={78} />
      ) : (
        <Layer x={0} y={6} w={50} h={72} z={0}>
          <Label>orders</Label>
          <div className="gt-kanban">
            {[3, 2, 3].map((n, c) => (
              <div key={c} className="gt-col">
                {Array.from({ length: n }, (_, i) => (
                  <span key={i} className={`gt-card gt-ticket ${c === 0 && i === 0 ? "pos-new" : ""}`}>
                    <Line w={70} accent={i === 0} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Layer>
      )}
      <Layer x={image ? 44 : 32} y={image ? 12 : 16} w={image ? 30 : 36} h={image ? 74 : 70} z={7} delay={1000}>
        <Label>bill</Label>
        <span className="pos-slot" />
        <div className="pos-receipt">
          {[62, 48, 56, 40].map((w, i) => (
            <div key={i} className="gt-bill-row">
              <Line w={w} />
              <span className="gt-line" style={{ width: "16%" }} />
            </div>
          ))}
          <span className="gt-sep" />
          <div className="gt-bill-row">
            <Line w={36} accent />
            <span className="gt-chip gt-chip-ok pos-paid">paid</span>
          </div>
        </div>
      </Layer>
      <Layer x={image ? 68 : 62} y={image ? 42 : 40} w={image ? 30 : 36} h={48} z={13} delay={2000}>
        <Label>revenue</Label>
        <div className="gt-chart">
          {bars.map((h, i) => (
            <span key={i} className={`gt-col-bar pos-bar ${i === bars.length - 1 ? "gt-col-bar-accent" : ""}`} style={v({ "--h": h, "--i": i })} />
          ))}
        </div>
      </Layer>
    </>
  );
}

// Hot: the phone build slides forward out of the desktop window while a scan line crosses the page.
function Showcase({ image, phone }: SceneProps) {
  return (
    <>
      {image ? (
        <Frame image={image} w={78} h={82}>
          <span className="gt-abs gt-scan gt-anim" />
        </Frame>
      ) : (
        <Layer x={0} y={2} w={78} h={84} z={0}>
          <Dots />
          <span className="gt-block gt-block-hero" />
          <Line w={80} />
          <Line w={64} />
        </Layer>
      )}
      {phone && (
        <Layer x={72} y={14} w={23} h={80} z={12} delay={1200} bare className="sc-phone">
          <Image src={phone} alt="" fill sizes="180px" className="object-cover object-top" />
        </Layer>
      )}
    </>
  );
}

const scenes: Record<ThumbVariant, (props: SceneProps) => ReactNode> = {
  "repo-graph": RepoGraph,
  voice: Voice,
  workflow: Workflow,
  retrieval: Retrieval,
  "video-score": VideoScore,
  "agents-pipeline": AgentsPipeline,
  chatbot: Chatbot,
  "vision-pose": VisionPose,
  map: MapScene,
  pos: Pos,
  showcase: Showcase,
};

export function GlassThumb({
  variant,
  image = null,
  phone = null,
  play = false,
  size = "card",
  className = "",
}: {
  variant: ThumbVariant;
  image?: string | null;
  /** Mobile screenshot for the "showcase" scene. */
  phone?: string | null;
  play?: boolean;
  /** "fill" stretches to the parent's height and centers a fixed-aspect stage. */
  size?: "card" | "compact" | "hero" | "fill";
  className?: string;
}) {
  const Scene = scenes[variant];
  return (
    <div
      aria-hidden
      className={`gt-scene ${className}`}
      data-size={size}
      data-variant={variant}
      data-motion={motionFor[variant]}
      data-play={play ? "" : undefined}
      data-image={image ? "" : undefined}
    >
      <div className="gt-frame">
        <div className="gt-stage">
          <Scene image={image} phone={phone} />
        </div>
      </div>
      <span className="gt-sweep" />
    </div>
  );
}
