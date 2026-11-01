import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { Engineering } from "@/components/engineering/stack";

export const metadata: Metadata = pageMetadata({
  title: "Skills",
  description: "The stack Yusuf Hussain builds with: LLMs, RAG, AI agents, Next.js, React, Node.js, Python, PostgreSQL and AWS, each linked to real projects.",
  path: "/skills",
});

export default function Page() {
  return (
    <div className="pt-16 md:pt-20">
      <JsonLd data={breadcrumbJsonLd([{ name: "Skills", path: "/skills" }])} />
      <Engineering asPage />
    </div>
  );
}
