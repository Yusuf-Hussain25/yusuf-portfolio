import type { CSSProperties, ReactNode } from "react";

export function SectionHeading({
  index,
  eyebrow,
  title,
  children,
  align = "left",
  eager = false,
  as: Heading = "h2",
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  /** Fade in on page load instead of on scroll (for headings right under the hero). */
  eager?: boolean;
  /** "h1" when the section is the page itself (one H1 per page for SEO). */
  as?: "h1" | "h2";
}) {
  const center = align === "center";
  // Scroll reveal by default; "fade-up" plays on load.
  const reveal = (ms: number) =>
    eager
      ? { className: "fade-up", style: { "--d": `${ms}ms` } as CSSProperties }
      : { className: "", style: { "--d": `${ms}ms` } as CSSProperties, "data-reveal": "" };
  const eyebrowAnim = reveal(0);
  const titleAnim = reveal(80);
  const bodyAnim = reveal(160);
  return (
    <header className={`mb-12 md:mb-16 ${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      <div {...eyebrowAnim} className={`${eyebrowAnim.className} eyebrow flex items-center gap-3 ${center ? "justify-center" : ""}`}>
        <span className="text-accent">{index}</span>
        <span className="h-px w-8 bg-line-strong" aria-hidden />
        <span>{eyebrow}</span>
      </div>
      <Heading {...titleAnim} className={`${titleAnim.className} display mt-5 text-[clamp(2.5rem,6.5vw,5.25rem)]`}>
        {title}
      </Heading>
      {children && (
        <p {...bodyAnim} className={`${bodyAnim.className} mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty ${center ? "mx-auto" : ""}`}>
          {children}
        </p>
      )}
    </header>
  );
}
