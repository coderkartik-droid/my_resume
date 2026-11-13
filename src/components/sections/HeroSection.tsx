"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Download,
  Mail,
  Sparkles,
  ChevronDown,
  Box,
  Cpu,
  Layers,
  MapPin,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/Icons";
import { sound } from "@/lib/sound";
import type { Profile } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import type { HeroVisualConfig, ThreeDVisualConfig } from "@/types/visual-config";
import { DEFAULT_HERO_CONFIG } from "@/types/visual-config";

const HeroCenterpiece = dynamic(() => import("@/components/3d/HeroCenterpiece"), {
  ssr: false,
});

function AnimatedCounter({
  value,
  suffix = "",
  duration = 1600,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * value));
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [started, value, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

interface HeroSectionProps {
  profile: Profile | null;
  heroConfig?: HeroVisualConfig;
  threeDConfig?: ThreeDVisualConfig;
}

export default function HeroSection({
  profile,
  heroConfig,
  threeDConfig,
}: HeroSectionProps) {
  const { currentTheme } = useTheme();
  const cfg = heroConfig || DEFAULT_HERO_CONFIG;

  const displayName = cfg.name || profile?.name || "Kartik Khajuria";
  const resumeUrl = cfg.secondaryCtaLink || profile?.resumeUrl || "/resume.pdf";
  const avatarUrl = profile?.avatarUrl || "/uploads/Screenshot_2026-11-06_123841_1794398898180.png";

  const titles = cfg.roleTicker && cfg.roleTicker.length > 0 ? cfg.roleTicker : [
    "Creative Technologist & UI Engineer",
    "WebGL & Spatial Computing Specialist",
    "Full-Stack Software Architect",
    "Product Design & Systems Engineer",
  ];
  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titles.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [titles.length]);

  const nameParts = displayName.trim().split(" ");
  const firstName = nameParts[0] || "KARTIK";
  const lastName = nameParts.slice(1).join(" ") || "KHAJURIA";

  const show3D = cfg.threeDCenterpieceVisible !== false;

  const router = useRouter();
  const secretClickCountRef = useRef(0);
  const secretClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dedicated Hidden Admin Login trigger: exactly 5 clicks within 3 seconds
  const handleSecretPhotoClick = useCallback(() => {
    if (secretClickTimerRef.current) {
      clearTimeout(secretClickTimerRef.current);
    }

    secretClickCountRef.current += 1;

    if (secretClickCountRef.current === 5) {
      secretClickCountRef.current = 0;
      router.push("/admin/login");
      return;
    }

    if (secretClickCountRef.current > 5) {
      secretClickCountRef.current = 0;
      return;
    }

    // Reset sequence if inactive for 3000ms
    secretClickTimerRef.current = setTimeout(() => {
      secretClickCountRef.current = 0;
    }, 3000);
  }, [router]);

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] lg:min-h-[960px] flex items-center justify-center pt-32 sm:pt-36 lg:pt-32 pb-20 px-5 sm:px-10 lg:px-12 overflow-hidden"
    >
      {/* Dynamic Atmospheric Radial Halos */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full blur-[180px] pointer-events-none opacity-30 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, #5145E5 0%, #38BDF8 40%, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[650px] h-[650px] rounded-full blur-[170px] pointer-events-none opacity-25 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, #A78BFA 0%, #38BDF8 35%, transparent 65%)`,
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[220px] pointer-events-none opacity-15"
        style={{
          background: `radial-gradient(circle, #0B1020 0%, #5145E5 30%, transparent 70%)`,
        }}
      />

      {/* Subtle Mesh Grid Pattern */}
      <div className="absolute inset-0 theme-bg-grid opacity-35 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center relative z-10">
        {/* LEFT COLUMN: Monumental Typography, Kinetic Roles, Bio, CTAs & Metrics */}
        <div
          className={`${
            show3D
              ? "lg:col-span-7 xl:col-span-7"
              : "lg:col-span-12 max-w-4xl mx-auto"
          } space-y-8 ${cfg.alignment === "center" ? "text-center mx-auto" : "text-center lg:text-left"}`}
        >
          {/* Eyebrow Status Ribbon */}
          {cfg.badgeVisible !== false && (
            <div className={`flex flex-wrap items-center ${cfg.alignment === "center" ? "justify-center" : "justify-center lg:justify-start"} gap-3`}>
              <div className="glass-pill px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  {cfg.badgeText || "AVAILABLE FOR HIGH-IMPACT INITIATIVES"}
                </span>
              </div>

              <span className="glass-pill text-xs font-mono tracking-wider text-slate-300 px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-sky-400" />
                <span>{profile?.location || "India · Available Worldwide"}</span>
              </span>
            </div>
          )}

          {/* Monumental Hero Headline */}
          <div className="space-y-3">
            <div className={`text-xs sm:text-sm font-mono tracking-[0.25em] uppercase text-sky-400/90 flex items-center ${cfg.alignment === "center" ? "justify-center" : "justify-center lg:justify-start"} gap-2`}>
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>SILICON VALLEY CALIBER &bull; FULL-STACK ARCHITECT</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-heading tracking-[-0.04em] leading-[0.92] uppercase select-none">
              <span className="block text-white font-extrabold tracking-tight drop-shadow-sm">
                {firstName}
              </span>
              <span className="block theme-gradient-text font-extrabold tracking-tight filter drop-shadow-[0_10px_20px_rgba(81,69,229,0.25)]">
                {lastName}
              </span>
            </h1>
          </div>

          {/* Dynamic Animated Professional Title Banner */}
          {cfg.roleTickerVisible !== false && (
            <div className={`flex items-center ${cfg.alignment === "center" ? "justify-center" : "justify-center lg:justify-start"} gap-3 text-sm sm:text-base font-mono`}>
              <div className="px-4 py-2.5 rounded-full border border-white/10 glass-panel shadow-lg flex items-center gap-2.5 transition-all duration-300">
                <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" />
                <span className="font-semibold tracking-wide text-xs sm:text-sm text-white/95">
                  {titles[titleIndex]}
                </span>
              </div>
            </div>
          )}

          {/* High-Concept Editorial Bio */}
          <p className="text-sm sm:text-base xl:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal text-slate-300/95">
            {cfg.introBio ||
              profile?.bio ||
              "Architecting immersive real-time 3D web experiences, bespoke WebGL shaders, fluid design systems, and highly scalable cloud platforms designed for visionary brands."}
          </p>

          {/* Premium High-Contrast CTA Buttons */}
          {cfg.ctaButtonsVisible !== false && (
            <div className={`flex flex-wrap items-center ${cfg.alignment === "center" ? "justify-center" : "justify-center lg:justify-start"} gap-4 pt-2`}>
              <a
                href={cfg.primaryCtaLink || "#projects"}
                onMouseEnter={() => sound.playHover()}
                onClick={() => sound.playClick()}
                className="theme-btn-primary px-8 py-3.5 text-xs font-mono tracking-wider group"
              >
                <span>{cfg.primaryCtaText || "EXPLORE CASE STUDIES"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </a>

              <a
                href={resumeUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => sound.playHover()}
                onClick={() => sound.playClick()}
                className="theme-btn-secondary px-7 py-3.5 text-xs font-mono tracking-wider group"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 text-sky-400" />
                <span>{cfg.secondaryCtaText || "DOWNLOAD RESUME"}</span>
              </a>

              <a
                href="#contact"
                onMouseEnter={() => sound.playHover()}
                onClick={() => sound.playClick()}
                className="theme-btn-secondary px-6 py-3.5 text-xs font-mono tracking-wider"
              >
                <Mail className="w-4 h-4 text-purple-400" />
                <span>GET IN TOUCH</span>
              </a>
            </div>
          )}

          {/* Social Links Ribbon */}
          {cfg.socialLinksVisible !== false && (
            <div className={`flex items-center ${cfg.alignment === "center" ? "justify-center" : "justify-center lg:justify-start"} gap-3 pt-2`}>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mr-1">
                CONNECT:
              </span>
              {profile?.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playHover()}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-sky-400/40 glass-pill transition-all hover:scale-110 shadow-sm text-slate-300 hover:text-white"
                  title="GitHub Profile"
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
                  className="p-2.5 rounded-xl border border-white/10 hover:border-sky-400/40 glass-pill transition-all hover:scale-110 shadow-sm text-slate-300 hover:text-white"
                  title="LinkedIn Profile"
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
                  className="p-2.5 rounded-xl border border-white/10 hover:border-sky-400/40 glass-pill transition-all hover:scale-110 shadow-sm text-slate-300 hover:text-white"
                  title="Twitter / X"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  onMouseEnter={() => sound.playHover()}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-sky-400/40 glass-pill transition-all hover:scale-110 shadow-sm text-slate-300 hover:text-white"
                  title="Direct Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* High-Impact Architectural Metric Bento Cards */}
          {cfg.metricCardsVisible !== false && (
            <div className={`grid grid-cols-3 gap-3 sm:gap-4 pt-4 max-w-xl ${cfg.alignment === "center" ? "mx-auto" : "mx-auto lg:mx-0"}`}>
              <div className="theme-card theme-card-hover p-4 sm:p-5 rounded-2xl text-center lg:text-left relative overflow-hidden group">
                <div className="text-3xl sm:text-4xl font-black font-heading tracking-tight theme-gradient-text">
                  <AnimatedCounter value={cfg.metric1Value ?? 3} suffix={cfg.metric1Suffix ?? "+"} />
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1.5 font-semibold">
                  {cfg.metric1Label || "Years Exp."}
                </div>
              </div>

              <div className="theme-card theme-card-hover p-4 sm:p-5 rounded-2xl text-center lg:text-left relative overflow-hidden group">
                <div className="text-3xl sm:text-4xl font-black font-heading tracking-tight theme-gradient-text">
                  <AnimatedCounter value={cfg.metric2Value ?? 15} suffix={cfg.metric2Suffix ?? "+"} />
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1.5 font-semibold">
                  {cfg.metric2Label || "Projects Built"}
                </div>
              </div>

              <div className="theme-card theme-card-hover p-4 sm:p-5 rounded-2xl text-center lg:text-left relative overflow-hidden group">
                <div className="text-3xl sm:text-4xl font-black font-heading tracking-tight theme-gradient-text">
                  <AnimatedCounter value={cfg.metric3Value ?? 100} suffix={cfg.metric3Suffix ?? "%"} />
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1.5 font-semibold">
                  {cfg.metric3Label || "Commitment"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Large Interactive 3D Holographic Portrait Composition */}
        {show3D && (
          <div className="lg:col-span-5 xl:col-span-5 relative w-full h-[480px] sm:h-[560px] lg:h-[680px] flex items-center justify-center">
            {/* Floating Spatial Feature Badges */}
            <div className="absolute top-6 left-2 sm:left-4 z-20 glass-pill px-3.5 py-2 rounded-2xl border border-white/10 shadow-xl flex items-center gap-2 pointer-events-none animate-float-slow">
              <Box className="w-4 h-4 text-sky-400" />
              <span className="text-[11px] font-mono font-semibold text-white/90">WebGL 3D Core</span>
            </div>

            <div
              className="absolute bottom-8 right-2 sm:right-4 z-20 glass-pill px-3.5 py-2 rounded-2xl border border-white/10 shadow-xl flex items-center gap-2 pointer-events-none"
              style={{ animation: "floatSlow 8s ease-in-out infinite 2s" }}
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-[11px] font-mono font-semibold text-white/90">Next.js 16 & React 19</span>
            </div>

            <HeroCenterpiece
              photoUrl={avatarUrl}
              displayName={displayName}
              config={threeDConfig}
              onPhotoClick={handleSecretPhotoClick}
            />
          </div>
        )}
      </div>

      {/* Floating Scroll Indicator */}
      {cfg.scrollIndicatorVisible !== false && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-70 font-mono text-[10px] tracking-[0.25em] uppercase pointer-events-none animate-bounce text-slate-400">
          <span>Scroll to Explore Journey</span>
          <ChevronDown className="w-4 h-4 text-sky-400" />
        </div>
      )}
    </section>
  );
}
