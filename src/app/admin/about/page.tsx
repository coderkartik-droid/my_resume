"use client";

import { useEffect, useState } from "react";
import {
  Compass,
  Save,
  Check,
  AlertCircle,
  Layers,
  Sparkles,
  Cpu,
  Zap,
  Target,
  Eye,
  RotateCcw,
} from "lucide-react";
import type { AboutVisualConfig, SiteVisualConfigData } from "@/types/visual-config";
import { DEFAULT_ABOUT_CONFIG } from "@/types/visual-config";

export default function AdminAboutManager() {
  const [aboutConfig, setAboutConfig] = useState<AboutVisualConfig>(DEFAULT_ABOUT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/visual-config");
      if (res.ok) {
        const data: SiteVisualConfigData = await res.json();
        if (data.about) {
          setAboutConfig(data.about);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSave = async (publishImmediate = false) => {
    try {
      if (publishImmediate) setPublishing(true);
      else setSaving(true);

      const res = await fetch("/api/visual-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "about",
          data: aboutConfig,
          publishNow: publishImmediate,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      showNotification(
        "success",
        publishImmediate
          ? "About section changes published live to public site!"
          : "About configuration saved as draft."
      );
    } catch {
      showNotification("error", "Failed to save About section configuration");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset About section to factory defaults?")) {
      setAboutConfig(DEFAULT_ABOUT_CONFIG);
      showNotification("success", "Reset to default configuration");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border flex items-center gap-3 shadow-xl transition-all ${
            notification.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700"
              : "bg-rose-600 text-white border-rose-700"
          }`}
        >
          {notification.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">About Section Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize editorial narrative, craftsmanship philosophy, and the 4 architectural pillars.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={saving || publishing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving Draft..." : "Save Draft"}</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving || publishing}
            className="px-4 py-2 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{publishing ? "Publishing..." : "Publish Live"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">
          Loading configuration...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section Header Controls */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Section Heading &amp; Narrative</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">Badge Label</label>
                <input
                  type="text"
                  value={aboutConfig.badgeText}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, badgeText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">Section Headline</label>
                <input
                  type="text"
                  value={aboutConfig.headline}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-mono">Subtext / Vision Statement</label>
              <textarea
                rows={3}
                value={aboutConfig.subtext}
                onChange={(e) => setAboutConfig({ ...aboutConfig, subtext: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* The 4 Architectural Pillars */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>The 4 Architectural Pillars</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pillar 1 */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 font-mono text-xs font-bold flex items-center justify-center">01</span>
                    <span className="text-xs font-bold text-slate-800">Pillar 1: 3D Graphics</span>
                  </div>
                  <Cpu className="w-4 h-4 text-cyan-600" />
                </div>
                <input
                  type="text"
                  value={aboutConfig.pillar1Title}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, pillar1Title: e.target.value })}
                  placeholder="Title"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                />
                <textarea
                  rows={3}
                  value={aboutConfig.pillar1Desc}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, pillar1Desc: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white resize-none"
                />
              </div>

              {/* Pillar 2 */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-mono text-xs font-bold flex items-center justify-center">02</span>
                    <span className="text-xs font-bold text-slate-800">Pillar 2: Full-Stack</span>
                  </div>
                  <Layers className="w-4 h-4 text-indigo-600" />
                </div>
                <input
                  type="text"
                  value={aboutConfig.pillar2Title}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, pillar2Title: e.target.value })}
                  placeholder="Title"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                />
                <textarea
                  rows={3}
                  value={aboutConfig.pillar2Desc}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, pillar2Desc: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white resize-none"
                />
              </div>

              {/* Pillar 3 */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 font-mono text-xs font-bold flex items-center justify-center">03</span>
                    <span className="text-xs font-bold text-slate-800">Pillar 3: Interaction</span>
                  </div>
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <input
                  type="text"
                  value={aboutConfig.pillar3Title}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, pillar3Title: e.target.value })}
                  placeholder="Title"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                />
                <textarea
                  rows={3}
                  value={aboutConfig.pillar3Desc}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, pillar3Desc: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white resize-none"
                />
              </div>

              {/* Pillar 4 */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-mono text-xs font-bold flex items-center justify-center">04</span>
                    <span className="text-xs font-bold text-slate-800">Pillar 4: Direction</span>
                  </div>
                  <Target className="w-4 h-4 text-rose-600" />
                </div>
                <input
                  type="text"
                  value={aboutConfig.pillar4Title}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, pillar4Title: e.target.value })}
                  placeholder="Title"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                />
                <textarea
                  rows={3}
                  value={aboutConfig.pillar4Desc}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, pillar4Desc: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
