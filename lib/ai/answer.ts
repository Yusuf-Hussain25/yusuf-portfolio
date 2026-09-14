import { achievements, award, profile, skillGroups, story, timeline } from "@/lib/content/profile";
import { caseStudies } from "@/lib/content/projects";
import type { Hit } from "./retrieval";

// Local, grounded answer composer used when no LLM key is configured.
// It only ever restates facts from the content files.

const byId = (slug: string) => caseStudies.find((c) => c.slug === slug)!;
const work = timeline.filter((t) => t.kind === "work");
const edu = timeline.find((t) => t.kind === "education")!;
const skills = (group: string) => skillGroups.find((g) => g.group === group)?.items.join(", ") ?? "";

type Intent = { test: RegExp; answer: () => string };

const intents: Intent[] = [
  {
    test: /salary|compensation|\bctc\b|located|location|based in|relocat|notice period|visa|\bage\b|available|availability/,
    answer: () =>
      `That isn't something the portfolio covers, so I won't guess. The best way to ask is directly: **${profile.email}**.`,
  },
  {
    test: /award|best employee|recogni|honou?r/,
    answer: () =>
      `Yusuf was named **${award.title}** at ${award.org}. ${award.summary}\n\nIn his words: *"${award.quote}"*`,
  },
  {
    test: /story|journey|background|tier[- ]?3|struggl|how did (he|yusuf) (start|get)|grew up/,
    answer: () => `${story.intro}\n\n${story.chapters.map((c) => `- **${c.year} — ${c.title}:** ${c.body}`).join("\n")}`,
  },
  {
    test: /voice|speech|gemini|assistant/,
    answer: () => {
      const p = byId("voice-assistant");
      return `**${p.title}** (${p.year}) is a voice-first assistant.\n\n- Uses Google Gemini with prompt engineering to classify intent across search, media, and utility commands.\n- Low-latency speech pipeline with the Web Speech API for speech-to-text and text-to-speech.\n- Modular Node.js backend with MongoDB and JWT auth, pluggable command handlers, and a Tailwind CSS UI.`;
    },
  },
  {
    test: /\brag\b|retrieval|vector|embedding|pinecone|chroma|pgvector|semantic search|knowledge base/,
    answer: () =>
      `**RepoMind** is the clearest RAG example: it runs a retrieval pipeline over source code using Pinecone embeddings, so its agents can answer code questions grounded in the repository.\n\nOn the toolkit side Yusuf lists ${skills("Vector DBs")}. This site is a second, inspectable example — the RAG Explorer in the AI Lab shows the retrieval behind this very answer.`,
  },
  {
    test: /n8n|automat|workflow/,
    answer: () =>
      `At **Freedom With AI**, Yusuf engineered custom n8n + LLM automation pipelines that replaced manual client workflows end-to-end — eliminating repetitive operations across notifications, reminders, planning, and task management. The backends behind them are Node.js and Python with REST APIs, PostgreSQL, LLM streaming, and prompt orchestration.`,
  },
  {
    test: /agent|langgraph|langchain|orchestrat|function calling|tool use/,
    answer: () =>
      `**RepoMind** is a multi-agent system that autonomously analyzes GitHub repositories — mapping architecture, summarizing modules, and answering code questions.\n\n- Orchestration with LangChain + LangGraph\n- Tool use through OpenAI function calling\n- Redis-backed agent memory and BullMQ job queues\n- Real-time agent progress streamed to a Next.js UI`,
  },
  {
    test: /strongest|best|most interesting|interesting|impressive|flagship|favou?rite|proud|complex|hardest/,
    answer: () =>
      `By technical scope, **RepoMind** stands out. It combines several AI system patterns in one product:\n\n- Multi-agent orchestration with LangChain + LangGraph\n- Tool use via OpenAI function calling\n- RAG over code with Pinecone embeddings\n- Redis-backed memory, BullMQ job queues, and live progress streaming to Next.js\n\nIn professional work, the n8n + LLM pipelines at Freedom With AI are notable because they replaced manual client workflows end-to-end.`,
  },
  {
    test: /different|unique|stand out|why (should|would) .*hire|traditional|versus|\bvs\b|compared/,
    answer: () =>
      `A traditional frontend developer ships interfaces. Yusuf's work spans the whole AI system around the interface:\n\n- **Models** — integrates OpenAI, Claude, and Gemini into web and mobile products\n- **Retrieval** — RAG pipelines with vector databases like Pinecone\n- **Agents** — multi-agent orchestration with LangGraph and tool use\n- **Automation** — n8n + LLM pipelines replacing manual workflows\n- **Delivery** — Node.js/Python backends, Flutter apps, and AWS deployments with CI/CD, often as project lead`,
  },
  {
    test: /contact|email|reach|hire|linkedin|github|connect|get in touch/,
    answer: () =>
      `You can reach Yusuf at **${profile.email}**.\n\n- GitHub: ${profile.links.github}\n- LinkedIn: ${profile.links.linkedin}`,
  },
  {
    test: /educat|degree|college|university|cgpa|gpa|studied|b\.?\s?tech/,
    answer: () => `Yusuf holds a **${edu.role.split(" · ")[0]}** from ${edu.org} (${edu.period}), with a CGPA of 8.5/10.`,
  },
  {
    test: /leetcode|dsa|algorithm|achievement|certif|hackathon/,
    answer: () => `Achievements & certifications:\n\n${achievements.map((a) => `- ${a}`).join("\n")}`,
  },
  {
    test: /aws|cloud|deploy|docker|devops|cicd|ci\/cd|infra/,
    answer: () =>
      `Yusuf deploys and manages production systems on **AWS** with CI/CD pipelines for zero-downtime releases (Freedom With AI), and previously containerized services with Docker and shipped them via CI/CD to AWS in his previous full-stack role. Toolkit: ${skills("Cloud / DevOps")}.`,
  },
  {
    test: /flutter|mobile|ios|android/,
    answer: () =>
      `At Freedom With AI, Yusuf built **Flutter** mobile apps with embedded AI features — chat, voice, and document Q&A — connected to backend services.`,
  },
  {
    test: /experience|career|company|companies|worked|employ|current|role|freedom|kvl|job/,
    answer: () =>
      work
        .map((w) => `**${w.role} — ${w.org}** (${w.period})\n${w.highlights.slice(0, 3).map((h) => `- ${h}`).join("\n")}`)
        .join("\n\n"),
  },
  {
    test: /tech|stack|skill|language|tool|framework|work with|\buses?\b|\bknows?\b/,
    answer: () =>
      `Yusuf's stack, grouped the way the résumé lists it:\n\n${skillGroups.map((g) => `- **${g.group}:** ${g.items.join(", ")}`).join("\n")}`,
  },
  {
    test: /project|built|build|portfolio|made|created|shipped/,
    answer: () =>
      `Here's what's in the portfolio:\n\n${caseStudies.map((c) => `- **${c.title}** (${c.kind.toLowerCase()}, ${c.year}) — ${c.tagline}`).join("\n")}`,
  },
  {
    test: /^(hi|hello|hey|yo|hola|namaste)\b|who (is|are)|about (him|yusuf)|introduce|summary|overview/,
    answer: () =>
      `${profile.firstName} is an AI full-stack developer. ${profile.summary.replace("AI Full-Stack Developer building", "He builds")}\n\nTry asking which project demonstrates RAG, or what his stack looks like.`,
  },
];

const STOP = new Set(["what", "which", "when", "where", "does", "have", "with", "about", "tell", "yusuf", "yusuf's", "that", "this", "from", "your", "there", "their", "into", "more", "much"]);

export function composeLocalAnswer(query: string, hits: Hit[]): string {
  const q = query.toLowerCase();
  const intent = intents.find((i) => i.test.test(q));
  if (intent) return intent.answer();

  // Hashed vectors can collide, so a hit must also contain a real word from the question.
  const words = q.split(/[^a-z0-9+#]+/).filter((w) => w.length > 3 && !STOP.has(w));
  const mentions = (h: Hit) => {
    const text = `${h.chunk.title} ${h.chunk.text}`.toLowerCase();
    return words.some((w) => text.includes(w.slice(0, 5)));
  };
  const relevant = hits.filter((h) => h.score > 0.14 && mentions(h)).slice(0, 2);
  if (relevant.length > 0) {
    return `Here's the most relevant information I retrieved:\n\n${relevant.map((h) => `- **${h.chunk.title}:** ${h.chunk.text}`).join("\n")}`;
  }
  return `I only answer questions about Yusuf's experience, projects, and skills — and I couldn't find anything relevant to that. Try: *"What AI projects has Yusuf built?"*`;
}
