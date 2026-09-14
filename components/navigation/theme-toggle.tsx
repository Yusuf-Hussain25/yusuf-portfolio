"use client";

import { useEffect, useLayoutEffect } from "react";
import { applyTheme } from "@/lib/hooks";
import { Moon, Sun } from "@/components/ui/icons";

export function ThemeToggle() {
  // Strict Mode's dev remount resets <html> to its JSX attributes, dropping what the
  // inline theme script set. Re-apply before paint; a no-op in production.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");
    if (root.dataset.theme) return;
    let theme: string | null = null;
    try {
      theme = localStorage.getItem("theme");
    } catch {}
    if (theme !== "light" && theme !== "dark") theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, []);

  // follow system changes until the visitor picks a theme explicitly
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      try {
        if (!localStorage.getItem("theme")) {
          document.documentElement.dataset.theme = mq.matches ? "dark" : "light";
        }
      } catch {}
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    const r = e.currentTarget.getBoundingClientRect();
    applyTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      className="relative grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-foreground"
    >
      <Sun className="absolute h-[17px] w-[17px] rotate-0 scale-100 opacity-100 transition-all duration-500 dark:-rotate-90 dark:scale-50 dark:opacity-0" />
      <Moon className="absolute h-[16px] w-[16px] rotate-90 scale-50 opacity-0 transition-all duration-500 dark:rotate-0 dark:scale-100 dark:opacity-100" />
    </button>
  );
}
