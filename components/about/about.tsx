import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import { about, award, certifications, education, profile, story } from "@/lib/content/profile";
import { HeadingGlyph, JourneyArt, type GlyphKind } from "./journey-art";
import { LogoMark } from "@/components/engineering/tech-logo";
import { ArrowRight, ArrowUpRight, Linkedin, Trophy } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/magnetic";
import portrait from "@/public/images/yusuf-portrait.jpg";
import trophy from "@/public/images/yusuf-award-trophy.jpg";
import "./about.css";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

// Numbers from the résumé (see story chapters and certifications).
const stats = [
  { value: education.grade, suffix: ` / ${education.scale}`, label: "CGPA" },
  { value: "5,000+", suffix: "", label: "Daily transactions" },
  { value: "100+", suffix: "", label: "DSA problems" },
];

// "A tier-3 college, a laptop, and a habit of shipping." → one drawn icon per phrase.
const taglineIcons: GlyphKind[] = ["college", "laptop", "ship"];
const taglineParts = story.tagline.replace(/\.$/, "").split(", ");

export function About() {
  const lastChapter = story.chapters.length - 1;
  return (
    <section id="about" className="relative overflow-hidden border-t border-line">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 h-[32rem] w-[32rem] rounded-full bg-accent-muted opacity-70 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-[55%] h-[28rem] w-[28rem] rounded-full bg-accent-muted opacity-50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
        {/* ── Intro: portrait + who I am ── */}
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="relative mx-auto w-full max-w-[720px] lg:col-span-7 lg:max-w-none">
            <figure data-reveal className="ab-portrait group">
              <div className="ab-portrait-frame">
                <Image
                  src={portrait}
                  alt="Yusuf Hussain at his desk, reading code on his monitor"
                  placeholder="blur"
                  fill
                  sizes="(min-width: 1024px) 700px, 92vw"
                  className="ab-portrait-img object-cover object-center"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-transparent" />
                <figcaption className="absolute inset-x-6 bottom-6 text-white">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/70">{profile.name}</div>
                  <div className="mt-1.5 text-xl font-semibold tracking-tight">AI Full-Stack Engineer</div>
                </figcaption>
              </div>

              <div className="ab-float glass left-3 top-8 sm:-left-6" style={{ "--f": "0s" } as CSSProperties}>
                <span className="status-dot" aria-hidden />
                Project lead · {award.org}
              </div>
              <div className="ab-float glass -right-2 bottom-28 sm:-right-8" style={{ "--f": "-3s" } as CSSProperties}>
                <Trophy className="h-4 w-4 text-accent" />
                Best Employee 2026
              </div>
            </figure>
          </div>

          <div className="lg:col-span-5">
            <div data-reveal className="eyebrow flex items-center gap-3">
              <span className="text-accent">05</span>
              <span className="h-px w-8 bg-line-strong" aria-hidden />
              <span>About</span>
            </div>
            <h2 data-reveal style={delay(80)} className="display mt-5 text-[clamp(2.5rem,4.2vw,3.6rem)]">
              {about.title} <span className="text-subtle">{about.subtitle}</span>
            </h2>
            <div data-reveal style={delay(160)} className="mt-7 max-w-2xl space-y-4 text-[16.5px] leading-relaxed text-muted">
              {about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <dl data-reveal style={delay(220)} className="mt-9 grid max-w-xl grid-cols-3 gap-2.5 sm:gap-3">
              {stats.map((s) => (
                <div key={s.label} className="panel spotlight flex flex-col-reverse px-4 py-3.5">
                  <dt className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-subtle">{s.label}</dt>
                  <dd className="text-[1.6rem] font-semibold leading-none tracking-tight sm:text-3xl">
                    {s.value}
                    {s.suffix && <span className="text-base text-subtle">{s.suffix}</span>}
                  </dd>
                </div>
              ))}
            </dl>

            <div data-reveal style={delay(280)} className="mt-10 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a href="#contact" className="btn btn-primary group h-12 px-6">
                  Hire me <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </a>
              </Magnetic>
              <Magnetic>
                <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-12 px-6">
                  <Linkedin /> LinkedIn <ArrowUpRight className="text-subtle" />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* ── Recognition: the trophy gets the stage ── */}
        <div data-reveal className="ab-award panel mt-24 grid overflow-hidden md:mt-32 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <a
            href={award.href}
            target="_blank"
            rel="noopener noreferrer"
            className="ab-trophy group relative block min-h-[420px] overflow-hidden md:min-h-[540px]"
            aria-label={`${award.title} — view the LinkedIn post`}
          >
            <Image
              src={trophy}
              alt="Freedom With AI trophy engraved with Yusuf Hussain's name"
              placeholder="blur"
              fill
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover object-[center_30%] transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
            />
            <span aria-hidden className="ab-sheen" />
            <span className="chip glass absolute left-4 top-4 gap-2">
              <Trophy className="h-3.5 w-3.5 text-accent" /> 2026
            </span>
          </a>

          <div className="relative flex flex-col justify-center p-7 md:p-12 lg:p-16">
            <div aria-hidden className="bg-grid grid-fade pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <div className="eyebrow flex items-center gap-3">
                <span className="text-accent">Recognition</span>
                <span className="h-px w-8 bg-line-strong" aria-hidden />
                <span>{award.org}</span>
              </div>
              <h3 className="display mt-5 text-[clamp(2.1rem,4.2vw,3.5rem)]">
                Best Employee <span className="text-subtle">of the Year 2026.</span>
              </h3>
              <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-muted">{award.summary}</p>
              <blockquote className="ab-quote mt-9 text-2xl font-semibold tracking-tight md:text-[1.9rem]">“{award.quote}”</blockquote>
              <a
                href={award.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-9 inline-flex items-center gap-2 text-sm font-medium text-accent"
              >
                Read the LinkedIn post
                <ArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Journey ── */}
        <div className="mt-24 md:mt-32">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div data-reveal className="eyebrow flex items-center gap-3">
                <span className="text-accent">Journey</span>
                <span className="h-px w-8 bg-line-strong" aria-hidden />
                <span>2021 — now</span>
              </div>
              <h3 data-reveal style={delay(80)} className="display mt-5 max-w-3xl text-[clamp(2rem,4.4vw,3.5rem)] text-balance">
                {taglineParts.map((part, i) => {
                  const cut = part.lastIndexOf(" ") + 1;
                  const icon = taglineIcons[i];
                  return (
                    <Fragment key={part}>
                      {i > 0 && ", "}
                      {part.slice(0, cut)}
                      <span className="whitespace-nowrap">
                        {part.slice(cut)}
                        {icon && <HeadingGlyph kind={icon} order={i} />}
                      </span>
                    </Fragment>
                  );
                })}
              </h3>
            </div>
            <p data-reveal style={delay(160)} className="max-w-sm leading-relaxed text-muted text-pretty">
              {story.intro}
            </p>
          </div>

          <ol data-reveal className="ab-journey relative mt-12 grid gap-4 lg:grid-cols-5 lg:gap-4" aria-label="Journey">
            <span aria-hidden className="ab-rail">
              <span className="ab-rail-fill" />
            </span>
            {story.chapters.map((c, i) => (
              <li key={c.id} className="ab-step" data-last={i === lastChapter || undefined} style={{ "--i": i } as CSSProperties}>
                <span className="ab-node" aria-hidden>
                  <span />
                </span>
                <div className="ab-card panel spotlight p-5">
                  <JourneyArt id={c.id} />
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-accent">{c.year}</div>
                  <div className="mt-2 font-semibold leading-snug tracking-tight">{c.title}</div>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">{c.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Education + practice ── */}
        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div data-reveal className="panel spotlight flex flex-col p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="eyebrow">Education</div>
              <span className="chip">{education.period}</span>
            </div>
            <div className="mb-6 mt-5 flex items-start gap-3.5">
              <LogoMark name="Education" size={20} className="h-11 w-11 rounded-xl" />
              <div className="min-w-0">
                <div className="font-semibold leading-snug tracking-tight">{education.degree}</div>
                <div className="mt-1 text-[14px] text-muted">
                  {education.school}, {education.city}
                </div>
              </div>
            </div>
            <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-4">
              <div className="eyebrow">CGPA</div>
              <div className="font-semibold tracking-tight">
                <span className="text-[1.9rem] leading-none text-accent">{education.grade}</span>
                <span className="text-subtle"> / {education.scale}</span>
              </div>
            </div>
          </div>

          <div data-reveal style={delay(80)} className="panel p-5 md:p-6">
            <div className="eyebrow">Certifications &amp; practice</div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {certifications.map((c) => (
                <li key={c.title} className="logo-tile">
                  <LogoMark name={c.logo} size={15} />
                  <span className="logo-name">
                    {c.title}
                    <span className="logo-note">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
