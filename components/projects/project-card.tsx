"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import type { Entry } from "./case-study-overlay";
import { GlassThumb } from "./thumbnails";

export type CardLayout = "stack" | "tall";

/**
 * Marks the card "hot" (data-hot) on hover/focus — or while it crosses the
 * middle of the viewport on touch — and drives a spring-damped 3D tilt plus
 * parallax vars on fine pointers. Writes attributes/CSS vars; never re-renders.
 */
function useCardMotion<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ac = new AbortController();
    const opts = { signal: ac.signal };
    const setHot = (on: boolean) => el.toggleAttribute("data-hot", on);

    el.addEventListener("focusin", () => setHot(true), opts);
    el.addEventListener(
      "focusout",
      (e) => {
        if (!el.contains(e.relatedTarget as Node | null) && !(fine && el.matches(":hover"))) setHot(false);
      },
      opts,
    );

    if (!fine) {
      const io = new IntersectionObserver(([entry]) => setHot(entry.isIntersecting), { rootMargin: "-35% 0px -35% 0px" });
      io.observe(el);
      return () => {
        ac.abort();
        io.disconnect();
      };
    }

    el.addEventListener("pointerenter", () => setHot(true), opts);
    el.addEventListener("pointerleave", () => !el.contains(document.activeElement) && setHot(false), opts);
    if (reduced) return () => ac.abort();

    let raf = 0;
    let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0;
    const step = () => {
      raf = 0;
      vx = (vx + (tx - x) * 0.12) * 0.74;
      vy = (vy + (ty - y) * 0.12) * 0.74;
      x += vx;
      y += vy;
      el.style.setProperty("--ry", `${x.toFixed(3)}deg`);
      el.style.setProperty("--rx", `${y.toFixed(3)}deg`);
      el.style.setProperty("--px", (x / 6).toFixed(3));
      el.style.setProperty("--py", (-y / 4.5).toFixed(3));
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) > 0.01) raf = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 12;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 9;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    el.addEventListener("pointermove", onMove, opts);
    el.addEventListener("pointerleave", onLeave, opts);
    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

export function ProjectCard({
  entry,
  layout,
  className = "",
  delay = 0,
  onOpen,
  registerThumb,
}: {
  entry: Entry;
  layout: CardLayout;
  className?: string;
  delay?: number;
  onOpen: (slug: string) => void;
  registerThumb: (slug: string, el: HTMLElement | null) => void;
}) {
  const ref = useCardMotion<HTMLElement>();
  const eyebrow = entry.kind === "case" ? [entry.data.index, entry.data.kind, entry.data.year] : [entry.data.category];
  const facts = entry.kind === "case" ? entry.data.facts : entry.data.features.slice(0, 3);
  const image = entry.kind === "client" ? entry.data.image : null;
  const live = entry.kind === "client" && Boolean(entry.data.liveUrl);
  const stacked = layout === "stack";
  const titleSize = stacked ? "text-3xl md:text-[2.75rem] lg:text-5xl" : "text-xl md:text-2xl";

  return (
    <div data-reveal style={{ "--d": `${delay}ms` } as CSSProperties} className={`h-full ${className}`}>
      <article ref={ref} data-layout={layout} className="pc-card panel spotlight hue group" style={{ "--hue": entry.data.hue } as CSSProperties}>
        <div className="pc-media relative p-2">
          <div ref={(el) => registerThumb(entry.slug, el)} className="pc-thumb pc-thumb-fill">
            <GlassThumb variant={entry.data.thumb} image={image} phone={entry.kind === "client" ? entry.data.phone : null} size="fill" />
          </div>
          {live && (
            <span className="chip glass pointer-events-none absolute left-4 top-4 gap-2">
              <span className="status-dot scale-75" aria-hidden />
              Live product
            </span>
          )}
          <span className="pc-arrow glass" aria-hidden>
            <ArrowUpRight />
          </span>
          <div className="pc-tags pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap gap-1.5">
            {entry.data.stack.slice(0, layout === "tall" ? 3 : 5).map((t, i) => (
              <span key={t} className="pc-tag chip glass" style={{ "--i": i } as CSSProperties}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className={`pc-body flex flex-col p-5 md:p-7 ${stacked ? "lg:px-11 lg:py-10" : ""}`}>
          {stacked && entry.kind === "case" && (
            <span className="pc-num" aria-hidden>
              {entry.data.index}
            </span>
          )}
          <div className="eyebrow flex flex-wrap items-center gap-2">
            {eyebrow.map((part, i) => (
              <span key={part} className={i === 0 && entry.kind === "case" ? "text-accent" : ""}>
                {i > 0 && <span className="mr-2" aria-hidden>·</span>}
                {part}
              </span>
            ))}
          </div>
          <h3 className={`${stacked ? "mt-5 lg:mt-auto" : "mt-4"} font-semibold tracking-[-0.03em] text-foreground text-balance ${titleSize}`}>
            <button
              type="button"
              onClick={() => onOpen(entry.slug)}
              aria-label={`View case study: ${entry.title}`}
              className="pc-open text-left after:absolute after:inset-0 after:z-10 after:content-['']"
            >
              {entry.title}
            </button>
          </h3>
          <p className={`mt-3 leading-relaxed text-muted text-pretty ${layout === "tall" ? "text-[15px]" : "md:text-lg"}`}>{entry.data.tagline}</p>
          {layout !== "tall" && (
            <ul className="mt-6 space-y-2.5">
              {facts.map((f) => (
                <li key={f} className="pc-fact flex items-start gap-2.5 text-sm text-muted">
                  <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto pt-7">
            <span className="pc-cta inline-flex items-center gap-2 text-sm font-medium">
              View case study <ArrowRight />
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
