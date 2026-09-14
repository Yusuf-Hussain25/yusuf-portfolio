// Server-only module (reads secrets). Minimal Anthropic Messages API client with streaming. Enabled when
// ANTHROPIC_API_KEY is set; the model can be overridden with ANTHROPIC_MODEL.

export const llmConfig = {
  enabled: Boolean(process.env.ANTHROPIC_API_KEY),
  model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
};

type Message = { role: "user" | "assistant"; content: unknown };

export async function* streamClaude(opts: {
  system: string;
  messages: Message[];
  maxTokens?: number;
  signal?: AbortSignal;
}): AsyncGenerator<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: opts.signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: llmConfig.model,
      max_tokens: opts.maxTokens ?? 700,
      system: opts.system,
      messages: opts.messages,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) throw new Error(`Anthropic API ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const evt = JSON.parse(line.slice(6));
        if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") yield evt.delta.text as string;
      } catch {
        // ignore keep-alives and partial lines
      }
    }
  }
}

export async function completeClaude(opts: { system: string; messages: Message[]; maxTokens?: number }): Promise<string> {
  let out = "";
  for await (const t of streamClaude(opts)) out += t;
  return out;
}

// Tiny in-memory fixed-window limiter to protect the API key.
const windows = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  if (windows.size > 500) for (const [k, v] of windows) if (v.reset < now) windows.delete(k);
  const w = windows.get(key);
  if (!w || w.reset < now) {
    windows.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  w.count += 1;
  return w.count <= limit;
}
