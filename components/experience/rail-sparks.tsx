"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion, useTheme } from "@/lib/hooks";

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number };

const RAIL_X = 20; // 1.25rem — matches .exp-timeline::before
const RAIL_INSET = 40; // 2.5rem — rail top/bottom inset
const MAX_SPARKS = 240;
const TAU = Math.PI * 2;

/**
 * Drives the experience timeline from scroll: the rail fills to the viewport centre, a
 * glowing head rides it, scrolling sheds sparks, and each chapter node bursts as it lights.
 * One fixed, viewport-sized canvas; the loop only runs while the timeline is near the screen.
 */
export function RailSparks({ target }: { target: RefObject<HTMLOListElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const reduced = useReducedMotion();

  useEffect(() => {
    const list = target.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!list || !canvas || !ctx || !theme) return;

    const css = getComputedStyle(document.documentElement);
    const rgb = css.getPropertyValue("--net-accent").trim().split(/\s+/).join(",");
    const dark = css.getPropertyValue("--net-glow").trim() === "1";
    const desktop = window.matchMedia("(min-width: 1024px)");

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const sparks: Spark[] = [];
    const emit = (x: number, y: number, count: number, drift: number, force: number) => {
      for (let i = 0; i < count && sparks.length < MAX_SPARKS; i++) {
        const angle = Math.random() * TAU;
        const speed = force * (0.35 + Math.random());
        const max = 0.45 + Math.random() * 0.85;
        sparks.push({
          x: x + (Math.random() - 0.5) * 3,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.7 - drift * (0.5 + Math.random() * 1.5),
          life: max,
          max,
          r: 0.6 + Math.random() * 1.5,
        });
      }
    };
    const dot = (x: number, y: number, r: number, fill: string | CanvasGradient) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    };

    let raf = 0;
    let running = false;
    let primed = false;
    let lastY = window.scrollY;
    let lastT = performance.now();

    const frame = (now: number) => {
      raf = running ? requestAnimationFrame(frame) : 0;
      const k = Math.min(3, (now - lastT) / 16.67);
      lastT = now;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;

      const rect = list.getBoundingClientRect();
      const top = rect.top + RAIL_INSET;
      const bottom = rect.bottom - RAIL_INSET;
      const head = Math.min(bottom, Math.max(top, h * 0.5));
      list.style.setProperty("--rail", bottom > top ? ((head - top) / (bottom - top)).toFixed(4) : "0");

      ctx.clearRect(0, 0, w, h);
      if (!desktop.matches) return;
      const x = rect.left + RAIL_X;

      // chapter nodes light once the head reaches them — with a burst on the way down
      list.querySelectorAll<HTMLElement>(":scope > li > .exp-node").forEach((node) => {
        const r = node.getBoundingClientRect();
        const ny = r.top + r.height / 2;
        const lit = head >= ny - 0.5;
        if (lit === node.classList.contains("is-lit")) return;
        node.classList.toggle("is-lit", lit);
        if (lit && primed && !reduced) emit(x, ny, 30, 0, 2.4);
      });
      primed = true;
      if (reduced) return;

      const onRail = head > top + 1 && head < bottom - 1;
      if (onRail && Math.abs(dy) > 0.5) emit(x, head, Math.min(8, Math.ceil(Math.abs(dy) / 9)), Math.sign(dy), 1.15);

      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= k / 60;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        s.vx *= 0.95 ** k;
        s.vy = s.vy * 0.95 ** k + 0.03 * k;
        s.x += s.vx * k;
        s.y += s.vy * k - dy; // sparks belong to the page, so they scroll with it
        const a = s.life / s.max;
        if (dark) dot(s.x, s.y, s.r * 4, `rgba(${rgb},${(a * 0.16).toFixed(3)})`);
        dot(s.x, s.y, Math.max(0.3, s.r * a), dark ? `rgba(235,237,255,${a.toFixed(3)})` : `rgba(${rgb},${a.toFixed(3)})`);
      }

      if (onRail) {
        const radius = 16 * (1 + Math.sin(now / 320) * 0.12 + Math.min(0.5, Math.abs(dy) / 60));
        const halo = ctx.createRadialGradient(x, head, 0, x, head, radius);
        halo.addColorStop(0, `rgba(${rgb},${dark ? 0.7 : 0.45})`);
        halo.addColorStop(1, `rgba(${rgb},0)`);
        dot(x, head, radius, halo);
        dot(x, head, 2.6, dark ? "rgba(245,246,255,0.95)" : `rgb(${rgb})`);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const start = () => {
      if (running) return;
      running = true;
      lastY = window.scrollY;
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      sparks.length = 0;
      ctx.clearRect(0, 0, w, h);
    };

    resize();
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { rootMargin: "25% 0px 25% 0px" });
    io.observe(list);
    window.addEventListener("resize", resize);
    return () => {
      io.disconnect();
      stop();
      window.removeEventListener("resize", resize);
    };
  }, [target, theme, reduced]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-30 hidden h-full w-full lg:block" />;
}
