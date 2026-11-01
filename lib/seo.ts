import type { Metadata } from "next";
import { education, profile, skillGroups, timeline } from "@/lib/content/profile";

// Canonical origin. Set NEXT_PUBLIC_SITE_URL once a custom domain is attached;
// on Vercel the production domain is picked up automatically.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://yusuf-portfolio.vercel.app")
).replace(/\/$/, "");

/** The roles people search for. Each one appears in the title, description, and visible copy. */
export const roles = [
  "AI Engineer",
  "AI Developer",
  "Full Stack Software Engineer",
  "Backend Engineer",
] as const;

export const seo = {
  // ≤ 60 characters so Google shows it whole.
  title: `${profile.name} — AI Engineer & Full Stack Developer`,
  // ≤ 160 characters so the search snippet isn't cut.
  description:
    "AI Engineer and Full Stack Developer in Hyderabad, India. I build LLM products, RAG systems, AI agents and scalable apps with Next.js, Node.js and Python.",
  /** Longer bio for structured data, where length doesn't matter. */
  longDescription:
    "Yusuf Hussain is an AI Engineer, AI Developer, and Full Stack Software Engineer at Freedom With AI (Hyderabad, India), open to remote and on-site roles worldwide — building LLM products, RAG systems, AI agents, MERN stack apps, and scalable backends with Node.js, Python, Next.js, PostgreSQL, and AWS.",
  keywords: [
    "Yusuf Hussain",
    "Yusuf Hussain AI Engineer",
    "Yusuf Hussain Full Stack Developer",
    "Yusuf Hussain Freedom With AI",
    "Yusuf Hussain Hyderabad",
    "Yusuf Hussain Patna",
    ...roles,
    "Freedom With AI",
    "Hyderabad",
    "MERN Stack Developer",
    "MERN Stack",
    "MongoDB",
    "Express.js",
    "React.js",
    "Node.js",
    "Full Stack Developer",
    "Full Stack Engineer",
    "Software Engineer",
    "Backend Developer",
    "Backend Software Engineer",
    "AI Full Stack Developer",
    "Generative AI Engineer",
    "LLM Engineer",
    "Machine Learning Engineer",
    "RAG",
    "AI Agents",
    "LangChain",
    "Node.js Developer",
    "Python Developer",
    "Next.js Developer",
    "React Developer",
    "AWS",
    "Remote AI Engineer",
    "Remote Full Stack Developer",
    "Remote Backend Engineer",
    "AI Engineer India",
    "Full Stack Developer India",
    "Hire AI Engineer",
    "Hire Full Stack Developer",
    "Freelance AI Developer",
  ],
};

export const location = { city: "Hyderabad", region: "Telangana", country: "IN" };

const current = timeline.find((t) => t.kind === "work");

// schema.org Person: tells Google who this page is about and which job titles to match.
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: profile.name,
  givenName: profile.firstName,
  familyName: "Hussain",
  url: siteUrl,
  mainEntityOfPage: siteUrl,
  image: `${siteUrl}/images/yusuf-portrait.jpg`,
  email: `mailto:${profile.email}`,
  jobTitle: [...roles],
  description: seo.longDescription,
  worksFor: current && { "@type": "Organization", name: current.org },
  workLocation: { "@type": "Place", name: `${location.city}, India` },
  address: {
    "@type": "PostalAddress",
    addressLocality: location.city,
    addressRegion: location.region,
    addressCountry: location.country,
  },
  homeLocation: { "@type": "Place", name: `${education.city}, India` },
  // Not limited to one city: available for remote work anywhere.
  areaServed: "Worldwide",
  seeks: { "@type": "Demand", name: "Remote and on-site AI / full-stack engineering roles worldwide" },
  alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
  knowsAbout: skillGroups.flatMap((g) => g.items),
  sameAs: [profile.links.github, profile.links.linkedin],
};

export const defaultOgImage = {
  url: "/images/yusuf-portrait.jpg",
  width: 1342,
  height: 755,
  alt: `${profile.name}, AI Engineer and Full Stack Developer`,
};

/**
 * Full metadata for an inner page. Open Graph and Twitter are spelled out here
 * because a page that sets `openGraph` replaces the root's whole object, and one
 * that doesn't silently inherits the home page's title, URL and description.
 * Pass `image: false` when the route has its own opengraph-image file.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = defaultOgImage,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; width?: number; height?: number; alt?: string } | false;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = `${title} · ${profile.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: profile.name,
      type,
      locale: "en_US",
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
  };
}

/** schema.org BreadcrumbList for a page path. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.path === "/" ? "" : it.path}`,
    })),
  };
}
