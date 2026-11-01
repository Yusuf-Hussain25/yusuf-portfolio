"use client";

import { useState, type CSSProperties } from "react";
import { areaOf, personal, professional, type Entry } from "@/lib/content/catalog";
import { ProjectCard } from "./project-card";

const filters = [
  { id: "all", label: "All" },
  { id: "professional", label: "Professional" },
  { id: "personal", label: "Personal" },
  { id: "ai", label: "AI" },
  { id: "full-stack", label: "Full-stack" },
] as const;

type Filter = (typeof filters)[number]["id"];

const match = (f: Filter) => (e: Entry) => (f === "ai" ? areaOf(e) === "AI" : f === "full-stack" ? areaOf(e) === "Full-stack" : true);

function Group({ id, index, title, blurb, items }: { id: string; index: string; title: string; blurb: string; items: Entry[] }) {
  if (items.length === 0) return null;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
      <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="eyebrow flex items-center gap-3">
            <span className="text-accent">{index}</span>
            <span className="h-px w-8 bg-line-strong" aria-hidden />
            <span>{items.length} projects</span>
          </div>
          <h2 id={`${id}-title`} className="display mt-4 text-[clamp(2rem,4.5vw,3.25rem)]">
            {title}
          </h2>
        </div>
        <p className="max-w-md leading-relaxed text-muted text-pretty">{blurb}</p>
      </div>
      <div className="pc-grid grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((entry, i) => (
          <ProjectCard key={entry.slug} entry={entry} layout="tall" delay={(i % 3) * 90} />
        ))}
      </div>
    </section>
  );
}

export function ProjectBrowser() {
  const [filter, setFilter] = useState<Filter>("all");
  const showPersonal = filter !== "professional";
  const showProfessional = filter !== "personal";
  const personalItems = showPersonal ? personal.filter(match(filter)) : [];
  const professionalItems = showProfessional ? professional.filter(match(filter)) : [];

  return (
    <>
      <div role="group" aria-label="Filter projects" className="mb-14 flex flex-wrap gap-2">
        {filters.map((f, i) => {
          const active = filter === f.id;
          const count =
            f.id === "all"
              ? personal.length + professional.length
              : f.id === "professional"
                ? professional.length
                : f.id === "personal"
                  ? personal.length
                  : [...personal, ...professional].filter(match(f.id)).length;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              data-reveal
              style={{ "--d": `${i * 40}ms` } as CSSProperties}
              className={`chip h-10 gap-2 px-4 text-[12px] transition-colors ${active ? "border-transparent bg-foreground text-background" : "hover:border-line-strong hover:text-foreground"}`}
            >
              {f.label}
              <span className={`tabular-nums ${active ? "opacity-70" : "text-subtle"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-24 md:gap-32">
        <Group
          id="personal"
          index="A"
          title="Personal projects"
          blurb="Products I designed, built and shipped on my own, from AI assistants to full-stack apps. Each page explains why I built it, the decisions I made and what I learned."
          items={personalItems}
        />
        <Group
          id="professional"
          index="B"
          title="Professional work"
          blurb="Work done for clients and employers: production AI pipelines and live products used every day."
          items={professionalItems}
        />
      </div>
    </>
  );
}
