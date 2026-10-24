import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InlineScript } from "@/components/ui/inline-script";
import { profile } from "@/lib/content/profile";
import { personJsonLd, seo, siteUrl } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  // One English page for every country: no regional targeting.
  alternates: { canonical: "/", languages: { en: "/", "x-default": "/" } },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: "/",
    siteName: profile.name,
    type: "profile",
    locale: "en_US",
    alternateLocale: ["en_IN", "en_GB"],
    images: [{ url: "/images/yusuf-portrait.jpg", alt: `${profile.name}, AI Engineer and Full Stack Software Engineer` }],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    images: ["/images/yusuf-portrait.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#07080a" },
  ],
};

// Runs before first paint: stored preference → system preference.
const themeScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t;d.style.colorScheme=t}catch(e){d.dataset.theme='dark'}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="min-h-dvh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <div aria-hidden className="ambient" />
        {children}
      </body>
    </html>
  );
}
