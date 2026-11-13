"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Target,
  Code2,
  Cpu,
  Layers,
  Terminal,
  Activity,
  CheckCircle2,
  Compass,
  Play,
  Flame,
  Globe,
} from "lucide-react";
import { sound } from "@/lib/sound";
import type { Profile } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import type { AboutVisualConfig } from "@/types/visual-config";
import { DEFAULT_ABOUT_CONFIG } from "@/types/visual-config";

interface AboutSectionProps {
  profile: Profile | null;
  config?: AboutVisualConfig;
}

// Live interactive WebGL mini-canvas running custom GLSL fragment shader
function LiveShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float len = length(p);
        float angle = atan(p.y, p.x);
        float wave = sin(len * 5.0 - uTime * 2.2 + sin(angle * 3.0));
        vec3 col = vec3(
          0.32 + 0.45 * sin(uTime + wave + 0.0),
          0.45 + 0.45 * sin(uTime + wave + 2.0),
          0.90 + 0.10 * sin(uTime + wave + 4.0)
        );
        gl_FragColor = vec4(col, 0.95);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    let animId: number;
    const start = performance.now();

    const render = () => {
      animId = requestAnimationFrame(render);
      const time = (performance.now() - start) / 1000;
      gl.uniform1f(uTimeLoc, time);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={120}
      className="w-full h-28 rounded-xl border border-white/10 shadow-inner"
    />
  );
}

