import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { Experience } from "@/components/experience/timeline";

export const metadata: Metadata = pageMetadata({
  title: "Experience",
  description: "Where Yusuf Hussain has worked: leading AI products end to end at Freedom With AI, and building full-stack web products at scale before that.",
  path: "/experience",
});

export default function Page() {
  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([{ name: "Experience", path: "/experience" }])} />
      <Experience asPage />
    </div>
  );
}
