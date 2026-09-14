"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { profile } from "@/lib/content/profile";
import { Close, Linkedin, Mail, PhoneCall, WhatsApp } from "./icons";
import "./contact-fab.css";

const waText = encodeURIComponent("Hi Yusuf, I saw your portfolio and would like to talk.");

const actions = [
  { label: "Call", sub: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}`, icon: <PhoneCall width={18} height={18} />, tone: "call", external: false },
  { label: "WhatsApp", sub: profile.phone, href: `https://wa.me/${profile.whatsapp}?text=${waText}`, icon: <WhatsApp width={18} height={18} />, tone: "wa", external: true },
  { label: "Email", sub: profile.email, href: `mailto:${profile.email}`, icon: <Mail width={18} height={18} />, tone: "mail", external: false },
  { label: "LinkedIn", sub: profile.links.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "").replace(/\/$/, ""), href: profile.links.linkedin, icon: <Linkedin width={16} height={16} />, tone: "in", external: true },
];

/**
 * Floating contact button (bottom right). Opens WhatsApp / Email / LinkedIn.
 * Appears after the hero and steps aside while the Contact section is on screen.
 */
export function ContactFab() {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hero = document.getElementById("top");
    const contact = document.getElementById("contact");
    let pastHero = false;
    let atContact = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === hero) pastHero = !e.isIntersecting;
          if (e.target === contact) atContact = e.isIntersecting;
        }
        const next = pastHero && !atContact;
        setShown(next);
        if (!next) setOpen(false);
      },
      { rootMargin: "0px 0px -35% 0px" },
    );
    if (hero) io.observe(hero);
    if (contact) io.observe(contact);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={wrap} className="cfab" data-shown={shown || undefined} data-open={open || undefined} inert={!shown}>
      <ul id="cfab-menu" className="cfab-menu" aria-label="Contact options" inert={!open}>
        {actions.map((a, i) => (
          <li key={a.label} style={{ "--i": actions.length - 1 - i } as CSSProperties}>
            <a
              href={a.href}
              target={a.external ? "_blank" : undefined}
              rel={a.external ? "noopener noreferrer" : undefined}
              className="cfab-item"
              data-tone={a.tone}
              onClick={() => setOpen(false)}
            >
              <span className="cfab-item-icon">{a.icon}</span>
              <span className="min-w-0">
                <span className="cfab-item-label">{a.label}</span>
                <span className="cfab-item-sub">{a.sub}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <button
        ref={toggle}
        type="button"
        className="cfab-toggle"
        aria-expanded={open}
        aria-controls="cfab-menu"
        aria-label={open ? "Close contact options" : "Contact Yusuf: call, WhatsApp, email or LinkedIn"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="cfab-icon cfab-icon-main">
          <PhoneCall width={25} height={25} strokeWidth={1.9} />
        </span>
        <span className="cfab-icon cfab-icon-close">
          <Close width={20} height={20} />
        </span>
      </button>
      <span className="cfab-hint" aria-hidden>
        Call or message
      </span>
    </div>
  );
}
