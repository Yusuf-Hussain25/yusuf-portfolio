// Evaluation scenarios. Model A responses restate facts from lib/content only.
// Model B responses are SYNTHETIC and intentionally fabricated so the
// evaluator has hallucinations to detect — they are not claims about Yusuf.

export type EvalResponse = { name: string; response: string; latencyMs: number };

export type EvalScenario = {
  id: string;
  label: string;
  query: string;
  a: EvalResponse;
  b: EvalResponse;
};

export const evalScenarios: EvalScenario[] = [
  {
    id: "rag",
    label: "RAG project",
    query: "Which project demonstrates RAG?",
    a: {
      name: "Model A",
      latencyMs: 1420,
      response:
        "RepoMind demonstrates RAG. It runs a retrieval pipeline over source code using Pinecone embeddings, so its agents can answer code questions about the repository. Agent orchestration uses LangChain and LangGraph, with OpenAI function calling for tool use.",
    },
    b: {
      name: "Model B",
      latencyMs: 860,
      response:
        "The AI Voice Assistant demonstrates RAG. It indexes uploaded PDFs in Weaviate and answers questions with GPT-4 Turbo. It served 50,000 users in its first month with 99.9% uptime.",
    },
  },
  {
    id: "role",
    label: "Current role",
    query: "What does Yusuf do in his current role?",
    a: {
      name: "Model A",
      latencyMs: 1310,
      response:
        "In his current role, Yusuf is an AI Developer at Freedom With AI, where he leads end-to-end delivery of AI products as project lead. He engineered n8n and LLM automation pipelines that replaced manual client workflows. He also develops Node.js and Python backends with PostgreSQL, and builds Flutter apps with embedded AI features.",
    },
    b: {
      name: "Model B",
      latencyMs: 780,
      response:
        "Yusuf is a Principal Research Scientist at Nimbus Labs. He trains foundation models on 4,096 TPU chips and has published three papers at NeurIPS. A team of 12 engineers reports directly to him.",
    },
  },
  {
    id: "vector",
    label: "Vector databases",
    query: "What vector databases has Yusuf worked with?",
    a: {
      name: "Model A",
      latencyMs: 1180,
      response:
        "Yusuf's vector database toolkit includes Pinecone, ChromaDB, and pgvector, along with OpenAI Embeddings and semantic search. In RepoMind, Pinecone embeddings power a RAG pipeline over source code.",
    },
    b: {
      name: "Model B",
      latencyMs: 690,
      response:
        "Yusuf mainly works with Milvus and Qdrant, operating a 2-billion-vector cluster in production. He also wrote a custom vector database in Rust that benchmarks 10x faster than Pinecone.",
    },
  },
];
