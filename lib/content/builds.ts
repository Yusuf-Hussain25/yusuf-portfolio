// Personal builds (2026). Everything here comes from each project's own README
// and its screenshots in the repo. No invented users, revenue or outcomes:
// the numbers are the ones the projects themselves measure (test counts,
// latency runs, demo data).
//
// Several of these started as course projects and were rebuilt as "2.0".
// That is said plainly on every page (`origin` + `compare`), because the
// interesting part is what changed and why.

import type { ProjectStory } from "./projects";

export type Shot = { src: string; alt: string; w: number; h: number };

export type Build = {
  slug: string;
  title: string;
  tagline: string;
  /** Two or three sentences: what it is, who it's for. */
  summary: string;
  year: string;
  area: "AI" | "Full-stack";
  /** Visual only: OKLCH hue for the project's accent color. */
  hue: number;
  liveUrl: string | null;
  repoUrl: string;
  stack: string[];
  /** Short, verifiable facts shown as big numbers. */
  highlights: { value: string; label: string }[];
  /** Where the project came from, said honestly. */
  origin?: string;
  /** Version 1 → version 2, area by area. */
  compare?: { area: string; before: string; after: string }[];
  story: ProjectStory;
  features: { group: string; items: string[] }[];
  /** The engineering under the UI: security, performance, data, ops. */
  engineering: { title: string; detail: string }[];
  /** Desktop screens. The first one is the cover. */
  screens: Shot[];
  phones: Shot[];
};

const gh = (repo: string) => `https://github.com/Yusuf-Hussain25/${repo}`;
const d = (slug: string, name: string, alt: string, w = 1440, h = 900): Shot => ({ src: `/images/projects/${slug}/${name}.webp`, alt, w, h });
const m = (slug: string, name: string, alt: string, w = 780, h = 1688): Shot => ({ src: `/images/projects/${slug}/${name}.webp`, alt, w, h });

