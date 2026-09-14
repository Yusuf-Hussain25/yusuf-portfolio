import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InlineScript } from "@/components/ui/inline-script";
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
  title: "Yusuf Hussain — AI Engineer",
  description:
    "Enter Yusuf's AI Lab: a grounded portfolio assistant, a live RAG explorer, agent orchestration, vision, and evaluation experiments.",
  openGraph: {
    title: "Yusuf Hussain — AI Engineer",
    description: "An AI product that happens to be a portfolio.",
    type: "website",
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
        <div aria-hidden className="ambient" />
        {children}
      </body>
    </html>
  );
}
