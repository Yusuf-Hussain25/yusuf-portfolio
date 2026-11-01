import Link from "next/link";
import { profile } from "@/lib/content/profile";
import { Github, Linkedin, Mail } from "@/components/ui/icons";
import { navItems } from "./nav-items";

export function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_auto] md:px-8">
        <div>
          <Link href="/" className="text-xl font-semibold tracking-[-0.02em]">
            {profile.name}
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{profile.intro}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-muted transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-start gap-2">
          {[
            { href: `mailto:${profile.email}`, label: "Email", icon: <Mail /> },
            { href: profile.links.github, label: "GitHub", icon: <Github /> },
            { href: profile.links.linkedin, label: "LinkedIn", icon: <Linkedin /> },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={l.label}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-foreground"
            >
              {l.icon}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 border-t border-line px-5 py-6 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle md:px-8">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <a href="#" className="transition-colors hover:text-foreground">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
