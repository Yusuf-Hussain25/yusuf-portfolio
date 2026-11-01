// One list of every project on the site, so pages, cards, the sitemap and
// prev/next links all agree on order, category and URL.

import { builds, type Build } from "./builds";
import { caseStudies, clientProjects, type CaseStudy, type ClientProject, type ThumbVariant } from "./projects";

/** Professional = paid work for clients and employers. Personal = things I built on my own. */
export type Track = "professional" | "personal";

export type Entry =
  | { kind: "case"; slug: string; title: string; data: CaseStudy }
  | { kind: "client"; slug: string; title: string; data: ClientProject }
  | { kind: "build"; slug: string; title: string; data: Build };

export const trackOf = (e: Entry): Track => {
  if (e.kind === "client") return "professional";
  if (e.kind === "case" && e.data.kind === "Professional work") return "professional";
  return "personal";
};

/** AI or full-stack, for the filter chips. */
export const areaOf = (e: Entry): "AI" | "Full-stack" => {
  if (e.kind === "build") return e.data.area;
  if (e.kind === "case") return "AI";
  return /AI|vision/i.test(e.data.category) ? "AI" : "Full-stack";
};

export const yearOf = (e: Entry): string | null => (e.kind === "client" ? null : e.data.year);

export const labelOf = (e: Entry): string => {
  if (e.kind === "client") return e.data.category;
  if (e.kind === "build") return e.data.area === "AI" ? "AI product" : "Full-stack product";
  if (e.data.kind === "Professional work") return "AI automation";
  return e.data.kind === "Project" ? "AI project" : e.data.kind;
};

export const imageOf = (e: Entry): string | null => {
  if (e.kind === "build") return e.data.screens[0]?.src ?? null;
  if (e.kind === "client") return e.data.image;
  return e.data.image ?? null;
};

export const phoneOf = (e: Entry): string | null => {
  if (e.kind === "build") return e.data.phones[0]?.src ?? null;
  if (e.kind === "client") return e.data.phone ?? null;
  return null;
};

/** Which code-drawn scene frames the card; real screenshots use the "showcase" browser frame. */
export const thumbOf = (e: Entry): ThumbVariant => {
  if (e.kind === "build") return "showcase";
  if (e.kind === "case" && e.data.image) return "showcase";
  return e.data.thumb;
};

export const liveUrlOf = (e: Entry): string | null => {
  if (e.kind === "case") return e.data.links.find((l) => /live|demo/i.test(l.label))?.href ?? null;
  return e.data.liveUrl;
};

export const repoUrlOf = (e: Entry): string | null => {
  if (e.kind === "build") return e.data.repoUrl;
  if (e.kind === "case") return e.data.links.find((l) => /source/i.test(l.label))?.href ?? null;
  return null;
};

/** Three short lines for a card. */
export const factsOf = (e: Entry): string[] => {
  if (e.kind === "case") return e.data.facts;
  if (e.kind === "client") return e.data.features.slice(0, 3);
  return e.data.highlights.map((h) => `${h.value} ${h.label}`);
};

export const hrefOf = (e: Entry | string) => `/projects/${typeof e === "string" ? e : e.slug}`;

const build = (data: Build): Entry => ({ kind: "build", slug: data.slug, title: data.title, data });
const cs = (data: CaseStudy): Entry => ({ kind: "case", slug: data.slug, title: data.title, data });
const client = (data: ClientProject): Entry => ({ kind: "client", slug: data.slug, title: data.title, data });

// Personal: newest and strongest first. Professional: the AI pipelines, then the products.
export const personal: Entry[] = [
  ...builds.slice(0, 2).map(build), // Nova, Cueline
  ...caseStudies.filter((c) => c.slug === "repomind").map(cs),
  ...builds.slice(2).map(build),
  ...caseStudies.filter((c) => c.kind !== "Professional work" && c.slug !== "repomind").map(cs),
];

export const professional: Entry[] = [
  ...caseStudies.filter((c) => c.kind === "Professional work").map(cs),
  ...clientProjects.map(client),
];

export const entries: Entry[] = [...personal, ...professional];

// Top projects on the home page: live AI products first, then the strongest full-stack builds
export const featuredSlugs = ["nova", "repomind", "toolverse", "vendora", "meetora", "zaika"];
export const featured: Entry[] = featuredSlugs.flatMap((s) => entries.filter((e) => e.slug === s));

export function getEntry(slug: string) {
  return entries.find((e) => e.slug === slug) ?? null;
}

/** Previous and next project inside the same track, wrapping around. */
export function neighbours(slug: string) {
  const entry = getEntry(slug);
  if (!entry) return null;
  const list = trackOf(entry) === "professional" ? professional : personal;
  const i = list.findIndex((e) => e.slug === slug);
  return { prev: list[(i - 1 + list.length) % list.length], next: list[(i + 1) % list.length] };
}
