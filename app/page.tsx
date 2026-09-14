import { About } from "@/components/about/about";
import { AILab } from "@/components/ai-lab/ai-lab";
import { AskYusuf } from "@/components/ask-yusuf/ask-yusuf";
import { Contact } from "@/components/contact/contact";
import { Engineering } from "@/components/engineering/stack";
import { Experience } from "@/components/experience/timeline";
import { Hero } from "@/components/hero/hero";
import { Nav } from "@/components/navigation/nav";
import { Projects } from "@/components/projects/projects";
import { ContactFab } from "@/components/ui/contact-fab";
import { Interactions } from "@/components/ui/interactions";

// Recruiter-first order: who → where I worked → what I built → skills → about → ask → interactive demos.
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Experience />
        <Projects />
        <Engineering />
        <About />
        <AskYusuf />
        <AILab />
        <Contact />
      </main>
      <ContactFab />
      <Interactions />
    </>
  );
}
