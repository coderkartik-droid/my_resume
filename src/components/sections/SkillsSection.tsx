"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Cpu,
  Code2,
  Box,
  FileCode2,
  Palette,
  Server,
  Database,
  Terminal,
  Layers,
  Flame,
  Search,
  Sparkles,
  Zap,
  X,
  CheckCircle2,
} from "lucide-react";
import { sound } from "@/lib/sound";
import type { Skill } from "@/types";
import { useTheme } from "@/context/ThemeContext";

const SkillsEcosystem = dynamic(() => import("@/components/3d/SkillsEcosystem"), {
  ssr: false,
});

interface SkillsSectionProps {
  skills: Skill[];
}

export default function SkillsSection({ skills = [] }: SkillsSectionProps) {
  const { currentTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);

  // Dynamically derive category tabs from actual database skills
  const categories = ["All", ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean)))];

  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === "All") return true;
    return s.category === activeCategory;
  });

  const getSkillIcon = (iconName?: string | null) => {
    switch (iconName) {
      case "Box":
        return <Box className="w-5 h-5 text-sky-400" />;
      case "FileCode2":
        return <FileCode2 className="w-5 h-5 text-amber-400" />;
      case "Palette":
        return <Palette className="w-5 h-5 text-purple-400" />;
      case "Server":
        return <Server className="w-5 h-5 text-emerald-400" />;
      case "Database":
        return <Database className="w-5 h-5 text-indigo-400" />;
      case "Cpu":
        return <Cpu className="w-5 h-5 text-rose-400" />;
      case "Terminal":
        return <Terminal className="w-5 h-5 text-cyan-400" />;
      case "Layers":
        return <Layers className="w-5 h-5 text-orange-400" />;
      case "Flame":
        return <Flame className="w-5 h-5 text-red-400" />;
      default:
        return <Code2 className="w-5 h-5 text-sky-400" />;
    }
  };

  const getLevelPercentage = (level?: string | null) => {
    if (!level) return 92;
    const l = level.toLowerCase();
    if (l.includes("expert") || l.includes("lead") || l.includes("master")) return 98;
    if (l.includes("advanced") || l.includes("senior")) return 94;
    if (l.includes("proficient") || l.includes("mid")) return 88;
    return 85;
  };

  const getLevelLabel = (level?: string | null) => {
    if (!level) return "Production Calibrated";
    const l = level.toLowerCase();
    if (l.includes("expert") || l.includes("lead")) return "Core Specialization";
    if (l.includes("advanced")) return "Production Calibrated";
    return "Active Working Stack";
  };

  return (
    <section id="skills" className="py-28 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#38BDF8" }}
      />
      <div
        className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#5145E5" }}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 space-y-16">
        {/* Section Header & 3D Interactive Ecosystem Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="theme-badge">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>TECHNICAL CAPABILITIES</span>
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                SECTION 04
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading uppercase tracking-[-0.03em] leading-[0.94] text-white">
              Skills &amp; <span className="theme-gradient-text">Ecosystem</span>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-slate-300 max-w-lg mx-auto lg:mx-0 font-normal">
              A meticulously engineered technology stack across 3D WebGL graphics programming, full-stack Next.js cloud infrastructures, and pixel-perfect design systems.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-mono border border-sky-400/30 text-sky-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>{skills.length} VERIFIED STACK NODES</span>
              </div>
              <div className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-mono border border-emerald-400/30 text-emerald-300 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>ACTIVE PRODUCTION PIPELINE</span>
              </div>
            </div>
          </div>

          {/* Interactive 3D Orbital Centerpiece */}
          <div className="lg:col-span-7 flex items-center justify-center">
            <SkillsEcosystem skills={skills} />
          </div>
        </div>

        {/* 3D Floating Skill Cards Showcase */}
        <div className="space-y-8 pt-8 border-t border-white/10">
          {/* Controls: Category Filter Tabs & Real-Time Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    sound.playClick();
                    setActiveCategory(cat);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat ? "theme-btn-primary" : "theme-btn-secondary"
                  }`}
                >
                  {cat} ({cat === "All" ? skills.length : skills.filter((s) => s.category === cat).length})
                </button>
              ))}
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search skills & stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs font-mono border glass-input transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3D Perspective Floating Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredSkills.map((s) => {
              const levelLabel = getLevelLabel(s.level);
              const pct = getLevelPercentage(s.level);
              const isHovered = hoveredSkillId === s.id;

              return (
                <div
                  key={s.id}
                  onMouseEnter={() => {
                    setHoveredSkillId(s.id);
                    sound.playHover();
                  }}
                  onMouseLeave={() => setHoveredSkillId(null)}
                  className="theme-card theme-card-hover p-6 rounded-3xl flex flex-col justify-between space-y-5 group cursor-default transition-all duration-300 relative overflow-hidden"
                  style={{
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  }}
                >
                  {/* Subtle top glare highlight */}
                  <div
                    className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "linear-gradient(90deg, #5145E5, #38BDF8, #A78BFA)" }}
                  />

                  {/* Card Header: Icon & Level Tag */}
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-md bg-white/[0.05] border border-white/10">
                      {getSkillIcon(s.icon)}
                    </div>

                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-sky-400/30 text-sky-300 bg-sky-950/20 font-semibold uppercase tracking-wider">
                      {s.level || "Advanced"}
                    </span>
                  </div>

                  {/* Skill Details */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-base font-bold font-heading tracking-tight text-white group-hover:text-sky-300 transition-colors">
                        {s.name}
                      </h4>
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                        {s.category}
                      </div>
                    </div>

                    {/* Proficiency Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Proficiency</span>
                        <span className="font-semibold text-sky-300">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, #5145E5 0%, #38BDF8 100%)",
                            boxShadow: "0 0 8px rgba(56, 189, 248, 0.4)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Architectural Competency Tag */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Status</span>
                      <span className="font-medium text-slate-200">{levelLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
