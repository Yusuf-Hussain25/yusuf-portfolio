// Case studies. Facts come from the résumé; framing sentences (the "problem")
// describe the category of problem, never invented outcomes. Unknown results
// and links are `null` and render as marked placeholders.
//
// `story` is the narrative behind each build — why it started, what was weighed
// and why each call was made. It explains the documented stack and features;
// it adds no metrics or outcomes. Own projects speak as "I", team products as "we".

export type ArchKind = "io" | "ai" | "service" | "data";

/** Which original, code-drawn 3D glass thumbnail represents a project. */
export type ThumbVariant =
  | "repo-graph"
  | "voice"
  | "workflow"
  | "retrieval"
  | "video-score"
  | "agents-pipeline"
  | "chatbot"
  | "vision-pose"
  | "map"
  | "pos"
  | "showcase";

export type ArchNode = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  kind: ArchKind;
};

export type ArchEdge = { from: string; to: string; label?: string };

/** How a project came to be: why it started, what was weighed, how it was built. */
export type ProjectStory = {
  spark: string;
  questions: string[];
  decisions: { choice: string; why: string }[];
  hardest: string;
  learned: string;
};

export type CaseStudy = {
  slug: string;
  index: string;
  title: string;
  tagline: string;
  year: string;
  kind: "Project" | "Professional work" | "This site";
  thumb: ThumbVariant;
  /** Visual only: OKLCH hue for the project's accent color. */
  hue: number;
  stack: string[];
  facts: string[];
  story: ProjectStory;
  problem: string;
  approach: string;
  aiComponents: { name: string; detail: string }[];
  implementation: string[];
  result: string | null;
  resultPlaceholder?: string;
  links: { label: string; href: string | null }[];
  architecture: { nodes: ArchNode[]; edges: ArchEdge[] };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "repomind",
    index: "01",
    title: "RepoMind",
    tagline: "Agentic AI repository analyzer — a multi-agent system for codebase understanding.",
    year: "2026",
    kind: "Project",
    thumb: "repo-graph",
    hue: 268,
    stack: ["Next.js", "TypeScript", "LangChain", "LangGraph", "OpenAI", "Pinecone", "Redis", "BullMQ"],
    facts: ["Multi-agent orchestration", "RAG over source code", "Real-time agent progress"],
    story: {
      spark:
        "Every new codebase starts the same way: days of opening file after file just to learn where things live. I wanted to ask a repository a question the way I'd ask a senior teammate — and get an answer that points to real code.",
      questions: [
        "Can one model call ever understand a whole repository, or does the work need to be split?",
        "How do I keep answers tied to actual files instead of confident guesses?",
        "Analysis takes time — how does the user know something is happening?",
      ],
      decisions: [
        {
          choice: "Several agents instead of one giant prompt",
          why: "Mapping architecture, summarizing modules and answering questions are different jobs. LangGraph lets each job have its own agent and keeps the hand-offs under control.",
        },
        {
          choice: "Retrieval over code, not the whole repo in context",
          why: "Source is chunked and embedded into Pinecone, so an agent pulls only the files that matter for a question — answers stay grounded and prompts stay small.",
        },
        {
          choice: "Queue the heavy work, stream the progress",
          why: "Indexing runs as BullMQ jobs so the API stays responsive, and every agent step streams to the Next.js UI so the wait is visible.",
        },
      ],
      hardest:
        "Keeping agents coherent across many steps. Each one needs to know what the others already found — that is exactly the job of the Redis-backed memory.",
      learned:
        "Agentic systems are mostly orchestration and state, not prompts. The model is one component; the queue, the memory and the retrieval layer decide whether it's reliable.",
    },
    problem:
      "Understanding an unfamiliar repository means reading many files before you can ask a useful question about it.",
    approach:
      "A multi-agent AI system that autonomously analyzes GitHub repositories — mapping architecture, summarizing modules, and answering code questions.",
    aiComponents: [
      { name: "Agent orchestration", detail: "LangChain + LangGraph coordinate the agents that analyze a repository." },
      { name: "Tool use", detail: "OpenAI function calling lets agents invoke tools during analysis." },
      { name: "RAG over code", detail: "A retrieval pipeline over source code using Pinecone embeddings grounds answers in the repository." },
      { name: "Agent memory", detail: "Redis-backed memory keeps agent state across steps." },
    ],
    implementation: [
      "Real-time agent progress is streamed to a Next.js UI.",
      "Node.js services back the UI, with BullMQ job queues for analysis work.",
      "Redis provides agent memory; Pinecone stores code embeddings.",
    ],
    result: null,
    resultPlaceholder: "Add outcome — demo link, repositories analyzed, or evaluation results.",
    links: [
      { label: "Source", href: null },
      { label: "Live demo", href: null },
    ],
    architecture: {
      nodes: [
        { id: "repo", label: "GitHub repo", sub: "input", x: 90, y: 70, kind: "io" },
        { id: "queue", label: "BullMQ", sub: "job queue", x: 270, y: 70, kind: "service" },
        { id: "embed", label: "Embeddings", sub: "code chunks", x: 450, y: 70, kind: "ai" },
        { id: "vec", label: "Pinecone", sub: "vector index", x: 630, y: 70, kind: "data" },
        { id: "ui", label: "Next.js UI", sub: "live progress", x: 90, y: 230, kind: "io" },
        { id: "orch", label: "LangGraph", sub: "orchestrator", x: 270, y: 230, kind: "ai" },
        { id: "agents", label: "Agents", sub: "map · summarize · answer", x: 450, y: 230, kind: "ai" },
        { id: "mem", label: "Redis", sub: "agent memory", x: 630, y: 230, kind: "data" },
      ],
      edges: [
        { from: "repo", to: "queue" },
        { from: "queue", to: "embed" },
        { from: "embed", to: "vec" },
        { from: "ui", to: "orch", label: "stream" },
        { from: "orch", to: "agents", label: "tools" },
        { from: "agents", to: "vec", label: "retrieve" },
        { from: "agents", to: "mem" },
      ],
    },
  },
  {
    slug: "voice-assistant",
    index: "02",
    title: "AI Voice Assistant",
    tagline: "A voice-first assistant with LLM intent classification and a low-latency speech pipeline.",
    year: "2025",
    kind: "Project",
    thumb: "voice",
    hue: 318,
    stack: ["React.js", "Node.js", "Google Gemini API", "Web Speech API", "MongoDB", "JWT", "Tailwind CSS"],
    facts: ["LLM intent classification", "Speech-to-text + text-to-speech", "Pluggable command handlers"],
    story: {
      spark:
        "I wanted to go past a speech-to-text demo. Hearing the words is the easy part — the interesting problem is deciding what the person actually wants, and doing the right thing with it.",
      questions: [
        "\"Play something\", \"search this\", \"set a timer\" — how do I tell them apart without writing a rule for every phrasing?",
        "How do I keep the loop fast enough to feel like a conversation?",
        "How do I add a new skill without rewriting the core?",
      ],
      decisions: [
        {
          choice: "An LLM as the intent classifier",
          why: "Prompt-engineered Gemini calls map free-form speech to an intent, so new phrasings work without new rules.",
        },
        {
          choice: "Speech handled in the browser",
          why: "The Web Speech API runs speech-to-text and text-to-speech on the client, cutting round trips so replies come back quickly.",
        },
        {
          choice: "Pluggable command handlers",
          why: "Each intent routes to its own handler — adding a capability means adding a handler, not touching the classifier.",
        },
      ],
      hardest:
        "Prompts that classify reliably. Spoken requests are short and ambiguous, so each intent has to be defined sharply enough that search, media and utility commands never bleed into each other.",
      learned: "Using an LLM well often means using it narrowly: one clear decision, with ordinary code doing the rest.",
    },
    problem: "Voice commands span very different intents — search, media, utilities — and each needs a different action.",
    approach:
      "Google Gemini with prompt engineering classifies each spoken request into an intent, which is routed to a pluggable command handler.",
    aiComponents: [
      { name: "Intent classification", detail: "Prompt-engineered Gemini calls classify requests across search, media, and utility commands." },
      { name: "Speech pipeline", detail: "Web Speech API handles speech-to-text and text-to-speech for a low-latency loop." },
    ],
    implementation: [
      "Modular Node.js backend with MongoDB and JWT-based auth.",
      "Pluggable command handlers make new capabilities easy to add.",
      "Responsive UI built with Tailwind CSS.",
    ],
    result: null,
    resultPlaceholder: "Add outcome — demo video, link, or usage notes.",
    links: [
      { label: "Source", href: "https://github.com/Yusuf-Hussain25/AI-Voice-Assistant" },
      { label: "Demo", href: null },
    ],
    architecture: {
      nodes: [
        { id: "mic", label: "Voice input", sub: "microphone", x: 90, y: 70, kind: "io" },
        { id: "stt", label: "Web Speech", sub: "speech-to-text", x: 270, y: 70, kind: "service" },
        { id: "api", label: "Node.js API", sub: "JWT auth", x: 450, y: 70, kind: "service" },
        { id: "llm", label: "Gemini", sub: "intent classifier", x: 630, y: 70, kind: "ai" },
        { id: "tts", label: "Spoken reply", sub: "text-to-speech", x: 90, y: 230, kind: "io" },
        { id: "handlers", label: "Handlers", sub: "search · media · utility", x: 360, y: 230, kind: "service" },
        { id: "db", label: "MongoDB", sub: "persistence", x: 630, y: 230, kind: "data" },
      ],
      edges: [
        { from: "mic", to: "stt" },
        { from: "stt", to: "api" },
        { from: "api", to: "llm" },
        { from: "llm", to: "handlers", label: "intent" },
        { from: "handlers", to: "tts" },
        { from: "api", to: "db" },
      ],
    },
  },
  {
    slug: "automation",
    index: "03",
    title: "LLM Automation Pipelines",
    tagline: "n8n + LLM pipelines and AI-enabled apps delivered as project lead at Freedom With AI.",
    year: "2025 — now",
    kind: "Professional work",
    thumb: "workflow",
    hue: 158,
    stack: ["n8n", "LLMs", "Node.js", "Python", "PostgreSQL", "Flutter", "AWS", "CI/CD"],
    facts: ["Replaced manual client workflows end-to-end", "LLM streaming + prompt orchestration", "Zero-downtime releases on AWS"],
    story: {
      spark:
        "Client operations ran on the same repeated work every day — sending notifications, chasing reminders, planning and updating tasks by hand. Work that repeats that predictably shouldn't need a person, so I set out to take it off the team's plate.",
      questions: [
        "Which steps are pure rules, and which need the judgment an LLM can supply?",
        "How do we automate without turning the process into a black box the team can't change?",
        "How do we ship to production without interrupting client operations?",
      ],
      decisions: [
        {
          choice: "n8n as the backbone",
          why: "Visual pipelines keep every automation readable and editable, with LLM steps only where a decision or a written message is needed.",
        },
        {
          choice: "Streaming backends in Node.js and Python",
          why: "REST APIs over PostgreSQL with LLM streaming and prompt orchestration, shared by the pipelines and the Flutter apps.",
        },
        {
          choice: "CI/CD on AWS for every release",
          why: "Releases go out through pipelines with zero downtime, so automations people depend on keep running while we deploy.",
        },
      ],
      hardest:
        "Leading it, not just building it — turning scattered requirements into an architecture, coordinating the team, and owning the release when real client work runs on it.",
      learned:
        "Automation is judged by what people stop doing. The best pipeline is the one the team forgets exists, because the work simply gets done.",
    },
    problem:
      "Client operations — notifications, reminders, planning, and task management — were handled through repetitive manual work.",
    approach:
      "Custom n8n + LLM automation pipelines replaced those workflows end-to-end, backed by Node.js and Python services and AI features in Flutter apps.",
    aiComponents: [
      { name: "LLM automation", detail: "n8n pipelines with LLM steps automate notifications, reminders, planning, and task management." },
      { name: "Prompt orchestration", detail: "Backends integrate LLM streaming and prompt orchestration." },
      { name: "Embedded AI features", detail: "Flutter apps ship chat, voice, and document Q&A connected to backend services." },
    ],
    implementation: [
      "Led delivery end-to-end: requirements, architecture, team coordination, production release.",
      "Node.js and Python backends with REST APIs and PostgreSQL.",
      "Production systems on AWS with CI/CD pipelines for zero-downtime releases.",
    ],
    result: "Manual client workflows replaced end-to-end, eliminating repetitive operations.",
    links: [],
    architecture: {
      nodes: [
        { id: "trigger", label: "Client workflow", sub: "events · schedules", x: 90, y: 70, kind: "io" },
        { id: "n8n", label: "n8n", sub: "pipeline", x: 270, y: 70, kind: "service" },
        { id: "llm", label: "LLM step", sub: "prompt orchestration", x: 450, y: 70, kind: "ai" },
        { id: "actions", label: "Actions", sub: "notify · plan · tasks", x: 630, y: 70, kind: "io" },
        { id: "app", label: "Flutter apps", sub: "chat · voice · doc Q&A", x: 90, y: 230, kind: "io" },
        { id: "api", label: "Node / Python", sub: "REST · streaming", x: 360, y: 230, kind: "service" },
        { id: "db", label: "PostgreSQL", sub: "on AWS", x: 630, y: 230, kind: "data" },
      ],
      edges: [
        { from: "trigger", to: "n8n" },
        { from: "n8n", to: "llm" },
        { from: "llm", to: "actions" },
        { from: "app", to: "api" },
        { from: "api", to: "llm", label: "stream" },
        { from: "api", to: "db" },
      ],
    },
  },
  {
    slug: "ai-lab",
    index: "04",
    title: "This AI Lab",
    tagline: "The portfolio you're using — a grounded assistant, a live retrieval engine, and an evaluator.",
    year: "2026",
    kind: "This site",
    thumb: "retrieval",
    hue: 222,
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Canvas 2D", "Route Handlers"],
    facts: ["In-browser vector search", "Grounded, streamed answers", "Four live AI experiments"],
    story: {
      spark:
        "Every AI portfolio says \"built with LLMs\". I wanted mine to prove it — a site where anyone can ask a question, watch retrieval happen, and check whether the answer is actually grounded.",
      questions: [
        "How do I stop the assistant from inventing things about me?",
        "Can retrieval run in the browser, with no vector database to host?",
        "What happens when there's no API key, or the model is unavailable?",
      ],
      decisions: [
        {
          choice: "One knowledge base for everything",
          why: "Every claim on the site lives in the content files; the assistant, the RAG explorer and the evaluator all read the same chunks.",
        },
        {
          choice: "Hashed embeddings in the browser",
          why: "256-dimension feature-hashed vectors and cosine search run client-side — instant, private, and free to host.",
        },
        {
          choice: "A local fallback behind the model",
          why: "With a key, retrieved context goes to Claude; without one, a local composer answers only from retrieved facts, so the site never breaks.",
        },
      ],
      hardest:
        "Making it feel premium without letting the effects take over — the neural canvas, the themes and the transitions had to support the content, not compete with it.",
      learned: "Treating a portfolio as a product changes the question from \"what should I show?\" to \"what can a visitor verify?\"",
    },
    problem: "Most portfolios describe AI work. Few let visitors inspect how an AI system actually works.",
    approach:
      "Treat the portfolio as a product: every claim lives in one knowledge base, which powers the assistant, the RAG explorer, and the evaluator.",
    aiComponents: [
      { name: "Hashed embeddings", detail: "Portfolio facts are chunked and embedded into 256-dimension feature-hashed vectors, in your browser." },
      { name: "Vector search", detail: "Cosine similarity retrieves the top-k chunks for each question." },
      { name: "Grounded generation", detail: "Retrieved context is sent to Claude when an API key is configured; otherwise a local composer answers only from retrieved facts." },
      { name: "Evaluation", detail: "Claims are scored for groundedness and relevance against the knowledge base." },
    ],
    implementation: [
      "Streaming NDJSON route handler with rate limiting and a local fallback.",
      "Physics-based neural canvas with springs, inertia, and theme-aware rendering.",
      "Semantic color tokens for two first-class themes.",
    ],
    result: "You're looking at it.",
    links: [{ label: "Source", href: "https://github.com/Yusuf-Hussain25/yusuf-portfolio" }],
    architecture: {
      nodes: [
        { id: "query", label: "Your question", sub: "input", x: 90, y: 70, kind: "io" },
        { id: "embed", label: "Embedding", sub: "256-d hashed", x: 270, y: 70, kind: "ai" },
        { id: "search", label: "Vector search", sub: "cosine top-k", x: 450, y: 70, kind: "ai" },
        { id: "kb", label: "Knowledge base", sub: "portfolio chunks", x: 630, y: 70, kind: "data" },
        { id: "ui", label: "Next.js UI", sub: "streamed tokens", x: 90, y: 230, kind: "io" },
        { id: "route", label: "/api/chat", sub: "route handler", x: 330, y: 230, kind: "service" },
        { id: "llm", label: "Generator", sub: "Claude · local", x: 570, y: 230, kind: "ai" },
      ],
      edges: [
        { from: "query", to: "embed" },
        { from: "embed", to: "search" },
        { from: "search", to: "kb" },
        { from: "search", to: "llm", label: "context" },
        { from: "llm", to: "route" },
        { from: "route", to: "ui", label: "stream" },
      ],
    },
  },
];

