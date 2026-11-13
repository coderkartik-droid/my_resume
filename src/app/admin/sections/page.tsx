"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  ExternalLink,
} from "lucide-react";
import type { SectionItemConfig, SiteVisualConfigData } from "@/types/visual-config";
import { DEFAULT_SECTIONS_CONFIG, DEFAULT_SITE_VISUAL_CONFIG } from "@/types/visual-config";

export default function SectionManagerPage() {
  const [sections, setSections] = useState<SectionItemConfig[]>(DEFAULT_SECTIONS_CONFIG);
  const [fullConfig, setFullConfig] = useState<SiteVisualConfigData>(DEFAULT_SITE_VISUAL_CONFIG);
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
        setFullConfig(effective);
        if (effective.sections && effective.sections.length > 0) {
          setSections(effective.sections);
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

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const updated = copy.map((item, idx) => ({ ...item, order: idx }));
    setSections(updated);
    setFullConfig((prev) => ({ ...prev, sections: updated }));
  };

  const toggleSection = (id: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
    );
    setSections(updated);
    setFullConfig((prev) => ({ ...prev, sections: updated }));
  };

  const updateTitle = (id: string, customTitle: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, customTitle } : sec
    );
    setSections(updated);
    setFullConfig((prev) => ({ ...prev, sections: updated }));
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/visual-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-draft",
          draftData: { ...fullConfig, sections },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");
      showNotification("success", "Section ordering saved to draft!");
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error saving draft");
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
          configData: { ...fullConfig, sections },
          versionName: `Section Order Updated ${new Date().toLocaleDateString()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish sections");
      showNotification("success", "Section layout published live!");
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error publishing");
    } finally {
      setPublishing(false);
    }
  };

  const handleReset = () => {
    setSections(DEFAULT_SECTIONS_CONFIG);
    setFullConfig((prev) => ({ ...prev, sections: DEFAULT_SECTIONS_CONFIG }));
    showNotification("success", "Sections reset to factory default sequence.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-500">Loading Section Manager...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Section Layout &amp; Sequencing Manager
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold uppercase tracking-wide">
                10 Sections
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Drag, reorder, and toggle visibility for all homepage sections.
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
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
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

      {/* Sections List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-mono text-slate-500 uppercase">
          <span>Section Identity &amp; Name</span>
          <div className="flex items-center gap-10">
            <span>Visibility</span>
            <span>Sequence Reordering</span>
          </div>
        </div>

        <div className="space-y-3">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                sec.enabled
                  ? "bg-white border-slate-200 shadow-sm"
                  : "bg-slate-50 border-slate-200/60 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-500">
                  {(idx + 1).toString().padStart(2, "0")}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{sec.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      #{sec.id}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Custom Title Label (optional)"
                    value={sec.customTitle || ""}
                    onChange={(e) => updateTitle(sec.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 w-64"
                  />
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Visibility Toggle Button */}
                <button
                  onClick={() => toggleSection(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    sec.enabled
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {sec.enabled ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                {/* Move Up/Down Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveSection(idx, "up")}
                    disabled={idx === 0}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-25 transition-all cursor-pointer"
                    title="Move Higher"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveSection(idx, "down")}
                    disabled={idx === sections.length - 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-25 transition-all cursor-pointer"
                    title="Move Lower"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
