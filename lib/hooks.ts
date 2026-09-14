"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

/** Current theme; `null` during server render. */
export function useTheme(): Theme | null {
  return useSyncExternalStore(
    subscribeTheme,
    () => (document.documentElement.dataset.theme === "light" ? "light" : "dark"),
    () => null,
  );
}

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = subscribeMedia(reducedQuery);

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => false);
}

export function applyTheme(next: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const commit = () => {
    root.dataset.theme = next;
    root.style.colorScheme = next;
  };
  try {
    localStorage.setItem("theme", next);
  } catch {}

  const reduce = window.matchMedia(reducedQuery).matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

  if (!reduce && origin && doc.startViewTransition) {
    const vt = doc.startViewTransition(commit);
    vt.ready
      .then(() => {
        const r = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
        root.animate(
          { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${r}px at ${origin.x}px ${origin.y}px)`] },
          { duration: 500, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      // A skipped transition (another one started, tab hidden, invalid state) still runs
      // `commit`, so the theme applies — only the circular reveal is lost.
      .catch(() => {});
    return;
  }
  root.classList.add("theme-transition");
  commit();
  window.setTimeout(() => root.classList.remove("theme-transition"), 480);
}
