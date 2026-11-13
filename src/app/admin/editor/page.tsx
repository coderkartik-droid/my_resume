"use client";

import { useEffect, useState, useRef } from "react";
import {
  Layers,
  Sparkles,
  Sliders,
  Eye,
  Save,
  RotateCcw,
  Upload,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Box,
  Cpu,
  Mail,
  Compass,
  FileText,
  History,
  Undo2,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import type {
  SiteVisualConfigData,
  HeroVisualConfig,
  ThreeDVisualConfig,
  AboutVisualConfig,
  ContactVisualConfig,
  FooterVisualConfig,
  SectionItemConfig,
  SiteRevision,
} from "@/types/visual-config";
import {
  DEFAULT_SITE_VISUAL_CONFIG,
  DEFAULT_HERO_CONFIG,
  DEFAULT_THREED_CONFIG,
  DEFAULT_SECTIONS_CONFIG,
  DEFAULT_ABOUT_CONFIG,
  DEFAULT_CONTACT_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from "@/types/visual-config";

export default function VisualPageEditor() {
  const [config, setConfig] = useState<SiteVisualConfigData>(DEFAULT_SITE_VISUAL_CONFIG);
  const [activeSectionTab, setActiveSectionTab] = useState<
    "sections" | "hero" | "3d" | "about" | "contact" | "footer"
  >("hero");
  const [deviceView, setDeviceView] = useState<"desktop" | "laptop" | "tablet" | "mobile">(
    "desktop"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [revisions, setRevisions] = useState<SiteRevision[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        setConfig(effective);
        if (data.revisions) {
          setRevisions(data.revisions);
        }
      }
    } catch (err) {
      console.error("Failed to load visual config:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Broadcast real-time config updates to the preview iframe
  const broadcastPreviewUpdate = (newConfig: SiteVisualConfigData) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "PORTFOLIO_VISUAL_CONFIG_PREVIEW",
          visualConfig: newConfig,
        },
        "*"
      );
    }
  };

  const updateConfig = (updater: (prev: SiteVisualConfigData) => SiteVisualConfigData) => {
    setConfig((prev) => {
      const updated = updater(prev);
      broadcastPreviewUpdate(updated);
      return updated;
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
          draftData: config,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");

      showNotification("success", "Draft saved! Live preview is updated.");
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
          configData: config,
          versionName: `Custom Release ${new Date().toLocaleDateString()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish live");

      showNotification("success", "All homepage changes published live to visitors!");
      if (data.revision) {
        setRevisions((prev) => [data.revision, ...prev]);
      }
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error publishing");
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (revisionId: string) => {
    try {
      const res = await fetch("/api/visual-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rollback",
          revisionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rollback failed");

      showNotification("success", "Restored previous revision successfully!");
      setHistoryModalOpen(false);
      fetchConfig();
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error rolling back");
    }
  };

  const handleResetSection = async (sectionKey: string) => {
    try {
      const res = await fetch("/api/visual-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-section",
          sectionKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset section failed");

      showNotification("success", `Section "${sectionKey}" reset to default`);
      fetchConfig();
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error resetting section");
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const sections = [...(config.sections || DEFAULT_SECTIONS_CONFIG)];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    // Re-assign order numbers
    const updated = sections.map((s, idx) => ({ ...s, order: idx }));
    updateConfig((prev) => ({ ...prev, sections: updated }));
  };

  const toggleSection = (id: string) => {
    const sections = (config.sections || DEFAULT_SECTIONS_CONFIG).map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    updateConfig((prev) => ({ ...prev, sections }));
  };

  const getDeviceWidth = () => {
    switch (deviceView) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "laptop":
        return "1024px";
      default:
        return "100%";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-500 tracking-wider">
          Initializing Visual Page Editor...
        </p>
      </div>
    );
  }

  const sectionsList = config.sections || DEFAULT_SECTIONS_CONFIG;

  return (
    <div className="space-y-6">
      {/* Top Application Control Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Visual Page Editor
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold uppercase tracking-wide">
                Live Studio
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Interactive Webflow-grade page inspector with real-time WebGL synchronization.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Device Previews */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setDeviceView("desktop")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                deviceView === "desktop"
                  ? "bg-white text-indigo-600 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Desktop 100%"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceView("laptop")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                deviceView === "laptop"
                  ? "bg-white text-indigo-600 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Laptop (1024px)"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceView("tablet")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                deviceView === "tablet"
                  ? "bg-white text-indigo-600 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceView("mobile")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                deviceView === "mobile"
                  ? "bg-white text-indigo-600 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setHistoryModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Revision History & Backups"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Revisions ({revisions.length})</span>
          </button>

          <a
            href="/?preview=true"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            title="Open Live Website in New Tab"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Open Tab</span>
          </a>

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

      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Inspector & Settings Tabs (5 cols) */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Section Selection Ribbon */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-mono font-bold">
            <button
              onClick={() => setActiveSectionTab("hero")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeSectionTab === "hero"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hero
            </button>
            <button
              onClick={() => setActiveSectionTab("3d")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeSectionTab === "3d"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              3D Scene
            </button>
            <button
              onClick={() => setActiveSectionTab("sections")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeSectionTab === "sections"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ordering
            </button>
            <button
              onClick={() => setActiveSectionTab("about")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeSectionTab === "about"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveSectionTab("contact")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeSectionTab === "contact"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Contact
            </button>
            <button
              onClick={() => setActiveSectionTab("footer")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeSectionTab === "footer"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Footer
            </button>
          </div>

          {/* TAB 1: HERO SECTION CONTROLS */}
          {activeSectionTab === "hero" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Hero Section Identity &amp; Typography
                </h3>
                <button
                  onClick={() => handleResetSection("hero")}
                  className="text-[11px] font-mono text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  title="Reset Hero to Defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Eyebrow Badge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-700">
                    Status Ribbon / Eyebrow Text
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.hero.badgeVisible !== false}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, badgeVisible: e.target.checked },
                        }))
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Visible</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={config.hero.badgeText}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, badgeText: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-indigo-500"
                />
              </div>

              {/* Full Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">
                  Monumental Headline Name
                </label>
                <input
                  type="text"
                  value={config.hero.name}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, name: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-indigo-500"
                />
              </div>

              {/* Role Ticker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-700">
                    Professional Designation Ticker (comma separated)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.hero.roleTickerVisible !== false}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, roleTickerVisible: e.target.checked },
                        }))
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Visible</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={config.hero.roleTicker.join(", ")}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        roleTicker: e.target.value.split(",").map((t) => t.trim()),
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-indigo-500"
                />
              </div>

              {/* Intro Editorial Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">
                  High-Impact Intro Bio
                </label>
                <textarea
                  rows={3}
                  value={config.hero.introBio}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, introBio: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-800 focus:outline-indigo-500"
                />
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-600">
                    Primary CTA Label
                  </label>
                  <input
                    type="text"
                    value={config.hero.primaryCtaText}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, primaryCtaText: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-600">
                    Primary CTA Link
                  </label>
                  <input
                    type="text"
                    value={config.hero.primaryCtaLink}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, primaryCtaLink: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Metrics Counters */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-700">
                    Architectural Metric Cards
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-mono text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.hero.metricCardsVisible !== false}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, metricCardsVisible: e.target.checked },
                        }))
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Visible</span>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Metric 1</label>
                    <input
                      type="number"
                      value={config.hero.metric1Value}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, metric1Value: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={config.hero.metric1Label}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, metric1Label: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] font-mono"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Metric 2</label>
                    <input
                      type="number"
                      value={config.hero.metric2Value}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, metric2Value: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={config.hero.metric2Label}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, metric2Label: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] font-mono"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Metric 3</label>
                    <input
                      type="number"
                      value={config.hero.metric3Value}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, metric3Value: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={config.hero.metric3Label}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, metric3Label: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Alignment & 3D Centerpiece Visibility */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700">Text Alignment</label>
                  <select
                    value={config.hero.alignment || "left"}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          alignment: e.target.value as "left" | "center",
                        },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  >
                    <option value="left">Left Aligned (Split 3D)</option>
                    <option value="center">Centered Editorial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700">3D Centerpiece</label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs font-mono">
                    <input
                      type="checkbox"
                      checked={config.hero.threeDCenterpieceVisible !== false}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            threeDCenterpieceVisible: e.target.checked,
                          },
                        }))
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Show 3D Monolith</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3D SCENE CONTROLS */}
          {activeSectionTab === "3d" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Box className="w-4 h-4 text-indigo-600" />
                  Three.js 3D WebGL Parameters
                </h3>
                <button
                  onClick={() => handleResetSection("threeD")}
                  className="text-[11px] font-mono text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  title="Reset 3D to Defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Monolith Scale */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-slate-700">Monolith Scale</span>
                  <span className="text-indigo-600 font-bold">
                    {(config.threeD.monolithScale || 1.0).toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.05"
                  value={config.threeD.monolithScale || 1.0}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      threeD: { ...prev.threeD, monolithScale: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Rings Speed */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-slate-700">Gimbal Rings Speed</span>
                  <span className="text-indigo-600 font-bold">
                    {(config.threeD.ringsSpeed || 1.0).toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={config.threeD.ringsSpeed || 1.0}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      threeD: { ...prev.threeD, ringsSpeed: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Lighting Intensity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-slate-700">Studio Lighting Intensity</span>
                  <span className="text-indigo-600 font-bold">
                    {(config.threeD.lightingIntensity || 1.2).toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.5"
                  step="0.1"
                  value={config.threeD.lightingIntensity || 1.2}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      threeD: { ...prev.threeD, lightingIntensity: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Mouse Interaction Sensitivity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-slate-700">Mouse Tracking Sensitivity</span>
                  <span className="text-indigo-600 font-bold">
                    {(config.threeD.mouseTrackingSensitivity ?? 1.0).toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.0"
                  step="0.1"
                  value={config.threeD.mouseTrackingSensitivity ?? 1.0}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      threeD: {
                        ...prev.threeD,
                        mouseTrackingSensitivity: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* 3D Component Visibility Switches */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs font-mono">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.threeD.monolithVisible !== false}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        threeD: { ...prev.threeD, monolithVisible: e.target.checked },
                      }))
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>Monolith</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.threeD.ringsVisible !== false}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        threeD: { ...prev.threeD, ringsVisible: e.target.checked },
                      }))
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>Gyroscopic Rings</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.threeD.glassSpheresVisible !== false}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        threeD: { ...prev.threeD, glassSpheresVisible: e.target.checked },
                      }))
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>Glass Spheres</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.threeD.stardustParticlesVisible !== false}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        threeD: {
                          ...prev.threeD,
                          stardustParticlesVisible: e.target.checked,
                        },
                      }))
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>Stardust Swarm</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: SECTIONS ORDERING & VISIBILITY */}
          {activeSectionTab === "sections" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Section Ordering &amp; Visibility
                </h3>
                <button
                  onClick={() => handleResetSection("sections")}
                  className="text-[11px] font-mono text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  title="Reset Section Ordering to Defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <p className="text-xs text-slate-500 font-mono">
                Reorder sections with Up/Down buttons or toggle visibility instantly.
              </p>

              <div className="space-y-2">
                {sectionsList.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      sec.enabled
                        ? "bg-white border-slate-200 shadow-sm"
                        : "bg-slate-50 border-slate-200/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSection(sec.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          sec.enabled
                            ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                            : "bg-slate-200 text-slate-400"
                        }`}
                        title={sec.enabled ? "Hide Section" : "Show Section"}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{sec.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">
                          ID: #{sec.id}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSection(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "down")}
                        disabled={idx === sectionsList.length - 1}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT SECTION */}
          {activeSectionTab === "about" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  About Section &amp; Philosophy
                </h3>
                <button
                  onClick={() => handleResetSection("about")}
                  className="text-[11px] font-mono text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">Badge Ribbon</label>
                <input
                  type="text"
                  value={config.about.badgeText}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      about: { ...prev.about, badgeText: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">Headline</label>
                <input
                  type="text"
                  value={config.about.headline}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      about: { ...prev.about, headline: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">Subtext Story</label>
                <textarea
                  rows={3}
                  value={config.about.subtext}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      about: { ...prev.about, subtext: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT SECTION */}
          {activeSectionTab === "contact" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  Command Center &amp; Inquiries
                </h3>
                <button
                  onClick={() => handleResetSection("contact")}
                  className="text-[11px] font-mono text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">Headline</label>
                <input
                  type="text"
                  value={config.contact.headline}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, headline: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">
                  Telemetry Status Tag
                </label>
                <input
                  type="text"
                  value={config.contact.telemetryStatus}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, telemetryStatus: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">
                  Latency Indicator
                </label>
                <input
                  type="text"
                  value={config.contact.telemetryLatency}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, telemetryLatency: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 6: FOOTER SECTION */}
          {activeSectionTab === "footer" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Signature Horizon Footer
                </h3>
                <button
                  onClick={() => handleResetSection("footer")}
                  className="text-[11px] font-mono text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">
                  Giant Horizon Watermark
                </label>
                <input
                  type="text"
                  value={config.footer.watermarkText}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, watermarkText: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">Tagline</label>
                <input
                  type="text"
                  value={config.footer.tagline}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, tagline: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-700">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={config.footer.copyrightText}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, copyrightText: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Interactive Iframe Preview (7 cols) */}
        <div className="xl:col-span-7 bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-3 py-1 text-slate-400 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE BROWSER PREVIEW</span>
            </div>
            <div className="text-[11px] opacity-60">Width: {getDeviceWidth()}</div>
          </div>

          <div className="w-full overflow-hidden flex justify-center bg-black/40 rounded-2xl p-1 min-h-[720px]">
            <iframe
              ref={iframeRef}
              src="/?preview=true"
              style={{
                width: getDeviceWidth(),
                height: "760px",
                border: "none",
                borderRadius: "1rem",
                transition: "width 0.3s ease",
              }}
              title="Live Homepage Visual Preview"
            />
          </div>
        </div>
      </div>

      {/* Revisions History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base">Revision Snapshots &amp; Rollback</h3>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-xs font-mono text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-500 font-mono">
              Every published change automatically generates a safe snapshot. Click Restore to roll back.
            </p>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {revisions.length === 0 ? (
                <div className="text-xs font-mono text-slate-400 py-6 text-center">
                  No previous snapshots recorded yet.
                </div>
              ) : (
                revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{rev.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {new Date(rev.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRollback(rev.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Undo2 className="w-3 h-3" />
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
