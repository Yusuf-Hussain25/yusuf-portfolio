// "How I Build" — the stack as layers of a system. `usedIn` references only
// what the résumé supports; an empty list renders as "listed skill".

export type StackTech = {
  name: string;
  detail: string;
  usedIn: string[];
  project?: string; // case study slug
};

export type StackLayer = {
  id: string;
  name: string;
  role: string;
  techs: StackTech[];
};

// One-line captions for the "Full toolkit" groups (keys match `skillGroups` in profile.ts).
export const toolkitCaptions: Record<string, string> = {
  "AI / LLM": "Models, orchestration and automation",
  "Vector DBs": "Retrieval and semantic search",
  Languages: "What the code is written in",
  Frontend: "Web and mobile interfaces",
  Backend: "APIs, auth and real-time transport",
  Databases: "Relational, document and cache",
  "Cloud / DevOps": "Deploying and shipping reliably",
};

export const stackLayers: StackLayer[] = [
  {
    id: "interface",
    name: "Interface",
    role: "Where people meet the system",
    techs: [
      { name: "Next.js", detail: "App framework for AI-driven web apps and streaming agent UIs.", usedIn: ["RepoMind", "Full-stack role 2024–25", "This site"], project: "repomind" },
      { name: "React", detail: "Component model behind the web products, including the voice assistant UI.", usedIn: ["AI Voice Assistant", "Full-stack role 2024–25 (MERN)"], project: "voice-assistant" },
      { name: "TypeScript", detail: "Typed application code across the frontend and services.", usedIn: ["RepoMind", "This site"], project: "repomind" },
      { name: "Tailwind CSS", detail: "Utility-first styling for responsive interfaces.", usedIn: ["AI Voice Assistant", "This site"], project: "voice-assistant" },
      { name: "Flutter", detail: "Mobile apps with embedded AI features — chat, voice, document Q&A.", usedIn: ["Freedom With AI"], project: "automation" },
    ],
  },
  {
    id: "intelligence",
    name: "Intelligence",
    role: "Models, retrieval, and reasoning",
    techs: [
      { name: "LLMs", detail: "OpenAI, Anthropic Claude, and Google Gemini integrated into web and mobile products.", usedIn: ["Freedom With AI", "RepoMind", "AI Voice Assistant"], project: "automation" },
      { name: "RAG", detail: "Retrieval pipelines that ground model answers in source data — e.g. code embeddings in Pinecone.", usedIn: ["RepoMind", "This site"], project: "repomind" },
      { name: "AI Agents", detail: "Multi-agent orchestration with LangChain + LangGraph and tool use via function calling.", usedIn: ["RepoMind"], project: "repomind" },
      { name: "Prompt Engineering", detail: "Intent classification prompts and prompt orchestration in production backends.", usedIn: ["AI Voice Assistant", "Freedom With AI"], project: "voice-assistant" },
      { name: "n8n", detail: "Automation pipelines with LLM steps that replaced manual client workflows.", usedIn: ["Freedom With AI"], project: "automation" },
      { name: "Vector DBs", detail: "Pinecone in RepoMind; ChromaDB and pgvector are also part of the toolkit.", usedIn: ["RepoMind"], project: "repomind" },
    ],
  },
  {
    id: "services",
    name: "Services",
    role: "APIs, streaming, orchestration",
    techs: [
      { name: "Node.js", detail: "Backends with REST APIs, LLM streaming, and job queues.", usedIn: ["Freedom With AI", "Full-stack role 2024–25", "RepoMind", "AI Voice Assistant"], project: "repomind" },
      { name: "Python", detail: "Backend services with REST APIs integrating LLMs.", usedIn: ["Freedom With AI"], project: "automation" },
      { name: "Express", detail: "REST APIs handling 5,000+ daily transactions with sub-200ms p95 response times.", usedIn: ["Full-stack role 2024–25"] },
      { name: "FastAPI", detail: "Python API framework in the toolkit.", usedIn: [] },
      { name: "WebSockets · SSE", detail: "Real-time transports for streaming responses.", usedIn: [] },
    ],
  },
  {
    id: "data",
    name: "Data",
    role: "State, memory, and storage",
    techs: [
      { name: "PostgreSQL", detail: "Relational storage for production AI backends.", usedIn: ["Freedom With AI"], project: "automation" },
      { name: "Redis", detail: "Agent memory and the backing store for BullMQ job queues.", usedIn: ["RepoMind"], project: "repomind" },
      { name: "MongoDB", detail: "Document storage for the voice assistant backend.", usedIn: ["AI Voice Assistant"], project: "voice-assistant" },
      { name: "MySQL · SQLite", detail: "Additional SQL databases in the toolkit.", usedIn: [] },
    ],
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    role: "Shipping reliably",
    techs: [
      { name: "AWS", detail: "Production deployments — EC2, S3, Lambda, RDS, and Bedrock are part of the toolkit.", usedIn: ["Freedom With AI", "Full-stack role 2024–25"], project: "automation" },
      { name: "Docker", detail: "Containerized services shipped via CI/CD.", usedIn: ["Full-stack role 2024–25"] },
      { name: "CI/CD", detail: "Pipelines for reliable, zero-downtime releases.", usedIn: ["Freedom With AI", "Full-stack role 2024–25"], project: "automation" },
      { name: "Vercel", detail: "Hosting for Next.js applications.", usedIn: [] },
    ],
  },
];
