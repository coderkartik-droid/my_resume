"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Sparkles,
  Sliders,
  Eye,
  Save,
  RotateCcw,
  Camera,
  Sun,
  MousePointer,
  Layers,
  CheckCircle2,
  AlertCircle,
  Undo2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import type { ThreeDVisualConfig, SiteVisualConfigData } from "@/types/visual-config";
import { DEFAULT_THREED_CONFIG, DEFAULT_SITE_VISUAL_CONFIG } from "@/types/visual-config";
import dynamic from "next/dynamic";

const HeroCenterpiece = dynamic(() => import("@/components/3d/HeroCenterpiece"), {
  ssr: false,
});

export default function ThreeDStudioPage() {
  const [config, setConfig] = useState<ThreeDVisualConfig>(DEFAULT_THREED_CONFIG);
  const [fullVisualConfig, setFullVisualConfig] = useState<SiteVisualConfigData>(DEFAULT_SITE_VISUAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/visual-config?preview=true");
      if (res.ok) {
        const data = await res.json();
        const effective = data.effective || data.published || DEFAULT_SITE_VISUAL_CONFIG;
        setFullVisualConfig(effective);
        if (effective.threeD) {
          setConfig(effective.threeD);
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

  const updateThreeD = (updater: (prev: ThreeDVisualConfig) => ThreeDVisualConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      setFullVisualConfig((full) => ({ ...full, threeD: next }));
      return next;
    });
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/visual-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-draft",
          draftData: { ...fullVisualConfig, threeD: config },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save 3D settings");
      showNotification("success", "3D WebGL parameters saved to draft!");
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const res = await fetch("/api/visual-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          configData: { ...fullVisualConfig, threeD: config },
          versionName: `3D Tuning Release ${new Date().toLocaleDateString()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish 3D settings");
      showNotification("success", "3D WebGL parameters published live!");
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error publishing");
    } finally {
      setPublishing(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_THREED_CONFIG);
    setFullVisualConfig((prev) => ({ ...prev, threeD: DEFAULT_THREED_CONFIG }));
    showNotification("success", "Reset to factory 3D baseline parameters.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-500">Loading 3D Control Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-sm">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Advanced 3D Control Studio
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-bold uppercase tracking-wide">
                WebGL 2.0
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Configure real-time Three.js parameters, physics kinetics, and GPU shaders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{publishing ? "Publishing..." : "Publish Live"}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-mono font-bold flex items-center gap-3 transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Grid: Controls + Live 3D Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-600" />
              Kinetics &amp; Lighting Parameters
            </h2>
            <span className="text-[10px] font-mono opacity-50 uppercase">Live Binding</span>
          </div>

          {/* Scale */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-slate-700">Monolith Scale</span>
              <span className="text-cyan-600 font-bold">
                {(config.monolithScale || 1.0).toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.6"
              step="0.05"
              value={config.monolithScale || 1.0}
              onChange={(e) =>
                updateThreeD((prev) => ({
                  ...prev,
                  monolithScale: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-cyan-600"
            />
          </div>

          {/* Rotation Speed */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-slate-700">Gimbal Rings Speed Multiplier</span>
              <span className="text-cyan-600 font-bold">
                {(config.ringsSpeed || 1.0).toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.ringsSpeed || 1.0}
              onChange={(e) =>
                updateThreeD((prev) => ({
                  ...prev,
                  ringsSpeed: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-cyan-600"
            />
          </div>

          {/* Studio Lighting Intensity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-slate-700">Studio Lighting Intensity</span>
              <span className="text-cyan-600 font-bold">
                {(config.lightingIntensity || 1.2).toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.1"
              value={config.lightingIntensity || 1.2}
              onChange={(e) =>
                updateThreeD((prev) => ({
                  ...prev,
                  lightingIntensity: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-cyan-600"
            />
          </div>

          {/* Mouse Tracking Sensitivity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-slate-700">Mouse Parallax Sensitivity</span>
              <span className="text-cyan-600 font-bold">
                {(config.mouseTrackingSensitivity ?? 1.0).toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2.0"
              step="0.1"
              value={config.mouseTrackingSensitivity ?? 1.0}
              onChange={(e) =>
                updateThreeD((prev) => ({
                  ...prev,
                  mouseTrackingSensitivity: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-cyan-600"
            />
          </div>

          {/* Camera Distance */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-slate-700">Camera Zoom / Distance</span>
              <span className="text-cyan-600 font-bold">
                {(config.cameraDistance || 7.8).toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="5.5"
              max="10.0"
              step="0.2"
              value={config.cameraDistance || 7.8}
              onChange={(e) =>
                updateThreeD((prev) => ({
                  ...prev,
                  cameraDistance: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-cyan-600"
            />
          </div>

          {/* Visibility Checkboxes */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <label className="text-xs font-mono font-bold text-slate-700">
              3D Sub-Components Visibility
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.monolithVisible !== false}
                  onChange={(e) =>
                    updateThreeD((prev) => ({
                      ...prev,
                      monolithVisible: e.target.checked,
                    }))
                  }
                  className="rounded text-cyan-600"
                />
                <span>Portrait Monolith</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.monolithWireframe !== false}
                  onChange={(e) =>
                    updateThreeD((prev) => ({
                      ...prev,
                      monolithWireframe: e.target.checked,
                    }))
                  }
                  className="rounded text-cyan-600"
                />
                <span>Hologram Wireframe</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.ringsVisible !== false}
                  onChange={(e) =>
                    updateThreeD((prev) => ({
                      ...prev,
                      ringsVisible: e.target.checked,
                    }))
                  }
                  className="rounded text-cyan-600"
                />
                <span>Gyroscopic Rings</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.glassSpheresVisible !== false}
                  onChange={(e) =>
                    updateThreeD((prev) => ({
                      ...prev,
                      glassSpheresVisible: e.target.checked,
                    }))
                  }
                  className="rounded text-cyan-600"
                />
                <span>Glass Spheres</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.floatingPolyhedraVisible !== false}
                  onChange={(e) =>
                    updateThreeD((prev) => ({
                      ...prev,
                      floatingPolyhedraVisible: e.target.checked,
                    }))
                  }
                  className="rounded text-cyan-600"
                />
                <span>Polyhedra</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.stardustParticlesVisible !== false}
                  onChange={(e) =>
                    updateThreeD((prev) => ({
                      ...prev,
                      stardustParticlesVisible: e.target.checked,
                    }))
                  }
                  className="rounded text-cyan-600"
                />
                <span>Stardust Swarm</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live 3D Centerpiece Preview Column (6 cols) */}
        <div className="lg:col-span-6 bg-[#08070D] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-white font-bold">REAL-TIME WEBGL VIEWPORT</span>
            </div>
            <span>Move cursor over scene to test parallax</span>
          </div>

          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden flex items-center justify-center bg-radial from-slate-900/60 to-black">
            <HeroCenterpiece config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