export default function AboutSection({ profile, config }: AboutSectionProps) {
  const { currentTheme } = useTheme();
  const cfg = config || DEFAULT_ABOUT_CONFIG;
  const [activeTab, setActiveTab] = useState<"craft" | "architecture" | "glsl">("craft");

  // Mouse 3D tilt tracking for cards
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;
    setTilt({ x: normY * -8, y: normX * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const pillars = [
    {
      num: "01",
      title: cfg.pillar1Title || "Real-Time 3D & WebGL",
      desc:
        cfg.pillar1Desc ||
        "Architecting GPU-accelerated 3D graphics, procedural geometries, and custom GLSL vertex/fragment shaders for fluid 60FPS browser execution.",
      icon: Cpu,
      color: "text-sky-400",
      accentBg: "rgba(56, 189, 248, 0.12)",
    },
    {
      num: "02",
      title: cfg.pillar2Title || "Full-Stack Precision",
      desc:
        cfg.pillar2Desc ||
        "Building rock-solid Next.js 16 applications with strict TypeScript typing, Prisma ORM engines, scalable databases, and atomic design systems.",
      icon: Layers,
      color: "text-indigo-400",
      accentBg: "rgba(81, 69, 229, 0.12)",
    },
    {
      num: "03",
      title: cfg.pillar3Title || "Performance & Micro-Interactions",
      desc:
        cfg.pillar3Desc ||
        "Delivering sub-100ms interaction feedback, accessible DOM hierarchies, and tactile audio-visual micro-interactions where every micro-detail serves a purpose.",
      icon: Zap,
      color: "text-purple-400",
      accentBg: "rgba(167, 139, 250, 0.12)",
    },
    {
      num: "04",
      title: cfg.pillar4Title || "Digital Art Direction",
      desc:
        cfg.pillar4Desc ||
        "Translating sophisticated brand identities into memorable, award-winning digital experiences inspired by Apple, Linear, and Awwwards best-in-class.",
      icon: Target,
      color: "text-emerald-400",
      accentBg: "rgba(52, 211, 153, 0.12)",
    },
  ];

  return (
    <section id="about" className="py-28 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div
        className="absolute top-1/2 -left-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#5145E5" }}
      />
      <div
        className="absolute bottom-10 right-0 w-[550px] h-[550px] rounded-full blur-[160px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#38BDF8" }}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 space-y-16">
        {/* Section Header with Large Editorial Typography */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="theme-badge">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>{cfg.badgeText || "PHILOSOPHY • ARCHITECTURE • CRAFT"}</span>
            </div>
            <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">
              SECTION 02 &bull; ABOUT
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading uppercase tracking-[-0.03em] leading-[0.94] max-w-5xl">
            {cfg.headline || "Bridging Computational Logic & Visual Artistry"}
          </h2>
          {cfg.subtext && (
            <p className="text-sm sm:text-base font-mono text-slate-300 max-w-3xl leading-relaxed">
              {cfg.subtext}
            </p>
          )}
        </div>

        {/* Master Bento Grid Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Bento Card 1: Interactive 3D Dossier Card with Mouse Tilt */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-5 transition-transform duration-200 ease-out preserve-3d"
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }}
          >
            <div className="theme-card p-8 sm:p-9 h-full flex flex-col justify-between space-y-8 relative overflow-hidden group shadow-2xl rounded-3xl">
              {/* Top ambient highlight line */}
              <div
                className="absolute top-0 inset-x-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, #5145E5, #38BDF8, #A78BFA)" }}
              />

              {/* Dossier Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                      LIVE PROFILE DOSSIER
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">REF. KK-2026</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black font-heading uppercase tracking-tight text-white">
                  {profile?.name || "Kartik Khajuria"}
                </h3>
                <p className="text-xs sm:text-sm font-mono text-sky-400 font-semibold">
                  {profile?.tagline || "Creative Technologist | Full-Stack Software Architect"}
                </p>
              </div>

              {/* Interactive Tabs: Core Craft / Architecture / Shader Pipeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveTab("craft");
                    }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
                      activeTab === "craft"
                        ? "theme-btn-primary shadow-sm text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Craft
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveTab("architecture");
                    }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
                      activeTab === "architecture"
                        ? "theme-btn-primary shadow-sm text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Arch
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveTab("glsl");
                    }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
                      activeTab === "glsl"
                        ? "theme-btn-primary shadow-sm text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    GLSL / 3D
                  </button>
                </div>

                {/* Tab Content Display */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 font-mono text-xs space-y-3 min-h-[190px]">
                  {activeTab === "craft" && (
                    <div className="space-y-2.5 animate-in fade-in duration-200">
                      <div className="text-[11px] text-emerald-400 font-bold">// CRAFTSMANSHIP PHILOSOPHY</div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        I approach every digital interface as architectural art. Sub-second responsiveness, sensory audio-visual feedback, and zero layout shift.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {["TypeScript", "React 19", "Next.js 16", "Tailwind 4", "Three.js"].map((t) => (
                          <span key={t} className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-[10px] border border-white/10 text-slate-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "architecture" && (
                    <div className="space-y-2.5 animate-in fade-in duration-200">
                      <div className="text-[11px] text-cyan-400 font-bold">// SYSTEM ARCHITECTURE</div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Strict modularity with Prisma ORM SQLite/Postgres schemas, edge caching, real-time WebSockets, and atomic design systems.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {["Server Actions", "Prisma ORM", "Micro-Frontends", "Edge Auth"].map((t) => (
                          <span key={t} className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-[10px] border border-white/10 text-slate-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "glsl" && (
                    <div className="space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-purple-400">// REAL-TIME WEBGL SHADER</span>
                        <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                          <Play className="w-2.5 h-2.5" /> Interactive GLSL
                        </span>
                      </div>
                      <LiveShaderCanvas />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Metrics Pill */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Focus: Engineering &amp; Design</span>
                <span className="text-emerald-400 font-bold font-mono">Bespoke Precision</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: The 4 Layered 3D Architectural Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((pillar) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={pillar.num}
                  onMouseEnter={() => sound.playHover()}
                  className="theme-card theme-card-hover p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-6 group cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg"
                      style={{
                        backgroundColor: pillar.accentBg,
                      }}
                    >
                      <IconComponent className={`w-6 h-6 ${pillar.color}`} />
                    </div>
                    <span className="text-2xl font-black font-mono opacity-25 group-hover:opacity-75 transition-opacity text-white">
                      {pillar.num}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base sm:text-lg font-bold font-heading tracking-tight text-white group-hover:text-sky-300 transition-colors">
                      {pillar.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] font-mono text-slate-400 group-hover:text-slate-200 transition-colors">
                    <span className="text-sky-400">&bull;</span>
                    <span>Production Calibrated</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Architectural Disciplines Banner */}
        <div className="theme-card p-6 sm:p-8 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-xl">
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black font-heading theme-gradient-text tracking-tight">
              Full-Stack
            </div>
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Next.js 16 &bull; Prisma
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black font-heading theme-gradient-text tracking-tight">
              Interactive 3D
            </div>
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Three.js &bull; GLSL Shaders
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black font-heading theme-gradient-text tracking-tight">
              Design Systems
            </div>
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Fluid Motion &bull; Tailwind
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black font-heading theme-gradient-text tracking-tight">
              Engineering
            </div>
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              TypeScript &bull; Architecture
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
