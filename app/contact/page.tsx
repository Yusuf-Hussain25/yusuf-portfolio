import type { Metadata } from "next";
import { Contact } from "@/components/contact/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hire Yusuf Hussain, AI engineer and full-stack developer. Email, WhatsApp, LinkedIn or GitHub.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <div className="pt-16 md:pt-20">
      <Contact />
    </div>
  );
}
