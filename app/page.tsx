import { Contact } from "@/components/contact/contact";
import { Experience } from "@/components/experience/timeline";
import { Hero } from "@/components/hero/hero";
import { Explore } from "@/components/home/explore";
import { Featured } from "@/components/projects/featured";

// Home is a front door: who I am, where I've worked, the best work, then one link per page.
export default function Home() {
  return (
    <>
      <Hero />
      <Experience index="01" flush />
      <Featured />
      <Explore />
      <Contact />
    </>
  );
}
