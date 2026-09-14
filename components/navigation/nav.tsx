"use client";

import { useEffect, useState } from "react";
import { Close, Menu } from "@/components/ui/icons";
import { ThemeToggle } from "./theme-toggle";

const items = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "system", label: "Skills" },
  { id: "about", label: "About" },
  { id: "ask", label: "Ask Yusuf" },
  { id: "lab", label: "AI Lab" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setScrolled(y > 24);
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 240);
          last = y;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ["top", ...items.map((i) => i.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 transition-transform duration-500 md:top-4"
      style={{ transform: hidden && !open ? "translate3d(0,-140%,0)" : "none", transitionTimingFunction: "var(--ease-out)" }}
    >
      <nav
        aria-label="Primary"
        className={`glass relative flex h-12 w-full max-w-4xl items-center gap-1 rounded-full pl-2 pr-1.5 transition-shadow duration-500 ${scrolled ? "shadow-[var(--shadow-panel)]" : ""}`}
      >
        <a href="#top" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-[15px] font-semibold tracking-tight text-background" aria-label="Back to top">
          Y
        </a>

        <ul className="mx-auto hidden items-center lg:flex">
          {items.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative block rounded-full px-3 py-2 font-mono text-[11.5px] uppercase tracking-[0.1em] transition-colors ${isActive ? "text-foreground" : "text-muted hover:text-foreground"}`}
                >
                  {isActive && <span className="absolute inset-0 -z-10 rounded-full bg-sunken" aria-hidden />}
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <a href="#contact" className="btn btn-primary mr-0.5 h-9 px-4 text-[13px]">
            Hire me
          </a>
          <ThemeToggle />
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-sunken hover:text-foreground lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`absolute inset-x-0 top-[calc(100%+8px)] origin-top rounded-3xl border border-line bg-surface p-2 shadow-[var(--shadow-lift)] transition-all duration-300 lg:hidden ${open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"}`}
        >
          <ul className="grid">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className={`flex h-12 items-center justify-between rounded-2xl px-4 text-[15px] ${active === item.id ? "bg-sunken text-foreground" : "text-muted"}`}
                >
                  {item.label}
                  <span className="font-mono text-[11px] text-subtle">↘</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
