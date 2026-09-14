"use client";

import type { CSSProperties } from "react";
import {
  siAnthropic,
  siCplusplus,
  siCss,
  siDocker,
  siExpress,
  siFastapi,
  siFlutter,
  siGit,
  siGithub,
  siGooglegemini,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siLangchain,
  siLanggraph,
  siLeetcode,
  siMongodb,
  siMysql,
  siN8n,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPostgresql,
  siPython,
  siReact,
  siRedis,
  siSqlite,
  siTailwindcss,
  siTypescript,
  siVercel,
} from "simple-icons";
import { useTheme } from "@/lib/hooks";

type BrandIcon = { path: string; hex: string; title: string };

// Official brand marks from simple-icons (individually imported → tree-shaken).
const BRANDS: Record<string, BrandIcon> = {
  "Next.js": siNextdotjs,
  React: siReact,
  "React.js": siReact,
  TypeScript: siTypescript,
  JavaScript: siJavascript,
  "Tailwind CSS": siTailwindcss,
  Flutter: siFlutter,
  n8n: siN8n,
  "Node.js": siNodedotjs,
  Python: siPython,
  Express: siExpress,
  "Express.js": siExpress,
  FastAPI: siFastapi,
  PostgreSQL: siPostgresql,
  Redis: siRedis,
  MongoDB: siMongodb,
  MySQL: siMysql,
  "MySQL · SQLite": siMysql,
  SQLite: siSqlite,
  Docker: siDocker,
  Vercel: siVercel,
  "Anthropic Claude": siAnthropic,
  "Google Gemini": siGooglegemini,
  LangChain: siLangchain,
  LangGraph: siLanggraph,
  Java: siOpenjdk,
  "C++": siCplusplus,
  HTML: siHtml5,
  CSS: siCss,
  JWT: siJsonwebtokens,
  Git: siGit,
  GitHub: siGithub,
  LeetCode: siLeetcode,
};

// Concept glyphs (original line drawings) for ideas that have no brand mark.
const GLYPHS = {
  spark: <path d="M12 3c.6 4.8 2.2 6.4 9 9-6.8 2.6-8.4 4.2-9 9-.6-4.8-2.2-6.4-9-9 6.8-2.6 8.4-4.2 9-9z" />,
  rag: (
    <>
      <path d="M13 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h5M13 3l5 5M13 3v5h5M8 10h4M8 14h2" />
      <circle cx="16.5" cy="16.5" r="3" />
      <path d="m18.8 18.8 2.2 2.2" />
    </>
  ),
  agents: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5" cy="18" r="2.2" />
      <circle cx="19" cy="18" r="2.2" />
      <path d="M10.9 7 6.2 16M13.1 7l4.7 9M7.2 18h9.6" />
    </>
  ),
  prompt: <path d="m4 17 6-5-6-5M12 19h8" />,
  vector: (
    <>
      <path d="M4 3v17h17" />
      <circle cx="10" cy="11" r="1.4" />
      <circle cx="15.5" cy="7" r="1.4" />
      <circle cx="14" cy="14.5" r="1.4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  stream: <path d="M3 9c3-3 5 3 8 0s5 3 8 0M3 15c3-3 5 3 8 0s5 3 8 0" />,
  api: <path d="M8 4C6 4 5 5 5 7v2c0 1.5-1 2.5-2 3 1 .5 2 1.5 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1.5 1 2.5 2 3-1 .5-2 1.5-2 3v2c0 2-1 3-3 3" />,
  loop: <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" />,
  db: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  cap: <path d="M2 9.5 12 4.5l10 5-10 5-10-5zM6 11.5v4.5c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.5M22 9.5v5.5" />,
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3z" />,
} as const;

const CONCEPTS: Record<string, keyof typeof GLYPHS> = {
  LLMs: "spark",
  RAG: "rag",
  "AI Agents": "agents",
  "Prompt Engineering": "prompt",
  "Vector DBs": "vector",
  "OpenAI Embeddings": "vector",
  pgvector: "vector",
  "Semantic Search": "search",
  "WebSockets · SSE": "stream",
  WebSockets: "stream",
  SSE: "stream",
  "REST APIs": "api",
  "CI/CD": "loop",
  SQL: "db",
  Education: "cap",
  Hackathon: "bolt",
};

// Brands missing from simple-icons get a typographic monogram — never a guessed logo.
const MONOGRAMS: Record<string, string> = {
  AWS: "aws",
  "AWS (EC2, S3, Lambda, RDS, Bedrock)": "aws",
  OpenAI: "OA",
  Pinecone: "Pc",
  ChromaDB: "Ch",
};

function luminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function readable(hex: string, theme: "light" | "dark" | null) {
  if (!theme) return false;
  const l = luminance(hex);
  const bg = theme === "dark" ? 0.008 : 0.92;
  return (Math.max(l, bg) + 0.05) / (Math.min(l, bg) + 0.05) >= 2.1;
}

export function hasLogo(name: string) {
  return name in BRANDS || name in CONCEPTS || name in MONOGRAMS;
}

/** `mono` draws the mark in currentColor (the caller decides the colour, e.g. LogoMark). */
export function TechLogo({ name, size = 16, className = "", mono = false }: { name: string; size?: number; className?: string; mono?: boolean }) {
  const theme = useTheme();
  const brand = BRANDS[name];
  if (brand) {
    const color = !mono && readable(brand.hex, theme) ? `#${brand.hex}` : "currentColor";
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden className={`shrink-0 ${className}`}>
        <path d={brand.path} />
      </svg>
    );
  }
  const concept = CONCEPTS[name];
  if (concept) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={`shrink-0 ${mono ? "" : "text-accent"} ${className}`}
      >
        {GLYPHS[concept]}
      </svg>
    );
  }
  const monogram = MONOGRAMS[name] ?? name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2);
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center font-mono font-semibold leading-none tracking-tight ${className}`}
      style={{ width: size, height: size, fontSize: size * (monogram.length > 2 ? 0.46 : 0.56) }}
    >
      {monogram}
    </span>
  );
}

/**
 * A logo in a tile tinted with its own brand colour (`--brand`, only when that colour
 * reads on the current theme). Concepts take the accent; everything else the foreground.
 */
export function LogoMark({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) {
  const theme = useTheme();
  const brand = BRANDS[name];
  const color = brand && readable(brand.hex, theme) ? `#${brand.hex}` : null;
  const kind = brand ? "brand" : name in CONCEPTS ? "concept" : "plain";
  return (
    <span aria-hidden data-kind={kind} className={`logo-mark ${className}`} style={color ? ({ "--brand": color } as CSSProperties) : undefined}>
      <TechLogo name={name} size={size} mono />
    </span>
  );
}
