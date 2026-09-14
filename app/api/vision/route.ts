import { completeClaude, llmConfig, rateLimit } from "@/lib/ai/llm";

const PROMPT = `Analyze this image like a computer-vision tool. Respond with ONLY a JSON object:
{"description": string (2 sentences), "objects": [{"label": string, "confidence": number 0-1}] (max 8), "text": string (all legible text, or ""), "answer": string (answer to the user's question, or "")}`;

export async function POST(req: Request) {
  if (!llmConfig.enabled) {
    return Response.json({ mode: "unconfigured", error: "Set ANTHROPIC_API_KEY to enable model vision." }, { status: 501 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`vision:${ip}`, 8)) return Response.json({ error: "Too many requests — try again in a minute." }, { status: 429 });

  let body: { image?: unknown; question?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const match = typeof body.image === "string" ? /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(body.image) : null;
  if (!match) return Response.json({ error: "Expected a base64 PNG, JPEG, WebP, or GIF data URL." }, { status: 400 });
  if (match[2].length > 6_000_000) return Response.json({ error: "Image too large." }, { status: 413 });
  const question = typeof body.question === "string" ? body.question.slice(0, 300) : "";

  try {
    const raw = await completeClaude({
      system: "You are a precise computer-vision analysis service. Output valid JSON only.",
      maxTokens: 900,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: match[1], data: match[2] } },
            { type: "text", text: `${PROMPT}\nUser question: ${question || "(none)"}` },
          ],
        },
      ],
    });
    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    return Response.json({
      mode: "llm",
      model: llmConfig.model,
      description: String(json.description ?? ""),
      objects: Array.isArray(json.objects) ? json.objects.slice(0, 8) : [],
      text: String(json.text ?? ""),
      answer: String(json.answer ?? ""),
    });
  } catch {
    return Response.json({ error: "The vision model request failed." }, { status: 502 });
  }
}
