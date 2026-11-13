"use client";

import { Download, FileText, CheckCircle2, ExternalLink, ShieldCheck, Sparkles, Eye } from "lucide-react";
import { sound } from "@/lib/sound";
import type { Profile } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface ResumeSectionProps {
  profile: Profile | null;
}

export default function ResumeSection({ profile }: ResumeSectionProps) {
  const { currentTheme } = useTheme();
  const resumeUrl = profile?.resumeUrl || "/resume.pdf";
  const displayName = profile?.name || "Kartik Khajuria";

  return (
    <section id="resume" className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 relative z-10 space-y-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
          <div>
            <div className="theme-badge mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>OFFICIAL CURRICULUM VITAE</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
              Resume &amp; <span className="theme-gradient-text">Credentials</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-mono opacity-70 max-w-md">
            Comprehensive breakdown of software engineering experience, graphics programming, systems architecture, and technical qualifications.
          </p>
        </div>

        {/* Feature Showcase Card */}
        <div className="theme-card p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle top edge bar */}
          <div
            className="absolute top-0 inset-x-0 h-[2px]"
            style={{ background: "var(--theme-primary-gradient)" }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Document Overview & Metrics */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold border"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--theme-primary) 12%, transparent)",
                    borderColor: "var(--theme-border)",
                    color: "var(--theme-accent, var(--theme-primary))",
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ATS-OPTIMIZED &amp; VERIFIED</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  {displayName} — Curriculum Vitae
                </h3>
                <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                  Tailored for technical recruiters, engineering directors, and venture founders. Includes full enterprise work history, verified skills inventory, and production project case studies.
                </p>
              </div>

              {/* Document Key Points */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div
                  className="p-3.5 rounded-2xl border flex items-center gap-3"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold font-mono">Format: PDF</div>
                    <div className="text-[10px] font-mono opacity-60">Universal Compatibility</div>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-2xl border flex items-center gap-3"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold font-mono">ATS Ready</div>
                    <div className="text-[10px] font-mono opacity-60">100% Parser Compliant</div>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-2xl border flex items-center gap-3"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold font-mono">Verified Stack</div>
                    <div className="text-[10px] font-mono opacity-60">27 Modern Competencies</div>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-2xl border flex items-center gap-3"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold font-mono">Latest Revision</div>
                    <div className="text-[10px] font-mono opacity-60">Current Year Edition</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href={resumeUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  className="theme-btn-primary px-7 py-4 text-xs font-mono font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resume (PDF)</span>
                </a>

                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  className="theme-btn-secondary px-6 py-4 text-xs font-mono font-bold"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open in Browser</span>
                </a>
              </div>
            </div>

            {/* Right: Visual Document Skeuomorph Preview */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div
                className="w-full max-w-sm rounded-2xl p-6 border shadow-2xl relative space-y-4 group transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  borderColor: "var(--theme-border)",
                  boxShadow: "0 25px 50px -12px var(--theme-glow)",
                }}
              >
                {/* Header of simulated paper */}
                <div className="border-b pb-4 space-y-2" style={{ borderColor: "var(--theme-border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">{displayName}</span>
                    <span className="text-[9px] font-mono opacity-60">PAGE 1 OF 2</span>
                  </div>
                  <div className="text-[10px] font-mono opacity-70">
                    Creative Developer &bull; Full-Stack Architect
                  </div>
                </div>

                {/* Simulated Content Bars */}
                <div className="space-y-3 py-2">
                  <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: "var(--theme-primary)" }} />
                  <div className="space-y-1.5 opacity-40">
                    <div className="h-1.5 w-full bg-white/30 rounded-full" />
                    <div className="h-1.5 w-5/6 bg-white/30 rounded-full" />
                    <div className="h-1.5 w-4/6 bg-white/30 rounded-full" />
                  </div>

                  <div className="h-2 w-1/4 rounded-full mt-4" style={{ backgroundColor: "var(--theme-secondary)" }} />
                  <div className="space-y-1.5 opacity-40">
                    <div className="h-1.5 w-full bg-white/30 rounded-full" />
                    <div className="h-1.5 w-3/4 bg-white/30 rounded-full" />
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--theme-border)" }}>
                  <span className="text-[10px] font-mono opacity-60">DIGITALLY SIGNED</span>
                  <a
                    href={resumeUrl}
                    download
                    className="text-xs font-mono font-bold flex items-center gap-1 hover:underline"
                    style={{ color: "var(--theme-accent, var(--theme-primary))" }}
                  >
                    <span>Instant Save</span>
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
