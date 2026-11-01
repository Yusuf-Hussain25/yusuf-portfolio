"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Close } from "@/components/ui/icons";

export type GalleryShot = { src: string; alt: string; w: number; h: number };

/** Desktop screens in a grid, phones in a row; click any screen to open it full size. */
export function Gallery({ screens, phones }: { screens: GalleryShot[]; phones: GalleryShot[] }) {
  const all = [...screens, ...phones];
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const show = useCallback((i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  }, []);
  const close = useCallback(() => dialog.current?.close(), []);
  const step = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + all.length) % all.length)), [all.length]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClose = () => setOpen(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    el.addEventListener("close", onClose);
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("close", onClose);
      el.removeEventListener("keydown", onKey);
    };
  }, [step]);

  const current = open === null ? null : all[open];

  return (
    <>
      <div className="grid gap-3">
        {screens.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {screens.map((s, i) => (
              <figure key={s.src} className={`panel overflow-hidden p-1.5 ${i === 0 && screens.length % 2 === 1 ? "sm:col-span-2" : ""}`}>
                <button type="button" onClick={() => show(i)} className="block w-full cursor-zoom-in" aria-label={`Open screenshot: ${s.alt}`}>
                  <Image
                    src={s.src}
                    alt={s.alt}
                    width={s.w}
                    height={s.h}
                    sizes={i === 0 ? "(min-width: 1152px) 880px, 92vw" : "(min-width: 1152px) 440px, (min-width: 640px) 46vw, 92vw"}
                    className="h-auto w-full rounded-[14px] transition-transform duration-500 hover:scale-[1.01]"
                  />
                </button>
                <figcaption className="px-2.5 pb-1.5 pt-2.5 font-mono text-[11px] text-subtle">{s.alt}</figcaption>
              </figure>
            ))}
          </div>
        )}
        {phones.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {phones.map((s, i) => (
              <figure key={s.src} className="panel overflow-hidden p-1.5">
                <button type="button" onClick={() => show(screens.length + i)} className="block w-full cursor-zoom-in" aria-label={`Open screenshot: ${s.alt}`}>
                  <Image src={s.src} alt={s.alt} width={s.w} height={s.h} sizes="(min-width: 1024px) 220px, 45vw" className="h-auto w-full rounded-[18px]" />
                </button>
                <figcaption className="px-2 pb-1 pt-2.5 font-mono text-[11px] text-subtle">{s.alt}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      <dialog
        ref={dialog}
        aria-label="Screenshot viewer"
        className="gallery-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {current && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 md:p-10" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="relative min-h-0 w-full flex-1">
              <Image key={current.src} src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex w-full max-w-3xl items-center gap-3">
              <button type="button" onClick={() => step(-1)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10" aria-label="Previous screenshot">
                <ArrowRight className="rotate-180" />
              </button>
              <p className="min-w-0 flex-1 text-center text-sm text-white/80">
                <span className="mr-2 font-mono text-[11px] text-white/50">
                  {(open ?? 0) + 1}/{all.length}
                </span>
                {current.alt}
              </p>
              <button type="button" onClick={() => step(1)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10" aria-label="Next screenshot">
                <ArrowRight />
              </button>
              <button type="button" onClick={close} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-black" aria-label="Close viewer" autoFocus>
                <Close />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
