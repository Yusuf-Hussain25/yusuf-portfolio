"use client";

import { Fragment, useRef, useState } from "react";
import { skillGroups } from "@/lib/content/profile";
import { caseStudies } from "@/lib/content/projects";
import { stackLayers, toolkitCaptions, type StackLayer, type StackTech } from "@/lib/content/stack";
import { ArrowRight } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { LogoMark, TechLogo } from "./tech-logo";
import "./engineering.css";

/** "AWS (EC2, S3, Lambda)" → { name: "AWS", note: "EC2 · S3 · Lambda" } so the mark stays a single brand. */
function splitNote(item: string) {
  const match = /^(.+?) \((.+)\)$/.exec(item);
  return match ? { name: match[1], note: match[2].split(", ").join(" · ") } : { name: item, note: "" };
}

// Full toolkit as three marquee rows; groups stay contiguous so each row reads as a theme.
const tools = skillGroups.flatMap((g) => g.items.map((item) => ({ ...splitNote(item), group: g.group, key: item })));
const perRow = Math.ceil(tools.length / 3);
const toolkitRows = [0, 1, 2].map((r) => tools.slice(r * perRow, (r + 1) * perRow));

function openCaseStudy(slug: string) {
  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(new CustomEvent("open-case-study", { detail: slug }));
}

