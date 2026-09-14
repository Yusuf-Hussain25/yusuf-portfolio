// Agent runtime interface + a deterministic simulated runtime.
// The orchestration trace (plan → parallel workers → review → synthesis) is
// modeled exactly as a real runtime would emit it; agent text is scripted.
// To go live, implement `AgentRuntime` against a model provider.

export type AgentId = "orchestrator" | "research" | "analysis" | "review" | "synthesizer";
export type AgentState = "idle" | "thinking" | "processing" | "complete";

export type AgentEvent =
  | { type: "state"; agent: AgentId; state: AgentState }
  | { type: "tool"; agent: AgentId; tool: string; input: string }
  | { type: "token"; agent: AgentId; text: string }
  | { type: "done"; result: string };

export interface AgentRuntime {
  run(task: string, signal: AbortSignal): AsyncGenerator<AgentEvent & { t: number }>;
}

type Script = {
  plan: string;
  research: { tools: [string, string][]; text: string };
  analysis: { tools: [string, string][]; text: string };
  review: { tools: [string, string][]; text: string };
  result: string;
};

export const presetTasks: { label: string; task: string; script: Script }[] = [
  {
    label: "RAG architecture",
    task: "Research the best approach for building a RAG application.",
    script: {
      plan: "Split into three workstreams: survey retrieval strategies, analyze trade-offs for a typical document corpus, and review failure modes plus evaluation.",
      research: {
        tools: [["search", "retrieval strategies for RAG"], ["read", "chunking guidelines"]],
        text: "Common patterns: dense top-k retrieval; hybrid search combining BM25 with vectors; cross-encoder re-ranking of candidates; query rewriting or multi-query expansion; parent-document chunking to keep local precision with wider context.",
      },
      analysis: {
        tools: [["compare", "dense vs hybrid retrieval"]],
        text: "Dense-only retrieval misses exact identifiers such as error codes; keyword-only misses paraphrases. Hybrid retrieval with a re-ranker is the safer default. Start with structure-aware chunks and modest overlap, retrieve ~20 candidates, re-rank down to ~5.",
      },
      review: {
        tools: [["checklist", "RAG failure modes"]],
        text: "Risks: stale indexes, context stuffing, and ungrounded answers. Mitigate with scheduled re-embedding, a hard context budget, citations, and a labeled query set to measure recall@k and groundedness before tuning prompts.",
      },
      result:
        "Recommended approach:\n1. Structure-aware chunking with light overlap\n2. Hybrid retrieval (BM25 + vectors) → re-rank to top 5\n3. Grounded prompt with citations and a context budget\n4. Evaluate recall@k + groundedness on a labeled set\n5. Automate re-indexing when sources change",
    },
  },
  {
    label: "Issue triage agent",
    task: "Design an agent that triages incoming GitHub issues.",
    script: {
      plan: "Decompose into: signals available on an issue, a classification + routing design, and guardrails for automated actions.",
      research: {
        tools: [["inspect", "issue schema: title, body, labels, author"], ["search", "similar issues via embeddings"]],
        text: "Useful signals: title and body text, stack traces, referenced files, author history, and semantic similarity to existing issues for duplicate detection.",
      },
      analysis: {
        tools: [["design", "classifier + router"]],
        text: "Use structured output: {type, severity, component, duplicate_of}. Retrieve the top similar issues as context, then route by component ownership. Keep label actions as tools with typed arguments.",
      },
      review: {
        tools: [["checklist", "automation guardrails"]],
        text: "Never auto-close. Require a confidence threshold for labeling, log every tool call, and send low-confidence issues to a human queue. Track precision per label weekly.",
      },
      result:
        "Design:\n1. Embed issue → retrieve similar issues\n2. Structured classification (type, severity, component)\n3. Tool calls for labels + assignment above a confidence threshold\n4. Human queue for everything else\n5. Weekly precision review per label",
    },
  },
  {
    label: "Fine-tune vs RAG",
    task: "Should a support assistant use fine-tuning or RAG?",
    script: {
      plan: "Evaluate along three axes: knowledge freshness, behavior/style control, and cost to operate and evaluate.",
      research: {
        tools: [["search", "fine-tuning vs retrieval trade-offs"]],
        text: "Fine-tuning changes behavior and format reliably but bakes knowledge in at training time. RAG injects current knowledge at query time and can cite sources.",
      },
      analysis: {
        tools: [["score", "freshness · control · cost"]],
        text: "Support content changes often and answers need citations → RAG wins on freshness and auditability. Tone and output format can usually be handled with prompting; fine-tune only if that proves insufficient.",
      },
      review: {
        tools: [["checklist", "decision risks"]],
        text: "Don't fine-tune to fix retrieval problems. Measure retrieval quality first; poor chunks produce poor answers regardless of the model.",
      },
      result:
        "Recommendation: start with RAG.\n1. Retrieval over the help center with citations\n2. Prompt for tone and format\n3. Evaluate groundedness on real tickets\n4. Consider fine-tuning later, only for behavior gaps",
    },
  },
];

