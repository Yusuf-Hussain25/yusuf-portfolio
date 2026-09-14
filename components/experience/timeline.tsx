"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { careerMove, companies, experienceHighlights, type Company } from "@/lib/content/experience";
import { LogoMark, TechLogo } from "@/components/engineering/tech-logo";
import { ArrowRight, ArrowUpRight, Trophy } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { RailSparks } from "./rail-sparks";
import "./experience.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function parseMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return { y, m };
}

function formatMonth(ym: string) {
  const { y, m } = parseMonth(ym);
  return `${MONTHS[m - 1]} ${y}`;
}

/** Inclusive month count, LinkedIn-style: "1 yr 2 mos". Open-ended roles count to today. */
function duration(start: string, end: string | null) {
  const s = parseMonth(start);
  const today = new Date();
  const e = end ? parseMonth(end) : { y: today.getFullYear(), m: today.getMonth() + 1 };
  const months = (e.y - s.y) * 12 + (e.m - s.m) + 1;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  return [yrs ? `${yrs} yr${yrs > 1 ? "s" : ""}` : "", mos ? `${mos} mo${mos > 1 ? "s" : ""}` : ""].filter(Boolean).join(" ");
}

/** Index of the row currently crossing the middle of the viewport. */
function useActiveRow() {
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const rows = Array.from(ref.current?.children ?? []);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(rows.indexOf(e.target));
      },
      { rootMargin: "-42% 0px -42% 0px" },
    );
    rows.forEach((row) => io.observe(row));
    return () => io.disconnect();
  }, []);
  return { ref, active };
}

