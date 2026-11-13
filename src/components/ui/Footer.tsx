"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/Icons";
import { sound } from "@/lib/sound";
import type { Profile } from "@/types";
import type { FooterVisualConfig } from "@/types/visual-config";
import { DEFAULT_FOOTER_CONFIG } from "@/types/visual-config";
import { PRIVACY_POLICY_ROUTE } from "@/lib/navigation";

interface FooterProps {
  profile?: Profile | null;
  config?: FooterVisualConfig;
}

/** Primary destinations — each maps to its own dedicated route. */
const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "Skills", href: "/skills" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Contact", href: "/contact" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] font-bold text-emerald-300/90">
      <span className="h-3.5 w-px bg-emerald-400/70 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
      {children}
    </h3>
  );
}

export default function Footer({ profile, config }: FooterProps) {
  const cfg = config || DEFAULT_FOOTER_CONFIG;
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in Indian Standard Time (IST)
      const istTime = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setCurrentTime(istTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const name = profile?.name || "Kartik Khajuria";
  const email = profile?.email || "kartikkhajuria643@gmail.com";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#04070A] border-t border-emerald-500/15 pt-16 sm:pt-20 pb-8">
      {/* Neon top rail */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.75) 30%, rgba(52,211,153,0.35) 60%, transparent 100%)",
        }}
      />
      {/* Soft green aurora glow */}
      <div
        className="absolute -top-44 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full blur-[180px] pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(5,150,105,0.12) 45%, transparent 75%)",
        }}
      />
      {/* Subtle technical grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.7) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
        {/* Massive Horizon Watermark Typography */}
        <div className="text-center overflow-hidden select-none pointer-events-none opacity-[0.05] font-heading font-black tracking-tight text-4xl sm:text-6xl md:text-8xl lg:text-9xl uppercase whitespace-nowrap text-emerald-50 mb-14 sm:mb-16">
          {cfg.watermarkText || `${name} • CREATIVE DEV`}
        </div>

        {/* ============================= MAIN GRID ============================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 pb-14">
          {/* SECTION 1 — BRAND */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3.5">
              <div
                className="relative w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-base text-[#04070A]"
                style={{
                  background: "linear-gradient(135deg, #34D399 0%, #059669 100%)",
                  boxShadow: "0 0 24px rgba(16,185,129,0.45)",
                }}
              >
                {name.charAt(0)}
                <span className="absolute inset-0 rounded-2xl border border-emerald-300/40 animate-ping opacity-20 pointer-events-none" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                  {name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">
                  Creative Technologist
                </span>
              </div>
            </div>

            {/* Small decorative visual element */}
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-emerald-400/70 to-transparent" />
              <div className="flex items-end gap-[3px] h-4">
                <span className="w-[3px] rounded-full bg-emerald-400/80 animate-eq-1" />
                <span className="w-[3px] rounded-full bg-emerald-400/60 animate-eq-2" />
                <span className="w-[3px] rounded-full bg-emerald-300/80 animate-eq-3" />
                <span className="w-[3px] rounded-full bg-emerald-400/60 animate-eq-4" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300/60">
                Signal Active
              </span>
            </div>

            <p className="text-sm font-mono text-slate-400 leading-relaxed max-w-md">
              {profile?.bio ||
                cfg.tagline ||
                profile?.footerText ||
                "Designing and developing high-impact digital experiences with 3D WebGL graphics, custom shaders, and scalable full-stack Next.js architecture."}
            </p>

            <Link
              href="/about"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="group inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              Read the full story
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* SECTION 2 — QUICK LINKS */}
          <div className="lg:col-span-3 space-y-5">
            <SectionTitle>Quick Links</SectionTitle>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onMouseEnter={() => sound.playHover()}
                    onClick={() => sound.playClick()}
                    className="group flex items-center justify-between gap-3 font-mono text-sm text-slate-400 hover:text-emerald-300 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/40 transition-all group-hover:bg-emerald-400 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                      <span className="transition-transform group-hover:translate-x-0.5">
                        {link.label}
                      </span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 -translate-x-1 opacity-0 text-emerald-400 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 3 — CONNECT */}
          <div className="lg:col-span-3 space-y-5">
            <SectionTitle>Connect</SectionTitle>

            <div className="flex flex-wrap items-center gap-2.5">
              {profile?.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  title="GitHub"
                  className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-all"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
              )}
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  title="LinkedIn"
                  className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-all"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {profile?.twitterUrl && (
                <a
                  href={profile.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  title="Twitter / X"
                  className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-all"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
              <a
                href={`mailto:${email}`}
                onMouseEnter={() => sound.playHover()}
                onClick={() => sound.playClick()}
                title="Direct Email"
                className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <ul className="space-y-3 font-mono text-sm text-slate-400 pt-1">
              <li>
                <a
                  href={`mailto:${email}`}
                  onClick={() => sound.playClick()}
                  className="flex items-start gap-2.5 hover:text-emerald-300 transition-colors break-all"
                >
                  <Mail className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                  <span>{email}</span>
                </a>
              </li>
              {profile?.phone && (
                <li>
                  <a
                    href={`tel:${profile.phone.replace(/\s+/g, "")}`}
                    onClick={() => sound.playClick()}
                    className="flex items-start gap-2.5 hover:text-emerald-300 transition-colors"
                  >
                    <Phone className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                    <span>{profile.phone}</span>
                  </a>
                </li>
              )}
              {profile?.location && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                  <span>{profile.location}</span>
                </li>
              )}
            </ul>
          </div>

          {/* SECTION 4 — LEGAL */}
          <div className="lg:col-span-2 space-y-5">
            <SectionTitle>Legal</SectionTitle>
            <ul className="space-y-3">
              <li>
                <Link
                  href={PRIVACY_POLICY_ROUTE}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  className="group flex items-center gap-2.5 font-mono text-sm text-slate-400 hover:text-emerald-300 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400/70 transition-colors group-hover:text-emerald-300" />
                  <span className="transition-transform group-hover:translate-x-0.5">
                    Privacy Policy
                  </span>
                </Link>
              </li>
            </ul>

            {cfg.showIstClock !== false && (
              <div className="theme-badge text-[10px] w-fit">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>IST: {currentTime || "05:30 PM"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subtle design divider */}
        <div
          className="h-px w-full mb-6"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.35) 50%, transparent 100%)",
          }}
        />

        {/* ============================ BOTTOM BAR ============================ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p className="text-center sm:text-left">
            &copy; {currentYear} {name}.{" "}
            {cfg.copyrightText || "All rights reserved worldwide."}
          </p>

          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1.5">
              <span>Crafted with</span>
              <span className="text-emerald-400 font-bold">Next.js 16</span>
              <span className="text-emerald-500/40">&bull;</span>
              <span className="text-emerald-300 font-bold">Three.js</span>
              <span className="text-emerald-500/40">&bull;</span>
              <span className="text-emerald-200 font-bold">Tailwind CSS 4</span>
            </span>

            {cfg.showBackToTop !== false && (
              <button
                onClick={scrollToTop}
                onMouseEnter={() => sound.playHover()}
                aria-label="Back to top"
                title="Back to top"
                className="group flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/10 bg-white/[0.03] font-mono font-bold tracking-wider text-slate-300 hover:text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-all"
              >
                <span className="text-[10px] uppercase">Back to Top</span>
                <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
