import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";

const doors = [
  { href: "/experience", n: "02", label: "Experience", sub: "Where I've worked, what I owned and the numbers behind it." },
  { href: "/skills", n: "03", label: "Skills", sub: "The stack I build with, layer by layer, linked to real projects." },
  { href: "/about", n: "04", label: "About", sub: "My story, education, certifications and the award." },
  { href: "/ai-lab", n: "05", label: "AI Lab", sub: "Ask my AI anything, or play with four live AI experiments." },
];

/** Home page: one door per page. */
export function Explore() {
  return (
    <section className="relative border-t border-line">
      <div aria-hidden className="bg-grid grid-fade absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
        <SectionHeading
          index="03"
          eyebrow="Explore"
          title={
            <>
              More about <span className="text-muted">me.</span>
            </>
          }
        />

        <div className="grid gap-3 md:grid-cols-2">
          {doors.map((d, i) => (
            <Link
              key={d.href}
              href={d.href}
              data-reveal
              style={{ "--d": `${i * 70}ms` } as CSSProperties}
              className="panel spotlight group flex items-center justify-between gap-6 p-6 md:p-8"
            >
              <span>
                <span className="eyebrow">
                  <span className="text-accent">{d.n}</span> · {d.label}
                </span>
                <span className="mt-3 block text-[17px] leading-relaxed text-muted text-pretty">{d.sub}</span>
              </span>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500 group-hover:translate-x-1 group-hover:border-line-strong">
                <ArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
