import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { Contact } from "@/components/contact/contact";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Hire Yusuf Hussain, AI Engineer and Full Stack Developer. Reach him by email, WhatsApp, LinkedIn or GitHub. Open to remote and on-site roles.",
  path: "/contact",
});

export default function Page() {
  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([{ name: "Contact", path: "/contact" }])} />
      <Contact asPage />
    </div>
  );
}
