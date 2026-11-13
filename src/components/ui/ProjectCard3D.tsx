"use client";

import { useRef, useState } from "react";
import { ExternalLink, ArrowRight, Sparkles, Layers, Download } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import type { Project } from "@/types";
import { sound } from "@/lib/sound";
import { useTheme } from "@/context/ThemeContext";

interface ProjectCard3DProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export default function ProjectCard3D({ project, onSelect }: ProjectCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const { currentTheme } = useTheme();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    // Smooth 3D tilt angles
    setRotateX(normY * -12);
    setRotateY(normX * 12);

    // Dynamic glare spotlight
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const techTags = project.techStack
    ? project.techStack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-3xl p-[1px] transition-transform duration-200 ease-out preserve-3d"
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${
          isHovered ? 1.015 : 1
        }, ${isHovered ? 1.015 : 1}, 1)`,
        background: isHovered
          ? "linear-gradient(135deg, rgba(81, 69, 229, 0.7), rgba(56, 189, 248, 0.7), rgba(167, 139, 250, 0.5))"
          : "linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.02))",
      }}
    >
      {/* Dynamic Glare Spotlight Layer */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.35 : 0,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(56, 189, 248, 0.5) 0%, rgba(81, 69, 229, 0.3) 40%, transparent 70%)`,
        }}
      />

      {/* Main Glassmorphic Card Body */}
      <div
        className="relative rounded-3xl overflow-hidden flex flex-col justify-between h-full p-6 sm:p-8 shadow-2xl transition-all"
        style={{
          backgroundColor: "rgba(14, 21, 40, 0.85)",
          backdropFilter: "blur(24px)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <div>
          {/* Header: Project Number & Category Badges */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className={`text-2xl sm:text-3xl font-black font-mono tracking-tighter transition-all duration-300 ${
                  isHovered ? "scale-105 drop-shadow-md text-sky-400" : "text-sky-400/80"
                }`}
              >
                {project.displayNumber || "01"}
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                {project.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {project.files && project.files.length > 0 && (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  title={`${project.files.length} downloadable files available`}
                >
                  <Download className="w-3 h-3" />
                  <span>{project.files.length} {project.files.length === 1 ? "Download" : "Downloads"}</span>
                </div>
              )}
              {project.featured && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border border-sky-400/30 text-sky-300 bg-sky-950/20">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>Featured</span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Media Container */}
          <div
            onClick={() => {
              sound.playClick();
              onSelect(project);
            }}
            className="group/img relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/50 mb-5 cursor-pointer shadow-inner"
          >
            {project.thumbnailUrl ? (
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center opacity-60">
                <Layers className="w-10 h-10 mb-2 opacity-50 text-sky-400" />
                <span className="font-mono text-xs text-slate-300">Interactive Preview Initialized</span>
              </div>
            )}

            {/* Gradient Overlay & Hover CTA */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white theme-btn-primary px-4 py-2 rounded-xl shadow-xl">
                <span>View Full Case Study</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Project Title */}
          <h3
            onClick={() => {
              sound.playClick();
              onSelect(project);
            }}
            className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white transition-colors cursor-pointer mb-2.5 line-clamp-1 group-hover:text-sky-300"
          >
            {project.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed line-clamp-2 mb-5 font-normal">
            {project.shortDesc}
          </p>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {techTags.slice(0, 5).map((tech, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-xl text-[11px] font-mono border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:border-sky-400/40"
              >
                {tech}
              </span>
            ))}
            {techTags.length > 5 && (
              <span className="px-2 py-1 text-[10px] font-mono text-slate-400">
                +{techTags.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => {
              sound.playClick();
              onSelect(project);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer group/btn"
          >
            <span>Explore Case Study</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
          </button>

          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="p-2 rounded-xl border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-all cursor-pointer bg-white/[0.04]"
                title="GitHub Repository"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-400/30 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm hover:scale-105 bg-sky-950/30 text-sky-300 hover:text-white"
              >
                <span>Live Platform</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
