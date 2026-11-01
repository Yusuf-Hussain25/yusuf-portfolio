import type { Metadata } from "next";
import { Experience } from "@/components/experience/timeline";

export const metadata: Metadata = {
  title: "Experience",
  description: "Where Yusuf Hussain has worked: AI products end to end as project lead, and full-stack web products at scale.",
  alternates: { canonical: "/experience" },
};

export default function Page() {
  return (
    <div className="pt-16 md:pt-20">
      <Experience />
    </div>
  );
}
