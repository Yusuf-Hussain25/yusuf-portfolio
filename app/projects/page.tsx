import type { Metadata } from "next";
import { ProjectBrowser } from "@/components/projects/project-browser";
import { SectionHeading } from "@/components/ui/section-heading";
import "@/components/projects/case-studies.css";
import "@/components/projects/project-showcase.css";

export const metadata: Metadata = {
  title: "Projects",
  description: "Personal AI and full-stack projects, and professional client work by Yusuf Hussain, each with the thinking behind it, screenshots and the stack.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 pb-28 pt-32 md:px-8 md:pb-36 md:pt-40">
        <SectionHeading
          index="01"
          eyebrow="Projects"
          title={
            <>
              Everything I&apos;ve <span className="text-muted">built.</span>
            </>
          }
        >
          Personal projects I built on my own, and professional work for clients and employers. Open any one to see why I built it, the key decisions, real screenshots and what I learned.
        </SectionHeading>
        <ProjectBrowser />
      </div>
    </section>
  );
}
