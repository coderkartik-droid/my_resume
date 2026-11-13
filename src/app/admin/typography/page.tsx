"use client";

import { useEffect, useState } from "react";
import {
  Type,
  Save,
  Check,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Sliders,
  Eye,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const HEADING_FONTS = [
  { label: "Inter / Modern Sans", value: "'Inter', sans-serif" },
  { label: "Space Grotesk / Tech Editorial", value: "'Space Grotesk', sans-serif" },
  { label: "Plus Jakarta Sans / Clean Corporate", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Outfit / Geometric Display", value: "'Outfit', sans-serif" },
  { label: "Syne / Bold Experimental", value: "'Syne', sans-serif" },
  { label: "System UI / Native", value: "system-ui, sans-serif" },
];

const MONO_FONTS = [
  { label: "JetBrains Mono / Code Studio", value: "'JetBrains Mono', monospace" },
  { label: "Fira Code / Clean Ligatures", value: "'Fira Code', monospace" },
  { label: "Space Mono / Retro Terminal", value: "'Space Mono', monospace" },
  { label: "Courier New / Monospaced Classic", value: "monospace" },
];

export default function AdminTypographyPage() {
  const { currentTheme, setOverrides } = useTheme();
  const [headingFont, setHeadingFont] = useState(HEADING_FONTS[0].value);
  const [monoFont, setMonoFont] = useState(MONO_FONTS[0].value);
  const [headingLetterSpacing, setHeadingLetterSpacing] = useState("-0.035em");
  const [headingTransform, setHeadingTransform] = useState<"uppercase" | "none">("uppercase");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchTypographyConfig();
  }, []);

  const fetchTypographyConfig = async () => {
    try {
      const res = await fetch("/api/theme");
      if (res.ok) {
        const data = await res.json();
        if (data.customOverrides?.typography) {
          const t = data.customOverrides.typography;
          if (t.headingFont) setHeadingFont(t.headingFont);
          if (t.monoFont) setMonoFont(t.monoFont);
          if (t.letterSpacing) setHeadingLetterSpacing(t.letterSpacing);
          if (t.transform) setHeadingTransform(t.transform);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeThemeId: currentTheme.id,
          customOverrides: {
            typography: {
              headingFont,
              monoFont,
              letterSpacing: headingLetterSpacing,
              transform: headingTransform,
            },
          },
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      showNotification("success", "Typography settings applied and published!");
    } catch {
      showNotification("error", "Failed to save typography settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setHeadingFont(HEADING_FONTS[0].value);
    setMonoFont(MONO_FONTS[0].value);
    setHeadingLetterSpacing("-0.035em");
    setHeadingTransform("uppercase");
    showNotification("success", "Reset to default typography hierarchy");
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
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Type className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Typography Settings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure global font families, heading letter-spacing, and editorial display hierarchies.
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
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Publishing..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Font Families</span>
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-mono">
              Primary Heading Font
            </label>
            <select
              value={headingFont}
              onChange={(e) => setHeadingFont(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
            >
              {HEADING_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-mono">
              Monospace / Technical Font
            </label>
            <select
              value={monoFont}
              onChange={(e) => setMonoFont(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
            >
              {MONO_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 font-mono">
                Heading Tracking (Letter Spacing)
              </label>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {headingLetterSpacing}
              </span>
            </div>
            <select
              value={headingLetterSpacing}
              onChange={(e) => setHeadingLetterSpacing(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
            >
              <option value="-0.05em">Tightest (-0.05em)</option>
              <option value="-0.035em">Editorial Tight (-0.035em)</option>
              <option value="-0.02em">Subtle (-0.02em)</option>
              <option value="0em">Normal (0em)</option>
              <option value="0.05em">Spacious (+0.05em)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-mono">
              Heading Case Transform
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHeadingTransform("uppercase")}
                className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border ${
                  headingTransform === "uppercase"
                    ? "bg-indigo-600 text-white border-indigo-700"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                UPPERCASE (Default)
              </button>
              <button
                type="button"
                onClick={() => setHeadingTransform("none")}
                className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border ${
                  headingTransform === "none"
                    ? "bg-indigo-600 text-white border-indigo-700"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                Standard Title Case
              </button>
            </div>
          </div>
        </div>

        {/* Live Specimen Preview */}
        <div className="p-8 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
              <span>LIVE SPECIMEN PREVIEW</span>
              <span className="text-indigo-400">SPECIMEN &bull; 01</span>
            </div>

            <div
              style={{
                fontFamily: headingFont,
                letterSpacing: headingLetterSpacing,
                textTransform: headingTransform,
              }}
              className="text-3xl sm:text-4xl font-black text-white leading-tight"
            >
              Architecting Immersive Digital Landscapes
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              High-performance WebGL graphics, custom shaders, and scalable full-stack architectures engineered for lasting sensory impression.
            </p>

            <div
              style={{ fontFamily: monoFont }}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-400"
            >
              &gt; npm run build:turbopack &bull; 37/37 static routes generated
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Font: {headingFont.split(",")[0]}</span>
            <span>Transform: {headingTransform}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
