"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Target,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Download,
  ArrowDown,
  Smartphone,
  Monitor,
  Archive,
  FileText,
  Package,
  BookOpen,
  Play,
} from "lucide-react";
import BackgroundMusicPlayer from "@/components/ui/BackgroundMusicPlayer";
import { GithubIcon } from "@/components/ui/Icons";
import type { Project } from "@/types";
import { sound } from "@/lib/sound";

interface ProjectDetailClientProps {
  project: Project;
  prevProject: Project | null;
  nextProject: Project | null;
  keyFeaturesList: string[];
  screenshotsList: string[];
  techStackList: string[];
}

export default function ProjectDetailClient({
  project,
  prevProject,
  nextProject,
  keyFeaturesList,
  screenshotsList,
  techStackList,
}: ProjectDetailClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "features" | "tech" | "screenshots" | "challenges"
  >("overview");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const tabs: { id: "overview" | "features" | "tech" | "screenshots" | "challenges"; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features" },
    { id: "tech", label: "Tech Stack" },
    { id: "screenshots", label: "Screenshots" },
    { id: "challenges", label: "Challenges" },
  ];

  return (
    <div className="min-h-screen bg-[#080D1B] text-[#F8FAFC] selection:bg-[#5145E5] selection:text-white">
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#080D1B]/90 backdrop-blur-2xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link
          href="/#projects"
          onMouseEnter={() => sound.playHover()}
          onClick={() => sound.playClick()}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span>Back to Projects</span>
        </Link>
        <div className="flex items-center gap-3">
          <BackgroundMusicPlayer embeddedInNavbar />
          <span className="text-sm font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            {project.displayNumber || "01"}
          </span>
          <span className="text-xs font-mono text-zinc-600">·</span>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            {project.category}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20 space-y-10">
        {/* Project Hero Header */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>ARCHITECTURAL CASE STUDY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-white leading-[1.05]">
            {project.title}
          </h1>

          <p className="text-base sm:text-lg font-mono text-slate-300 leading-relaxed max-w-3xl">
            {project.shortDesc}
          </p>

          {/* Technology Badges */}
          {techStackList.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {techStackList.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons: Live Demo, View Code, Documentation, Video Demo */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => sound.playHover()}
                onClick={() => sound.playClick()}
                className="theme-btn-primary px-6 py-3 rounded-xl text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all hover:scale-105"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => sound.playHover()}
                onClick={() => sound.playClick()}
                className="theme-btn-secondary px-6 py-3 rounded-xl text-slate-200 hover:text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-md"
              >
                <GithubIcon className="w-4 h-4" />
                <span>View Code</span>
              </a>
            )}
            {project.documentationUrl && (
              <a
                href={project.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => sound.playHover()}
                onClick={() => sound.playClick()}
                className="theme-btn-secondary px-5 py-3 rounded-xl text-slate-200 hover:text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-md"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Documentation</span>
              </a>
            )}
            {project.videoDemoUrl && (
              <a
                href={project.videoDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => sound.playHover()}
                onClick={() => sound.playClick()}
                className="theme-btn-secondary px-5 py-3 rounded-xl text-slate-200 hover:text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-md"
              >
                <Play className="w-4 h-4 text-purple-400" />
                <span>Video Walkthrough</span>
              </a>
            )}
          </div>
        </div>

        {/* Large Project Preview Image */}
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
          <div className="py-8 px-6 sm:px-8 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Download className="w-4 h-4" />
              </span>
              <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-emerald-400">
                DOWNLOAD PROJECT
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-8 gap-y-3 pt-1">
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
                    className="group inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-zinc-300 hover:text-emerald-400 transition-colors duration-200"
                    title={file.fileDescription || labelText}
                  >
                    <span className="relative">
                      {labelText}
                      <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300 ease-out" />
                    </span>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/5 border border-white/10 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/15 transition-all">
                      <ArrowDown className="w-3 h-3 text-emerald-400 group-hover:translate-y-0.5 transition-transform duration-200" />
                    </span>
                    {file.fileSizeFormatted && (
                      <span className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        ({file.fileSizeFormatted})
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="pt-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id);
                }}
                className={`px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "theme-btn-primary text-white shadow-lg shadow-indigo-900/35 font-bold"
                    : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.07] border border-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Content Panes */}
          <div className="pt-8">
            {/* 1. Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.fullDesc && (
                    <div className="p-7 rounded-3xl theme-card space-y-3 shadow-lg">
                      <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase tracking-wider font-bold">
                        <Layers className="w-4 h-4" />
                        <span>Project Overview</span>
                      </div>
                      <p className="text-sm font-mono text-slate-300 leading-relaxed">
                        {project.fullDesc}
                      </p>
                    </div>
                  )}

                  {project.objectives && (
                    <div className="p-7 rounded-3xl theme-card space-y-3 shadow-lg">
                      <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider font-bold">
                        <Target className="w-4 h-4" />
                        <span>Objectives &amp; Key Benchmarks</span>
                      </div>
                      <p className="text-sm font-mono text-slate-300 leading-relaxed">
                        {project.objectives}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.problem && (
                    <div className="p-7 rounded-3xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Problem Statement</span>
                      </div>
                      <p className="text-sm font-mono text-slate-300 leading-relaxed">
                        {project.problem}
                      </p>
                    </div>
                  )}

                  {project.solution && (
                    <div className="p-7 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-bold">
                        <Lightbulb className="w-4 h-4" />
                        <span>Architectural Solution</span>
                      </div>
                      <p className="text-sm font-mono text-slate-300 leading-relaxed">
                        {project.solution}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Features Tab */}
            {activeTab === "features" && (
              <div className="animate-in fade-in duration-200">
                {keyFeaturesList.length > 0 ? (
                  <div className="p-8 rounded-3xl theme-card space-y-6">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Key Engineered Features</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {keyFeaturesList.map((feat, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-mono text-slate-200"
                        >
                          <CheckCircle2 className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl theme-card text-center text-sm font-mono text-slate-400">
                    No custom features specified for this project.
                  </div>
                )}
              </div>
            )}

            {/* 3. Tech Stack Tab */}
            {activeTab === "tech" && (
              <div className="p-8 rounded-3xl theme-card space-y-6 animate-in fade-in duration-200">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Technology Stack Taxonomy</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {techStackList.map((tech, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono font-bold text-white text-center shadow-md flex items-center justify-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Screenshots Tab */}
            {activeTab === "screenshots" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {screenshotsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {screenshotsList.map((imgUrl, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImage(imgUrl)}
                        className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black cursor-pointer hover:border-sky-400/50 transition-all group"
                      >
                        <img
                          src={imgUrl}
                          alt={`Screenshot ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl theme-card text-center text-sm font-mono text-slate-400">
                    No gallery screenshots uploaded for this case study.
                  </div>
                )}
              </div>
            )}

            {/* 5. Challenges Tab */}
            {activeTab === "challenges" && (
              <div className="animate-in fade-in duration-200">
                {project.challenges ? (
                  <div className="p-7 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Challenges Faced &amp; Technical Resolution</span>
                    </h3>
                    <p className="text-sm font-mono text-slate-300 leading-relaxed">
                      {project.challenges}
                    </p>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl theme-card text-center text-sm font-mono text-slate-400">
                    No technical challenge notes published for this project.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Project Pagination (Previous / Next) */}
        <div className="pt-10 border-t border-white/10 flex items-center justify-between gap-4">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="group flex items-center gap-3 p-4 rounded-2xl theme-card hover:border-sky-400/40 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-sky-400 group-hover:-translate-x-1 transition-all" />
              <div className="text-left">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Previous Case Study</div>
                <div className="text-xs font-bold font-mono text-white group-hover:text-sky-300">
                  {prevProject.title}
                </div>
              </div>
            </Link>
          ) : <div />}

          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="group flex items-center gap-3 p-4 rounded-2xl theme-card hover:border-sky-400/40 transition-all text-right"
            >
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Next Case Study</div>
                <div className="text-xs font-bold font-mono text-white group-hover:text-sky-300">
                  {nextProject.title}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
            </Link>
          ) : <div />}
        </div>
      </main>

      {/* Lightbox Modal for screenshot enlargement */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-md"
        >
          <img
            src={activeImage}
            alt="Enlarged screenshot"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain border border-white/20 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
