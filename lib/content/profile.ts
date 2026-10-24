// Single source of truth for personal information.
// Everything here comes from Yusuf's résumé. Anything not in the résumé is
// represented as `null` and rendered as a clearly marked placeholder.

export const profile = {
  name: "Yusuf Hussain",
  firstName: "Yusuf",
  headline: "AI Engineer",
  resumeTitle: "AI Full-Stack Developer",
  intro:
    "I build intelligent systems, AI-powered products, and experiences that turn complex technology into useful software.",
  summary:
    "AI Full-Stack Developer building production AI applications with Large Language Models (OpenAI, Anthropic Claude, Google Gemini), Retrieval-Augmented Generation (RAG), and workflow automation (n8n). Experienced in leading end-to-end project delivery, integrating LLMs into web and mobile (Flutter) products, and deploying scalable services on AWS.",
  email: "yusuf.aman00@gmail.com",
  phone: "+91 87896 57886",
  /** Country code + number, as wa.me expects. */
  whatsapp: "918789657886",
  links: {
    github: "https://github.com/Yusuf-Hussain25",
    linkedin: "https://www.linkedin.com/in/yusuf-hussain-48b2a7209",
  },
} as const;

export type TimelineEntry = {
  id: string;
  kind: "work" | "education";
  org: string;
  role: string;
  period: string;
  stack: string[];
  highlights: string[];
  award?: string;
};

export const award = {
  title: "Best Employee of the Year 2026",
  org: "Freedom With AI",
  quote: "Ownership can't be assigned.",
  summary:
    "Recognized for treating client problems as his own — including the ones that broke at 2 AM — and for growing into responsibility as a project lead.",
  href: "https://www.linkedin.com/feed/update/urn:li:activity:7501554961026158593/",
};

export const about = {
  title: "AI engineer by craft.",
  subtitle: "Full-stack by habit.",
  paragraphs: [
    "I'm Yusuf Hussain — an AI Engineer and Full Stack Software Engineer at Freedom With AI in Hyderabad. As an AI Developer I build LLM products end to end: RAG, AI agents, and automation. As a Backend Engineer I build the Node.js and Python APIs, PostgreSQL and MongoDB data, and AWS infrastructure behind them — and as a MERN stack developer (MongoDB, Express, React, Node.js), the React and Next.js interfaces people actually use.",
    "I studied Computer Science at a tier-3 college in Patna — no placement pipeline, no financial cushion — so I taught myself what the syllabus didn't. I was hired as a Full Stack Developer in my final year, moved into AI full-time at Freedom With AI as a project lead, and was named Best Employee of the Year 2026. Today I work from Hyderabad with teams anywhere, and I'm open to remote roles worldwide.",
  ],
};

export const education = {
  degree: "B.Tech in Computer Science and Engineering",
  school: "R.P. Sharma Institute of Technology",
  city: "Patna",
  period: "Sept 2021 — May 2025",
  grade: "8.5",
  scale: "10",
};

// `logo` is a TechLogo name (brand mark or concept glyph).
export const certifications = [
  { logo: "LeetCode", title: "100+ DSA problems solved", detail: "LeetCode" },
  { logo: "Java", title: "Alpha — Data Structures & Algorithms with Java", detail: "Course certificate" },
  { logo: "C++", title: "C++ Foundation Program", detail: "Physics Wallah · Certificate" },
  { logo: "Hackathon", title: "Inter-college hackathon", detail: "Built a collaborative web-based solution" },
];

