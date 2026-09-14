import { composeLocalAnswer } from "@/lib/ai/answer";
import { getIndex } from "@/lib/ai/knowledge";
import { llmConfig, rateLimit, streamClaude } from "@/lib/ai/llm";
import { processQuery } from "@/lib/ai/retrieval";

const SYSTEM = `You are the portfolio assistant for Yusuf Hussain, an AI full-stack developer.
Answer ONLY with facts from the CONTEXT below. If the context does not contain the answer, say you don't have that information and suggest emailing Yusuf.
Never invent metrics, companies, dates, users, or technologies. Refer to Yusuf in the third person.
Be concise: 2–5 sentences or a short list. Plain text; you may use **bold** and "- " bullets.

CONTEXT:
`;

type Turn = { role: "user" | "assistant"; content: string };

const isTurn = (t: unknown): t is Turn =>
  typeof t === "object" && t !== null &&
  ((t as Turn).role === "user" || (t as Turn).role === "assistant") &&
  typeof (t as Turn).content === "string";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`chat:${ip}`, 24)) {
    return Response.json({ error: "Too many requests — try again in a minute." }, { status: 429 });
  }

  let body: { query?: unknown; history?: unknown } | null;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  const query = typeof body.query === "string" ? body.query.trim().slice(0, 500) : "";
  if (!query) return Response.json({ error: "Query is required." }, { status: 400 });

  const history = (Array.isArray(body.history) ? body.history.filter(isTurn) : [])
    .slice(-6)
    .map((t) => ({ role: t.role, content: t.content.slice(0, 2000) }));
  while (history.length && history[0].role !== "user") history.shift();

  const index = getIndex();
  const hits = index.search(processQuery(query).terms, 6);
  const sources = hits.map((h) => ({ id: h.chunk.id, title: h.chunk.title, source: h.chunk.source, score: Number(h.score.toFixed(3)) }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      const streamLocal = async () => {
        const answer = composeLocalAnswer(query, hits);
        const parts = answer.split(/(\s+)/);
        for (let i = 0; i < parts.length; i += 4) {
          if (req.signal.aborted) return;
          send({ type: "delta", text: parts.slice(i, i + 4).join("") });
          await new Promise((r) => setTimeout(r, 24));
        }
      };

      let sent = false;
      try {
        if (llmConfig.enabled) {
          send({ type: "meta", mode: "llm", model: llmConfig.model, sources });
          const context = hits.map((h, i) => `[${i + 1}] ${h.chunk.title}: ${h.chunk.text}`).join("\n");
          for await (const text of streamClaude({
            system: SYSTEM + context,
            messages: [...history, { role: "user", content: query }],
            signal: req.signal,
          })) {
            sent = true;
            send({ type: "delta", text });
          }
        } else {
          send({ type: "meta", mode: "local", sources });
          await streamLocal();
        }
      } catch {
        if (llmConfig.enabled && !sent && !req.signal.aborted) {
          send({ type: "meta", mode: "local", sources });
          await streamLocal();
        } else if (!req.signal.aborted) {
          send({ type: "error", message: "The response was interrupted." });
        }
      }
      send({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}
