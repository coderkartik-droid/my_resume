"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Layers,
  Cpu,
  Compass,
  CheckCircle2,
  Mail,
  MapPin,
} from "lucide-react";
import { sound } from "@/lib/sound";
import type { Profile, Project, Skill } from "@/types";
import type { SiteVisualConfigData } from "@/types/visual-config";
import { DEFAULT_SECTIONS_CONFIG } from "@/types/visual-config";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ProjectDetailsModal from "@/components/ui/ProjectDetailsModal";

interface HomeLandingProps {
  profile: Profile | null;
  projects: Project[];
  skills: Skill[];
  visualConfig: SiteVisualConfigData;
}

const EXPERTISE = [
  "Full-Stack Architecture",
  "3D WebGL & Spatial UI",
  "Design Systems",
  "Performance Engineering",
  "API & Database Design",
  "Product Strategy",
];

export default function HomeLanding({
  profile,
  projects,
  skills,
  visualConfig,
}: HomeLandingProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [liveConfig, setLiveConfig] = useState<SiteVisualConfigData>(visualConfig);

  // Preserve the Visual Page Editor live-preview channel
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === "PORTFOLIO_VISUAL_CONFIG_PREVIEW" &&
        event.data.visualConfig
      ) {
        setLiveConfig(event.data.visualConfig);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    setLiveConfig(visualConfig);
  }, [visualConfig]);

  const about = liveConfig.about;

  // Honour the existing "Website Content" section visibility toggles so the
  // admin panel keeps control over which landing blocks appear publicly.
  const sectionEnabled = (id: string) => {
    const list =
      liveConfig.sections && liveConfig.sections.length > 0
        ? liveConfig.sections
        : DEFAULT_SECTIONS_CONFIG;
    const found = list.find((s) => s.id === id);
    return found ? found.enabled !== false : true;
  };

  const displayName = liveConfig.hero?.name || profile?.name || "Kartik Khajuria";
  const bio =
    profile?.bio ||
    about?.subtext ||
    "Merging architectural precision, cinematic WebGL 3D, and high-performance engineering to build unforgettable digital experiences.";
  const role = profile?.tagline || "Creative Developer & Full-Stack Software Engineer";
  const location = profile?.location || "Mathura, Uttar Pradesh, India";
  const email = profile?.email || "kartikkhajuria643@gmail.com";

  const featured = [...projects]
    .sort((a, b) => {
      const byDate =
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      // Fall back to the existing display order when creation dates tie.
      return byDate !== 0 ? byDate : (a.order ?? 0) - (b.order ?? 0);
    })
    .slice(0, 2);

  // Group skills by category for a compact overview
  const groupedSkills = skills.reduce<Record<string, string[]>>((acc, skill) => {
    const key = skill.category || "Other";
    if (!acc[key]) acc[key] = [];
    if (acc[key].length < 6) acc[key].push(skill.name);
    return acc;
  }, {});
  const skillGroups = Object.entries(groupedSkills).slice(0, 4);
  const totalSkills = skills.length;

  return (
    <div className="relative">
      {/* 01 — Profile & Introduction */}
      <HeroSection
        profile={profile}
        heroConfig={liveConfig.hero}
        threeDConfig={liveConfig.threeD}
      />

      {/* 02 — Short About + Expertise */}
      {sectionEnabled("about") && (
      <section className="relative py-24">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="theme-badge text-[10px]">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span className="font-mono font-bold uppercase tracking-[0.2em] text-sky-300">
                  About Me
                </span>
              </div>
              <h2 className="font-heading font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-[1.1] text-white">
                {about?.headline || "Architecting Immersive Digital Frontiers"}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {bio}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/about"
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  className="theme-btn-primary px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider inline-flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <span>READ FULL STORY</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={`mailto:${email}`}
                  onClick={() => sound.playClick()}
                  className="theme-btn-secondary px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider inline-flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>EMAIL ME</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
              <div className="theme-card p-6 sm:p-7 space-y-6">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold">
                    Professional Role
                  </div>
                  <div className="mt-2 font-heading font-bold text-lg text-white leading-snug">
                    {role}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-mono text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{location}</span>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">
                    Areas of Expertise
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {EXPERTISE.map((item) => (
                      <span
                        key={item}
                        className="text-[11px] font-mono px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 03 — Skills Overview */}
      {sectionEnabled("skills") && (
      <section className="relative py-20 border-t border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div className="space-y-3">
              <div className="theme-badge text-[10px]">
                <Cpu className="w-3 h-3 text-sky-400" />
                <span className="font-mono font-bold uppercase tracking-[0.2em] text-sky-300">
                  Skills Overview
                </span>
              </div>
              <h2 className="font-heading font-extrabold tracking-tight text-3xl sm:text-4xl text-white">
                A Complete Technical Ecosystem
              </h2>
            </div>
            <Link
              href="/skills"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="theme-btn-secondary px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider inline-flex items-center gap-2 hover:scale-105 transition-all self-start"
            >
              <span>EXPLORE ALL {totalSkills > 0 ? totalSkills : ""} SKILLS</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
            </Link>
          </div>

          {skillGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {skillGroups.map(([category, items]) => (
                <div key={category} className="theme-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      {category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((name) => (
                      <span
                        key={name}
                        className="text-[10.5px] font-mono px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 font-mono">
              Skills will appear here once added from the admin dashboard.
            </p>
          )}
        </div>
      </section>
      )}

      {/* 04 — Featured Projects */}
      {sectionEnabled("projects") && (
      <section className="relative border-t border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:pt-14 lg:pb-2 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-14">
            <div className="space-y-3">
              <div className="theme-badge text-[10px]">
                <Compass className="w-3 h-3 text-sky-400" />
                <span className="font-mono font-bold uppercase tracking-[0.2em] text-sky-300">
                  Featured Projects
                </span>
              </div>
              <h2 className="font-heading font-extrabold tracking-tight text-3xl sm:text-4xl text-white">
                Selected Creations
              </h2>
            </div>
            <Link
              href="/projects"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="theme-btn-secondary px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider inline-flex items-center gap-2 hover:scale-105 transition-all self-start"
            >
              <span>VIEW ALL PROJECTS</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
            </Link>
          </div>
        </div>

        {featured.length > 0 ? (
          <ProjectsSection
            projects={featured}
            onSelectProject={(p) => setSelectedProject(p)}
          />
        ) : (
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 py-12">
            <p className="text-sm text-slate-400 font-mono">
              Projects will appear here once published from the admin dashboard.
            </p>
          </div>
        )}
      </section>
      )}

      {/* 05 — Contact CTA */}
      {sectionEnabled("contact") && (
      <section className="relative py-24 border-t border-white/[0.06]">
        <div className="max-w-[1180px] mx-auto px-6 sm:px-10 relative z-10">
          <div className="theme-card relative overflow-hidden p-8 sm:p-12 text-center space-y-6">
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full blur-[130px] pointer-events-none opacity-25"
              style={{
                background:
                  "radial-gradient(circle, #5145E5 0%, #38BDF8 60%, transparent 80%)",
              }}
            />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 theme-badge text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="font-mono font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Available for select work
                </span>
              </div>
              <h2 className="font-heading font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
                Let&apos;s Build Something Extraordinary
              </h2>
              <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
                {liveConfig.contact?.subtext ||
                  "Whether commissioning a full-scale 3D WebGL platform, a scalable full-stack application, or exploring technical leadership — let's talk."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/contact"
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  className="theme-btn-primary px-6 py-3 rounded-full text-xs font-mono font-bold tracking-wider inline-flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <span>START A CONVERSATION</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={`mailto:${email}`}
                  onClick={() => sound.playClick()}
                  className="theme-btn-secondary px-6 py-3 rounded-full text-xs font-mono font-bold tracking-wider inline-flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>{email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      <ProjectDetailsModal
        project={selectedProject}
        allProjects={featured}
        onClose={() => setSelectedProject(null)}
        onNavigate={(p) => setSelectedProject(p)}
      />
    </div>
  );
}
