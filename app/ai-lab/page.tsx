import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { AILab } from "@/components/ai-lab/ai-lab";
import { AskYusuf } from "@/components/ask-yusuf/ask-yusuf";

export const metadata: Metadata = pageMetadata({
  title: "AI Lab",
  description: "Ask Yusuf's portfolio assistant anything, and try four live AI experiments in the browser: retrieval (RAG), agents, evaluation and vision.",
  path: "/ai-lab",
});

export default function Page() {
  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([{ name: "AI Lab", path: "/ai-lab" }])} />
      <AskYusuf asPage />
      <AILab />
    </div>
  );
}
