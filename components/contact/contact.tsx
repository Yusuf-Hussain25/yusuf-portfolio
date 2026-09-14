import type { CSSProperties } from "react";
import { profile } from "@/lib/content/profile";
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, WhatsApp } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/magnetic";
import { CopyEmail } from "./copy-email";
import "./contact.css";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const hireMail = `mailto:${profile.email}?subject=${encodeURIComponent("Hiring enquiry — AI engineer role")}`;
const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const links = [
  { label: "WhatsApp", href: `https://wa.me/${profile.whatsapp}`, sub: profile.phone, icon: <WhatsApp /> },
  { label: "LinkedIn", href: profile.links.linkedin, sub: handle(profile.links.linkedin), icon: <Linkedin /> },
  { label: "GitHub", href: profile.links.github, sub: handle(profile.links.github), icon: <Github /> },
];

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-line">
      <div aria-hidden className="bg-grid grid-fade absolute inset-0 opacity-60" />
      <div aria-hidden className="ct-glow pointer-events-none absolute" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-28 md:px-8 md:py-36 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-7">
          <div data-reveal className="eyebrow flex items-center gap-3">
            <span className="text-accent">08</span>
            <span className="h-px w-8 bg-line-strong" aria-hidden />
            <span>Contact</span>
          </div>
          <div data-reveal style={delay(40)} className="chip glass mt-8 gap-2.5 text-foreground">
            <span className="status-dot" aria-hidden />
            Available for AI engineering roles
          </div>
          <h2 data-reveal style={delay(80)} className="display mt-6 text-[clamp(3rem,7.4vw,6.5rem)]">
            Let&apos;s build something <span className="accent-text">intelligent.</span>
          </h2>
          <p data-reveal style={delay(160)} className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
            I&apos;m interested in building useful products at the intersection of software engineering and AI.
          </p>
          <div data-reveal style={delay(240)} className="mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <a href={hireMail} className="btn btn-primary group h-14 px-7 text-[15px]">
                <Mail /> Hire me <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#ask" className="btn btn-ghost h-14 px-7 text-[15px]">
                Ask my AI first
              </a>
            </Magnetic>
          </div>
        </div>

        <div data-reveal style={delay(200)} className="lg:col-span-5">
          <div className="ct-card panel glass beam relative p-6 md:p-8">
            <div className="eyebrow flex items-center justify-between gap-3">
              <span>Direct line</span>
              <span className="text-accent">Email · WhatsApp · LinkedIn</span>
            </div>

            <div className="mt-7 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">Email</div>
            <CopyEmail email={profile.email} />

            <ul className="mt-7 grid gap-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="ct-link">
                    <span className="ct-link-icon">{l.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium">{l.label}</span>
                      <span className="block truncate font-mono text-[11px] text-subtle">{l.sub}</span>
                    </span>
                    <ArrowUpRight className="ct-link-arrow" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 border-t border-line px-5 py-8 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle md:px-8">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <a href="#top" className="transition-colors hover:text-foreground">
          Back to top ↑
        </a>
      </footer>
    </section>
  );
}
