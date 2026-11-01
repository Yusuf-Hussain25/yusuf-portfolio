import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Build } from "@/lib/content/builds";
import {
  hrefOf,
  imageOf,
  labelOf,
  liveUrlOf,
  neighbours,
  phoneOf,
  repoUrlOf,
  thumbOf,
  trackOf,
  yearOf,
  type Entry,
} from "@/lib/content/catalog";
import type { CaseStudy, ClientProject, ProjectStory, Screen } from "@/lib/content/projects";
import { ArrowRight, ArrowUpRight, Check, Github } from "@/components/ui/icons";
import { ArchitectureDiagram } from "./architecture-diagram";
import { Gallery, type GalleryShot } from "./gallery";
import { GlassThumb } from "./thumbnails";
import "./case-studies.css";
import "./project-showcase.css";

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

/** Why the project started: the problem as the headline, the spark behind it, and the questions it raised. */
function WhyItStarted({ n, headline, story }: { n: string; headline?: string; story: ProjectStory }) {
  return (
    <Step n={n} label="Why I built it">
      {headline ? (
        <>
          <p className="max-w-3xl text-2xl leading-snug tracking-[-0.01em] text-foreground text-pretty md:text-3xl">{headline}</p>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted text-pretty">{story.spark}</p>
        </>
      ) : (
        <p className="max-w-3xl text-xl leading-relaxed tracking-[-0.01em] text-foreground text-pretty md:text-2xl">{story.spark}</p>
      )}
      <div className="mt-10">
        <div className="eyebrow">Questions I had to answer</div>
        <ul className={`mt-4 grid gap-3 ${story.questions.length === 4 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
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
          <div className="eyebrow relative">What I learned</div>
          <p className="relative mt-4 text-lg leading-relaxed text-foreground text-pretty">{story.learned}</p>
        </div>
      </div>
    </Step>
  );
}

function Stack({ n, stack }: { n: string; stack: string[] }) {
  return (
    <Step n={n} label="Tech stack">
      <div className="flex flex-wrap gap-2">
        {stack.map((t) => (
          <span key={t} className="chip h-9 px-3.5 text-[12px] text-foreground">
            {t}
          </span>
        ))}
      </div>
    </Step>
  );
}

function BuildBody({ data }: { data: Build }) {
  let step = 0;
  const n = () => String(++step).padStart(2, "0");
  return (
    <>
      <Step n={n()} label="Overview">
        <p className="max-w-3xl text-lg leading-relaxed text-muted text-pretty md:text-xl">{data.summary}</p>
        {data.origin && (
          <p className="mt-6 flex max-w-3xl gap-3 rounded-2xl border border-line bg-sunken/60 p-4 text-[15px] leading-relaxed text-muted">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">Origin</span>
            <span>{data.origin}</span>
          </p>
        )}
      </Step>
      <WhyItStarted n={n()} story={data.story} />
      {data.compare && data.compare.length > 0 && (
        <Step n={n()} label="Before → after">
          <div className="panel overflow-hidden">
            <div className="hidden grid-cols-[150px_1fr_1fr] gap-6 border-b border-line px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle md:grid">
              <span>Area</span>
              <span>Version 1</span>
              <span className="text-accent">What I built</span>
            </div>
            <ul>
              {data.compare.map((row) => (
                <li key={row.area} className="grid gap-2 border-b border-line px-6 py-5 last:border-b-0 md:grid-cols-[150px_1fr_1fr] md:gap-6">
                  <span className="font-medium text-foreground">{row.area}</span>
                  <span className="text-[15px] leading-relaxed text-subtle">
                    <span className="mr-2 font-mono text-[10.5px] uppercase tracking-[0.12em] md:hidden">Before</span>
                    {row.before}
                  </span>
                  <span className="text-[15px] leading-relaxed text-foreground">
                    <span className="mr-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-accent md:hidden">After</span>
                    {row.after}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Step>
      )}
      <Decisions n={n()} decisions={data.story.decisions} />
      {data.screens.length + data.phones.length > 1 && (
        <Step n={n()} label="Screens">
          <Gallery screens={data.screens} phones={data.phones} />
        </Step>
      )}
      <Step n={n()} label="Features">
        <div className={`grid gap-3 ${data.features.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
          {data.features.map((g) => (
            <div key={g.group} className="panel p-5 md:p-6">
              <div className="eyebrow text-accent">{g.group}</div>
              <ul className="mt-4 space-y-3">
                {g.items.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                    <Check className="mt-1 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Step>
      <Step n={n()} label="Under the hood">
        <div className="grid gap-3 sm:grid-cols-2">
          {data.engineering.map((c, i) => (
            <div key={c.title} className="panel spotlight p-5">
              <div className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-3 font-medium text-foreground">{c.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.detail}</p>
            </div>
          ))}
        </div>
      </Step>
      <Stack n={n()} stack={data.stack} />
      <LookingBack n={n()} story={data.story} />
    </>
  );
}

function CaseBody({ data }: { data: CaseStudy }) {
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
      <Stack n={n()} stack={data.stack} />
      <LookingBack n={n()} story={data.story} />
      {data.result && (
        <Step n={n()} label="Result">
          <p className="text-2xl font-medium tracking-[-0.01em] text-foreground md:text-3xl">{data.result}</p>
        </Step>
      )}
    </>
  );
}

function ClientBody({ data }: { data: ClientProject }) {
  let step = 0;
  const n = () => String(++step).padStart(2, "0");
  const shots: GalleryShot[] = (data.screens ?? []).map((s) => ({ src: s.src, alt: s.alt, w: SCREEN_SIZE[s.kind][0], h: SCREEN_SIZE[s.kind][1] }));
  const wide = shots.filter((_, i) => data.screens?.[i].kind !== "mobile");
  const phones = shots.filter((_, i) => data.screens?.[i].kind === "mobile");
  return (
    <>
      <WhyItStarted n={n()} headline={data.challenge} story={data.story} />
      <Step n={n()} label="Solution">
        <p className="max-w-3xl text-lg leading-relaxed text-muted text-pretty">{data.solution}</p>
      </Step>
      <Decisions n={n()} decisions={data.story.decisions} />
      {shots.length > 0 && (
        <Step n={n()} label="Screens">
          <Gallery screens={wide} phones={phones} />
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
      <Stack n={n()} stack={data.stack} />
      <LookingBack n={n()} story={data.story} />
      {data.contribution && (
        <Step n={n()} label="My contribution">
          <p className="text-lg leading-relaxed text-foreground">{data.contribution}</p>
        </Step>
      )}
    </>
  );
}

export function ProjectDetail({ entry }: { entry: Entry }) {
  const track = trackOf(entry);
  const year = yearOf(entry);
  const live = liveUrlOf(entry);
  const repo = repoUrlOf(entry);
  const near = neighbours(entry.slug);
  const thumb = thumbOf(entry);
  const highlights = entry.kind === "build" ? entry.data.highlights : null;

  return (
    <article className="cs-content hue mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8 md:pt-36" style={{ "--hue": entry.data.hue } as CSSProperties}>
      <nav aria-label="Breadcrumb" className="fade-up font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
        <Link href="/projects" className="-my-2 inline-block py-2 transition-colors hover:text-foreground">
          Projects
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <Link href={`/projects#${track}`} className="-my-2 inline-block py-2 transition-colors hover:text-foreground">
          {track === "professional" ? "Professional" : "Personal"}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">{entry.title}</span>
      </nav>

      <header className="pt-8 md:pt-10">
        <div className="fade-up flex flex-wrap items-center gap-2" style={{ "--d": "60ms" } as CSSProperties}>
          <span className="chip text-foreground">{track === "professional" ? "Professional work" : "Personal project"}</span>
          <span className="chip">{labelOf(entry)}</span>
          {year && <span className="chip">{year}</span>}
          {live && (
            <span className="chip gap-2">
              <span className="status-dot scale-75" aria-hidden />
              Live
            </span>
          )}
        </div>
        <h1 className="display fade-up mt-6 text-[clamp(2.75rem,8vw,6.5rem)] text-balance" style={{ "--d": "120ms" } as CSSProperties}>
          {entry.title}
        </h1>
        <p className="fade-up mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty md:text-xl" style={{ "--d": "180ms" } as CSSProperties}>
          {entry.data.tagline}
        </p>
        {(live || repo) && (
          <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ "--d": "240ms" } as CSSProperties}>
            {live && (
              <a href={live} target="_blank" rel="noopener noreferrer" className="btn btn-primary group h-12 px-6">
                Open live app <ArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
            {repo && (
              <a href={repo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-12 px-6">
                <Github /> Source code
              </a>
            )}
          </div>
        )}
      </header>

      <div className="cs-hero-thumb fade-up mt-10 overflow-hidden border border-line md:mt-14" style={{ "--d": "300ms" } as CSSProperties}>
        <GlassThumb variant={thumb} image={imageOf(entry)} phone={phoneOf(entry)} size="hero" play />
      </div>

      {highlights && (
        <dl className="mt-4 grid grid-cols-3 gap-2 md:mt-6 md:gap-3">
          {highlights.map((h) => (
            <div key={h.label} data-reveal className="panel p-3.5 md:p-6">
              <dt className="sr-only">{h.label}</dt>
              <dd>
                <span className="block text-xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">{h.value}</span>
                <span className="mt-1.5 block text-[12px] leading-snug text-muted md:mt-2 md:text-sm md:leading-relaxed">{h.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6">
        {entry.kind === "build" ? <BuildBody data={entry.data} /> : entry.kind === "case" ? <CaseBody data={entry.data} /> : <ClientBody data={entry.data} />}
      </div>

      {near && (
        <nav aria-label="More projects" className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            { e: near.prev, label: "Previous project", dir: -1 },
            { e: near.next, label: "Next project", dir: 1 },
          ].map(({ e, label, dir }) => (
            <Link
              key={label}
              href={hrefOf(e)}
              className={`panel spotlight group flex items-center justify-between gap-6 p-6 md:p-8 ${dir < 0 ? "flex-row-reverse text-right" : ""}`}
            >
              <span>
                <span className="eyebrow">{label}</span>
                <span className="mt-3 block text-2xl font-semibold tracking-[-0.02em] md:text-3xl">{e.title}</span>
                <span className="mt-1 block text-sm text-muted">{labelOf(e)}</span>
              </span>
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500 group-hover:border-line-strong ${dir < 0 ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
              >
                <ArrowRight className={dir < 0 ? "rotate-180" : ""} />
              </span>
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-10 text-center">
        <Link href="/projects" className="btn btn-ghost h-12 px-6">
          All projects
        </Link>
      </div>
    </article>
  );
}
