"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, useTheme } from "@/lib/hooks";

type Node = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; r: number; phase: number; label?: string };
type Edge = { a: number; b: number };
type Particle = { edge: number; t: number; speed: number };
type Core = { x: number; y: number; r: number };

// Labels sit around the core (right side, clear of the name); each one is wired into it.
const LABELS: { label: string; desktop: [number, number]; mobile: [number, number] }[] = [
  { label: "LLMs", desktop: [0.6, 0.2], mobile: [0.16, 0.13] },
  { label: "RAG", desktop: [0.93, 0.22], mobile: [0.58, 0.08] },
  { label: "AGENTS", desktop: [0.63, 0.68], mobile: [0.86, 0.19] },
  { label: "VISION", desktop: [0.93, 0.64], mobile: [0.14, 0.84] },
  { label: "AUTOMATION", desktop: [0.74, 0.88], mobile: [0.34, 0.95] },
  { label: "NEXT.JS", desktop: [0.45, 0.12], mobile: [0.78, 0.74] },
];

// Tools from the résumé that orbit inside the core (desktop only; too small to read on phones).
const CORE_STACK = ["OPENAI", "CLAUDE", "LANGCHAIN", "PINECONE", "PYTHON", "AWS"];

// deterministic PRNG so the network has the same geometry on every visit
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(w: number, h: number) {
  const mobile = w < 768;
  const rand = mulberry32(7);
  const core: Core = mobile
    ? { x: w * 0.7, y: h * 0.87, r: Math.min(w * 0.12, 54) }
    : { x: w * 0.79, y: h * 0.46, r: Math.min(w * 0.1, h * 0.19, 190) };
  const nodes: Node[] = LABELS.map((l) => {
    const [px, py] = mobile ? l.mobile : l.desktop;
    return { hx: px * w, hy: py * h, x: px * w, y: py * h, vx: 0, vy: 0, r: 3.2, phase: rand() * 6.28, label: l.label };
  });
  const count = mobile ? 20 : 48;
  for (let i = 0; i < count; i++) {
    const px = mobile ? rand() : 0.22 + 0.8 * Math.pow(rand(), 0.55);
    const py = mobile ? (rand() < 0.5 ? rand() * 0.3 : 0.72 + rand() * 0.28) : rand();
    nodes.push({ hx: px * w, hy: py * h, x: px * w, y: py * h, vx: 0, vy: 0, r: 1 + rand() * 1.2, phase: rand() * 6.28 });
  }
  // keep the core's interior clear: nodes that land inside settle on a loose shell around it
  for (const n of nodes) {
    const dx = n.hx - core.x, dy = n.hy - core.y;
    const d = Math.hypot(dx, dy);
    const keep = core.r * (n.label ? 1.6 : 1.15 + rand() * 0.4);
    if (d < keep) {
      const a = d > 0.1 ? Math.atan2(dy, dx) : rand() * 6.283;
      n.hx = n.x = core.x + Math.cos(a) * keep;
      n.hy = n.y = core.y + Math.sin(a) * keep;
    }
  }
  const edges: Edge[] = [];
  const seen = new Set<string>();
  nodes.forEach((n, i) => {
    const k = n.label ? 3 : 2;
    nodes
      .map((m, j) => ({ j, d: (m.hx - n.hx) ** 2 + (m.hy - n.hy) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, k)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ a: i, b: j });
        }
      });
  });
  const particles: Particle[] = Array.from({ length: mobile ? 7 : 18 }, () => ({
    edge: Math.floor(rand() * edges.length),
    t: rand(),
    speed: 0.0025 + rand() * 0.005,
  }));
  return { nodes, edges, particles, mobile, core };
}

function readPalette() {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim().split(/\s+/).join(",");
  return {
    line: v("--net-line"),
    node: v("--net-node"),
    accent: v("--net-accent"),
    glow: s.getPropertyValue("--net-halo").trim() === "1",
    font: s.getPropertyValue("--font-geist-mono").trim() || "monospace",
  };
}

