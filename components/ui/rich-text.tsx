import { Fragment, type ReactNode } from "react";

// Minimal, safe markdown subset: paragraphs, "- " / "1. " lists, **bold**, *italic*.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^(\s*[-•]\s|\s*\d+\.\s)/.test(l) || !l.trim());
        if (isList) {
          const ordered = /^\s*\d+\./.test(lines[0]);
          const Tag = ordered ? "ol" : "ul";
          return (
            <Tag key={bi} className="space-y-1.5">
              {lines.filter((l) => l.trim()).map((l, li) => (
                <li key={li} className="flex gap-2.5">
                  <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span>{inline(l.replace(/^\s*([-•]|\d+\.)\s/, ""))}</span>
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