function Highlights() {
  return (
    <dl data-reveal className="panel grid grid-cols-2 gap-px overflow-hidden bg-line lg:grid-cols-4">
      {experienceHighlights.map((h) => (
        <div key={h.label} className="flex flex-col-reverse justify-end bg-surface p-5 md:p-6">
          <dt className="mt-2.5 text-[13px] leading-snug text-muted">{h.label}</dt>
          <dd className="text-[1.45rem] font-semibold leading-none tracking-tight md:text-[1.85rem]">{h.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Sticky identity column: who, when, proof — and a progress meter synced to the contributions. */
function Identity({ company: c, index, active }: { company: Company; index: number; active: number }) {
  const now = c.status === "now";
  const current = c.contributions[active];
  return (
    <div className="exp-sticky">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] tracking-[0.14em] text-subtle">
          {pad(index + 1)} / {pad(companies.length)}
        </span>
        <span className={`chip ${now ? "text-foreground" : ""}`}>
          {now && <span className="status-dot scale-75" aria-hidden />}
          {now ? "Current role" : "Previous role"}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <span aria-hidden className="exp-monogram">
          {c.monogram}
        </span>
        <div className="min-w-0">
          <h3 id={`exp-${c.id}`} className="text-[1.5rem] font-semibold leading-tight tracking-tight md:text-[1.7rem]">
            {c.org}
          </h3>
          <div className="mt-0.5 text-[13px] text-subtle">{c.kind}</div>
        </div>
      </div>

      <div className="mt-6 text-[15px] font-medium tracking-tight">{c.role}</div>
      <div className="mt-1 font-mono text-[12px] text-muted">
        {formatMonth(c.start)} — {c.end ? formatMonth(c.end) : "Present"}
        <span className="text-subtle"> · </span>
        <span suppressHydrationWarning>{duration(c.start, c.end)}</span>
      </div>

      {c.award && (
        <a href={c.award.href} target="_blank" rel="noopener noreferrer" className="exp-award group mt-6 flex items-center gap-3 rounded-2xl p-3 pr-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-muted text-accent dark:shadow-[var(--glow)]">
            <Trophy className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold leading-tight tracking-tight">{c.award.title}</span>
            <span className="mt-1 block font-mono text-[10.5px] uppercase tracking-[0.1em] text-subtle">View the LinkedIn post</span>
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      )}

      <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line">
        {c.impact.map((m) => (
          <div key={m.label} className="flex items-baseline justify-between gap-4 bg-surface px-4 py-3">
            <dt className="text-[13px] text-muted">{m.label}</dt>
            <dd className={`whitespace-nowrap font-semibold tracking-tight ${now ? "text-accent" : "text-foreground"}`}>{m.value}</dd>
          </div>
        ))}
      </dl>

      <div aria-hidden className="mt-7 hidden lg:block">
        <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">
          <span>Reading</span>
          <span className="tabular-nums">
            <span className="text-accent">{pad(active + 1)}</span> / {pad(c.contributions.length)}
          </span>
        </div>
        <div className="exp-progress mt-2.5">
          {c.contributions.map((k, i) => (
            <span key={k.title} data-on={i <= active} />
          ))}
        </div>
        <div key={current.title} className="exp-reading mt-2.5 line-clamp-2 text-[13px] leading-snug text-muted">
          {current.title}
        </div>
      </div>
    </div>
  );
}

function Chapter({ company: c, index }: { company: Company; index: number }) {
  const now = c.status === "now";
  const { ref, active } = useActiveRow();
  return (
    <li className="relative" aria-labelledby={`exp-${c.id}`}>
      <span aria-hidden className="exp-node" />
      <article data-reveal className={`panel exp-card relative ${now ? "exp-card-now" : ""}`}>
        {now && <span aria-hidden className="exp-now-edge absolute inset-x-10 top-0 h-px" />}
        <div className="grid lg:grid-cols-12">
          <aside className="border-b border-line p-6 md:p-8 lg:col-span-5 lg:border-b-0 lg:border-r xl:col-span-4">
            <Identity company={c} index={index} active={active} />
          </aside>

          <div className="exp-story lg:col-span-7 xl:col-span-8">
            <p className="text-[clamp(1.35rem,2.4vw,1.95rem)] font-semibold leading-[1.18] tracking-[-0.03em] text-balance">{c.focus}</p>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-muted text-pretty">{c.summary}</p>

            <div className="eyebrow mt-10 flex items-center gap-3">
              <span>Key contributions</span>
              <span className="h-px flex-1 bg-line" aria-hidden />
              <span>{pad(c.contributions.length)}</span>
            </div>
            <ol ref={ref} className="mt-2">
              {c.contributions.map((k, i) => (
                <li
                  key={k.title}
                  data-active={i === active}
                  className="exp-row grid grid-cols-[2.25rem_minmax(0,1fr)] border-b border-line py-5 last:border-b-0 md:grid-cols-[3rem_minmax(0,1fr)] md:py-6"
                >
                  <span className="exp-num pt-[0.4rem] font-mono text-[12px] leading-none text-subtle">{pad(i + 1)}</span>
                  <div className="min-w-0">
                    <h4 className="text-[1.05rem] font-semibold leading-snug tracking-tight md:text-[1.15rem]">{k.title}</h4>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted text-pretty">{k.detail}</p>
                    {k.tech.length > 0 && (
                      <ul className="mt-3.5 flex flex-wrap gap-1.5" aria-label="Technologies">
                        {k.tech.map((t) => (
                          <li key={t} className="logo-chip">
                            <TechLogo name={t} size={12} />
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="eyebrow mt-10">Stack</div>
            <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(min(100%,9.5rem),1fr))] gap-2">
              {c.stack.map((s) => (
                <li key={s} className="logo-tile">
                  <LogoMark name={s} size={15} />
                  <span className="logo-name">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </li>
  );
}

function CareerMove() {
  return (
    <li className="relative py-7 md:py-9" aria-label={`Career move, ${careerMove.date}`}>
      <span aria-hidden className="exp-node exp-node-move" />
      <div data-reveal style={delay(60)} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-1 text-[14px]">
        <span className="chip text-accent">{careerMove.date} · Moved into AI</span>
        <span className="text-muted">{careerMove.from}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent" />
        <span className="font-medium text-foreground">{careerMove.to}</span>
        <span className="basis-full text-[13px] text-subtle xl:basis-auto">{careerMove.note}</span>
      </div>
    </li>
  );
}

export function Experience() {
  const timeline = useRef<HTMLOListElement>(null);
  return (
    <section id="experience" className="relative border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
        <SectionHeading
          index="02"
          eyebrow="Experience"
          title={
            <>
              Built in production. <span className="text-subtle">Led end to end.</span>
            </>
          }
        >
          Two roles, one trajectory — from full-stack products under real traffic to leading AI products from idea to release.
        </SectionHeading>

        <Highlights />

        <ol ref={timeline} className="exp-timeline relative mt-10 md:mt-14 lg:pl-14">
          {companies.map((c, i) => (
            <Fragment key={c.id}>
              {i > 0 && <CareerMove />}
              <Chapter company={c} index={i} />
            </Fragment>
          ))}
        </ol>
        <RailSparks target={timeline} />
      </div>
    </section>
  );
}
