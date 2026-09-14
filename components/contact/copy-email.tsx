"use client";

import { useEffect, useState } from "react";
import { Check } from "@/components/ui/icons";

/** The email address as a mailto link, with a one-tap copy button. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="mt-2 flex items-center gap-3">
      <a href={`mailto:${email}`} className="min-w-0 flex-1 truncate text-xl font-semibold tracking-tight transition-colors hover:text-accent md:text-[1.6rem]">
        {email}
      </a>
      <button type="button" onClick={copy} className="chip ct-copy shrink-0" aria-live="polite">
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-success" /> Copied
          </>
        ) : (
          "Copy"
        )}
      </button>
    </div>
  );
}
