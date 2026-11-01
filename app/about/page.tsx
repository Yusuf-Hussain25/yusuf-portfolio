import type { Metadata } from "next";
import { About } from "@/components/about/about";

export const metadata: Metadata = {
  title: "About",
  description: "Yusuf Hussain's story, education, certifications and Best Employee of the Year award.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return (
    <div className="pt-16 md:pt-20">
      <About />
    </div>
  );
}
