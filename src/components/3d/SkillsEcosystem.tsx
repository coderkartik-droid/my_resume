"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import type { Skill } from "@/types";
import { sound } from "@/lib/sound";
import { useTheme } from "@/context/ThemeContext";
import {
  Code2,
  Box,
  FileCode2,
  Palette,
  Server,
  Database,
  Cpu,
  Terminal,
  Layers,
  Flame,
  Sparkles,
} from "lucide-react";

interface SkillsEcosystemProps {
  skills: Skill[];
}

export default function SkillsEcosystem({ skills }: SkillsEcosystemProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [activeTooltipPos, setActiveTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const { currentTheme, animations } = useTheme();

  // Take top 16 representative skills for the 3D constellation
  const displaySkills = useMemo(() => {
    return skills.length > 0 ? skills.slice(0, 16) : [];
  }, [skills]);

  // Skill Icon Helper
  const getSkillIcon = (iconName?: string | null) => {
    switch (iconName) {
      case "Box":
        return <Box className="w-3.5 h-3.5 text-cyan-400" />;
      case "FileCode2":
        return <FileCode2 className="w-3.5 h-3.5 text-amber-400" />;
      case "Palette":
        return <Palette className="w-3.5 h-3.5 text-purple-400" />;
      case "Server":
        return <Server className="w-3.5 h-3.5 text-emerald-400" />;
      case "Database":
        return <Database className="w-3.5 h-3.5 text-blue-400" />;
      case "Cpu":
        return <Cpu className="w-3.5 h-3.5 text-rose-400" />;
      case "Terminal":
        return <Terminal className="w-3.5 h-3.5 text-indigo-400" />;
      case "Layers":
        return <Layers className="w-3.5 h-3.5 text-orange-400" />;
      case "Flame":
        return <Flame className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Code2 className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const primaryColor = new THREE.Color(currentTheme.colors.primary || "#873EFF");
    const secondaryColor = new THREE.Color(currentTheme.colors.secondary || "#FF5A1F");
    const accentColor = new THREE.Color(currentTheme.colors.accent || "#00D9FF");

    // Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Central Core Sphere with pulsating wireframe
    const coreGeo = new THREE.IcosahedronGeometry(0.72, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0c0a14,
      metalness: 0.9,
      roughness: 0.15,
      emissive: primaryColor,
      emissiveIntensity: 0.5,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterGroup.add(coreMesh);

    // Concentric Orbital Ring Rails
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.012, 16, 100),
      new THREE.MeshBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.4 })
    );
    ring1.rotation.x = Math.PI / 3;
    masterGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.01, 16, 100),
      new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.35 })
    );
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    masterGroup.add(ring2);

    // Ambient Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 2.0));
    const light1 = new THREE.PointLight(primaryColor, 4.0, 10);
    light1.position.set(2, 3, 2);
    scene.add(light1);

    const light2 = new THREE.PointLight(accentColor, 3.5, 10);
    light2.position.set(-2, -3, 2);
    scene.add(light2);

    // Stardust Constellation Particles
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 1.2 + Math.random() * 2.2;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pPos[i] = r * Math.sin(ph) * Math.cos(th);
      pPos[i + 1] = r * Math.sin(ph) * Math.sin(th);
      pPos[i + 2] = r * Math.cos(ph);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.035,
      color: accentColor,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const pField = new THREE.Points(pGeo, pMat);
    masterGroup.add(pField);

    // Drag-to-rotate interaction physics
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      rotationVelocity.x = deltaY * 0.005;
      rotationVelocity.y = deltaX * 0.005;

      masterGroup.rotation.x += rotationVelocity.x;
      masterGroup.rotation.y += rotationVelocity.y;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(mount);

    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible || document.hidden) return;

      const elapsed = (performance.now() - startTime) / 1000;
      const motion = prefersReducedMotion ? 0.2 : 1.0;

      if (!isDragging) {
        // Smooth inertial deceleration
        rotationVelocity.x *= 0.95;
        rotationVelocity.y *= 0.95;
        masterGroup.rotation.x += rotationVelocity.x;
        masterGroup.rotation.y += rotationVelocity.y;

        // Continuous ambient orbital spin
        masterGroup.rotation.y += 0.003 * motion;
      }

      ring1.rotation.z = elapsed * 0.2 * motion;
      ring2.rotation.z = -elapsed * 0.16 * motion;
      coreMesh.rotation.y = elapsed * 0.15 * motion;

      // Pulse core
      const pulse = 1.0 + Math.sin(elapsed * 2.0) * 0.03;
      coreMesh.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      mount.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, [currentTheme]);

  // Compute 2D position rings for interactive skill pills overlay
  const tier1 = displaySkills.slice(0, 8);
  const tier2 = displaySkills.slice(8, 16);

  return (
    <div className="relative w-full aspect-square max-w-[540px] mx-auto flex items-center justify-center select-none">
      {/* Dynamic Radial Background Glow - Samples theme colors */}
      <div
        className="absolute inset-0 rounded-full blur-3xl pointer-events-none opacity-25"
        style={{
          background: `radial-gradient(circle, var(--theme-primary) 0%, var(--theme-accent) 45%, transparent 70%)`,
        }}
      />

      {/* 3D WebGL Canvas Layer */}
      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing z-0"
        style={{ touchAction: "none" }}
      />

      {/* Interactive Core Centerpiece Indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2px] flex items-center justify-center shadow-2xl animate-pulse"
          style={{
            background: "var(--theme-primary-gradient)",
            boxShadow: "0 0 35px var(--theme-glow)",
          }}
        >
          <div
            className="w-full h-full rounded-full flex flex-col items-center justify-center text-center p-2"
            style={{ backgroundColor: "var(--theme-bg)" }}
          >
            <Sparkles
              className="w-5 h-5 mb-1 animate-spin [animation-duration:12s]"
              style={{ color: "var(--theme-accent, var(--theme-primary))" }}
            />
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-white">
              CORE
            </span>
            <span className="text-[8px] font-mono opacity-60 uppercase">
              {skills.length} Stack
            </span>
          </div>
        </div>

        {/* Dynamic Skill Details Tooltip */}
        {hoveredSkill && (
          <div
            className="absolute top-full mt-3 z-30 px-4 py-2 rounded-2xl border backdrop-blur-xl shadow-2xl text-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
            style={{
              backgroundColor: "var(--theme-card)",
              borderColor: "var(--theme-border-glow)",
              color: "var(--theme-fg)",
            }}
          >
            <div className="text-xs font-bold font-mono text-white">
              {hoveredSkill.name}
            </div>
            <div
              className="text-[10px] font-mono font-semibold"
              style={{ color: "var(--theme-accent, var(--theme-primary))" }}
            >
              {hoveredSkill.level || "Advanced"} &bull; {hoveredSkill.category}
            </div>
          </div>
        )}
      </div>

      {/* Tier 1 Orbital Nodes (Radius ~ 34%) */}
      {tier1.map((skill, index) => {
        const angle = (index / tier1.length) * Math.PI * 2;
        const radius = 34; // percent
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const isHovered = hoveredSkill?.id === skill.id;

        return (
          <button
            key={skill.id}
            type="button"
            onMouseEnter={() => {
              setHoveredSkill(skill);
              sound.playHover();
            }}
            onMouseLeave={() => setHoveredSkill(null)}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${isHovered ? 1.25 : 1})`,
              backgroundColor: "var(--theme-card)",
              borderColor: isHovered
                ? "var(--theme-accent, var(--theme-primary))"
                : "var(--theme-border)",
              boxShadow: isHovered ? "0 0 20px var(--theme-glow)" : "none",
            }}
            className="absolute z-20 p-2 sm:p-2.5 rounded-2xl border backdrop-blur-md transition-all duration-300 flex items-center gap-2 group cursor-pointer shadow-lg"
          >
            <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center">
              {getSkillIcon(skill.icon)}
            </div>
            <span className="text-[11px] font-mono font-medium text-white pr-1 hidden sm:inline">
              {skill.name}
            </span>
          </button>
        );
      })}

      {/* Tier 2 Orbital Nodes (Radius ~ 45%) */}
      {tier2.map((skill, index) => {
        const angle = (index / tier2.length) * Math.PI * 2 + 0.35;
        const radius = 45; // percent
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const isHovered = hoveredSkill?.id === skill.id;

        return (
          <button
            key={skill.id}
            type="button"
            onMouseEnter={() => {
              setHoveredSkill(skill);
              sound.playHover();
            }}
            onMouseLeave={() => setHoveredSkill(null)}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${isHovered ? 1.22 : 1})`,
              backgroundColor: "var(--theme-card)",
              borderColor: isHovered
                ? "var(--theme-primary)"
                : "var(--theme-border)",
              boxShadow: isHovered ? "0 0 20px var(--theme-glow)" : "none",
            }}
            className="absolute z-20 p-1.5 sm:p-2 rounded-2xl border backdrop-blur-md transition-all duration-300 flex items-center gap-2 group cursor-pointer shadow-md"
          >
            <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center">
              {getSkillIcon(skill.icon)}
            </div>
            <span className="text-[10px] font-mono font-medium text-white pr-1 hidden sm:inline">
              {skill.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
