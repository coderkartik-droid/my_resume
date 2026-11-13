"use client";

import { useState } from "react";
import {
  Briefcase,
  Calendar,
  MapPin,
  Sparkles,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Award,
  Layers,
} from "lucide-react";
import { sound } from "@/lib/sound";
import type { Experience } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface ExperienceSectionProps {
  experience: Experience[];
}

export default function ExperienceSection({ experience = [] }: ExperienceSectionProps) {
  const { currentTheme } = useTheme();
  const [filter, setFilter] = useState<"all" | "work" | "education">("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const effectiveItems = experience;

  const filteredItems = effectiveItems
    .filter((e) => {
      if (filter === "all") return true;
      if (filter === "work") return e.type === "work" || !e.type;
      if (filter === "education") return e.type === "education";
      return true;
    })
    .sort((a, b) => a.order - b.order);

  return (
    <section id="experience" className="py-28 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#5145E5" }}
      />
      <div
        className="absolute bottom-1/4 -left-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#38BDF8" }}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="theme-badge">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                <span>CHRONOLOGICAL TRACK RECORD</span>
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                SECTION 03
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading uppercase tracking-[-0.03em] leading-[0.94] text-white">
              Career <span className="theme-gradient-text">Expedition</span>
            </h2>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => {
                sound.playClick();
                setFilter("all");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filter === "all" ? "theme-btn-primary" : "theme-btn-secondary"
              }`}
            >
              All Milestones ({experience.length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilter("work");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filter === "work" ? "theme-btn-primary" : "theme-btn-secondary"
              }`}
            >
              Engineering Roles ({experience.filter((e) => e.type === "work" || !e.type).length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilter("education");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filter === "education" ? "theme-btn-primary" : "theme-btn-secondary"
              }`}
            >
              Academic Foundations ({experience.filter((e) => e.type === "education").length})
            </button>
          </div>
        </div>

        {/* 3D Interactive Timeline Stream */}
        <div className="relative pl-6 md:pl-48 space-y-12">
          {/* Architectural Timeline Rail Spine */}
          <div
            className="absolute left-[11px] md:left-[171px] top-4 bottom-4 w-[2px] rounded-full opacity-60 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, #5145E5, #38BDF8, #A78BFA)`,
              boxShadow: "0 0 10px rgba(56, 189, 248, 0.4)",
            }}
          />

          {filteredItems.map((item, index) => {
            const isHovered = hoveredId === item.id;
            const isEducation = item.type === "education";

            return (
              <div
                key={item.id}
                onMouseEnter={() => {
                  setHoveredId(item.id);
                  sound.playHover();
                }}
                onMouseLeave={() => setHoveredId(null)}
                className="relative group transition-all duration-300"
              >
                {/* Interactive Node Orb on Spine */}
                <div
                  className={`absolute -left-[23px] md:-left-[29px] top-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-[#080D1B] ${
                    isHovered ? "scale-125 border-sky-400 shadow-[0_0_15px_#38BDF8]" : "border-indigo-500"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-all ${
                      isHovered ? "bg-white scale-125" : "bg-sky-400"
                    }`}
                  />
                </div>

                {/* Left Desktop Period Badge */}
                <div className="hidden md:flex flex-col items-end absolute -left-48 top-5 w-40 text-right pr-6">
                  <span className="text-xs font-mono font-black tracking-wider uppercase text-sky-300">
                    {item.period}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                    {isEducation ? "ACADEMIC" : "PRODUCTION"}
                  </span>
                </div>

                {/* 3D Glassmorphic Card */}
                <div
                  className={`theme-card p-7 sm:p-9 space-y-4 rounded-3xl transition-all duration-300 group-hover:scale-[1.01] ${
                    isHovered ? "shadow-2xl border-sky-400/40" : ""
                  }`}
                  style={{
                    transform: isHovered ? "translateX(6px)" : "translateX(0px)",
                  }}
                >
                  {/* Mobile Period Badge */}
                  <div className="md:hidden flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-mono font-bold text-sky-300">
                      {item.period}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase text-slate-300">
                      {isEducation ? "Education" : "Role"}
                    </span>
                  </div>

                  {/* Role Title & Organization Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isEducation ? (
                          <GraduationCap className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Briefcase className="w-5 h-5 text-sky-400" />
                        )}
                        <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white group-hover:text-sky-300 transition-colors">
                          {item.role}
                        </h3>
                      </div>
                      <div className="text-xs sm:text-sm font-mono text-slate-300 font-semibold flex items-center gap-2">
                        <span className="text-white">@{item.organization}</span>
                        {item.location && (
                          <>
                            <span className="opacity-40">&bull;</span>
                            <span className="text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-sky-400" />
                              {item.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border bg-white/5 border-white/10 text-slate-300">
                      <span>Index #{String(index + 1).padStart(2, "0")}</span>
                    </div>
                  </div>

                  {/* Milestone Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {item.description}
                  </p>

                  {/* Technical Skills & Competencies Ribbon */}
                  {item.skills && (
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mr-1">
                        TECHNIQUES:
                      </span>
                      {item.skills.split(",").map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-mono border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:border-sky-400/40"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
