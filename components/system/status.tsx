"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion, useTheme } from "@/lib/hooks";
import { Close } from "@/components/ui/icons";

type Info = { llm: boolean; model: string | null; chunks: number; dim: number };
type Tone = "success" | "accent" | "warning" | "danger" | "muted";

const toneClass: Record<Tone, string> = {
  success: "bg-success",
  accent: "bg-accent",
  warning: "bg-warning",
  danger: "bg-danger",
  muted: "bg-subtle",
};

export function SystemStatus() {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<Info | null>(null);
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const theme = useTheme();
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const ping = useCallback(async () => {
    const t0 = performance.now();
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const json = (await res.json()) as Info;
      setLatency(Math.round(performance.now() - t0));
      setInfo(json);
      setApiOk(res.ok);
    } catch {
      setApiOk(false);
      setLatency(null);
    }
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void ping();
  };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const interval = window.setInterval(ping, 5000);

    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      frames++;
      if (t - last >= 500) {
        setFps(Math.round((frames * 1000) / (t - last)));
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.clearInterval(interval);
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, ping]);

  const rows: { label: string; value: string; tone: Tone }[] = [
    { label: "Frontend", value: "ONLINE", tone: "success" },
    {
      label: "AI Services",
      value: info ? (info.llm ? `CLAUDE · ${info.model}` : "LOCAL RETRIEVAL") : "CHECKING",
      tone: info ? (info.llm ? "success" : "accent") : "muted",
    },
    {
      label: "API",
      value: apiOk === null ? "CHECKING" : apiOk ? `ONLINE · ${latency ?? "—"} ms` : "UNREACHABLE",
      tone: apiOk === null ? "muted" : apiOk ? "success" : "danger",
    },
    {
      label: "Knowledge Base",
      value: info ? `${info.chunks} CHUNKS · ${info.dim}-D` : "CHECKING",
      tone: info ? "success" : "muted",
    },
    { label: "Render", value: fps ? `${fps} FPS` : "MEASURING", tone: fps === null ? "muted" : fps >= 50 ? "success" : "warning" },
    { label: "Theme", value: (theme ?? "—").toUpperCase(), tone: "muted" },
    { label: "Motion", value: reduced ? "REDUCED" : "FULL", tone: "muted" },
  ];

  return (
    <div ref={wrapRef} className="fixed bottom-4 right-4 z-40 md:bottom-5 md:right-5">
      <div
        ref={panelRef}
        id="system-status-panel"
        role="dialog"
        aria-label="System status"
        tabIndex={-1}
        className={`glass absolute bottom-[calc(100%+10px)] right-0 w-[min(340px,calc(100vw-2rem))] origin-bottom-right rounded-2xl p-4 shadow-[var(--shadow-lift)] outline-none transition-all duration-300 ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-2 scale-95 opacity-0"}`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <div className="flex items-center justify-between">
          <div className="eyebrow flex items-center gap-2">
            <span className="status-dot" aria-hidden /> System status
          </div>
          <button type="button" onClick={() => { setOpen(false); buttonRef.current?.focus(); }} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-sunken hover:text-foreground" aria-label="Close system status">
            <Close />
          </button>
        </div>
        <dl className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface/60">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <dt className="text-[13px] text-muted">{r.label}</dt>
              <dd className="flex min-w-0 items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-foreground">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${toneClass[r.tone]}`} aria-hidden />
                <span className="truncate">{r.value}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] leading-relaxed text-subtle">
          Visual metaphor — values measured live in your browser, not production infrastructure claims.
        </p>
      </div>

      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="system-status-panel"
        className="glass flex h-10 items-center gap-2.5 rounded-full px-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted shadow-[var(--shadow-panel)] transition-colors hover:border-line-strong hover:text-foreground"
      >
        <span className="status-dot" aria-hidden />
        <span><span className="hidden sm:inline">AI System </span>Online</span>
      </button>
    </div>
  );
}
