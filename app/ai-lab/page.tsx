import type { Metadata } from "next";
import { AILab } from "@/components/ai-lab/ai-lab";
import { AskYusuf } from "@/components/ask-yusuf/ask-yusuf";

export const metadata: Metadata = {
  title: "AI Lab",
  description: "Ask Yusuf's portfolio assistant anything, and try four live AI experiments: retrieval, agents, evaluation and vision.",
  alternates: { canonical: "/ai-lab" },
};

export default function Page() {
  return (
    <div className="pt-16 md:pt-20">
      <AskYusuf />
      <AILab />
    </div>
  );
}
