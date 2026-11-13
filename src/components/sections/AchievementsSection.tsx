"use client";

import { useState } from "react";
import {
  Award,
  ShieldCheck,
  ExternalLink,
  Trophy,
  Star,
  CheckCircle2,
  Sparkles,
  Medal,
} from "lucide-react";
import { sound } from "@/lib/sound";
import type { Certification, Experience } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface AchievementsSectionProps {
  certifications: Certification[];
  achievements: Experience[];
}

export default function AchievementsSection({
  certifications,
  achievements,
}: AchievementsSectionProps) {
  const { currentTheme } = useTheme();
  const [tab, setTab] = useState<"certifications" | "awards">("certifications");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="achievements" className="py-28 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 -left-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#38BDF8" }}
      />
      <div
        className="absolute bottom-10 right-0 w-[550px] h-[550px] rounded-full blur-[160px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#5145E5" }}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="theme-badge">
                <Trophy className="w-3.5 h-3.5 text-sky-400" />
                <span>VERIFIED CREDENTIALS &bull; HONORS</span>
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                SECTION 06
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading uppercase tracking-[-0.03em] leading-[0.94] text-white">
              Achievements &amp; <span className="theme-gradient-text">Accolades</span>
            </h2>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setTab("certifications");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                tab === "certifications" ? "theme-btn-primary" : "theme-btn-secondary"
              }`}
            >
              Industry Certifications ({certifications.length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setTab("awards");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                tab === "awards" ? "theme-btn-primary" : "theme-btn-secondary"
              }`}
            >
              Honors &amp; Awards ({achievements.length})
            </button>
          </div>
        </div>

        {/* Dynamic Metric Counter Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="theme-card p-5 text-center rounded-2xl">
            <div className="text-3xl sm:text-4xl font-black font-heading theme-gradient-text">
              100%
            </div>
            <div className="text-[10px] font-mono text-slate-400 uppercase mt-1 font-semibold">
              Verified Authenticity
            </div>
          </div>
          <div className="theme-card p-5 text-center rounded-2xl">
            <div className="text-3xl sm:text-4xl font-black font-heading theme-gradient-text">
              {certifications.length}+
            </div>
            <div className="text-[10px] font-mono text-slate-400 uppercase mt-1 font-semibold">
              Accredited Licenses
            </div>
          </div>
          <div className="theme-card p-5 text-center rounded-2xl">
            <div className="text-3xl sm:text-4xl font-black font-heading theme-gradient-text">
              Top 1%
            </div>
            <div className="text-[10px] font-mono text-slate-400 uppercase mt-1 font-semibold">
              Engineering Excellence
            </div>
          </div>
          <div className="theme-card p-5 text-center rounded-2xl">
            <div className="text-3xl sm:text-4xl font-black font-heading theme-gradient-text">
              Global
            </div>
            <div className="text-[10px] font-mono text-slate-400 uppercase mt-1 font-semibold">
              Industry Recognition
            </div>
          </div>
        </div>

        {/* Tab 1: Industry Certifications */}
        {tab === "certifications" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {certifications.map((cert) => {
              const isHovered = hoveredId === cert.id;
              return (
                <div
                  key={cert.id}
                  onMouseEnter={() => {
                    setHoveredId(cert.id);
                    sound.playHover();
                  }}
                  onMouseLeave={() => setHoveredId(null)}
                  className="theme-card theme-card-hover p-7 sm:p-9 rounded-3xl flex flex-col justify-between space-y-5 group cursor-default transition-all duration-300"
                  style={{
                    transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 bg-indigo-500/15 text-sky-400 border border-indigo-500/20">
                        <ShieldCheck className="w-6 h-6" />
                      </div>

                      <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-slate-300">
                        {cert.issueDate}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-black font-heading tracking-tight text-white group-hover:text-sky-300 transition-colors mb-1">
                        {cert.title}
                      </h3>
                      <div className="text-xs font-mono text-slate-400 font-semibold">
                        Authorized by <span className="text-sky-300">{cert.issuer}</span>
                      </div>
                    </div>

                    {cert.skills && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {cert.skills.split(",").map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-mono border border-white/10 bg-white/[0.03] text-slate-300"
                          >
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {cert.credentialUrl && (
                    <div className="pt-4 border-t border-white/10">
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playClick()}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400 hover:text-sky-300 hover:underline"
                      >
                        <span>Verify Credential Authenticity</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Awards & Honors */}
        {tab === "awards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {achievements.map((item) => {
              const isHovered = hoveredId === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => {
                    setHoveredId(item.id);
                    sound.playHover();
                  }}
                  onMouseLeave={() => setHoveredId(null)}
                  className="theme-card theme-card-hover p-7 sm:p-9 rounded-3xl flex flex-col justify-between space-y-5 group cursor-default transition-all duration-300"
                  style={{
                    transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 bg-sky-500/15 text-sky-400 border border-sky-500/20">
                        <Medal className="w-6 h-6" />
                      </div>

                      <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-slate-300">
                        {item.period}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-black font-heading tracking-tight text-white group-hover:text-sky-300 transition-colors mb-1">
                        {item.role}
                      </h3>
                      <div className="text-xs font-mono text-slate-400 font-semibold">
                        Presented by <span className="text-sky-300">{item.organization}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {item.skills && (
                    <div className="pt-4 border-t border-white/10 flex flex-wrap gap-1.5">
                      {item.skills.split(",").map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-mono border border-white/10 bg-white/[0.03] text-slate-300"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