function Detail({ layer, tech, index }: { layer: StackLayer; tech: StackTech; index: number }) {
  const project = tech.project ? caseStudies.find((c) => c.slug === tech.project) : undefined;
  return (
    <div key={tech.name} className="eng-detail-in panel glass relative overflow-hidden p-6 md:p-7" aria-live="polite">
      <div aria-hidden className="bg-grid grid-fade pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-line bg-sunken text-foreground dark:shadow-[var(--glow)]">
            <TechLogo name={tech.name} size={30} />
          </div>
          <div className="min-w-0">
            <div className="eyebrow">
              <span className="text-accent">L{index + 1}</span> · {layer.name}
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{tech.name}</h3>
          </div>
        </div>

        <p className="mt-6 text-[15px] leading-relaxed text-muted">{tech.detail}</p>

        <div className="eyebrow mt-7">Where it&apos;s used</div>
        {tech.usedIn.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {tech.usedIn.map((u) => (
              <li key={u} className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 px-3 py-2.5 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-accent dark:shadow-[var(--glow)]" aria-hidden />
                {u}
              </li>
            ))}
          </ul>
        ) : (
          <div className="placeholder mt-3">Listed skill — no linked project yet</div>
        )}

        {project && (
          <button type="button" onClick={() => openCaseStudy(project.slug)} className="btn btn-ghost group mt-7 w-full justify-between sm:w-auto">
            Open {project.title} case study
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function Engineering() {
  const [selected, setSelected] = useState({ layer: "intelligence", tech: "RAG" });
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const [pinnedGroup, setPinnedGroup] = useState<string | null>(null);
  const focusGroup = hoverGroup ?? pinnedGroup;
  const innerRef = useRef<HTMLDivElement>(null);

  const layerIndex = stackLayers.findIndex((l) => l.id === selected.layer);
  const activeLayer = stackLayers[layerIndex];
  const activeTech = activeLayer.techs.find((t) => t.name === selected.tech) ?? activeLayer.techs[0];

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = innerRef.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * 5}deg`);
    el.style.setProperty("--rx", `${-y * 4}deg`);
  };
  const onLeave = () => {
    innerRef.current?.style.setProperty("--ry", "0deg");
    innerRef.current?.style.setProperty("--rx", "0deg");
  };

  return (
    <section id="system" className="relative border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
        <SectionHeading index="04" eyebrow="Skills · How I build" title="How I build">
          Not a list of logos — a system. Each layer calls the one below it. Select a component to see where it runs in real work.
        </SectionHeading>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="eng-stack lg:col-span-7" onPointerMove={onMove} onPointerLeave={onLeave}>
            <div ref={innerRef} className="eng-stack-inner">
              {stackLayers.map((layer, i) => {
                const active = layer.id === selected.layer;
                return (
                  <Fragment key={layer.id}>
                    {i > 0 && (
                      <div aria-hidden className="relative h-9">
                        {[0.18, 0.82].map((x) => (
                          <svg key={x} className="absolute top-0 h-full w-3 -translate-x-1/2" style={{ left: `${x * 100}%` }} viewBox="0 0 12 36" preserveAspectRatio="none">
                            <line x1="6" y1="0" x2="6" y2="36" stroke="var(--accent)" strokeOpacity={active || stackLayers[i - 1].id === selected.layer ? 0.7 : 0.3} strokeWidth="1.2" className="flow-dash" />
                          </svg>
                        ))}
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                          ↓ calls
                        </span>
                      </div>
                    )}
                    <div data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
                      <div
                        data-active={active}
                        className="eng-layer panel glass spotlight"
                        style={{ "--z": `${(stackLayers.length - i) * 8}px` } as React.CSSProperties}
                      >
                        <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:gap-6">
                          <div className="shrink-0 md:w-40">
                            <div className="eyebrow">
                              <span className="text-accent">L{i + 1}</span> · {layer.techs.length} parts
                            </div>
                            <div className="mt-2 text-lg font-semibold tracking-tight">{layer.name}</div>
                            <div className="text-[13px] leading-snug text-muted">{layer.role}</div>
                          </div>
                          <div className="flex flex-wrap gap-2" role="group" aria-label={`${layer.name} technologies`}>
                            {layer.techs.map((tech) => {
                              const pressed = active && tech.name === activeTech.name;
                              return (
                                <button
                                  key={tech.name}
                                  type="button"
                                  aria-pressed={pressed}
                                  onClick={() => setSelected({ layer: layer.id, tech: tech.name })}
                                  className="eng-tile"
                                >
                                  <span className="eng-logo">
                                    <TechLogo name={tech.name} size={15} />
                                  </span>
                                  {tech.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    {active && (
                      <div className="mt-4 lg:hidden">
                        <Detail layer={activeLayer} tech={activeTech} index={layerIndex} />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28">
              <Detail layer={activeLayer} tech={activeTech} index={layerIndex} />
              <p className="mt-4 px-1 font-mono text-[11px] leading-relaxed text-subtle">
                Mapped from résumé experience and projects. Listed skills without a linked project are marked as such.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <div data-reveal className="eyebrow flex items-center gap-3">
            <span>Full toolkit</span>
            <span className="h-px flex-1 bg-line" aria-hidden />
            <span>{tools.length} tools · and counting</span>
          </div>
          <div data-reveal className="tk panel relative mt-6 overflow-hidden" data-focus={focusGroup ? "" : undefined}>
            <div aria-hidden className="bg-grid grid-fade pointer-events-none absolute inset-0 opacity-40" />
            <div className="tk-rows relative py-6 md:py-8">
              {toolkitRows.map((row, r) => (
                <div key={r} className="tk-row" style={{ "--dur": `${row.length * 4.2}s`, "--dir": r % 2 ? "reverse" : "normal" } as React.CSSProperties}>
                  {[0, 1].map((copy) => (
                    <ul key={copy} className="tk-track" aria-hidden={copy === 1 || undefined}>
                      {row.map((t) => (
                        <li key={t.key} className="logo-tile tk-tile" data-match={focusGroup === t.group || undefined}>
                          <LogoMark name={t.name} size={16} />
                          <span className="logo-name">
                            {t.name}
                            {t.note && <span className="logo-note">{t.note}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              ))}
            </div>

            <div className="relative flex flex-col gap-4 border-t border-line p-5 md:flex-row md:items-center md:justify-between md:px-7">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Highlight a toolkit group">
                {skillGroups.map((g) => (
                  <button
                    key={g.group}
                    type="button"
                    aria-pressed={pinnedGroup === g.group}
                    data-match={focusGroup === g.group || undefined}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setHoverGroup(g.group)}
                    onPointerLeave={() => setHoverGroup(null)}
                    onFocus={() => setHoverGroup(g.group)}
                    onBlur={() => setHoverGroup(null)}
                    onClick={() => setPinnedGroup((p) => (p === g.group ? null : g.group))}
                    className="chip tk-chip"
                  >
                    {g.group}
                    <span className="text-subtle">{String(g.items.length).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
              <p key={focusGroup ?? "all"} className="tk-caption shrink-0 font-mono text-[11px] text-subtle">
                {focusGroup ? toolkitCaptions[focusGroup] : "Pick a group to light it up"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
