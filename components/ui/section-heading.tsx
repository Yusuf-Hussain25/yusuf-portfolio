import type { ReactNode } from "react";

export function SectionHeading({
  index,
  eyebrow,
  title,
  children,
  align = "left",
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  const center = align === "center";
  return (
    <header className={`mb-12 md:mb-16 ${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      <div data-reveal className={`eyebrow flex items-center gap-3 ${center ? "justify-center" : ""}`}>
        <span className="text-accent">{index}</span>
        <span className="h-px w-8 bg-line-strong" aria-hidden />
        <span>{eyebrow}</span>
      </div>
      <h2 data-reveal style={{ "--d": "80ms" } as React.CSSProperties} className="display mt-5 text-[clamp(2.5rem,6.5vw,5.25rem)]">
        {title}
      </h2>
      {children && (
        <p data-reveal style={{ "--d": "160ms" } as React.CSSProperties} className={`mt-6 text-lg leading-relaxed text-muted text-pretty ${center ? "mx-auto" : ""} max-w-2xl`}>
          {children}
        </p>
      )}
    </header>
  );
}