export const builds: Build[] = [
  {
    slug: "nova",
    title: "Nova",
    tagline: "A voice-first AI assistant that searches the web, checks the weather, does exact maths and answers out loud.",
    summary:
      "Talk to it or type. Nova uses real tools instead of guessing: live web search with sources, a weather card with a 4-day forecast, exact maths and unit conversion, and actions like “play lo-fi on YouTube”. It replies in English, Hindi or Hinglish, and needs no sign-up.",
    year: "2026",
    area: "AI",
    hue: 128,
    liveUrl: "https://nova.yusufhussain.in",
    repoUrl: gh("nova-assistant"),
    stack: ["Next.js 16", "React 19", "AI SDK 7", "OpenAI", "Gemini", "Neon Postgres", "Drizzle ORM", "Tailwind CSS v4", "Vercel"],
    highlights: [
      { value: "3", label: "languages: English, Hindi, Hinglish" },
      { value: "0", label: "sign-ups needed to start talking" },
      { value: "2", label: "AI providers, with automatic fallback" },
    ],
    origin: "Nova 2.0 is a ground-up rebuild of my 2025 AI Voice Assistant (React, Express, MongoDB, Gemini).",
    compare: [
      { area: "Stack", before: "React + Express + MongoDB", after: "Next.js 16 (App Router, Cache Components), Neon Postgres + Drizzle, deployed on Vercel" },
      { area: "AI", before: "Gemini classifying intent from a prompt", after: "AI SDK 7 tool calling: web search, weather, mathjs and app actions; OpenAI primary with Gemini fallback" },
      { area: "Voice", before: "Browser speech APIs, a button for every turn", after: "Hands-free mode: end-of-speech detected from the mic level, tap the orb to interrupt; OpenAI transcription and speech" },
      { area: "History", before: "Needed an account", after: "Anonymous HttpOnly session cookie scopes every chat to one browser; one click wipes it" },
    ],
    story: {
      spark:
        "My first voice assistant could talk, but it guessed. Ask it the weather or a GST calculation and you got a confident sentence, not a fact. I wanted an assistant that reaches for a real tool whenever a real answer exists, and that you can use hands-free like a person in the room.",
      questions: [
        "How do I stop a language model from guessing numbers, weather and news?",
        "How can voice feel natural, with no button between every turn?",
        "How do I keep chat history private without forcing people to sign up?",
        "A public AI demo costs money per message. How do I keep it from being abused?",
      ],
      decisions: [
        {
          choice: "Tools, not guesses",
          why: "Web search with sources, Open-Meteo weather, mathjs for exact maths and unit conversion. The model decides which tool to call; the tool produces the answer.",
        },
        {
          choice: "Detect end of speech from the mic level",
          why: "Web Audio measures the level, so you just speak and pause. Voice turns use minimal reasoning effort and a spoken-style prompt (short, no markdown) to keep latency low.",
        },
        {
          choice: "An anonymous session instead of accounts",
          why: "An HttpOnly cookie scopes every chat and setting to one browser. Every read, write and delete is checked against that visitor id; anyone else gets a not-found page.",
        },
        {
          choice: "Fallbacks everywhere",
          why: "OpenAI is primary with automatic Gemini fallback; weather falls back from Open-Meteo to wttr.in. A demo that breaks when one vendor hiccups isn't a product.",
        },
      ],
      hardest:
        "Making streaming and persistence agree. The client sends only the new message; the server loads history from Postgres, validates it against the tool schemas, streams the reply and saves it when it finishes. Regenerate trims history on the server, not in the browser.",
      learned:
        "The model is the easy part. Cost caps, isolation between visitors and fallbacks are what turn a demo into something you can leave running on a public URL.",
    },
    features: [
      {
        group: "Talk to it",
        items: [
          "Hands-free voice mode: speak, pause, and it answers aloud",
          "Interrupt any time by tapping the orb",
          "English, Hindi or Hinglish, spoken and written",
        ],
      },
      {
        group: "Real answers",
        items: [
          "Live web search with sources",
          "Weather card with a 4-day forecast",
          "Exact maths, GST, EMIs and unit conversion",
          "App actions: play on YouTube or Spotify, open Maps or Gmail",
        ],
      },
      {
        group: "Private by default",
        items: ["Chat history without accounts", "Search conversations with Ctrl K", "“Clear history & reset” wipes everything"],
      },
    ],
    engineering: [
      { title: "Cost controls", detail: "Per-visitor hourly caps on chat (40), transcription and speech (80), a 4,000-character message limit and an 8 MB audio limit. Resetting history doesn't reset the caps." },
      { title: "Isolation", detail: "Every chat read, write and delete is checked against the visitor id from the HttpOnly cookie." },
      { title: "Streaming persistence", detail: "History lives on the server and is validated against tool schemas before each streamed reply is saved." },
      { title: "Region placement", detail: "Hosted on Vercel in Singapore, next to the Neon database, with the HTTP driver so there is no server to run." },
    ],
    screens: [d("nova", "home", "Nova home: voice orb, tool cards for weather, web search, maths and apps")],
    phones: [m("nova", "mobile", "Nova on a phone", 390, 844)],
  },
  {
    slug: "cueline",
    title: "Cueline",
    tagline: "A real-time interview copilot: live transcript, question detection and streamed answers grounded in your resume.",
    summary:
      "Cueline listens to the interviewer in a Google Meet or Zoom tab, transcribes them live, works out when a real question has been asked, and streams back a short, speakable answer based on your resume and the job description.",
    year: "2026",
    area: "AI",
    hue: 200,
    liveUrl: null,
    repoUrl: gh("cueline"),
    stack: ["Next.js", "TypeScript", "Node.js", "WebSocket", "AudioWorklet", "Deepgram Nova-3", "Claude Haiku", "Zod"],
    highlights: [
      { value: "~2 s", label: "median from end of question to first answer word" },
      { value: "747 ms", label: "median time to first token (Claude Haiku)" },
      { value: "4", label: "layers of question detection" },
    ],
    story: {
      spark:
        "In a live interview the answer is only useful in the next two or three seconds. That turns an “AI chat” problem into a real-time systems problem: audio capture, streaming speech-to-text, deciding when a question is finished, and an LLM that starts talking fast enough.",
      questions: [
        "When has the interviewer actually asked a question, and not just said “can you hear me?”",
        "Which speech-to-text gives live partial results and end-of-speech signals?",
        "Which model can start answering inside a 3-second budget?",
        "How do I keep every vendor swappable?",
      ],
      decisions: [
        {
          choice: "Deepgram over raw WebSocket, no SDK",
          why: "It streams interim and final results and gives end-of-speech signals for free. The protocol is small, so writing it directly keeps every byte visible. An SttStream interface keeps the server provider-neutral.",
        },
        {
          choice: "Measure the model, don't guess",
          why: "A benchmark script sent five interview questions through the real prompt: Claude Haiku 747 ms median TTFT, GPT-4.1 mini 1,422 ms, Opus (low effort) 5,303 ms. Detection takes ~1.1 s, so only Haiku leaves real headroom. Opus is one env var away.",
        },
        {
          choice: "Detection layers that get more expensive only when needed",
          why: "Rules on every turn (~0 ms), a short hold when a turn trails off on “and / the / to”, an LLM classifier only when rules can't decide, and a stable-interim backstop when STT is slow to finalise.",
        },
        {
          choice: "One shared WebSocket contract",
          why: "A shared package holds the message types and audio constants, so client and server can't drift apart.",
        },
      ],
      hardest:
        "Answering at the right moment: not on small talk, not halfway through “tell me about a time when…”, and not seconds late. That is why detection is layered instead of one prompt.",
      learned:
        "Latency is a budget you spend stage by stage. Writing the budget down (endpointing, detection, first token) showed exactly where the next second could come from: speculative generation on stable interim text.",
    },
    features: [
      {
        group: "Live",
        items: [
          "Captures tab audio (Chrome/Edge) or the microphone",
          "AudioWorklet resamples to 16 kHz PCM and streams 50 ms chunks",
          "Live transcript with interim and final text",
        ],
      },
      {
        group: "Answers",
        items: [
          "Question detection with rules, hold, classifier and backstop",
          "Short, speakable answers grounded in resume + job description",
          "Streamed token by token, with latency metrics in the UI",
        ],
      },
      {
        group: "Pluggable",
        items: ["Claude, OpenAI, Gemini, Groq or DeepSeek behind one LlmClient interface", "Deepgram behind an SttStream interface", "History of past sessions"],
      },
    ],
    engineering: [
      { title: "Latency budget", detail: "Measured on a bundled 71-second mock interview (5 questions): Deepgram endpointing ~1.0–1.4 s, then detection, then first token. Median first word ≈ 2 s." },
      { title: "Session state machine", detail: "One Session per socket runs the pipeline and records latency metrics for every answer." },
      { title: "Config validation", detail: "Environment is validated with zod at startup; provider selection is one setting." },
      { title: "Known limits, written down", detail: "Tab audio needs Chrome or Edge; microphone mode has no speaker separation. Next step: speculative generation and a labelled evaluation set." },
    ],
    screens: [
      d("cueline", "streaming", "Live transcript with a detected question and a streaming answer", 1600, 1000),
      d("cueline", "hero-light", "Cueline setup screen in light mode", 1600, 1000),
      d("cueline", "dark", "Cueline in dark mode", 1600, 1000),
      d("cueline", "history", "Past interview sessions", 1600, 1000),
    ],
    phones: [m("cueline", "mobile", "Cueline on a phone", 390, 844)],
  },
  {
    slug: "vendora",
    title: "Vendora",
    tagline: "A multi-vendor marketplace for India: one cart across independent stores, flash deals and live delivery tracking.",
    summary:
      "Shoppers check out across many independent stores in a single cart and follow their rider live on a map. Sellers run their own storefronts with an AI listing assistant and flash deals; admins approve stores. Everything is priced in rupees.",
    year: "2026",
    area: "Full-stack",
    hue: 150,
    liveUrl: "https://vendora.yusufhussain.in",
    repoUrl: gh("vendora"),
    stack: ["Next.js 16", "React 19", "Server Actions", "Neon Postgres", "Prisma", "Better Auth", "Stripe", "Leaflet", "Tailwind CSS v4"],
    highlights: [
      { value: "5 → 1", label: "course stores merged into one product" },
      { value: "4", label: "roles: shopper, seller, rider, admin" },
      { value: "₹", label: "Indian pricing, PIN lookup, all states" },
    ],
    origin: "Vendora merges five separate course e-commerce projects (GoCart, Forever, Grocery Delivery, Greencart, QuickCart) into one product, rebuilt from the ground up.",
    compare: [
      { area: "Scope", before: "Five separate demo stores", after: "One marketplace: fashion, groceries, electronics and home goods from independent sellers" },
      { area: "Data", before: "Three different MongoDB setups", after: "Neon Postgres + Prisma, one schema" },
      { area: "Auth", before: "Clerk in one app, hand-rolled JWTs in others", after: "Better Auth, self-hosted, roles stored in the database" },
      { area: "Checkout", before: "Prices trusted from the browser", after: "Server-side price, size and stock checks; stock reserved in a transaction; Stripe payments verified before an order counts as paid" },
      { area: "Design", before: "Five unrelated templates", after: "Editorial design system: ivory and forest green, Instrument Serif headlines, optional dark theme" },
    ],
    story: {
      spark:
        "I had five e-commerce course projects that each did one thing: one had multi-vendor stores, one had size variants, one had riders on a map. None of them was a product. I wanted to see what happens when you merge them into one real marketplace and fix everything the demos skipped.",
      questions: [
        "How does one cart work when every item comes from a different store with its own delivery fee?",
        "What has to happen on the server so the browser can never set a price or oversell stock?",
        "What does “built for India” actually mean in the address form and the prices?",
      ],
      decisions: [
        {
          choice: "Next.js 16 with Server Actions",
          why: "One app for shoppers, sellers, riders and admins. Server Components keep catalogue pages fast; Server Actions keep mutations next to the data.",
        },
        {
          choice: "Postgres + Prisma instead of three MongoDBs",
          why: "Orders, stock, coupons and stores are relational. Reserving stock inside a transaction is the only honest way to avoid overselling.",
        },
        {
          choice: "Better Auth, self-hosted",
          why: "No third-party account needed, and roles live in the same database as everything else.",
        },
        {
          choice: "Built for India from the start",
          why: "Rupees with Indian digit grouping (₹1,34,900), all states and union territories, and PIN code lookup that fills city and state.",
        },
      ],
      hardest:
        "Checkout across stores: one cart becomes several per-store orders, each with its own delivery fee, coupon rules and stock reservation, and all of it must fail or succeed together.",
      learned:
        "Merging features is easy; merging data models is the real work. Once the schema was right, every screen got simpler.",
    },
    features: [
      {
        group: "Shoppers",
        items: [
          "Search across products, brands, tags and stores; filters and sorting live in the URL",
          "Product pages with gallery, size picker, reviews and related items",
          "Flash deals with live countdowns",
          "One cart grouped by seller, coupons, guest cart merged on login",
          "Live order tracking on OpenStreetMap, refreshed every 5 seconds",
        ],
      },
      {
        group: "Sellers, riders, admins",
        items: ["Seller storefront and dashboard with an AI listing assistant", "Inventory with history", "Rider screen with delivery OTP", "Admin approval of stores"],
      },
    ],
    engineering: [
      { title: "Checkout integrity", detail: "Server-side price, size and stock checks, stock reserved in a transaction, per-store orders and delivery fees, coupon expiry enforced." },
      { title: "Payments", detail: "Cash on delivery or Stripe; Stripe payments are verified with Stripe before orders count as paid." },
      { title: "Maps without keys", detail: "Leaflet + react-leaflet with OpenStreetMap tiles, so tracking works with no paid map API." },
      { title: "One design system", detail: "Loading skeletons, empty states, toasts and keyboard-friendly controls on every screen, 390 px phones to wide desktops." },
    ],
    screens: [
      d("vendora", "home", "Vendora home page with departments and flash deals"),
      d("vendora", "shop", "Shop with filters for department, price, rating and stock"),
      d("vendora", "product", "Product page with gallery, sizes and reviews"),
      d("vendora", "cart", "One cart grouped by store"),
      d("vendora", "tracking", "Live delivery tracking on a map"),
      d("vendora", "seller", "Seller dashboard"),
      d("vendora", "rider", "Rider delivery screen"),
      d("vendora", "admin", "Admin store approvals"),
      d("vendora", "home-dark", "Home page in the dark evening theme"),
    ],
    phones: [],
  },
  {
    slug: "meetora",
    title: "Meetora",
    tagline: "Peer-to-peer video meetings with live captions, reactions, screen sharing, host controls and session recaps.",
    summary:
      "Video calls in the browser that feel like a room: a pre-join lobby, an adaptive grid with active-speaker glow, live captions, reactions and raised hands, real host controls, and a searchable recap of every session.",
    year: "2026",
    area: "Full-stack",
    hue: 160,
    liveUrl: "https://meetora.yusufhussain.in",
    repoUrl: gh("meetora"),
    stack: ["React 19", "Vite", "WebRTC", "Socket.io", "Clerk", "Neon Postgres", "Gemini", "Tailwind CSS v4"],
    highlights: [
      { value: "26", label: "automated security checks" },
      { value: "P2P", label: "WebRTC mesh with STUN + optional TURN" },
      { value: "Live", label: "captions and searchable transcripts" },
    ],
    origin: "Meetora 2.0 is a full redesign and rebuild of a basic course project (“MeetUp”).",
    compare: [
      { area: "Joining", before: "Straight into the call", after: "Lobby with camera preview, mic level meter, device pickers and who's already inside" },
      { area: "In the call", before: "Grid, mute, camera, chat", after: "Adaptive grid + spotlight/pin, active-speaker glow, screen sharing, reactions, raise hand, live captions" },
      { area: "Host", before: "Anyone could end the meeting", after: "Host-only end for all, ask to mute / mute all, remove participant" },
      { area: "History", before: "Card list with chat log", after: "Attendance timeline, searchable transcript with export, copyable summary" },
      { area: "Security", before: "Sockets trusted the client's user id", after: "Every socket verifies a Clerk session token; host checks and room scoping on the server" },
    ],
    story: {
      spark:
        "The original app let anyone end anyone's meeting, because the server trusted whatever user id the browser sent. That one bug told me the real job: not more buttons, but a server that knows who is who, and a call UI that feels calm.",
      questions: [
        "How do I prove who is on a socket, not just believe them?",
        "How does the UI know who is speaking without a media server?",
        "How do I share a screen without renegotiating every peer connection?",
        "What should people get after the call ends?",
      ],
      decisions: [
        {
          choice: "Verify every socket with a Clerk session token",
          why: "Host actions and room membership are checked on the server, so the browser can't promote itself to host.",
        },
        {
          choice: "Active speaker from real audio levels",
          why: "WebRTC receiver audioLevel for others, Web Audio for your own mic: speaker glow without an SFU.",
        },
        {
          choice: "Screen sharing with replaceTrack",
          why: "Swapping the video track means nothing renegotiates, so sharing starts instantly for everyone.",
        },
        {
          choice: "Captions through a voice gate",
          why: "An AudioWorklet and a voice gate send only speech to Gemini transcription on the server, with the Web Speech API as a fallback.",
        },
      ],
      hardest:
        "Permission edge cases. Camera blocked, mic missing, device in use: each one needs a clear message, and you should still be able to join to listen and chat.",
      learned:
        "In real-time apps the server must be the source of truth for identity and roles. The UI can be optimistic; authority can't.",
    },
    features: [
      {
        group: "Meetings",
        items: ["Instant meetings with readable codes, or schedule for later", "Invite links and Google Calendar links", "Pre-join lobby with device test"],
      },
      {
        group: "In the call",
        items: [
          "Adaptive grid, spotlight and pinning; presenters spotlighted automatically",
          "Screen sharing (tab, window or screen)",
          "Emoji reactions, raise hand, chat, people panel, keyboard shortcuts",
          "Live captions",
        ],
      },
      {
        group: "After the call",
        items: ["Day-grouped history with search and filters", "Attendance timeline", "Searchable transcript with .txt export and a summary"],
      },
    ],
    engineering: [
      { title: "Authenticated signalling", detail: "Socket.io signalling where every connection verifies a Clerk session token." },
      { title: "26 security checks", detail: "Automated security checks run against the server." },
      { title: "No-renegotiation sharing", detail: "replaceTrack swaps camera and screen without new offers and answers." },
      { title: "Bento dashboard", detail: "Stats, 7-day activity chart, up next, upcoming and recent sessions, plan usage." },
    ],
    screens: [
      d("meetora", "call-grid", "Meeting grid with active-speaker glow"),
      d("meetora", "lobby", "Pre-join lobby with camera preview and mic meter"),
      d("meetora", "call-spotlight", "Spotlight layout while presenting"),
      d("meetora", "call-chat", "In-call chat panel"),
      d("meetora", "dashboard", "Dashboard with activity chart and upcoming meetings"),
      d("meetora", "session-recap", "Session recap with summary"),
      d("meetora", "session-attendance", "Attendance timeline for a session"),
      d("meetora", "postcall", "Post-call screen"),
    ],
    phones: [m("meetora", "call-mobile", "A call on a phone", 390, 844), m("meetora", "dashboard-mobile", "Dashboard on a phone")],
  },
  {
    slug: "filenest",
    title: "Filenest",
    tagline: "A cloud drive with live uploads, previews for almost any file, and public links you control.",
    summary:
      "Upload files with live progress, organise them in nested folders, preview images, video, PDFs, CSV, JSON and Markdown in the browser, and share view-only or downloadable links with an expiry you can change or revoke.",
    year: "2026",
    area: "Full-stack",
    hue: 220,
    liveUrl: "https://filenest.yusufhussain.in",
    repoUrl: gh("filenest"),
    stack: ["React 19", "Vite", "Express 5", "Neon Postgres", "S3 / Cloudflare R2", "Presigned URLs", "Tailwind CSS v4"],
    highlights: [
      { value: "74", label: "automated security checks" },
      { value: "1 GB", label: "per file, straight to storage" },
      { value: "⌘K", label: "search across every file and folder" },
    ],
    origin: "Filenest 2.0 is a full redesign and hardening of a basic course project (“Drivea”). Version 2.1 moved uploads straight to storage.",
    compare: [
      { area: "Uploads", before: "One request with a simulated progress bar", after: "Real per-file progress, three at a time, cancel and retry; 2.1 uploads straight to the bucket with presigned URLs" },
      { area: "Finding things", before: "Search box for the current folder", after: "⌘K search across all files and folders, Recent and Starred" },
      { area: "Preview", before: "Modal for image, video, audio, PDF", after: "Full-screen viewer with swipe; text, CSV tables, JSON and rendered Markdown" },
      { area: "Sharing", before: "A link that could only be revoked", after: "View-only or downloadable links, expiry, open counts, browsable shared folders" },
      { area: "Security", before: "Owner checks on most queries", after: "No leaked owner email, no raw DB errors, atomic quota, rate limits, helmet, 74 automated checks" },
    ],
    story: {
      spark:
        "A file drive looks simple until you upload a 900 MB video through your own API and watch it fall over. The course version faked its progress bar. I wanted uploads that are honest, fast and safe, and sharing that the owner fully controls.",
      questions: [
        "Why should big files pass through my server at all?",
        "How do I show real progress, cancel and retry for many files at once?",
        "What can a stranger with a public link see, and for how long?",
      ],
      decisions: [
        {
          choice: "Presigned uploads straight to S3-compatible storage",
          why: "The API only signs and verifies. No 100 MB cap, faster large files, and storage itself refuses a file bigger than announced.",
        },
        {
          choice: "Any S3-compatible bucket",
          why: "Cloudflare R2 or AWS S3 in production, RustFS in Docker locally; one command starts Postgres and storage for development.",
        },
        {
          choice: "Links with rules",
          why: "View-only or downloadable, expiry of 1, 7 or 30 days or never, open counts, and revoke at any time.",
        },
        {
          choice: "Security as tests, not hope",
          why: "74 automated checks run against the API, so a regression shows up as a failing test, not a leak.",
        },
      ],
      hardest:
        "Folder uploads and ZIP downloads. Dropping a folder recreates the whole tree before files land in it, and downloading any selection streams a ZIP straight from storage.",
      learned:
        "Move bytes where they belong. Once the server stopped carrying files, uploads got faster and the limits got simpler.",
    },
    features: [
      {
        group: "Files",
        items: ["Nested folders, grid or list view, six sort orders", "Drag and drop files or whole folders anywhere", "Multi-select with Shift-click, download as ZIP, move, star, trash with Undo"],
      },
      {
        group: "Preview & share",
        items: ["Full-screen viewer for images, video, audio, PDF, text, CSV, JSON, Markdown", "Public links with expiry and download control", "Shared links page"],
      },
      {
        group: "Account",
        items: ["Recent and Starred", "Settings: profile, password, theme, storage insights with a 14-day upload chart", "One-click demo account"],
      },
    ],
    engineering: [
      { title: "Direct-to-storage uploads", detail: "Presigned URLs; the API never carries the bytes." },
      { title: "Atomic quota", detail: "Storage quota per account (1 GB by default) can't be raced past by parallel uploads." },
      { title: "Session security", detail: "JWT in an httpOnly cookie, helmet and rate limits on the Express 5 API." },
      { title: "74 automated checks", detail: "Security tests run against the real API." },
    ],
    screens: [
      d("filenest", "drive", "My Files with folders and image thumbnails"),
      d("filenest", "preview-image", "Full-screen image preview with details"),
      d("filenest", "search", "⌘K search palette"),
      d("filenest", "share", "Share dialog with expiry and download options"),
      d("filenest", "folder-upload", "Folder upload with per-file progress"),
      d("filenest", "multi-select", "Multi-select actions"),
      d("filenest", "public-link", "What a visitor sees on a public link"),
      d("filenest", "settings", "Storage insights in settings"),
      d("filenest", "drive-dark", "My Files in dark mode"),
    ],
    phones: [m("filenest", "drive-mobile", "Drive on a phone", 390, 844), m("filenest", "preview-mobile", "Preview on a phone", 390, 844)],
  },
  {
    slug: "toolverse",
    title: "Toolverse",
    tagline: "AI writing and image tools in one premium workspace, with Claude, OpenAI, Gemini or free providers.",
    summary:
      "Write articles, brainstorm blog titles, generate images, remove backgrounds and objects, and get a resume reviewed, all in one place. Everything you make is saved, searchable and shareable to a community gallery.",
    year: "2026",
    area: "AI",
    hue: 280,
    liveUrl: "https://toolverse.yusufhussain.in",
    repoUrl: gh("toolverse"),
    stack: ["React 19", "Vite", "Express 5", "Claude (Anthropic SDK)", "OpenAI", "Gemini", "Neon Postgres", "Clerk"],
    highlights: [
      { value: "36", label: "automated security checks" },
      { value: "6", label: "AI tools in one workspace" },
      { value: "0", label: "AI keys needed to run most tools" },
    ],
    origin: "Toolverse started as a course project (“QuickAI”). 2.0 is a rebuild.",
    compare: [
      { area: "Getting started", before: "Needed five services' keys just to boot", after: "Runs every tool except object removal with no AI keys; better providers switch on when keys are set" },
      { area: "AI", before: "Gemini only, raw prompts sent from the browser", after: "Claude, OpenAI, Gemini or a free provider; prompts built on the server" },
      { area: "Features", before: "Six forms and a list", after: "Tool pages with live progress and history, a creations library, a community gallery with likes, plans and usage" },
      { area: "Security", before: "Usage counters in Clerk metadata, likes on any id", after: "Verified sessions, owner-scoped queries, atomic monthly quotas, signed file URLs, 36 checks" },
    ],
    story: {
      spark:
        "The original sent raw prompts from the browser and needed five paid keys before it would even start. I wanted the opposite: an app anyone can clone and run for free, that gets better when you add a key, and where the server owns every prompt.",
      questions: [
        "How do I support Claude, OpenAI, Gemini and a free provider without four code paths?",
        "Where should prompts live so users can't rewrite them?",
        "How do I enforce monthly quotas without race conditions?",
      ],
      decisions: [
        {
          choice: "Provider adapters with a free fallback",
          why: "Each tool asks for “text” or “image”; the server picks the best configured provider, down to a free one, so the app always boots.",
        },
        {
          choice: "Prompts built on the server",
          why: "The browser sends inputs (topic, length, tone), never a prompt. That closes prompt injection from the client and keeps outputs consistent.",
        },
        {
          choice: "Atomic quotas in Postgres",
          why: "Usage is counted with one atomic update, not read-modify-write in auth metadata.",
        },
        {
          choice: "A workspace, not a list of forms",
          why: "Dashboard with stats and sparklines, Ctrl K search, a creations library and a community gallery make it feel like one product.",
        },
      ],
      hardest:
        "Resume review: extracting a PDF on the server, then returning a score, strengths, fixes, missing keywords and a rewritten summary in a structure the UI can trust.",
      learned:
        "Design for the developer who clones it, too. “Works with zero keys” made the project far easier to demo, test and share.",
    },
    features: [
      {
        group: "Tools",
        items: [
          "Article Writer with length and tone, Markdown output",
          "Blog Title Ideas",
          "Image Generator with 8 styles and 3 aspect ratios",
          "Background Remover with a before/after slider",
          "Object Remover",
          "Resume Review: score out of 100, fixes and missing keywords",
        ],
      },
      {
        group: "Workspace",
        items: ["Dashboard with week-over-week stats and 14-day sparklines", "Creations library", "Community gallery with likes", "Plans and usage, light and dark themes"],
      },
    ],
    engineering: [
      { title: "Server-side prompts", detail: "The browser sends inputs; prompts are assembled on the server for every provider." },
      { title: "Owner-scoped data", detail: "Users can't read, publish, delete or list each other's creations." },
      { title: "Signed file URLs", detail: "Every generated file is served through a signed link." },
      { title: "36 checks against the real API", detail: "The test creates two throwaway users, attacks each rule, then deletes them." },
    ],
    screens: [
      d("toolverse", "dashboard", "Workspace dashboard with stats and tool tiles"),
      d("toolverse", "landing", "Toolverse landing page"),
      d("toolverse", "article", "Article Writer with Markdown output"),
      d("toolverse", "image-tool", "Image Generator"),
      d("toolverse", "background-tool", "Background Remover with before/after slider"),
      d("toolverse", "library", "Creations library"),
      d("toolverse", "community", "Community gallery"),
      d("toolverse", "plan", "Plan and usage"),
      d("toolverse", "dashboard-dark", "Dashboard in dark mode"),
    ],
    phones: [m("toolverse", "dashboard-mobile", "Dashboard on a phone"), m("toolverse", "tool-mobile", "A tool on a phone")],
  },
  {
    slug: "zaika",
    title: "Zaika",
    tagline: "Indian food delivery with live order tracking and a real-time restaurant admin panel.",
    summary:
      "A light, modern storefront where customers customise dishes and follow their rider on a live map, plus a restaurant console with a real-time Kanban kitchen board, all running on one Express API and Neon Postgres.",
    year: "2026",
    area: "Full-stack",
    hue: 40,
    liveUrl: "https://zaika.yusufhussain.in",
    repoUrl: gh("zaika"),
    stack: ["React 19", "Vite", "Express 5", "Neon Postgres", "Razorpay", "Stripe", "JWT"],
    highlights: [
      { value: "36", label: "Indian dishes in the demo menu" },
      { value: "1", label: "command runs storefront, admin and API" },
      { value: "3", label: "payment options: UPI, cards, cash" },
    ],
    origin: "Zaika started from a MERN food-delivery tutorial project, was rebuilt as 2.0 and extended in 2.1.",
    compare: [
      { area: "Structure", before: "Separate customer site, admin site and API", after: "One React 19 + Express 5 project, one port; on Vercel a static site plus one function" },
      { area: "Database", before: "MongoDB", after: "Neon Postgres with versioned SQL migrations" },
      { area: "Restaurant", before: "A list of orders", after: "Dashboard with KPIs, Kanban kitchen board with chimes, menu, customers and settings" },
      { area: "Security", before: "Anyone could add or delete dishes and change any order; prices trusted from the browser; orders marked paid from a URL flag", after: "Role checks, server-computed totals, verified payments, read-only demo admin" },
    ],
    story: {
      spark:
        "Reading the original code, I found that anyone could delete dishes, change any order, send their own prices, and mark an order paid by adding a flag to the URL. A food app that a curious customer can break isn't a portfolio piece. I rebuilt it so the server owns every rupee.",
      questions: [
        "Which numbers must only ever be computed on the server?",
        "How does the kitchen hear about a new order instantly?",
        "How do I show a live delivery map without a paid map API?",
        "How can visitors explore the admin panel without being able to break it?",
      ],
      decisions: [
        {
          choice: "Prices and totals only on the server",
          why: "The browser sends dish ids and options; the server computes every price, add-on and delivery fee.",
        },
        {
          choice: "A read-only demo admin role",
          why: "Portfolio visitors can open the whole restaurant console, but every write returns 403.",
        },
        {
          choice: "Postgres with migrations",
          why: "Orders, statuses and timestamps are relational, and versioned migrations make the schema reproducible.",
        },
        {
          choice: "An illustrated delivery map",
          why: "No map API or key: the rider moves from kitchen to door with an ETA, and the kitchen sees a mini map in the order drawer.",
        },
      ],
      hardest:
        "Dish customisation that survives the whole journey: half or full, spice level and paid add-ons must appear in the cart, checkout, order page and kitchen ticket, and come back on reorder, while prices stay server-side.",
      learned:
        "Security bugs are product bugs. Fixing them changed the design: roles, a demo admin and server-side totals made the whole app simpler to reason about.",
    },
    features: [
      {
        group: "Customers",
        items: [
          "Menu by category with search, veg-only switch and sorting",
          "Veg / non-veg marks and Bestseller badges from real orders",
          "Customise portion, spice and add-ons with a live total",
          "Guest cart merged on sign-in; Razorpay (UPI, cards), cash or Stripe",
          "Live order tracking and delivery map",
        ],
      },
      {
        group: "Restaurant",
        items: ["Dashboard with KPIs and charts", "Kanban kitchen board with chimes for new orders", "Menu manager and dish editor", "Customers and store settings"],
      },
    ],
    engineering: [
      { title: "Role re-check", detail: "Passwords hashed with bcrypt; the user's role is re-read from the database on every request." },
      { title: "Server-side money", detail: "Order totals and delivery fees are computed only on the server." },
      { title: "One deploy", detail: "Static site plus one serverless function on Vercel." },
      { title: "Real demo data", detail: "36 Indian dishes with credited photos and a read-only demo admin." },
    ],
    screens: [
      d("zaika", "storefront", "Zaika storefront"),
      d("zaika", "menu", "Menu with categories and veg filter"),
      d("zaika", "customise", "Dish customisation sheet with live total"),
      d("zaika", "cart", "Cart and checkout"),
      d("zaika", "delivery-map", "Live delivery map with rider ETA"),
      d("zaika", "dashboard", "Restaurant dashboard"),
      d("zaika", "kitchen-board", "Live Kanban kitchen board"),
      d("zaika", "orders", "Orders list"),
      d("zaika", "dish-editor", "Dish editor"),
    ],
    phones: [m("zaika", "mobile-home", "Storefront on a phone", 600, 1298), m("zaika", "mobile-tracking", "Order tracking on a phone", 600, 1298)],
  },
  {
    slug: "clearcut",
    title: "Clearcut",
    tagline: "Remove image backgrounds in seconds, add a new backdrop and export, with a free on-device AI model.",
    summary:
      "Upload or paste a photo, get a clean cutout, drop in a colour, gradient, blurred original or your own image, and export a ready-to-post PNG, JPG or WebP. Every cutout is saved to your library.",
    year: "2026",
    area: "AI",
    hue: 300,
    liveUrl: null,
    repoUrl: gh("clearcut"),
    stack: ["React 19", "Vite", "Express 5", "IMG.LY background removal", "Neon Postgres", "Clerk", "Stripe", "Razorpay"],
    highlights: [
      { value: "31", label: "automated security checks" },
      { value: "₹0", label: "per image with the default on-device model" },
      { value: "3", label: "engines: IMG.LY, ClipDrop, remove.bg" },
    ],
    origin: "Clearcut started as a course project (“bg.removal”): one upload button, a spinner and one download link. 2.0 is a rebuild.",
    compare: [
      { area: "Engine", before: "ClipDrop only, paid after the trial", after: "Free on-device model by default (IMG.LY, no key), or ClipDrop / remove.bg with one setting" },
      { area: "Editing", before: "Download the PNG", after: "Compare slider, backdrops, drop shadow, PNG/JPG/WebP at 3 sizes, copy to clipboard" },
      { area: "History", before: "Nothing was kept", after: "A library of every cutout: search, favourites, rename, re-download" },
      { area: "Security", before: "JWT decoded without verification; credits added from a URL flag", after: "Verified sessions, verified payments, atomic credits, signed URLs, 31 checks" },
    ],
    story: {
      spark:
        "The original paid an API for every single image and decoded login tokens without verifying them. I wanted background removal that costs nothing by default, and a credit system nobody can top up by editing a URL.",
      questions: [
        "Can a free, open model replace a paid API for most photos?",
        "Where should backdrops be rendered so photos don't leave the device again?",
        "How do credits stay correct when processing fails halfway?",
      ],
      decisions: [
        {
          choice: "Free IMG.LY model by default, paid engines optional",
          why: "One setting switches to ClipDrop or remove.bg for anyone who wants them; the default costs nothing.",
        },
        {
          choice: "Export rendered in the browser",
          why: "Backdrops, shadows and resizing happen client-side, so composited images never leave your device.",
        },
        {
          choice: "Atomic credits with automatic refunds",
          why: "One credit per cutout, refunded if processing fails. Payments are verified with Stripe or Razorpay before credits are added.",
        },
      ],
      hardest: "Making the editor feel instant on a phone: the compare slider, backdrops and export all have to work with touch and arrow keys.",
      learned: "Defaults are a product decision. A free default engine changed who can use the app, and how much it costs to keep online.",
    },
    features: [
      {
        group: "Studio",
        items: ["Drag and drop, file picker or paste", "Result / Compare / Original views with a before/after slider", "Backdrops: colour, gradient, blurred original or your photo", "PNG, JPG or WebP at full size, 1080 px or 512 px"],
      },
      {
        group: "Account",
        items: ["Library with search, favourites and paging", "5 free credits, refunds on failure", "Credit packs via Stripe or Razorpay (UPI, cards, netbanking)", "Purchase history and a 14-day usage chart"],
      },
    ],
    engineering: [
      { title: "Verified everything", detail: "Clerk-verified sessions and payments verified with the provider before credits are added." },
      { title: "Postgres on Neon", detail: "A migrate script, foreign keys and check constraints; credits change atomically." },
      { title: "Signed file URLs", detail: "Library images are served through signed links." },
      { title: "31 automated checks", detail: "Security tests against the running API." },
    ],
    screens: [
      d("clearcut", "editor", "Editor with a cutout and backdrop options"),
      d("clearcut", "landing", "Clearcut landing page"),
      d("clearcut", "studio-light", "Upload studio in light mode"),
      d("clearcut", "library", "Library of saved cutouts"),
      d("clearcut", "billing", "Credits and billing"),
    ],
    phones: [m("clearcut", "editor-mobile", "Editor on a phone"), m("clearcut", "studio-mobile", "Studio on a phone")],
  },
  {
    slug: "whisperly",
    title: "Whisperly",
    tagline: "A real-time one-to-one messenger with presence, unread tracking, photos and a polished dark and light interface.",
    summary:
      "Sign up, set up a profile, find people by username and chat instantly, with photos, “active now” presence, unread tracking and a shared-media panel.",
    year: "2026",
    area: "Full-stack",
    hue: 250,
    liveUrl: "https://whisperly.yusufhussain.in",
    repoUrl: gh("whisperly"),
    stack: ["React", "Vite", "Firebase Auth", "Cloud Firestore", "Cloudinary"],
    highlights: [
      { value: "Live", label: "messages through Firestore listeners" },
      { value: "2", label: "themes that follow your system" },
      { value: "1", label: "click to explore a seeded demo account" },
    ],
    origin: "Whisperly 2.0 is a redesign and fix-up of a course chat app.",
    compare: [
      { area: "Design", before: "Course template", after: "Glass panels on an aurora background, Geist, design tokens, dark and light themes" },
      { area: "Chat list", before: "Plain list", after: "Live username search, All/Unread filters, relative times, presence dots" },
      { area: "Conversations", before: "One bubble per message", after: "Grouped bubbles, day separators, image lightbox, auto-growing composer, upload progress" },
      { area: "Fixes", before: "Presence stopped updating after login; new accounts errored", after: "Presence keeps updating, timers cleaned up, first load works" },
    ],
    story: {
      spark: "Chat apps are judged on small details: the dot that says someone is online, the badge that says you missed something, the way messages group. I used this project to get those details right.",
      questions: ["How do I keep usernames unique without a server?", "How do I keep conversations private with only Firestore rules?", "What makes a chat feel alive?"],
      decisions: [
        { choice: "A usernames collection", why: "A username → uid lookup lets sign-up check that a name is free before creating the account." },
        { choice: "Security rules as the backend", why: "Production Firestore rules keep each conversation private to its two participants." },
        { choice: "Configurable image uploads", why: "Cloudinary, Firebase Storage or inline, chosen by environment." },
      ],
      hardest: "Presence: “Active now” must keep updating after login and background timers must be cleaned up, or the app slowly lies.",
      learned: "With a serverless backend, the security rules are the API. They deserve the same care as server code.",
    },
    features: [
      {
        group: "Messaging",
        items: ["Real-time messages with Firestore onSnapshot", "Photo messages with upload progress", "Unread badge, highlight and filter", "Presence from last-seen time"],
      },
      {
        group: "Profile",
        items: ["Unique usernames", "Profile page with live preview and drag-and-drop photo", "Details panel with shared media"],
      },
    ],
    engineering: [
      { title: "Private by rules", detail: "Firestore rules restrict messages to their two participants." },
      { title: "Seeded demo", detail: "npm run seed creates a demo account with realistic conversations." },
    ],
    screens: [
      d("whisperly", "chat-dark", "Conversation in dark mode with the details panel"),
      d("whisperly", "chat-light", "Conversation in light mode"),
      d("whisperly", "profile", "Profile page with live preview"),
      d("whisperly", "auth", "Sign-in page"),
    ],
    phones: [m("whisperly", "mobile", "Whisperly on a phone", 390, 844)],
  },
];