function customScript(task: string): Script {
  const topic = task.replace(/\s+/g, " ").trim().slice(0, 120);
  return {
    plan: `Decompose "${topic}" into: gathering context, analyzing options, and reviewing risks before synthesis.`,
    research: {
      tools: [["search", topic]],
      text: "Collected background, existing approaches, and the constraints that matter for this task.",
    },
    analysis: {
      tools: [["compare", "candidate approaches"]],
      text: "Compared candidate approaches against the constraints and ranked them by effort and expected impact.",
    },
    review: {
      tools: [["checklist", "risks and open questions"]],
      text: "Flagged assumptions to validate and defined how success should be measured.",
    },
    result: `Simulated runtime — the orchestration is real, but custom tasks use templated agent output.\nConnect a model provider in lib/ai/agents.ts to generate real content for:\n"${topic}"`,
  };
}

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("aborted", "AbortError"));
    const onAbort = () => {
      clearTimeout(id);
      reject(new DOMException("aborted", "AbortError"));
    };
    const id = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });

export const simulatedRuntime: AgentRuntime = {
  async *run(task, signal) {
    const script = presetTasks.find((p) => p.task === task)?.script ?? customScript(task);
    const start = performance.now();
    const t = () => Math.round(performance.now() - start);

    async function* stream(agent: AgentId, text: string) {
      const words = text.split(/(\s+)/);
      for (let i = 0; i < words.length; i += 2) {
        await wait(22, signal);
        yield { type: "token" as const, agent, text: words.slice(i, i + 2).join(""), t: t() };
      }
    }

    yield { type: "state", agent: "orchestrator", state: "thinking", t: t() };
    await wait(700, signal);
    yield { type: "state", agent: "orchestrator", state: "processing", t: t() };
    yield* stream("orchestrator", script.plan);
    yield { type: "state", agent: "orchestrator", state: "complete", t: t() };

    const workers = [
      ["research", script.research],
      ["analysis", script.analysis],
      ["review", script.review],
    ] as const;

    for (const [agent] of workers) {
      yield { type: "state", agent, state: "thinking", t: t() };
      await wait(180, signal);
    }
    // interleave worker output so they visibly run in parallel
    const queues = workers.map(([agent, s]) => {
      const events: AgentEvent[] = [{ type: "state", agent, state: "processing" }];
      for (const [tool, input] of s.tools) events.push({ type: "tool", agent, tool, input });
      const words = s.text.split(/(\s+)/);
      for (let i = 0; i < words.length; i += 2) events.push({ type: "token", agent, text: words.slice(i, i + 2).join("") });
      events.push({ type: "state", agent, state: "complete" });
      return events;
    });
    while (queues.some((q) => q.length)) {
      for (const q of queues) {
        const evt = q.shift();
        if (!evt) continue;
        await wait(evt.type === "tool" ? 260 : evt.type === "state" ? 120 : 16, signal);
        yield { ...evt, t: t() };
      }
    }

    yield { type: "state", agent: "synthesizer", state: "thinking", t: t() };
    await wait(600, signal);
    yield { type: "state", agent: "synthesizer", state: "processing", t: t() };
    yield* stream("synthesizer", script.result);
    yield { type: "state", agent: "synthesizer", state: "complete", t: t() };
    yield { type: "done", result: script.result, t: t() };
  },
};
