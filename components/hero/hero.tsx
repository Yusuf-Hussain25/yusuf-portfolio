"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/lib/content/profile";
import { ArrowRight } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/magnetic";
import { NeuralCanvas } from "./neural-canvas";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  // expose scroll progress through the hero as --p for choreographed exit
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height * 0.8)));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] items-center overflow-hidden" style={{ "--p": 0 } as React.CSSProperties}>
      <div aria-hidden className="hero-aurora" />
      <div aria-hidden className="bg-grid grid-fade absolute inset-0 opacity-70" />
      <NeuralCanvas className="absolute inset-0 h-full w-full" />

      <div
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-28 md:px-8"
        style={{ transform: "translate3d(0, calc(var(--p) * -80px), 0)", opacity: "calc(1 - var(--p) * 1.1)" }}
      >
        <a
          href="#lab"
          className="fade-up group inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/60 py-1.5 pl-2.5 pr-3 backdrop-blur transition-colors hover:border-line-strong"
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          <span className="status-dot" aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted transition-colors group-hover:text-foreground">AI Lab · 4 live demos</span>
          <ArrowRight className="h-3.5 w-3.5 text-subtle transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>

        <h1 className="display mt-8 text-[clamp(5rem,19vw,16.5rem)] leading-[0.8]" aria-label={`${profile.firstName}, ${profile.headline}`}>
          <span aria-hidden className="block">
            {profile.firstName.toUpperCase().split("").map((c, i) => (
              <span key={i} className="hero-char" style={{ "--i": i } as React.CSSProperties}>
                {c}
              </span>
            ))}
          </span>
        </h1>

        <div className="fade-up mt-6 flex items-center gap-4" style={{ "--d": "520ms" } as React.CSSProperties} aria-hidden>
          <span className="h-px w-10 bg-accent md:w-16" />
          <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-foreground sm:text-sm sm:tracking-[0.32em] md:text-base">
            {profile.headline} <span className="text-subtle">· Full-Stack</span>
          </span>
        </div>

        <p className="fade-up mt-8 max-w-xl text-lg leading-relaxed text-muted text-pretty md:text-xl" style={{ "--d": "640ms" } as React.CSSProperties}>
          {profile.intro}
        </p>

        <div className="fade-up mt-10 flex flex-wrap items-center gap-3" style={{ "--d": "760ms" } as React.CSSProperties}>
          <Magnetic>
            <a href="#contact" className="btn btn-primary group h-12 px-6">
              Hire me
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </Magnetic>
          <Magnetic>
            <a href="#projects" className="btn btn-ghost h-12 px-6">
              View Projects
            </a>
          </Magnetic>
        </div>
      </div>

      <div
        aria-hidden
        className="fade-up absolute inset-x-0 bottom-6 z-10 mx-auto hidden max-w-7xl items-center px-8 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle md:flex"
        style={{ "--d": "1000ms", opacity: "calc(1 - var(--p) * 2)" } as React.CSSProperties}
      >
        <span>LLMs · RAG · Agents · Automation</span>
        {/* centred so it never collides with the fixed status pill bottom-right */}
        <span className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3">
          Scroll
          <span className="relative h-8 w-px overflow-hidden bg-line-strong">
            <span className="absolute inset-x-0 top-0 h-3 bg-accent" style={{ animation: "scan 1.8s var(--ease) infinite" }} />
          </span>
        </span>
      </div>
    </section>
  );
}
