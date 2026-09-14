"use client";

import { useRef, type ReactNode } from "react";

/** Subtle magnetic pull toward the cursor on fine pointers. */
export function Magnetic({ children, strength = 0.28, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transition = "transform 0.15s linear";
    el.style.transform = `translate3d(${dx * strength}px, ${dy * strength * 1.2}px, 0)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <span ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`inline-flex will-change-transform ${className}`}>
      {children}
    </span>
  );
}
