import type { MetadataRoute } from "next";
import { entries } from "@/lib/content/catalog";
import { siteUrl } from "@/lib/seo";

const pages = ["projects", "experience", "skills", "about", "ai-lab", "contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    ...pages.map((p) => ({ url: `${siteUrl}/${p}`, lastModified, changeFrequency: "monthly" as const, priority: p === "projects" ? 0.9 : 0.7 })),
    ...entries.map((e) => ({ url: `${siteUrl}/projects/${e.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
