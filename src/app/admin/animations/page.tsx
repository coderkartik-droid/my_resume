"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Layers,
  MousePointer,
  Box,
  Eye,
} from "lucide-react";
import { AnimationConfig, AnimationIntensity } from "@/types/theme";
import { DEFAULT_ANIMATION_CONFIG } from "@/lib/themes/theme-engine";

export default function AnimationStudioPage() {
  const [config, setConfig] = useState<AnimationConfig>(DEFAULT_ANIMATION_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchAnimationConfig();
  }, []);

  const fetchAnimationConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/theme");
      if (res.ok) {
        const data = await res.json();
        if (data.animationSettings) {
          setConfig(data.animationSettings);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-animations",
          animationSettings: config,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update animations");

      showNotification("success", "Animation Studio configurations updated successfully!");
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_ANIMATION_CONFIG);
    showNotification("success", "Reset to default animation parameters. Click Save to persist.");
  };

  const sectionKeys = [
    { key: "hero", label: "Hero & Introduction Section" },
    { key: "profile", label: "Professional Profile Section" },
    { key: "about", label: "About Me & Pillars" },
    { key: "experience", label: "Professional Experience Timeline" },
    { key: "skills", label: "Skills Ecosystem & 3D WebGL" },
    { key: "projects", label: "Projects & Portfolio Cards" },
    { key: "testimonials", label: "Client Testimonials Slider" },
    { key: "contact", label: "Contact Form & Celebration Confetti" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Animation Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono font-bold uppercase tracking-wider">
                Motion Control
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Configure global motion curves, interactive 3D physics, hover physics, and section-by-section overrides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Animation Settings</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2.5 shadow-sm animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* 1. Global Master Switch & Intensity */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Master Motion Switch</h3>
            <p className="text-xs text-slate-500">
              Globally activate or suppress animations across all public visitor viewports.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
          </label>
        </div>

        {/* Intensity Selector */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold block">
            Motion Intensity Profile
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["subtle", "normal", "advanced", "extreme"] as const).map((intensity) => (
              <button
                key={intensity}
                type="button"
                onClick={() => setConfig({ ...config, intensity })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  config.intensity === intensity
                    ? "border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 text-purple-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                <div className="font-bold text-xs uppercase font-mono">{intensity}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {intensity === "subtle" && "Gentle fades, reduced travel, minimal GPU work"}
                  {intensity === "normal" && "Standard production motion with smooth reveals"}
                  {intensity === "advanced" && "Expansive parallax, particle glow, 3D tilt"}
                  {intensity === "extreme" && "High-octane Awwwards-style kinetic motion"}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Transition & Motion Styles */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Animation Style Variants
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Page Transition Style
            </label>
            <select
              value={config.pageTransitions}
              onChange={(e) =>
                setConfig({
                  ...config,
                  pageTransitions: e.target.value as AnimationConfig["pageTransitions"],
                })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="fade">Smooth Fade In / Out</option>
              <option value="slide">Slide Transition</option>
              <option value="scale">Scale & Zoom</option>
              <option value="blur">Cinematic Blur</option>
              <option value="none">None (Instant)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Scroll Animation Style
            </label>
            <select
              value={config.scrollAnimations}
              onChange={(e) =>
                setConfig({
                  ...config,
                  scrollAnimations: e.target.value as AnimationConfig["scrollAnimations"],
                })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="reveal">Fade & Slide Reveal</option>
              <option value="stagger">Staggered Card Cascades</option>
              <option value="parallax">Parallax Layering</option>
              <option value="subtle">Subtle Micro-Fade</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Hover Effect Style
            </label>
            <select
              value={config.hoverEffects}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hoverEffects: e.target.value as AnimationConfig["hoverEffects"],
                })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="3d-tilt">Interactive 3D Card Tilt</option>
              <option value="glow">Radiant Border Glow</option>
              <option value="lift">Simple Elevation Lift</option>
              <option value="minimal">Minimal Color Highlight</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Background Canvas Style
            </label>
            <select
              value={config.backgroundStyle}
              onChange={(e) =>
                setConfig({
                  ...config,
                  backgroundStyle: e.target.value as AnimationConfig["backgroundStyle"],
                })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="interactive-canvas">Interactive Particle & Aurora Waves</option>
              <option value="particles">Floating Stardust Embers</option>
              <option value="gradient-mesh">Fluid Gradient Mesh</option>
              <option value="geometric">Subtle Geometric Grid</option>
              <option value="minimal">Minimal Static Radial Glow</option>
              <option value="none">None (Pure Background)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Physics & Timing Sliders */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Physics, Timing &amp; Speed Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-600">Speed Multiplier</span>
              <span className="font-bold text-purple-600">{config.speed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={config.speed}
              onChange={(e) => setConfig({ ...config, speed: parseFloat(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-600">Entrance Stagger Delay</span>
              <span className="font-bold text-purple-600">{config.delay}s</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.05"
              value={config.delay}
              onChange={(e) => setConfig({ ...config, delay: parseFloat(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0s</span>
              <span>0.25s</span>
              <span>0.5s</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-600">Parallax Intensity</span>
              <span className="font-bold text-purple-600">{Math.round(config.parallaxIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.parallaxIntensity}
              onChange={(e) => setConfig({ ...config, parallaxIntensity: parseFloat(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Flat)</span>
              <span>50%</span>
              <span>100% (Deep)</span>
            </div>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={config.cursorEffects}
              onChange={(e) => setConfig({ ...config, cursorEffects: e.target.checked })}
              className="rounded text-purple-600 accent-purple-600 w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="text-xs font-bold text-slate-800">Animated Precision Cursor</div>
              <div className="text-[10px] text-slate-500">Trailing magnetic ring (desktop)</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={config.particleEffects}
              onChange={(e) => setConfig({ ...config, particleEffects: e.target.checked })}
              className="rounded text-purple-600 accent-purple-600 w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="text-xs font-bold text-slate-800">Background Particles</div>
              <div className="text-[10px] text-slate-500">Living ember and stardust motion</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={config.threeDEffects}
              onChange={(e) => setConfig({ ...config, threeDEffects: e.target.checked })}
              className="rounded text-purple-600 accent-purple-600 w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="text-xs font-bold text-slate-800">3D WebGL Canvas</div>
              <div className="text-[10px] text-slate-500">Interactive 3D centerpieces</div>
            </div>
          </label>
        </div>
      </div>

      {/* 4. Section-Specific Animation Overrides */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Section-Specific Animation Toggles
          </h3>
          <p className="text-xs text-slate-500">
            Optionally disable motion on specific sections if desired for performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sectionKeys.map((sec) => {
            const isSecEnabled = config.sectionOverrides?.[sec.key]?.enabled !== false;
            return (
              <div
                key={sec.key}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50"
              >
                <span className="text-xs font-medium text-slate-700">{sec.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSecEnabled}
                    onChange={(e) => {
                      const newOverrides = {
                        ...(config.sectionOverrides || {}),
                        [sec.key]: { enabled: e.target.checked },
                      };
                      setConfig({ ...config, sectionOverrides: newOverrides });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