// Story framing provided by Yusuf (tier-3 college, financial constraints, standout student).
// Dates and facts are from the résumé and the award post.
export const story = {
  tagline: "A tier-3 college, a laptop, and a habit of shipping.",
  intro:
    "No big-name campus. No placement pipeline. No financial cushion. Just consistency — and the belief that skills compound faster than circumstances.",
  milestones: ["Tier-3 college", "Hired before graduating", "AI company", "Best Employee 2026"],
  chapters: [
    {
      id: "campus",
      year: "2021 · Patna",
      title: "Tier-3 college, first-tier ambition",
      body: "Yusuf started B.Tech in Computer Science at R.P. Sharma Institute of Technology, Patna — a tier-3 college with no big-tech placement pipeline. He finished as one of its standout students, with a CGPA of 8.5.",
    },
    {
      id: "grind",
      year: "2021 — 2024",
      title: "Learning what the syllabus didn't teach",
      body: "With money tight, the internet became the classroom: 100+ LeetCode problems, certifications in DSA with Java and C++, a hackathon build, and a lot of late nights.",
    },
    {
      id: "hired",
      year: "Aug 2024",
      title: "Hired before graduating",
      body: "While still in his final year, he joined as a Full Stack Developer — shipping MERN + Next.js apps and REST APIs handling 5,000+ daily transactions at sub-200ms p95.",
    },
    {
      id: "ai",
      year: "Dec 2025",
      title: "Into an AI company",
      body: "He moved into AI full-time at Freedom With AI — leading AI product delivery end-to-end, building n8n + LLM automation pipelines, Flutter AI apps, and AWS deployments.",
    },
    {
      id: "award",
      year: "2026",
      title: "Best Employee of the Year",
      body: "Within a year of joining, Freedom With AI named him Best Employee of the Year 2026. In his words: a milestone, not a destination.",
    },
  ],
};

export const timeline: TimelineEntry[] = [
  {
    id: "freedom-with-ai",
    kind: "work",
    org: "Freedom With AI",
    role: "AI Developer",
    period: "Dec 2025 — Present",
    stack: ["LLMs", "n8n", "Node.js", "Python", "Flutter", "AWS", "PostgreSQL"],
    award: "Best Employee of the Year 2026",
    highlights: [
      "Led end-to-end delivery of AI products as project lead — requirements, architecture, team coordination, and production release.",
      "Engineered custom n8n + LLM automation pipelines that replaced manual client workflows end-to-end — eliminating repetitive operations across notifications, reminders, planning, and task management.",
      "Developed scalable Node.js and Python backends with REST APIs and PostgreSQL, integrating LLM streaming and prompt orchestration.",
      "Built Flutter mobile apps with embedded AI features (chat, voice, document Q&A) connected to backend services.",
      "Deployed and managed production systems on AWS with CI/CD pipelines for reliable, zero-downtime releases.",
    ],
  },
  {
    id: "kvl",
    kind: "work",
    org: "KVL Business Solutions",
    role: "Full Stack Developer",
    period: "Aug 2024 — Sept 2025",
    stack: ["MERN", "Next.js", "AWS", "Docker", "SQL"],
    highlights: [
      "Architected AI-driven web applications on MERN + Next.js, automating internal workflows and improving delivery turnaround.",
      "Designed REST APIs with Node.js and Express, handling 5,000+ daily transactions with sub-200ms p95 response times.",
      "Containerized services with Docker and shipped via CI/CD to AWS, improving release reliability.",
    ],
  },
  {
    id: "education",
    kind: "education",
    org: "R.P. Sharma Institute of Technology, Patna",
    role: "B.Tech in Computer Science and Engineering · CGPA 8.5/10",
    period: "Sept 2021 — May 2025",
    stack: [],
    highlights: [],
  },
];

export const achievements = [
  "Best Employee of the Year 2026 — Freedom With AI.",
  "Solved 100+ Data Structures and Algorithms problems on LeetCode.",
  "Alpha Course on Data Structures and Algorithms with Java — Certificate.",
  "C++ Foundation Program, Physics Wallah — Certificate.",
  "Participated in an inter-college hackathon, building a collaborative web-based solution.",
];

export const skillGroups: { group: string; items: string[] }[] = [
  { group: "AI / LLM", items: ["OpenAI", "Anthropic Claude", "Google Gemini", "LangChain", "LangGraph", "RAG", "AI Agents", "n8n"] },
  { group: "Vector DBs", items: ["Pinecone", "ChromaDB", "pgvector", "OpenAI Embeddings", "Semantic Search"] },
  { group: "Languages", items: ["TypeScript", "JavaScript", "Python", "Java", "C++", "SQL"] },
  { group: "Frontend", items: ["React.js", "Next.js", "Tailwind CSS", "Flutter", "HTML", "CSS"] },
  { group: "Backend", items: ["Node.js", "Express.js", "FastAPI", "REST APIs", "WebSockets", "SSE", "JWT"] },
  { group: "Databases", items: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQLite"] },
  { group: "Cloud / DevOps", items: ["AWS (EC2, S3, Lambda, RDS, Bedrock)", "Vercel", "Docker", "CI/CD", "Git", "GitHub"] },
];