export function NeuralCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !theme) return;
    const ctx = canvas.getContext("2d")!;
    const palette = readPalette();
    let w = 0, h = 0, dpr = 1;
    let graph = build(1, 1);
    const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, active: false };
    let visible = true;
    let raf = 0;
    let spin = 0;
    let lastTime = 0;
    const stackGlow = CORE_STACK.map(() => 0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      graph = build(w, h);
      if (reduced) draw(0);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = mouse.y > -100 && mouse.y < h + 100;
    };
    const onLeave = () => (mouse.active = false);

    const dot = (x: number, y: number, r: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 6.283);
      ctx.fill();
    };

    function draw(time: number) {
      const { nodes, edges, particles, mobile, core } = graph;
      const rect = canvas!.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.85)));
      const e = p * p * (3 - 2 * p); // smoothstep
      const cx = w * (mobile ? 0.5 : 0.66);

      // smoothed cursor → inertia
      const tx = mouse.active ? mouse.x : mouse.sx;
      const ty = mouse.active ? mouse.y : mouse.sy;
      if (mouse.sx < -9000 && mouse.active) { mouse.sx = tx; mouse.sy = ty; }
      mouse.sx += (tx - mouse.sx) * 0.12;
      mouse.sy += (ty - mouse.sy) * 0.12;
      const mx = mouse.sx, my = mouse.sy;
      const R = mobile ? 120 : 200;

      for (const n of nodes) {
        const driftX = reduced ? 0 : Math.sin(time * 0.00031 + n.phase) * 7;
        const driftY = reduced ? 0 : Math.cos(time * 0.00027 + n.phase) * 7;
        let fx = (n.hx + driftX - n.x) * 0.018;
        let fy = (n.hy + driftY - n.y) * 0.018;
        if (mouse.active) {
          const dx = n.x - mx, dy = n.y - my;
          const d = Math.hypot(dx, dy);
          if (d < R && d > 0.1) {
            const f = (1 - d / R) ** 2 * (n.label ? 0.9 : 1.6);
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
        }
        n.vx = (n.vx + fx) * 0.88;
        n.vy = (n.vy + fy) * 0.88;
        n.x += n.vx;
        n.y += n.vy;
      }

      const px = (n: { x: number; hx: number }) => n.x + (cx + (n.hx - cx) * 0.06 - n.x) * e;
      const py = (n: { y: number }) => n.y + (h * 1.02 - n.y) * e;
      const fade = 1 - e * 0.7;

      ctx.clearRect(0, 0, w, h);

      // ── neural core: thin rings drawn in the network's own line language ──
      const t = reduced ? 0 : time * 0.001;
      const kx = px({ x: core.x, hx: core.x });
      const ky = py({ y: core.y });
      const kr = core.r * (1 - e * 0.5);
      const near = mouse.active ? Math.max(0, 1 - Math.hypot(mx - kx, my - ky) / (kr * 2.4)) : 0;
      const breathe = reduced ? 0.5 : Math.sin(t * 1.3) * 0.5 + 0.5;

      const halo = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr * 1.25);
      halo.addColorStop(0, `rgba(${palette.accent},${(palette.glow ? 0.08 : 0.045) * (1 + near * 0.6) * fade})`);
      halo.addColorStop(1, `rgba(${palette.accent},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(kx, ky, kr * 1.25, 0, 6.283);
      ctx.fill();

      // skills feed the core: gently curved wires from each label to the outer ring, with signals flowing in
      for (let i = 0; i < LABELS.length; i++) {
        const n = nodes[i];
        const x = px(n), y = py(n);
        const a = Math.atan2(y - ky, x - kx);
        const ex = kx + Math.cos(a) * kr, ey = ky + Math.sin(a) * kr;
        const len = Math.hypot(x - ex, y - ey) || 1;
        const bend = (i % 2 ? 1 : -1) * len * 0.14;
        const qx = (x + ex) / 2 + (-(ey - y) / len) * bend;
        const qy = (y + ey) / 2 + ((ex - x) / len) * bend;
        ctx.strokeStyle = `rgba(${palette.line},${(0.09 + near * 0.08) * fade})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(qx, qy, ex, ey);
        ctx.stroke();

        const u = reduced ? 0.5 : (t * 0.14 + i * 0.29) % 1;
        const iu = 1 - u;
        const sx = iu * iu * x + 2 * iu * u * qx + u * u * ex;
        const sy = iu * iu * y + 2 * iu * u * qy + u * u * ey;
        const env = Math.sin(u * Math.PI) * fade;
        if (palette.glow) dot(sx, sy, 5, `rgba(${palette.accent},${0.14 * env})`);
        dot(sx, sy, 1.3, `rgba(${palette.accent},${0.85 * env})`);
      }

      const ringAlpha = (0.13 + near * 0.1) * fade;
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = `rgba(${palette.line},${ringAlpha})`;
      ctx.beginPath();
      ctx.arc(kx, ky, kr, 0, 6.283);
      ctx.stroke();
      ctx.setLineDash([2, 6]);
      ctx.lineDashOffset = -t * 6;
      ctx.strokeStyle = `rgba(${palette.line},${ringAlpha * 1.1})`;
      ctx.beginPath();
      ctx.arc(kx, ky, kr * 0.64, 0, 6.283);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(${palette.accent},${(0.3 + near * 0.2) * fade})`;
      ctx.beginPath();
      ctx.arc(kx, ky, kr * 0.3, 0, 6.283);
      ctx.stroke();

      // orbiting neurons on the outer and middle rings, wired together like the network
      const outer = Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * 6.283 + t * 0.05;
        return [kx + Math.cos(a) * kr, ky + Math.sin(a) * kr] as const;
      });
      // the middle ring carries the stack; it stops turning while one is hovered so it can be read
      const hoverAmount = Math.max(...stackGlow);
      const dt = lastTime ? Math.min(50, time - lastTime) : 16;
      lastTime = time;
      if (!reduced) spin += dt * 0.00008 * (1 - hoverAmount);
      const middle = CORE_STACK.map((_, i) => {
        const a = (i / CORE_STACK.length) * 6.283 - spin + 0.3;
        return [kx + Math.cos(a) * kr * 0.64, ky + Math.sin(a) * kr * 0.64, a] as const;
      });

      ctx.font = `500 10px ${palette.font}`;
      const showStack = !mobile && e < 0.6;
      let hovered = -1;
      if (showStack && mouse.active) {
        middle.forEach(([x, y, a], j) => {
          const tw = ctx.measureText(CORE_STACK[j]).width;
          const dir = Math.cos(a) >= 0 ? 1 : -1;
          const lx = x + dir * (10 + tw / 2);
          if (Math.hypot(mouse.x - x, mouse.y - y) < 20 || (Math.abs(mouse.x - lx) < tw / 2 + 8 && Math.abs(mouse.y - y) < 12)) hovered = j;
        });
      }
      stackGlow.forEach((g, j) => (stackGlow[j] = g + ((hovered === j ? 1 : 0) - g) * (reduced ? 1 : 0.14)));

      ctx.lineWidth = 0.7;
      middle.forEach(([x, y, a], j) => {
        const g = stackGlow[j];
        ctx.strokeStyle = g > 0.02 ? `rgba(${palette.accent},${(0.12 + g * 0.4) * fade})` : `rgba(${palette.line},${(0.1 + near * 0.08) * fade})`;
        ctx.beginPath();
        outer
          .map(([ox, oy]) => ({ ox, oy, d: (ox - x) ** 2 + (oy - y) ** 2 }))
          .sort((p1, p2) => p1.d - p2.d)
          .slice(0, 2)
          .forEach(({ ox, oy }) => {
            ctx.moveTo(x, y);
            ctx.lineTo(ox, oy);
          });
        ctx.moveTo(x, y);
        ctx.lineTo(kx + Math.cos(a) * kr * 0.3, ky + Math.sin(a) * kr * 0.3);
        ctx.stroke();
      });

      middle.forEach(([x, y, a], j) => {
        const u = reduced ? 0.5 : (t * (0.3 + stackGlow[j] * 0.5) + j / CORE_STACK.length) % 1;
        const ix = kx + Math.cos(a) * kr * 0.3, iy = ky + Math.sin(a) * kr * 0.3;
        dot(x + (ix - x) * u, y + (iy - y) * u, 1.1 + stackGlow[j] * 0.6, `rgba(${palette.accent},${(0.8 + stackGlow[j] * 0.2) * Math.sin(u * Math.PI) * fade})`);
      });
      for (const [x, y] of outer) dot(x, y, 1.3, `rgba(${palette.node},${(0.38 + near * 0.3) * fade})`);
      middle.forEach(([x, y, a], j) => {
        const g = stackGlow[j];
        const pulse = 0.85 + Math.sin(time * 0.006) * 0.15;
        if (palette.glow || g > 0.02) dot(x, y, 5 + g * 9 * pulse, `rgba(${palette.accent},${((palette.glow ? 0.1 : 0) + g * 0.22) * fade})`);
        if (g > 0.02) {
          ctx.strokeStyle = `rgba(${palette.accent},${g * 0.8 * fade})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 5.5, 0, 6.283);
          ctx.stroke();
        }
        dot(x, y, 1.8 + g * 0.8, `rgba(${palette.accent},${(0.75 + g * 0.25) * fade})`);

        if (!showStack) return;
        const dir = Math.cos(a) >= 0 ? 1 : -1;
        ctx.textAlign = dir > 0 ? "left" : "right";
        ctx.textBaseline = "middle";
        if (palette.glow && g > 0.02) {
          ctx.shadowColor = `rgba(${palette.accent},${g})`;
          ctx.shadowBlur = 14 * g;
        }
        ctx.fillStyle = g > 0.02 ? `rgba(${palette.node},${(0.45 + g * 0.55) * (1 - e)})` : `rgba(${palette.node},${(0.42 + near * 0.2) * (1 - e)})`;
        ctx.fillText(CORE_STACK[j], x + dir * 10, y + 0.5);
        ctx.shadowBlur = 0;
      });
      ctx.textAlign = "left";

      if (palette.glow) dot(kx, ky, 14 + breathe * 4, `rgba(${palette.accent},${(0.1 + near * 0.08 + hoverAmount * 0.1) * fade})`);
      ctx.strokeStyle = `rgba(${palette.accent},${(0.55 - breathe * 0.3) * fade})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(kx, ky, 6 + breathe * 3, 0, 6.283);
      ctx.stroke();
      dot(kx, ky, 2.6, `rgba(${palette.accent},${fade})`);

      // edges as quadratic curves that bend toward the cursor
      const ctrl: [number, number][] = new Array(edges.length);
      edges.forEach((edge, i) => {
        const a = nodes[edge.a], b = nodes[edge.b];
        const ax = px(a), ay = py(a), bx = px(b), by = py(b);
        const midx = (ax + bx) / 2, midy = (ay + by) / 2;
        const dm = Math.hypot(mx - midx, my - midy);
        const pull = mouse.active ? Math.max(0, 1 - dm / (R * 1.4)) : 0;
        const cxp = midx + (mx - midx) * 0.14 * pull;
        const cyp = midy + (my - midy) * 0.14 * pull;
        ctrl[i] = [cxp, cyp];
        const labeled = a.label || b.label;
        const alpha = ((labeled ? 0.2 : 0.11) + pull * 0.28) * fade;
        ctx.strokeStyle = pull > 0.05 ? `rgba(${palette.accent},${alpha})` : `rgba(${palette.line},${alpha})`;
        ctx.lineWidth = labeled ? 0.9 : 0.7;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(cxp, cyp, bx, by);
        ctx.stroke();
      });

      // signal particles travelling along connections
      for (const part of particles) {
        if (!reduced) part.t += part.speed;
        if (part.t > 1) {
          part.t = 0;
          part.edge = (part.edge * 7 + 13) % edges.length;
        }
        const edge = edges[part.edge];
        if (!edge) continue;
        const a = nodes[edge.a], b = nodes[edge.b];
        const [qx, qy] = ctrl[part.edge];
        const tt = part.t, it = 1 - tt;
        const x = it * it * px(a) + 2 * it * tt * qx + tt * tt * px(b);
        const y = it * it * py(a) + 2 * it * tt * qy + tt * tt * py(b);
        const env = Math.sin(tt * Math.PI) * fade;
        if (palette.glow) dot(x, y, 6, `rgba(${palette.accent},${0.16 * env})`);
        dot(x, y, 1.4, `rgba(${palette.accent},${0.9 * env})`);
      }

      // nodes + labels
      ctx.font = `500 10.5px ${palette.font}`;
      ctx.textBaseline = "middle";
      for (const n of nodes) {
        const x = px(n), y = py(n);
        const nearN = mouse.active ? Math.max(0, 1 - Math.hypot(mx - x, my - y) / R) : 0;
        if (n.label) {
          if (palette.glow) dot(x, y, 12 + nearN * 6, `rgba(${palette.accent},${(0.1 + nearN * 0.2) * fade})`);
          ctx.strokeStyle = `rgba(${nearN > 0.05 ? palette.accent : palette.node},${(0.55 + nearN * 0.45) * fade})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 5.5, 0, 6.283);
          ctx.stroke();
          dot(x, y, 2.2, `rgba(${palette.accent},${fade})`);
          const labelAlpha = (0.55 + nearN * 0.45) * (1 - e);
          if (labelAlpha > 0.02) {
            ctx.fillStyle = `rgba(${palette.node},${labelAlpha})`;
            ctx.fillText(n.label, x + 12, y + 0.5);
          }
        } else {
          dot(x, y, n.r + nearN, `rgba(${nearN > 0.1 ? palette.accent : palette.node},${(0.28 + nearN * 0.5) * fade})`);
        }
      }
    }

    const loop = (time: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(time);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const onVis = () => !document.hidden && start();
    const onStillScroll = () => draw(0);

    resize();
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    if (reduced) window.addEventListener("scroll", onStillScroll, { passive: true });
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onStillScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [theme, reduced]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
