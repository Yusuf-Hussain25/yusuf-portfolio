// Browser client for the streaming NDJSON chat endpoint.

export type ChatSource = { id: string; title: string; source: string; score: number };
export type ChatMeta = { mode: "llm" | "local"; model?: string; sources: ChatSource[] };
export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function streamChat(opts: {
  query: string;
  history?: ChatTurn[];
  signal?: AbortSignal;
  onMeta?: (meta: ChatMeta) => void;
  onDelta: (text: string) => void;
}): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: opts.query, history: opts.history ?? [] }),
    signal: opts.signal,
  });
  if (!res.ok || !res.body) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }

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
      if (!line.trim()) continue;
      const evt = JSON.parse(line) as
        | ({ type: "meta" } & ChatMeta)
        | { type: "delta"; text: string }
        | { type: "error"; message: string }
        | { type: "done" };
      if (evt.type === "meta") opts.onMeta?.(evt);
      else if (evt.type === "delta") opts.onDelta(evt.text);
      else if (evt.type === "error") throw new Error(evt.message);
    }
  }
}
