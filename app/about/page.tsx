import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { About } from "@/components/about/about";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "Yusuf Hussain's story: from Patna to AI engineering in Hyderabad, education, certifications and the Best Employee of the Year 2026 award.",
  path: "/about",
});

export default function Page() {
  return (
    <div className="pt-16 md:pt-20">
      <JsonLd data={breadcrumbJsonLd([{ name: "About", path: "/about" }])} />
      <About asPage />
    </div>
  );
}
