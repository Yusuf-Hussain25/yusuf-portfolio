"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Close, Menu } from "@/components/ui/icons";
import { navItems } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The menu remembers which page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean) => setOpenOn(next ? pathname : null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 md:top-4">
      <nav
        aria-label="Primary"
        className={`glass relative flex h-12 w-full max-w-4xl items-center gap-1 rounded-full pl-2 pr-1.5 transition-shadow duration-500 ${scrolled ? "shadow-[var(--shadow-panel)]" : ""}`}
      >
        <Link
          href="/"
          onClick={(e) => {
            // Already on the home page: a link to "/" wouldn't move, so glide back to the top.
            if (pathname !== "/") return;
            e.preventDefault();
            setOpenOn(null);
            if (window.location.hash) history.replaceState(null, "", "/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-[15px] font-semibold tracking-tight text-background"
          aria-label="Home"
        >
          Y
        </Link>

        <ul className="mx-auto hidden items-center lg:flex">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative block rounded-full px-3 py-2 font-mono text-[11.5px] uppercase tracking-[0.1em] transition-colors ${active ? "text-foreground" : "text-muted hover:text-foreground"}`}
                >
                  {active && <span className="absolute inset-0 -z-10 rounded-full bg-sunken" aria-hidden />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link href="/contact" className="btn btn-primary mr-0.5 h-9 px-4 text-[13px]">
            Hire me
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-sunken hover:text-foreground lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`absolute inset-x-0 top-[calc(100%+8px)] origin-top rounded-3xl border border-line bg-surface p-2 shadow-[var(--shadow-lift)] transition-all duration-300 lg:hidden ${open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"}`}
        >
          <ul className="grid">
            {[{ href: "/", label: "Home" }, ...navItems].map((item) => {
              const active = item.href === "/" ? pathname === "/" : isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      setOpen(false);
                      if (item.href === "/" && pathname === "/") {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-12 items-center justify-between rounded-2xl px-4 text-[15px] ${active ? "bg-sunken text-foreground" : "text-muted"}`}
                  >
                    {item.label}
                    <span className="font-mono text-[11px] text-subtle">↘</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
