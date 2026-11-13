"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Download, Mail, MapPin, Globe, CheckCircle2, ShieldCheck, Sparkles, Code2, Layers, Cpu } from "lucide-react";
import { sound } from "@/lib/sound";
import type { Profile } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface ProfileSectionProps {
  profile: Profile | null;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  const { currentTheme } = useTheme();
  const displayName = profile?.name || "Kartik Khajuria";
  const email = profile?.email || "kartikkhajuria643@gmail.com";
  const location = profile?.location || "Mathura, Uttar Pradesh, India";

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const router = useRouter();
  const secretClickCountRef = useRef(0);
  const secretClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePhotoSecretClick = useCallback(() => {
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

    secretClickTimerRef.current = setTimeout(() => {
      secretClickCountRef.current = 0;
    }, 3000);
  }, [router]);

  return (
    <section id="profile" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="theme-badge">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EXECUTIVE DOSSIER</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight">
            Professional <span className="theme-gradient-text">Profile</span>
          </h2>
          <p className="text-xs sm:text-sm font-mono opacity-70 max-w-lg">
            Engineering leadership, creative digital execution, and full-stack software architecture.
          </p>
        </div>

        {/* Profile Card Container */}
        <div className="theme-card p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle top edge glow bar */}
          <div
            className="absolute top-0 inset-x-0 h-[2px]"
            style={{ background: "var(--theme-primary-gradient)" }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Avatar with Animated Orbit Frame */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Outer spinning dashed orbit */}
                <div
                  className="absolute inset-0 rounded-full border border-dashed animate-spin [animation-duration:35s] pointer-events-none"
                  style={{ borderColor: "var(--theme-border-glow)" }}
                />

                {/* Inner counter-spinning dotted orbit */}
                <div
                  className="absolute inset-3 rounded-full border border-dotted animate-spin [animation-duration:25s] [animation-direction:reverse] pointer-events-none opacity-60"
                  style={{ borderColor: "var(--theme-primary)" }}
                />

                {/* Avatar / Monogram Box */}
                <div
                  className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-3xl overflow-hidden p-1 shadow-2xl flex items-center justify-center"
                  style={{
                    background: "var(--theme-primary-gradient)",
                    boxShadow: "0 0 35px var(--theme-glow)",
                  }}
                >
                  <div
                    className="w-full h-full rounded-[22px] overflow-hidden flex flex-col items-center justify-center relative"
                    style={{ backgroundColor: "var(--theme-bg)" }}
                  >
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={displayName}
                        onClick={handlePhotoSecretClick}
                        className="w-full h-full object-cover cursor-pointer select-none"
                      />
                    ) : (
                      <div
                        onClick={handlePhotoSecretClick}
                        className="flex flex-col items-center justify-center space-y-2 cursor-pointer select-none"
                      >
                        <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter theme-gradient-text">
                          {initials}
                        </span>
                        <span className="text-[10px] font-mono opacity-60 tracking-widest uppercase font-bold">
                          Verified Dev
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Online status indicator */}
                <div
                  className="absolute bottom-2 right-6 px-3 py-1 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg"
                  style={{
                    backgroundColor: "var(--theme-card)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold uppercase tracking-wide">{displayName}</h3>
                <p className="text-xs font-mono opacity-70">
                  {profile?.tagline || "Creative Developer | Full-Stack Software Engineer"}
                </p>
              </div>
            </div>

            {/* Right: Technical Snapshot & Details Grid */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-mono opacity-60 uppercase mb-1">
                    <MapPin className="w-3.5 h-3.5" style={{ color: "var(--theme-primary)" }} />
                    <span>Location &amp; Timezone</span>
                  </div>
                  <div className="text-sm font-bold font-mono">{location} (IST / UTC+5:30)</div>
                </div>

                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-mono opacity-60 uppercase mb-1">
                    <Mail className="w-3.5 h-3.5" style={{ color: "var(--theme-primary)" }} />
                    <span>Direct Communication</span>
                  </div>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm font-bold font-mono hover:underline break-all"
                  >
                    {email}
                  </a>
                </div>

                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-mono opacity-60 uppercase mb-1">
                    <Cpu className="w-3.5 h-3.5" style={{ color: "var(--theme-primary)" }} />
                    <span>Primary Stack</span>
                  </div>
                  <div className="text-sm font-bold font-mono">
                    Next.js, Three.js, TypeScript, Node.js, WebGL
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-mono opacity-60 uppercase mb-1">
                    <Globe className="w-3.5 h-3.5" style={{ color: "var(--theme-primary)" }} />
                    <span>Engagement Mode</span>
                  </div>
                  <div className="text-sm font-bold font-mono">
                    Full-Time, Contract, Technical Advisory
                  </div>
                </div>
              </div>

              {/* Core Attributes */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider opacity-60">
                  Key Technical Competencies:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Interactive 3D WebGL",
                    "Custom GLSL Shaders",
                    "Design Systems Architecture",
                    "Full-Stack Next.js 16",
                    "Database Engineering",
                    "Performance & Fluid Motion",
                    "Microservices & Cloud",
                    "Creative Motion Design",
                  ].map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono border"
                      style={{
                        backgroundColor: "var(--theme-card)",
                        borderColor: "var(--theme-border)",
                        color: "var(--theme-fg)",
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#contact"
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  className="theme-btn-primary px-6 py-3 text-xs font-mono"
                >
                  <Mail className="w-4 h-4" />
                  <span>Initiate Discussion</span>
                </a>

                <a
                  href={profile?.resumeUrl || "/resume.pdf"}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  className="theme-btn-secondary px-6 py-3 text-xs font-mono"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Curriculum Vitae</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
