import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { entries, getEntry, imageOf } from "@/lib/content/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};
  const image = imageOf(entry);
  return {
    title: entry.title,
    description: entry.data.tagline,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { title: entry.title, description: entry.data.tagline, url: `/projects/${slug}`, ...(image ? { images: [{ url: image }] } : {}) },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();
  return <ProjectDetail entry={entry} />;
}
