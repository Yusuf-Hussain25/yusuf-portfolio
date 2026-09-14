"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { CaseStudy, ClientProject, ProjectStory, Screen } from "@/lib/content/projects";
import { ArrowRight, ArrowUpRight, Check, Close } from "@/components/ui/icons";
import { ArchitectureDiagram } from "./architecture-diagram";
import { GlassThumb } from "./thumbnails";

export type Entry =
  | { kind: "case"; slug: string; title: string; data: CaseStudy }
  | { kind: "client"; slug: string; title: string; data: ClientProject };

const SCREEN_SIZE: Record<Screen["kind"], [number, number]> = {
  showcase: [2000, 1250],
  desktop: [1600, 1000],
  mobile: [540, 1169],
};

function Step({ n, label, children }: { n: string; label: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-line py-10 md:grid-cols-[200px_1fr] md:gap-10 md:py-14">
      <div className="self-start md:sticky md:top-28">
        <div className="eyebrow flex items-center gap-3">
          <span className="text-accent">{n}</span>
          <span className="h-px w-6 bg-line-strong" aria-hidden />
          <span>{label}</span>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** Real screens from the live product: the showcase full width, desktop screens in pairs, phones in a row. */
function Screens({ screens }: { screens: Screen[] }) {
  const wide = screens.filter((s) => s.kind !== "mobile");
  const phones = screens.filter((s) => s.kind === "mobile");
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {wide.map((s, i) => (
          <figure key={s.src} className={`panel overflow-hidden p-1.5 ${i === 0 ? "sm:col-span-2" : ""}`}>
            <Image
              src={s.src}
              alt={s.alt}
              width={SCREEN_SIZE[s.kind][0]}
              height={SCREEN_SIZE[s.kind][1]}
              sizes={i === 0 ? "(min-width: 1152px) 880px, 92vw" : "(min-width: 1152px) 440px, (min-width: 640px) 46vw, 92vw"}
              className="h-auto w-full rounded-[14px]"
            />
            <figcaption className="px-2.5 pb-1.5 pt-2.5 font-mono text-[11px] text-subtle">{s.alt}</figcaption>
          </figure>
        ))}
      </div>
      {phones.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {phones.map((s) => (
            <figure key={s.src} className="panel overflow-hidden p-1.5">
              <Image src={s.src} alt={s.alt} width={SCREEN_SIZE.mobile[0]} height={SCREEN_SIZE.mobile[1]} sizes="(min-width: 1024px) 220px, 45vw" className="h-auto w-full rounded-[18px]" />
              <figcaption className="px-2 pb-1 pt-2.5 font-mono text-[11px] text-subtle">{s.alt}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

/** Why the project started: the problem as the headline, the spark behind it, and the questions it raised. */
function WhyItStarted({ n, headline, story }: { n: string; headline: string; story: ProjectStory }) {
  return (
    <Step n={n} label="Why it started">
      <p className="max-w-3xl text-2xl leading-snug tracking-[-0.01em] text-foreground text-pretty md:text-3xl">{headline}</p>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted text-pretty">{story.spark}</p>
      <div className="mt-10">
        <div className="eyebrow">Questions on the table</div>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {story.questions.map((q, i) => (
            <li key={q} className="panel spotlight p-5">
              <span className="font-mono text-[11px] text-accent">Q{i + 1}</span>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground text-pretty">{q}</p>
            </li>
          ))}
        </ul>
      </div>
    </Step>
  );
}

/** The calls that shaped the build, each with the reason behind it. */
function Decisions({ n, decisions }: { n: string; decisions: ProjectStory["decisions"] }) {
  return (
    <Step n={n} label="Key decisions">
      <ol className="cs-decisions">
        {decisions.map((d, i) => (
          <li key={d.choice} className="cs-decision">
            <span className="cs-decision-node font-mono" aria-hidden>
              {i + 1}
            </span>
            <h3 className="text-lg font-medium tracking-[-0.01em] text-foreground md:text-xl">{d.choice}</h3>
            <p className="mt-2 max-w-3xl leading-relaxed text-muted text-pretty">{d.why}</p>
          </li>
        ))}
      </ol>
    </Step>
  );
}

/** Reflection: the hardest part of the build and the takeaway. */
function LookingBack({ n, story }: { n: string; story: ProjectStory }) {
  return (
    <Step n={n} label="Looking back">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="panel p-6">
          <div className="eyebrow">The hard part</div>
          <p className="mt-4 leading-relaxed text-muted text-pretty">{story.hardest}</p>
        </div>
        <div className="panel relative overflow-hidden p-6">
          <span className="cs-lesson-glow" aria-hidden />
          <div className="eyebrow relative">The takeaway</div>
          <p className="relative mt-4 text-lg leading-relaxed text-foreground text-pretty">{story.learned}</p>
        </div>
      </div>
    </Step>
  );
}

function CaseBody({ data }: { data: CaseStudy }) {
  const links = data.links.flatMap((l) => (l.href ? [{ label: l.label, href: l.href }] : []));
  let step = 0;
  const n = () => String(++step).padStart(2, "0");
  return (
    <>
      <WhyItStarted n={n()} headline={data.problem} story={data.story} />
      <Step n={n()} label="Approach">
        <p className="max-w-3xl text-lg leading-relaxed text-muted text-pretty">{data.approach}</p>
      </Step>
      <Decisions n={n()} decisions={data.story.decisions} />
      <Step n={n()} label="Architecture">
        <ArchitectureDiagram study={data} />
      </Step>
      <Step n={n()} label="AI components">
        <div className="grid gap-3 sm:grid-cols-2">
          {data.aiComponents.map((c, i) => (
            <div key={c.name} className="panel spotlight p-5">
              <div className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-3 font-medium text-foreground">{c.name}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.detail}</p>
            </div>
          ))}
        </div>
      </Step>
      <Step n={n()} label="Implementation">
        <ul className="space-y-3">
          {data.implementation.map((item) => (
            <li key={item} className="flex gap-3 text-muted">
              <Check className="mt-1 shrink-0 text-success" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </Step>
      <LookingBack n={n()} story={data.story} />
      {/* Visitors only see real outcomes and links; empty ones stay out of the page. */}
      {(data.result || links.length > 0) && (
        <Step n={n()} label="Result">
          {data.result && <p className="text-2xl font-medium tracking-[-0.01em] text-foreground md:text-3xl">{data.result}</p>}
          {links.length > 0 && (
            <div className={`flex flex-wrap gap-3 ${data.result ? "mt-8" : ""}`}>
              {links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  {l.label} <ArrowUpRight />
                </a>
              ))}
            </div>
          )}
        </Step>
      )}
    </>
  );
}

function ClientBody({ data }: { data: ClientProject }) {
  let step = 0;
  const n = () => String(++step).padStart(2, "0");
  return (
    <>
      <WhyItStarted n={n()} headline={data.challenge} story={data.story} />
      <Step n={n()} label="Solution">
        <p className="max-w-3xl text-lg leading-relaxed text-muted text-pretty">{data.solution}</p>
      </Step>
      <Decisions n={n()} decisions={data.story.decisions} />
      {data.screens && data.screens.length > 0 && (
        <Step n={n()} label="Screens">
          <Screens screens={data.screens} />
        </Step>
      )}
      <Step n={n()} label="Product flow">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
          {data.flow.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className={`cs-flow-step chip h-9 px-3.5 text-[12px] ${i === 0 || i === data.flow.length - 1 ? "text-foreground" : ""}`}>
                <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </span>
              {i < data.flow.length - 1 && <span className="cs-flow-arrow" style={{ "--i": i } as CSSProperties} aria-hidden />}
            </li>
          ))}
        </ol>
      </Step>
      <Step n={n()} label="Key features">
        <div className="grid gap-3 sm:grid-cols-2">
          {data.features.map((f) => (
            <div key={f} className="panel flex gap-3 p-4">
              <Check className="mt-0.5 shrink-0 text-accent" />
              <span className="text-[15px] leading-relaxed text-muted">{f}</span>
            </div>
          ))}
        </div>
      </Step>
      <Step n={n()} label="Stack">
        <div className="flex flex-wrap gap-2">
          {data.stack.map((t) => (
            <span key={t} className="chip h-8 px-3">
              {t}
            </span>
          ))}
        </div>
      </Step>
      <LookingBack n={n()} story={data.story} />
      {(data.contribution || data.liveUrl) && (
        <Step n={n()} label={data.contribution ? "My contribution" : "Live product"}>
          {data.contribution && <p className="text-lg leading-relaxed text-foreground">{data.contribution}</p>}
          {data.liveUrl && (
            <div className={data.contribution ? "mt-8" : ""}>
              <a href={data.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Visit live product <ArrowUpRight />
              </a>
            </div>
          )}
        </Step>
      )}
    </>
  );
}

export function CaseStudyOverlay({
  entry,
  next,
  position,
  total,
  onClose,
  onNavigate,
}: {
  entry: Entry;
  next: Entry;
  position: number;
  total: number;
  onClose: () => void;
  onNavigate: (dir: 1 | -1) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [entry.slug]);

  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !rootRef.current) return;
      const focusables = rootRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!rootRef.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const thumb = entry.data.thumb;
  const label = entry.kind === "case" ? entry.data.kind : "Client work";
  const meta = entry.kind === "case" ? entry.data.year : entry.data.category;
  const tagline = entry.data.tagline;
  const image = entry.kind === "client" ? entry.data.image : null;
  const phone = entry.kind === "client" ? entry.data.phone : null;

  return (
    <div ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="case-study-title" className="cs-overlay fixed inset-0 z-[80]">
      <div ref={scrollRef} className="absolute inset-0 overflow-y-auto overscroll-contain">
        <div className="sticky top-0 z-20 px-3 pt-3 md:px-6 md:pt-5">
          <div className="glass mx-auto flex h-12 max-w-6xl items-center gap-2 rounded-full pl-5 pr-1.5">
            <span className="eyebrow hidden sm:inline">Case study</span>
            <span className="font-mono text-[11px] tabular-nums text-muted">
              {String(position + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={() => onNavigate(-1)} className="btn h-9 px-3 text-muted hover:bg-sunken hover:text-foreground" aria-label="Previous project">
                <ArrowRight className="rotate-180" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button type="button" onClick={() => onNavigate(1)} className="btn h-9 px-3 text-muted hover:bg-sunken hover:text-foreground" aria-label="Next project">
                <span className="hidden sm:inline">Next</span>
                <ArrowRight />
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
                aria-label="Close case study"
              >
                <Close />
              </button>
            </div>
          </div>
        </div>

        <article key={entry.slug} className="cs-content mx-auto max-w-6xl px-5 pb-24 md:px-8">
          <header className="pt-10 md:pt-16">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{label}</span>
              <span className="chip">{meta}</span>
            </div>
            <h2 id="case-study-title" className="display mt-6 text-[clamp(2.75rem,8vw,6.5rem)] text-balance">
              {entry.title}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty md:text-xl">{tagline}</p>
          </header>

          <div className="cs-hero-thumb mt-10 overflow-hidden border border-line md:mt-14" style={{ viewTransitionName: "case-thumb" } as CSSProperties}>
            <GlassThumb variant={thumb} image={image} phone={phone} size="hero" play />
          </div>

          <div className="mb-6 mt-6 flex flex-wrap gap-2">
            {entry.data.stack.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>

          {entry.kind === "case" ? <CaseBody data={entry.data} /> : <ClientBody data={entry.data} />}

          <button
            type="button"
            onClick={() => onNavigate(1)}
            className="panel spotlight group mt-6 flex w-full items-center justify-between gap-6 p-6 text-left md:p-8"
          >
            <span>
              <span className="eyebrow">Next case study</span>
              <span className="mt-3 block text-2xl font-semibold tracking-[-0.02em] md:text-4xl">{next.title}</span>
            </span>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500 group-hover:translate-x-1 group-hover:border-line-strong">
              <ArrowRight />
            </span>
          </button>
        </article>
      </div>
    </div>
  );
}
