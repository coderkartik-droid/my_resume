"use client";

import { useEffect, useState } from "react";
import {
  X,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Target,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Layers,
  Download,
  ArrowDown,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import type { Project } from "@/types";
import { sound } from "@/lib/sound";

interface ProjectDetailsModalProps {
  project: Project | null;
  allProjects: Project[];
  onClose: () => void;
  onNavigate: (project: Project) => void;
}

export default function ProjectDetailsModal({
  project,
  allProjects,
  onClose,
  onNavigate,
}: ProjectDetailsModalProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  // Find previous and next project in admin-defined sequence
  const currentIndex = allProjects.findIndex((p) => p.id === project.id);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : allProjects[allProjects.length - 1];
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : allProjects[0];

  let keyFeaturesList: string[] = [];
  if (project.keyFeatures) {
    try {
      keyFeaturesList = JSON.parse(project.keyFeatures);
    } catch {
      keyFeaturesList = project.keyFeatures.split("\n").filter(Boolean);
    }
  }

  let screenshotsList: string[] = [];
  if (project.screenshots) {
    try {
      screenshotsList = JSON.parse(project.screenshots);
    } catch {
      screenshotsList = project.screenshots.split("\n").filter(Boolean);
    }
  }

  const techStackList = project.techStack
    ? project.techStack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto">
      <div
        className="relative w-full max-w-5xl border rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto my-auto"
        style={{
          backgroundColor: "var(--theme-bg)",
          borderColor: "var(--theme-border)",
          color: "var(--theme-fg)",
        }}
      >
        {/* Sticky Modal Top Bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b"
          style={{
            backgroundColor: "var(--theme-card)",
            borderColor: "var(--theme-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-bold font-mono"
              style={{ color: "var(--theme-accent, var(--theme-primary))" }}
            >
              {project.displayNumber}
            </span>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-xs font-mono opacity-70 uppercase tracking-widest">
              {project.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer opacity-70 hover:opacity-100"
              style={{ backgroundColor: "var(--theme-card)" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 md:p-10 space-y-10">
          {/* Header Title & CTA Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-mono mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>CASE STUDY ARCHIVE</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                {project.title}
              </h1>
              <p className="text-sm md:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                {project.shortDesc}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <span>Launch Live Site</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Featured Hero Thumbnail */}
          {project.thumbnailUrl && (
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Clean Editorial Project Download Links */}
          {project.files && project.files.length > 0 && (
            <div className="py-6 px-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                  <Download className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                  DOWNLOAD PROJECT
                </h4>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-6 gap-y-2.5 pt-1">
                {project.files.map((file) => {
                  const labelText =
                    file.buttonText?.trim() ||
                    `Download ${file.fileName} (.${file.fileType.toUpperCase()})`;

                  return (
                    <a
                      key={file.id}
                      href={`/api/downloads/${file.id}`}
                      download
                      onMouseEnter={() => sound.playHover()}
                      onClick={() => sound.playSuccess()}
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-emerald-400 transition-colors"
                      title={file.fileDescription || labelText}
                    >
                      <span className="relative">
                        {labelText}
                        <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300 ease-out" />
                      </span>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/5 border border-white/10 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/15 transition-all">
                        <ArrowDown className="w-2.5 h-2.5 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
                      </span>
                      {file.fileSizeFormatted && (
                        <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400">
                          ({file.fileSizeFormatted})
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 1 & 2: Overview & Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.fullDesc && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-bold">
                  <Layers className="w-4 h-4" />
                  <span>1. Project Overview</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{project.fullDesc}</p>
              </div>
            )}

            {project.objectives && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-wider font-bold">
                  <Target className="w-4 h-4" />
                  <span>2. Objectives & Key Benchmarks</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{project.objectives}</p>
              </div>
            )}
          </div>

          {/* Section 3 & 4: Problem Statement & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.problem && (
              <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>3. Problem Statement</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{project.problem}</p>
              </div>
            )}

            {project.solution && (
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-bold">
                  <Lightbulb className="w-4 h-4" />
                  <span>4. Architectural Solution</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{project.solution}</p>
              </div>
            )}
          </div>

          {/* Section 5: Key Features */}
          {keyFeaturesList.length > 0 && (
            <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>5. Key Engineered Features</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {keyFeaturesList.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 text-sm text-zinc-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Technologies Used */}
          {techStackList.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>6. Technology Stack Taxonomy</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {techStackList.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-200 shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: Screenshots Gallery */}
          {screenshotsList.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                7. Project Gallery & Interface Views
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {screenshotsList.map((imgUrl, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(imgUrl)}
                    className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black cursor-pointer hover:border-cyan-400/50 transition-all group"
                  >
                    <img
                      src={imgUrl}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lightbox Modal for screenshot enlargement */}
          {activeImage && (
            <div
              onClick={() => setActiveImage(null)}
              className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
            >
              <img
                src={activeImage}
                alt="Enlarged screenshot"
                className="max-w-full max-h-[90vh] rounded-2xl object-contain border border-white/20"
              />
            </div>
          )}

          {/* Section 8: Challenges Faced */}
          {project.challenges && (
            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                8. Challenges Faced & Technical Resolution
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{project.challenges}</p>
            </div>
          )}

          {/* Previous & Next Navigation in Sequence */}
          <div className="pt-8 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
            {prevProject && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate(prevProject);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                    Previous Project
                  </span>
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {prevProject.displayNumber} · {prevProject.title}
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-zinc-300 cursor-pointer"
            >
              ← Back to Portfolio
            </button>

            {nextProject && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate(nextProject);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-right cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                    Next Project
                  </span>
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {nextProject.displayNumber} · {nextProject.title}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
