import { achievements, award, profile, skillGroups, story, timeline } from "@/lib/content/profile";
import { caseStudies } from "@/lib/content/projects";
import { createIndex, type Chunk, type VectorIndex } from "./retrieval";

// Every chunk is derived from the content files — the assistant, the RAG
// explorer, and the evaluator all share this one knowledge base.
function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [
    { id: "profile-summary", title: "Profile summary", source: "Profile", text: profile.summary },
    {
      id: "contact",
      title: "Contact and links",
      source: "Contact",
      text: `Email ${profile.email}. GitHub ${profile.links.github}. LinkedIn ${profile.links.linkedin}.`,
    },
  ];

  for (const entry of timeline) {
    if (entry.kind === "education") {
      chunks.push({
        id: "education",
        title: "Education",
        source: "Education",
        text: `${entry.role} at ${entry.org}, ${entry.period}.`,
      });
      continue;
    }
    chunks.push({
      id: `${entry.id}-role`,
      title: `${entry.role} at ${entry.org}`,
      source: "Experience",
      text: `${entry.role} at ${entry.org} (${entry.period}). Stack: ${entry.stack.join(", ")}. ${entry.highlights[0]}`,
    });
    entry.highlights.slice(1).forEach((h, i) => {
      chunks.push({ id: `${entry.id}-${i + 1}`, title: `${entry.org} — work`, source: "Experience", text: h });
    });
  }

  for (const cs of caseStudies) {
    chunks.push({
      id: `${cs.slug}-overview`,
      title: cs.title,
      source: "Project",
      text: `${cs.title} (${cs.kind}, ${cs.year}): ${cs.tagline} ${cs.approach} Stack: ${cs.stack.join(", ")}.`,
    });
    chunks.push({
      id: `${cs.slug}-ai`,
      title: `${cs.title} — AI components`,
      source: "Project",
      text: cs.aiComponents.map((c) => `${c.name}: ${c.detail}`).join(" "),
    });
    chunks.push({
      id: `${cs.slug}-story`,
      title: `${cs.title} — why and how it was built`,
      source: "Project",
      text: `${cs.story.spark} Key decisions: ${cs.story.decisions.map((d) => `${d.choice} — ${d.why}`).join(" ")} Hardest part: ${cs.story.hardest} Takeaway: ${cs.story.learned}`,
    });
  }

  for (const g of skillGroups) {
    chunks.push({ id: `skills-${g.group}`, title: `Skills — ${g.group}`, source: "Skills", text: `${g.group}: ${g.items.join(", ")}.` });
  }

  chunks.push({ id: "achievements", title: "Achievements & certifications", source: "Achievements", text: achievements.join(" ") });
  chunks.push({ id: "award", title: award.title, source: "Achievements", text: `${award.title} at ${award.org}. ${award.summary}` });
  chunks.push({
    id: "story",
    title: "Yusuf's story",
    source: "Profile",
    text: `${story.intro} ${story.chapters.map((c) => `${c.title} (${c.year}): ${c.body}`).join(" ")}`,
  });
  return chunks;
}

let index: VectorIndex | null = null;

export function getIndex(): VectorIndex {
  if (!index) index = createIndex(buildChunks());
  return index;
}
