import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { JsonLd } from "@/components/seo/json-ld";
import { entries, getEntry, labelOf, liveUrlOf, repoUrlOf, trackOf, yearOf } from "@/lib/content/catalog";
import { profile } from "@/lib/content/profile";
import { breadcrumbJsonLd, pageMetadata, siteUrl } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return entries.map((e) => ({ slug: e.slug }));
}

function describe(slug: string) {
  const entry = getEntry(slug)!;
  const by = `${trackOf(entry) === "professional" ? "Professional work" : "A personal project"} by ${profile.name}.`;
  const tagline = entry.data.tagline;
  // keep the snippet under ~160 characters
  return tagline.length + by.length + 1 <= 160 ? `${tagline} ${by}` : tagline;
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};
  // The share image comes from ./opengraph-image.tsx in this folder.
  return pageMetadata({ title: `${entry.title} — ${labelOf(entry)}`, description: describe(slug), path: `/projects/${slug}`, image: false, type: "article" });
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();
  const url = `${siteUrl}/projects/${slug}`;
  const live = liveUrlOf(entry);
  const repo = repoUrlOf(entry);
  const year = yearOf(entry);
  const work = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    name: entry.title,
    headline: `${entry.title} — ${labelOf(entry)}`,
    description: entry.data.tagline,
    url,
    image: `${url}/opengraph-image`,
    genre: labelOf(entry),
    keywords: entry.data.stack.join(", "),
    ...(year ? { dateCreated: year } : {}),
    author: { "@id": `${siteUrl}/#person` },
    creator: { "@type": "Person", name: profile.name, url: siteUrl },
    ...(live || repo ? { sameAs: [live, repo].filter(Boolean) } : {}),
    isPartOf: { "@type": "CollectionPage", name: "Projects", url: `${siteUrl}/projects` },
  };
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Projects", path: "/projects" }, { name: entry.title, path: `/projects/${slug}` }])} />
      <JsonLd data={work} />
      <ProjectDetail entry={entry} />
    </>
  );
}
