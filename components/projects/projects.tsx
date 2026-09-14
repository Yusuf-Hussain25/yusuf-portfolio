"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import { createPortal, flushSync } from "react-dom";
import { caseStudies, clientProjects } from "@/lib/content/projects";
import { useReducedMotion } from "@/lib/hooks";
import { SectionHeading } from "@/components/ui/section-heading";
import { CaseStudyOverlay, type Entry } from "./case-study-overlay";
import { ProjectCard, type CardLayout } from "./project-card";
import "./case-studies.css";
import "./project-showcase.css";

const own: Entry[] = caseStudies.map((data) => ({ kind: "case" as const, slug: data.slug, title: data.title, data }));
const client: Entry[] = clientProjects.map((data) => ({ kind: "client" as const, slug: data.slug, title: data.title, data }));
const entries: Entry[] = [...own, ...client];
const indexOf = (slug: string) => entries.findIndex((e) => e.slug === slug);

/** Matches the CSS query that makes the showcase cards sticky. */
const STACK_QUERY = "(min-width: 1024px) and (min-height: 680px)";

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

function inViewport(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
}

export function Projects() {
  const [active, setActive] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const thumbs = useRef(new Map<string, HTMLElement>());
  const trigger = useRef<HTMLElement | null>(null);

  const registerThumb = useCallback((slug: string, el: HTMLElement | null) => {
    if (el) thumbs.current.set(slug, el);
    else thumbs.current.delete(slug);
  }, []);

  /** Morph the card thumbnail into the overlay hero (and back) with View Transitions. */
  const morph = useCallback(
    (slug: string, direction: "open" | "close", update: () => void) => {
      const doc = document as ViewTransitionDoc;
      const thumb = thumbs.current.get(slug);
      if (reduced || !doc.startViewTransition || !thumb || !inViewport(thumb)) {
        update();
        return false;
      }
      const html = document.documentElement;
      html.classList.add("vt-case");
      if (direction === "open") thumb.style.viewTransitionName = "case-thumb";
      const vt = doc.startViewTransition(() => {
        thumb.style.viewTransitionName = direction === "open" ? "" : "case-thumb";
        flushSync(update);
      });
      vt.finished
        .catch(() => {})
        .finally(() => {
          html.classList.remove("vt-case");
          thumb.style.viewTransitionName = "";
        });
      return true;
    },
    [reduced],
  );

  const open = useCallback(
    (slug: string) => {
      if (indexOf(slug) < 0) return;
      trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      history.replaceState(null, "", `#project-${slug}`);
      morph(slug, "open", () => setActive(slug));
    },
    [morph],
  );

  const close = useCallback(() => {
    if (!active) return;
    const slug = active;
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    const restoreFocus = () => trigger.current?.focus({ preventScroll: true });
    if (morph(slug, "close", () => setActive(null))) {
      restoreFocus();
      return;
    }
    const overlay = document.querySelector<HTMLElement>(".cs-overlay");
    if (overlay && !reduced) {
      overlay.setAttribute("data-closing", "");
      window.setTimeout(() => {
        setActive(null);
        restoreFocus();
      }, 200);
    } else {
      setActive(null);
      restoreFocus();
    }
  }, [active, morph, reduced]);

  /** Prev/next: the hero morphs between projects while the page cross-fades. */
  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (!active) return;
      const next = entries[(indexOf(active) + dir + entries.length) % entries.length];
      history.replaceState(null, "", `#project-${next.slug}`);
      const doc = document as ViewTransitionDoc;
      if (reduced || !doc.startViewTransition) {
        setActive(next.slug);
        return;
      }
      const html = document.documentElement;
      html.classList.add("vt-case");
      doc
        .startViewTransition(() => flushSync(() => setActive(next.slug)))
        .finished.catch(() => {})
        .finally(() => html.classList.remove("vt-case"));
    },
    [active, reduced],
  );

  // Deep links (#project-<slug>) and programmatic opens from other sections.
  const openFromOutside = useEffectEvent((slug: string) => open(slug));
  useEffect(() => {
    const fromHash = () => {
      const match = /^#project-(.+)$/.exec(window.location.hash);
      if (match) openFromOutside(decodeURIComponent(match[1]));
    };
    const onEvent = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (typeof slug === "string") openFromOutside(slug);
    };
    const raf = requestAnimationFrame(fromHash);
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("open-case-study", onEvent);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener("open-case-study", onEvent);
    };
  }, []);

  // Showcase deck: as each card slides over the one before, the covered cards
  // sink back (--depth drives scale + dim in CSS) and the front card plays.
  const stack = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = stack.current;
    if (!root) return;
    const mq = window.matchMedia(STACK_QUERY);
    const items = Array.from(root.children) as HTMLElement[];
    let raf = 0;
    const update = () => {
      raf = 0;
      const on = mq.matches && !reduced;
      const tops = items.map((el) => el.getBoundingClientRect().top);
      items.forEach((el, i) => {
        let depth = 0;
        if (on) for (let j = i + 1; j < items.length; j++) depth += Math.min(1, Math.max(0, 1 - (tops[j] - tops[i]) / el.offsetHeight));
        el.style.setProperty("--depth", depth.toFixed(3));
        if (!on) return;
        const cardEl = el.querySelector<HTMLElement>(".pc-card");
        cardEl?.toggleAttribute("data-hot", (depth < 0.3 && tops[i] < window.innerHeight * 0.4) || Boolean(cardEl.matches(":hover")));
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    mq.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mq.removeEventListener("change", schedule);
    };
  }, [reduced]);

  const activeIndex = active ? indexOf(active) : -1;
  const card = (layout: CardLayout, entry: Entry, i: number) => (
    <ProjectCard
      key={entry.slug}
      entry={entry}
      layout={layout}
      delay={layout === "stack" ? 0 : (i % 3) * 90}
      onOpen={open}
      registerThumb={registerThumb}
    />
  );

  return (
    <section id="projects" className="relative">
      <div className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
        <SectionHeading
          index="03"
          eyebrow="Projects"
          title={
            <>
              Selected <span className="text-muted">work.</span>
            </>
          }
        >
          AI systems I&apos;ve designed end to end, and production products from client work. Open any project to see the problem, the architecture, and how it was built.
        </SectionHeading>

        <div ref={stack} className="pc-stack">
          {own.map((entry, i) => (
            <div key={entry.slug} className="pc-stack-item" style={{ "--i": i } as CSSProperties}>
              {card("stack", entry, i)}
            </div>
          ))}
        </div>

        <div className="mt-24 md:mt-32">
          <div className="mb-8 flex flex-col gap-5 border-b border-line pb-8 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <div data-reveal className="eyebrow flex items-center gap-3">
                <span className="text-accent">03.B</span>
                <span className="h-px w-8 bg-line-strong" aria-hidden />
                <span>Client work</span>
              </div>
              <h3 data-reveal style={{ "--d": "80ms" } as CSSProperties} className="display mt-5 text-[clamp(2.25rem,5vw,3.75rem)]">
                Products in production.
              </h3>
            </div>
            <p data-reveal style={{ "--d": "160ms" } as CSSProperties} className="max-w-md leading-relaxed text-muted text-pretty">
              Live products used every day — wellness, AI coaching, customer chat, AI agents, computer vision, marketplaces, and restaurant operations.
            </p>
          </div>

          <div className="pc-grid grid gap-6 md:grid-cols-2 lg:grid-cols-3">{client.map((entry, i) => card("tall", entry, i))}</div>
        </div>
      </div>

      {active &&
        activeIndex >= 0 &&
        createPortal(
          <CaseStudyOverlay
            entry={entries[activeIndex]}
            next={entries[(activeIndex + 1) % entries.length]}
            position={activeIndex}
            total={entries.length}
            onClose={close}
            onNavigate={navigate}
          />,
          document.body,
        )}
    </section>
  );
}
