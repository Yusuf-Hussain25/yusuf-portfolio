// Experience as two chapters, newest first. Facts and metrics come from the
// résumé and the award post; the prose is professional framing of those facts.

import { award } from "./profile";

export type Contribution = { title: string; detail: string; tech: string[] };

export type Company = {
  id: string;
  status: "now" | "previous";
  org: string;
  monogram: string;
  kind: string;
  role: string;
  start: string; // YYYY-MM
  end: string | null; // null = present
  focus: string;
  summary: string;
  contributions: Contribution[];
  impact: { value: string; label: string }[];
  stack: string[];
  award?: { title: string; href: string };
};

export const companies: Company[] = [
  {
    id: "freedom-with-ai",
    status: "now",
    org: "Freedom With AI",
    monogram: "FW",
    kind: "AI company",
    role: "AI Developer · Project Lead",
    start: "2025-12",
    end: null,
    focus: "Owning AI products from the first requirement to the production release.",
    summary:
      "I lead AI product delivery end to end — shaping requirements, designing the architecture, coordinating the team and taking releases live. The work sits where LLMs meet real operations: automations that replace manual workflows, backends that stream model output, and mobile apps with AI built in.",
    contributions: [
      {
        title: "Project lead, idea to production",
        detail: "Own delivery of AI products end to end — requirements, architecture, team coordination and the production release.",
        tech: [],
      },
      {
        title: "Replaced manual client workflows with n8n + LLM pipelines",
        detail: "Custom automations that removed repetitive operations across notifications, reminders, planning and task management.",
        tech: ["n8n", "LLMs"],
      },
      {
        title: "Node.js and Python backends that stream LLM output",
        detail: "Scalable REST APIs over PostgreSQL, with LLM streaming and prompt orchestration built into the request path.",
        tech: ["Node.js", "Python", "PostgreSQL", "REST APIs"],
      },
      {
        title: "Flutter apps with AI built in",
        detail: "Mobile apps with chat, voice and document Q&A, connected to the backend services.",
        tech: ["Flutter", "LLMs"],
      },
      {
        title: "Zero-downtime releases on AWS",
        detail: "Production systems deployed and run on AWS, shipped through CI/CD pipelines.",
        tech: ["AWS", "CI/CD"],
      },
    ],
    impact: [
      { value: "Best Employee", label: "of the Year 2026" },
      { value: "Project lead", label: "AI delivery end to end" },
      { value: "Zero-downtime", label: "production releases" },
    ],
    stack: ["LLMs", "n8n", "Node.js", "Python", "Flutter", "PostgreSQL", "AWS", "CI/CD"],
    award: { title: award.title, href: award.href },
  },
  {
    id: "kvl",
    status: "previous",
    org: "KVL Business Solutions",
    monogram: "KV",
    kind: "Software company",
    role: "Full Stack Developer",
    start: "2024-08",
    end: "2025-09",
    focus: "Building production web products — and the APIs that carry their traffic.",
    summary:
      "I joined in my final year of college and worked across the whole stack, from Next.js interfaces to Node.js services. It's where production became real: steady traffic, strict latency budgets and releases that couldn't break.",
    contributions: [
      {
        title: "AI-driven web applications on MERN + Next.js",
        detail: "Platforms that automated internal workflows and improved delivery turnaround.",
        tech: ["MongoDB", "Express", "React", "Node.js", "Next.js"],
      },
      {
        title: "REST APIs under real traffic",
        detail: "Node.js and Express services handling 5,000+ daily transactions at sub-200ms p95 response times.",
        tech: ["Node.js", "Express", "SQL"],
      },
      {
        title: "A containerized release path",
        detail: "Services packaged with Docker and shipped through CI/CD to AWS, making releases more reliable.",
        tech: ["Docker", "CI/CD", "AWS"],
      },
    ],
    impact: [
      { value: "5,000+", label: "daily API transactions" },
      { value: "<200ms", label: "p95 response time" },
      { value: "Final year", label: "hired before graduating" },
    ],
    stack: ["Next.js", "React", "Node.js", "Express", "MongoDB", "SQL", "Docker", "AWS"],
  },
];

export const experienceHighlights = [
  { value: "Project lead", label: "Current role — AI products end to end" },
  { value: "5,000+", label: "Daily API transactions served" },
  { value: "<200ms", label: "p95 API response time" },
  { value: "2026", label: "Best Employee of the Year" },
];

export const careerMove = {
  date: "Dec 2025",
  from: "Full Stack Developer",
  to: "AI Developer · Project Lead",
  note: "From shipping web products at scale to owning AI products end to end.",
};
