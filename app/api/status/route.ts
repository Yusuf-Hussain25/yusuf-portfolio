import { getIndex } from "@/lib/ai/knowledge";
import { llmConfig } from "@/lib/ai/llm";

export async function GET() {
  const index = getIndex();
  return Response.json(
    {
      llm: llmConfig.enabled,
      model: llmConfig.enabled ? llmConfig.model : null,
      chunks: index.chunks.length,
      dim: index.dim,
      vocabulary: index.vocabulary,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
