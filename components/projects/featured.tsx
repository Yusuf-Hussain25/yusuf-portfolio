import Link from "next/link";
import type { CSSProperties } from "react";
import { featured, personal, professional } from "@/lib/content/catalog";
import { ArrowRight } from "@/components/ui/icons";
import { ProjectCard } from "./project-card";
import "./case-studies.css";
import "./project-showcase.css";

/** Home page, right under the hero: the top projects as cards, visible on first load. */
export function Featured() {
  return (
    <section id="work" className="relative">
      <div className="mx-auto max-w-7xl px-5 pb-28 md:px-8 md:pb-36">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
          <div>
            <div className="eyebrow flex items-center gap-3">
              <span className="text-accent">02</span>
              <span className="h-px w-8 bg-line-strong" aria-hidden />
              <span>Top projects</span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] md:text-3xl">Things I&apos;ve built</h2>
          </div>
          <Link href="/projects" className="btn btn-ghost group h-10 px-4 text-[13px]">
            All {personal.length + professional.length} projects
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="pc-grid grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((entry, i) => (
            <ProjectCard key={entry.slug} entry={entry} layout="tall" delay={(i % 3) * 90} />
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            { href: "/projects#personal", label: "Personal projects", count: personal.length, sub: "AI products and full-stack apps I built on my own" },
            { href: "/projects#professional", label: "Professional work", count: professional.length, sub: "Client and employer work: AI pipelines and live products" },
          ].map((d, i) => (
            <Link
              key={d.href}
              href={d.href}
              data-reveal
              style={{ "--d": `${i * 90}ms` } as CSSProperties}
              className="panel spotlight group flex items-center justify-between gap-6 p-6 md:p-7"
            >
              <span>
                <span className="eyebrow">
                  <span className="text-accent">{String(d.count).padStart(2, "0")}</span> projects
                </span>
                <span className="mt-2 block text-xl font-semibold tracking-[-0.02em] md:text-2xl">{d.label}</span>
                <span className="mt-1 block text-[15px] text-muted">{d.sub}</span>
              </span>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500 group-hover:translate-x-1 group-hover:border-line-strong">
                <ArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