// ───────────────────────── Client work ─────────────────────────
// Live products.
//
// Descriptions are paraphrased from the products' public case studies;
// the stack lists only what those case studies state. Yusuf's personal contribution is
// left `null` until he confirms it.

export type Screen = { src: string; alt: string; kind: "showcase" | "desktop" | "mobile" };

export type ClientProject = {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  thumb: ThumbVariant;
  /** Visual only: OKLCH hue for the project's accent color. */
  hue: number;
  /** Screenshot of the public landing page, or null to keep the code-drawn thumbnail. */
  image: string | null;
  /** Mobile screenshot, shown as a phone in the "showcase" thumbnail. */
  phone?: string | null;
  /** Case-study gallery captured from the live product. */
  screens?: Screen[];
  stack: string[];
  features: string[];
  challenge: string;
  solution: string;
  flow: string[];
  story: ProjectStory;
  contribution: string | null;
  liveUrl: string | null;
};

export const clientProjects: ClientProject[] = [
  {
    slug: "vidyt",
    title: "VidYT",
    category: "AI SaaS · Creator analytics",
    tagline: "Pre-publish AI scoring that flags a weak hook, title, or thumbnail before a video goes live.",
    thumb: "video-score",
    hue: 25,
    image: "/images/projects/vidyt.jpg",
    stack: ["Next.js", "TypeScript", "AI/LLM", "MongoDB"],
    features: [
      "Predicts likely CTR and retention before upload",
      "Trend radar for rising topics in a niche",
      "Script, hook, and title optimization tools",
      "Automatic long-form to Shorts clipping",
      "One workflow across YouTube, Shorts, Reels, Facebook, and TikTok",
    ],
    challenge:
      "Creators only discovered that a thumbnail, hook, or title underperformed after publishing — when the hours spent were already lost.",
    solution:
      "A scoring checkpoint built into the upload workflow reviews a video before it goes live, backed by AI tools for scripts, hooks, titles, and clipping.",
    flow: ["Draft video", "AI scoring", "Flag hook · title · thumbnail", "Optimize", "Publish"],
    story: {
      spark:
        "Creators pour hours into a video and only learn after publishing that the thumbnail, hook or title didn't land — when the effort is already spent. We wanted that feedback to arrive before the upload button.",
      questions: [
        "Can a draft be scored on the signals behind CTR and retention before it's public?",
        "How does a low score turn into something the creator can actually fix?",
        "How does it fit one workflow across YouTube, Shorts, Reels, Facebook and TikTok?",
      ],
      decisions: [
        {
          choice: "A scoring checkpoint inside the upload flow",
          why: "Review happens where creators already are — right before publishing — not in a separate analytics tool.",
        },
        {
          choice: "Every flag leads to a fix",
          why: "Scores connect to AI tools for scripts, hooks, titles and clipping, so the next step is always obvious.",
        },
        {
          choice: "Short-form built in",
          why: "Automatic long-form to Shorts clipping turns one video into content for every platform.",
        },
      ],
      hardest: "Making predictions useful rather than intimidating — a score only helps when it points to a specific change.",
      learned: "The most valuable moment for feedback is before the decision, not after the result.",
    },
    contribution: null,
    liveUrl: null, // https://www.vidyt.com — returned 502 on 2026-09-14; restore once it's back up
  },
  {
    slug: "growthos",
    title: "GrowthOS",
    category: "AI SaaS · Autonomous sales agents",
    tagline: "Five role-based AI agents that keep a revenue pipeline moving outside working hours.",
    thumb: "agents-pipeline",
    hue: 82,
    image: "/images/projects/growthos.jpg",
    stack: ["Next.js", "AI Agents", "TypeScript", "MongoDB"],
    features: [
      "CEO, Sales, Marketing, Proposal, and Outreach agents",
      "Inbound lead scoring against the ideal customer profile",
      "AI-drafted proposals from enriched lead profiles",
      "Multi-touch email and LinkedIn outreach",
      "Meeting scheduling and CRM sync",
    ],
    challenge:
      "Qualifying leads, drafting proposals, and running outreach all waited on a person — so the pipeline stalled whenever the team was offline.",
    solution:
      "Specialized agents split growth work the way a team would, running a staged pipeline from lead intake through outreach, meetings, and CRM sync.",
    flow: ["Ingest leads", "Score intent & ICP fit", "Enrich", "Draft proposal", "Outreach", "Book meeting", "Sync CRM"],
    story: {
      spark:
        "A sales pipeline stalls the moment the team goes offline — leads wait to be qualified, proposals wait to be written, follow-ups slip. The question was whether AI agents could keep that work moving around the clock.",
      questions: [
        "How do we split growth work so each agent has one clear job?",
        "Which leads deserve attention first?",
        "How do people stay aware of everything the agents did?",
      ],
      decisions: [
        {
          choice: "Agents shaped like a team",
          why: "CEO, Sales, Marketing, Proposal and Outreach agents mirror how a real growth team divides its responsibilities.",
        },
        {
          choice: "A staged pipeline",
          why: "Leads move from intake to ICP scoring, enrichment, proposal, outreach, meeting and CRM sync — each stage with a clear output.",
        },
        {
          choice: "The CRM stays the source of truth",
          why: "Every step syncs back, so the team can see exactly what the agents did and pick up from there.",
        },
      ],
      hardest:
        "Hand-offs between agents — a proposal is only as good as the enrichment before it, so each stage has to pass the right context forward.",
      learned: "Autonomous agents work best with the structure of a real team: clear roles, clear hand-offs, clear records.",
    },
    contribution: null,
    liveUrl: "https://growthos.kvlbusinesssolutions.com",
  },
  {
    slug: "super-ai",
    title: "Super AI",
    category: "AI SaaS · Website chatbot",
    tagline: "A self-training chatbot that learns a website on its own and goes live from a one-line embed.",
    thumb: "chatbot",
    hue: 52,
    image: "/images/projects/super-ai.jpg",
    stack: ["Next.js", "AI/LLM", "TypeScript", "Self-Hosted"],
    features: [
      "Scans pages, products, services, and FAQs automatically",
      "Builds its own knowledge base from the scan",
      "Strictly read-only access to site data",
      "One-line embed script",
      "Answers visitors in their own language",
    ],
    challenge:
      "Website chatbots needed a manually fed knowledge base and constant upkeep, so most businesses never made it past setup.",
    solution:
      "Give it a URL: it crawls the site, trains a knowledge base from what it finds, and returns an embed script — self-hosted and read-only.",
    flow: ["Website URL", "Crawl content", "Build knowledge base", "Embed script", "Answer visitors"],
    story: {
      spark:
        "Most businesses want a website chatbot and never get past setup — someone has to feed it pages, products and FAQs, then keep all of it up to date. The idea: let the bot learn the site by itself.",
      questions: [
        "Can a crawl alone build a knowledge base good enough to answer visitors?",
        "How do we make it safe to point at a live website?",
        "How small can installation possibly be?",
      ],
      decisions: [
        {
          choice: "Start from a URL, not a document dump",
          why: "It crawls pages, products, services and FAQs, and trains its knowledge base from what it finds.",
        },
        {
          choice: "Strictly read-only",
          why: "The bot only reads site data, so it can never change anything on the business's website.",
        },
        {
          choice: "A one-line embed",
          why: "Setup ends with a single script, and the bot answers visitors in their own language.",
        },
      ],
      hardest:
        "Turning messy real-world pages into clean knowledge — navigation, repeated footers and marketing copy have to be separated from the facts a visitor actually needs.",
      learned: "The best onboarding is almost no onboarding. When setup is one URL, far more businesses actually go live.",
    },
    contribution: null,
    liveUrl: "https://superai.kvlbusinesssolutions.com",
  },
  {
    slug: "body-tracker",
    title: "Body Tracker",
    category: "Computer vision · Wellness",
    tagline: "In-browser face, hand, and pose tracking that turns a webcam into live posture and attention scores.",
    thumb: "vision-pose",
    hue: 145,
    image: "/images/projects/body-tracker.jpg",
    stack: ["Next.js", "TypeScript", "Google MediaPipe", "Computer Vision"],
    features: [
      "Live posture, attention, and fatigue scoring",
      "Runs entirely in the browser — video never leaves the device",
      "Hand gesture recognition and multi-person tracking",
      "Session PDF reports",
      "JavaScript SDK and React hooks for other products",
    ],
    challenge:
      "Measuring how someone sits, moves, or focuses usually meant wearables, dedicated sensors, or uploading video to someone else's server.",
    solution:
      "MediaPipe face, hand, and pose models run inside the browser, scoring the camera feed live and exposing the same pipeline as an SDK.",
    flow: ["Webcam", "MediaPipe in browser", "Posture · attention · fatigue", "Dashboard · PDF · SDK"],
    story: {
      spark:
        "Measuring posture or focus usually means wearables, dedicated sensors, or uploading someone's camera feed to a server. A webcam and a browser should be enough.",
      questions: [
        "Can face, hand and pose models run fast enough inside a browser?",
        "How do we keep video private by design, not by promise?",
        "How can other products reuse the same pipeline?",
      ],
      decisions: [
        {
          choice: "MediaPipe on the device",
          why: "Face, hand and pose models run in the browser, so the camera feed never leaves the device.",
        },
        {
          choice: "Scores, not raw landmarks",
          why: "Tracking data becomes posture, attention and fatigue scores people can understand — plus session PDF reports.",
        },
        {
          choice: "Ship it as an SDK",
          why: "A JavaScript SDK and React hooks expose the same pipeline to other products.",
        },
      ],
      hardest: "Turning noisy, frame-by-frame landmarks into steady, meaningful scores in real time, on ordinary hardware.",
      learned: "Privacy can be an architecture decision. If the video never leaves the device, there's nothing on a server to protect.",
    },
    contribution: null,
    liveUrl: null, // https://bodytracker.kvlbusinesssolutions.com — returned 502 on 2026-09-14; restore once it's back up
  },
  {
    slug: "aapkaplot",
    title: "AapKaPlot",
    category: "PropTech · Property marketplace",
    tagline: "A map-first marketplace for verified plots, homes, and commercial listings with direct owner contact.",
    thumb: "map",
    hue: 170,
    image: "/images/projects/aapkaplot.jpg",
    stack: ["Next.js", "React", "MongoDB", "GPS APIs"],
    features: [
      "Live, satellite-capable map search",
      "GPS-based nearby discovery",
      "Category and budget filters",
      "AI recommendations and chat assistant",
      "Verified owner contact",
    ],
    challenge:
      "Buyers relied on scattered listings with no easy way to verify ownership, exact location, or whether a listing was still current.",
    solution:
      "Every listing sits on a live map with location detection and filters, while AI recommendations narrow options and buyers contact verified owners directly.",
    flow: ["Buyer location", "Map search + filters", "AI recommendations", "Verified owner"],
    story: {
      spark:
        "Buying a plot often means scattered listings, vague locations and no way to know whether the owner — or the listing — is real. The idea was to put every property on a map and connect buyers directly with verified owners.",
      questions: [
        "How does a buyer judge a location before visiting?",
        "How do we cut down on fake or outdated listings?",
        "How do we narrow a long list down to the right few?",
      ],
      decisions: [
        {
          choice: "Map-first search",
          why: "Every listing sits on a live, satellite-capable map with GPS-based nearby discovery.",
        },
        {
          choice: "Verified owner contact",
          why: "Buyers reach owners directly, removing the uncertainty of unverified middlemen.",
        },
        {
          choice: "AI to narrow the choice",
          why: "Category and budget filters work together with AI recommendations and a chat assistant.",
        },
      ],
      hardest: "Making location the heart of the product — the map, the filters and the listing details all had to work as one experience.",
      learned: "In real estate, trust and location are the product. Anything that serves neither is noise.",
    },
    contribution: null,
    liveUrl: null, // https://aapkaplot.com — returned 502 on 2026-09-14; restore once it's back up
  },
  {
    slug: "restro-os",
    title: "Restro OS",
    category: "Restaurant management platform",
    tagline: "Ordering, billing, reservations, and delivery-platform orders unified in one restaurant system.",
    thumb: "pos",
    hue: 68,
    image: "/images/projects/restro-os.jpg",
    stack: ["Next.js", "Node.js", "Razorpay", "MongoDB"],
    features: [
      "GST-ready POS and billing",
      "Automated table reservations without double-bookings",
      "Zomato and Swiggy orders in the same system",
      "Dish and hour revenue analytics",
      "Staff management and online ordering",
    ],
    challenge:
      "Bookings, billing, and delivery orders lived in separate tools, so reconciling a day's numbers was manual and dish-level margins stayed invisible.",
    solution:
      "Dine-in, takeaway, and delivery run from one platform with automated billing and booking, feeding an analytics layer on what actually drives revenue.",
    flow: ["Dine-in · takeaway · delivery", "One order system", "Billing", "Revenue analytics"],
    story: {
      spark:
        "Restaurants were juggling one tool for billing, another for reservations, and separate dashboards for Zomato and Swiggy orders. Closing the day meant reconciling them by hand — and nobody could see which dishes actually made money.",
      questions: [
        "Can dine-in, takeaway and delivery run through one order system?",
        "How do we end double-booked tables?",
        "Which numbers does an owner really need to see?",
      ],
      decisions: [
        {
          choice: "One order system for every channel",
          why: "Dine-in, takeaway and Zomato and Swiggy orders all land in the same place.",
        },
        {
          choice: "Automated billing and reservations",
          why: "GST-ready billing and table bookings run on their own, with no double-bookings.",
        },
        {
          choice: "Analytics by dish and by hour",
          why: "Revenue is broken down to what sells and when, so owners see what actually drives the business.",
        },
      ],
      hardest:
        "Rush hour. A restaurant system has to stay fast and simple when the floor is full and orders arrive from every channel at once.",
      learned: "Unifying the data is the real feature — once every order lives in one place, the insight comes almost for free.",
    },
    contribution: null,
    liveUrl: null, // https://restro.kvlbusinesssolutions.com — returned 502 on 2026-09-14; restore once it's back up
  },
];
