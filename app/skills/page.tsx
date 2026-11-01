import type { Metadata } from "next";
import { Engineering } from "@/components/engineering/stack";

export const metadata: Metadata = {
  title: "Skills",
  description: "The stack Yusuf Hussain builds with: LLMs, RAG, agents, Next.js, Node.js, Postgres and cloud, linked to real projects.",
  alternates: { canonical: "/skills" },
};

export default function Page() {
  return (
    <div className="pt-16 md:pt-20">
      <Engineering />
    </div>
  );
}
