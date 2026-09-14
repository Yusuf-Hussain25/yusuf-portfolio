/**
 * An inline script that runs during HTML parsing (before first paint) without React's
 * "script tag while rendering" warning: `text/javascript` on the server, `text/plain`
 * on the client, with the type mismatch suppressed. See the Next.js guide
 * "How to prevent flash before hydration".
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
