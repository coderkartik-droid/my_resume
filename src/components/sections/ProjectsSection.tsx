"use client";

import { useState } from "react";
import {
  FolderKanban,
  Sparkles,
  Layers,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import ProjectCard3D from "@/components/ui/ProjectCard3D";
import { sound } from "@/lib/sound";
import type { Project } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface ProjectsSectionProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export default function ProjectsSection({
  projects,
  onSelectProject,
}: ProjectsSectionProps) {
  const { currentTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");

  // Dynamically derive categories from actual database projects
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  const filteredProjects = projects.filter((p) => {
    if (activeCategory === "All") return true;
    return p.category === activeCategory;
  });

  return (
    <section id="projects" className="py-28 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div
        className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#5145E5" }}
      />
      <div
        className="absolute bottom-10 -left-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#38BDF8" }}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="theme-badge">
                <FolderKanban className="w-3.5 h-3.5 text-sky-400" />
                <span>SIGNATURE PRODUCTIONS &bull; CASE STUDIES</span>
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                SECTION 05
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading uppercase tracking-[-0.03em] leading-[0.94] text-white">
              Featured <span className="theme-gradient-text">Creations</span>
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
                {cat} ({cat === "All" ? projects.length : projects.filter((p) => p.category === cat).length})
              </button>
            ))}
          </div>
        </div>

        {/* 3D Perspective Project Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {filteredProjects.map((project) => (
            <ProjectCard3D
              key={project.id}
              project={project}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
