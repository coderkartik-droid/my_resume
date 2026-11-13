"use client";

import { useEffect, useState, useRef } from "react";
import {
  Palette,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Upload,
  Eye,
  Sliders,
  Check,
  RefreshCw,
  ExternalLink,
  Laptop,
  Smartphone,
  Save,
  Undo2,
  Layers,
  Sun,
  Moon,
} from "lucide-react";
import { THEME_LIST, getThemeById, THEME_REGISTRY } from "@/lib/themes/registry";
import { ThemeDefinition, ThemeId, ThemeCustomOverrides } from "@/types/theme";

export default function ThemeStudioPage() {
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>("midnight-dark");
  const [draftThemeId, setDraftThemeId] = useState<ThemeId | null>(null);
  const [previousThemeId, setPreviousThemeId] = useState<ThemeId | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>("midnight-dark");

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Customizer state
  const [overrides, setOverrides] = useState<ThemeCustomOverrides>({});
  const [activeTab, setActiveTab] = useState<"catalog" | "customize">("catalog");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchThemeConfig();
  }, []);

  const fetchThemeConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/theme");
      if (res.ok) {
        const data = await res.json();
        setActiveThemeId(data.activeThemeId || "midnight-dark");
        setDraftThemeId(data.draftThemeId || null);
        setPreviousThemeId(data.previousThemeId || null);
        setSelectedThemeId(data.draftThemeId || data.activeThemeId || "midnight-dark");
        if (data.customOverrides) {
          setOverrides(data.customOverrides);
        }
      }
    } catch (err) {
      console.error("Failed to load theme configuration:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3500);
  };

  // Broadcast preview updates to the iframe
  const updateIframePreview = (themeId: ThemeId, currentOverrides = overrides) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "PORTFOLIO_THEME_PREVIEW",
          themeId,
          overrides: currentOverrides,
        },
        "*"
      );
    }
  };

  const handleSelectTheme = (id: ThemeId) => {
    setSelectedThemeId(id);
    updateIframePreview(id, overrides);
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-draft",
          draftThemeId: selectedThemeId,
          customOverrides: overrides,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save draft failed");

      setDraftThemeId(selectedThemeId);
      showNotification("success", `Draft theme "${getThemeById(selectedThemeId).name}" saved!`);
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishTheme = async () => {
    try {
      setPublishing(true);
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          themeId: selectedThemeId,
          customOverrides: overrides,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");

      setPreviousThemeId(activeThemeId);
      setActiveThemeId(selectedThemeId);
      setDraftThemeId(null);
      showNotification("success", `Theme "${getThemeById(selectedThemeId).name}" published live to public visitors!`);
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Failed to publish theme");
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async () => {
    if (!previousThemeId) return;
    try {
      setRollingBack(true);
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rollback" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rollback failed");

      const oldPrev = previousThemeId;
      setPreviousThemeId(activeThemeId);
      setActiveThemeId(oldPrev);
      setSelectedThemeId(oldPrev);
      updateIframePreview(oldPrev, overrides);
      showNotification("success", `Rolled back to theme "${getThemeById(oldPrev).name}"!`);
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Failed to rollback theme");
    } finally {
      setRollingBack(false);
    }
  };

  const handleResetDefault = async () => {
    if (!confirm("Reset theme configuration to factory default (Midnight Dark)?")) return;
    try {
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-default" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      setActiveThemeId("midnight-dark");
      setSelectedThemeId("midnight-dark");
      setDraftThemeId(null);
      setOverrides({});
      updateIframePreview("midnight-dark", {});
      showNotification("success", "Theme reset to default (Midnight Dark)");
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Reset failed");
    }
  };

  const filteredThemes = THEME_LIST.filter((theme) => {
    const matchesCat = categoryFilter === "all" || theme.category === categoryFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedTheme = getThemeById(selectedThemeId);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Theme Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono font-bold uppercase tracking-wider">
                  20 Pro Themes
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Change your entire public website design, colors, typography and layout in real-time without code.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving Draft..." : "Save Draft"}</span>
          </button>

          <button
            onClick={handlePublishTheme}
            disabled={publishing}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {publishing ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Publish Theme Live</span>
          </button>

          {previousThemeId && (
            <button
              onClick={handleRollback}
              disabled={rollingBack}
              className="px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title={`Rollback to previous theme: ${getThemeById(previousThemeId).name}`}
            >
              <Undo2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Rollback ({getThemeById(previousThemeId).name})</span>
            </button>
          )}

          <button
            onClick={handleResetDefault}
            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            title="Reset to factory default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
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

      {/* Main Studio Grid: Split View (Controls Left, Live Preview Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Theme Selector & Customizer */}
        <div className="xl:col-span-6 space-y-6">
          {/* Active Status Badge Bar */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                  Currently Published Theme
                </div>
                <div className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>{getThemeById(activeThemeId).name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    LIVE
                  </span>
                </div>
              </div>
            </div>

            {draftThemeId && draftThemeId !== activeThemeId && (
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-amber-300 font-bold">
                  Unpublished Draft
                </div>
                <div className="text-xs font-bold text-amber-100">
                  {getThemeById(draftThemeId).name}
                </div>
              </div>
            )}
          </div>

          {/* Subnavigation: Catalog vs Deep Customizer */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "catalog"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Browse 20 Themes
            </button>
            <button
              onClick={() => setActiveTab("customize")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "customize"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize Active Theme</span>
            </button>
          </div>

          {activeTab === "catalog" && (
            <div className="space-y-4">
              {/* Category Filter Pills & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
                  {["all", "minimal", "dark", "vibrant", "luxury", "editorial", "futuristic"].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                          categoryFilter === cat
                            ? "bg-indigo-600 text-white shadow-sm font-semibold"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Filter 20 themes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 20 Themes Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[750px] overflow-y-auto pr-1">
                {filteredThemes.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  const isActive = activeThemeId === theme.id;

                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-600/30 bg-indigo-50/20 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Top Bar with Palette Dots */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                              style={{ backgroundColor: theme.colors.background }}
                              title={`Background: ${theme.colors.background}`}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                              style={{ backgroundColor: theme.colors.primary }}
                              title={`Primary: ${theme.colors.primary}`}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                              style={{ backgroundColor: theme.colors.secondary }}
                              title={`Secondary: ${theme.colors.secondary}`}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                              style={{ backgroundColor: theme.colors.accent }}
                              title={`Accent: ${theme.colors.accent}`}
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                                ACTIVE
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              {theme.mode}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {theme.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {theme.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Bottom: Selection / Preview Indicator */}
                      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 capitalize">
                          {theme.category}
                        </span>

                        <span
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            isSelected ? "text-indigo-600 font-bold" : "text-slate-400"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Previewing</span>
                            </>
                          ) : (
                            <span>Preview</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Deep Customizer */}
          {activeTab === "customize" && (
            <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Customizing: {selectedTheme.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adjust specific tokens to tailor the design to your exact taste.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOverrides({});
                    updateIframePreview(selectedThemeId, {});
                    showNotification("success", "Custom overrides reset to theme defaults");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Reset Overrides
                </button>
              </div>

              {/* Color Customization */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Color Tokens
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={overrides.primaryColor || selectedTheme.colors.primary}
                        onChange={(e) => {
                          const newOv = { ...overrides, primaryColor: e.target.value };
                          setOverrides(newOv);
                          updateIframePreview(selectedThemeId, newOv);
                        }}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={overrides.primaryColor || selectedTheme.colors.primary}
                        onChange={(e) => {
                          const newOv = { ...overrides, primaryColor: e.target.value };
                          setOverrides(newOv);
                          updateIframePreview(selectedThemeId, newOv);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={overrides.secondaryColor || selectedTheme.colors.secondary}
                        onChange={(e) => {
                          const newOv = { ...overrides, secondaryColor: e.target.value };
                          setOverrides(newOv);
                          updateIframePreview(selectedThemeId, newOv);
                        }}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={overrides.secondaryColor || selectedTheme.colors.secondary}
                        onChange={(e) => {
                          const newOv = { ...overrides, secondaryColor: e.target.value };
                          setOverrides(newOv);
                          updateIframePreview(selectedThemeId, newOv);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Accent Highlight Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={overrides.accentColor || selectedTheme.colors.accent}
                        onChange={(e) => {
                          const newOv = { ...overrides, accentColor: e.target.value };
                          setOverrides(newOv);
                          updateIframePreview(selectedThemeId, newOv);
                        }}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={overrides.accentColor || selectedTheme.colors.accent}
                        onChange={(e) => {
                          const newOv = { ...overrides, accentColor: e.target.value };
                          setOverrides(newOv);
                          updateIframePreview(selectedThemeId, newOv);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={overrides.backgroundColor || selectedTheme.colors.background}
                        onChange={(e) => {
                          const newOv = { ...overrides, backgroundColor: e.target.value };
                          setOverrides(newOv);
                          updateIframePreview(selectedThemeId, newOv);
                        }}
                        className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={overrides.backgroundColor || selectedTheme.colors.background}
                        onChange={(e) => {
                          const newOv = { ...overrides, backgroundColor: e.target.value };
                          setOverrides(newOv);
                          updateIframePreview(selectedThemeId, newOv);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Typography Tokens
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Heading Font Family
                    </label>
                    <select
                      value={overrides.headingFont || selectedTheme.typography.headingFont}
                      onChange={(e) => {
                        const newOv = { ...overrides, headingFont: e.target.value };
                        setOverrides(newOv);
                        updateIframePreview(selectedThemeId, newOv);
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="'Inter', sans-serif">Inter (Modern Clean)</option>
                      <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Geometric)</option>
                      <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech Editorial)</option>
                      <option value="'Syne', sans-serif">Syne (Artistic Display)</option>
                      <option value="'Orbitron', sans-serif">Orbitron (Cybernetic)</option>
                      <option value="'Cinzel', serif">Cinzel (Luxury Serif)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Border Radius
                    </label>
                    <select
                      value={overrides.borderRadius || selectedTheme.cardStyle.radius}
                      onChange={(e) => {
                        const newOv = { ...overrides, borderRadius: e.target.value };
                        setOverrides(newOv);
                        updateIframePreview(selectedThemeId, newOv);
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="0.25rem">Sharp (4px)</option>
                      <option value="0.75rem">Compact (12px)</option>
                      <option value="1.25rem">Standard (20px)</option>
                      <option value="1.75rem">Spacious (28px)</option>
                      <option value="9999px">Full Pill</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Animation Intensity Override */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Animation Personality
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {(["subtle", "normal", "advanced", "extreme"] as const).map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => {
                        const newOv = { ...overrides, animationIntensity: intensity };
                        setOverrides(newOv);
                        updateIframePreview(selectedThemeId, newOv);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-mono uppercase font-bold text-center transition-all cursor-pointer ${
                        (overrides.animationIntensity || selectedTheme.animationPersonality.intensity) === intensity
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Interactive Live Preview Frame */}
        <div className="xl:col-span-6 space-y-4 sticky top-6">
          <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-2xl shadow-md">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold font-mono tracking-wider">
                LIVE INTERACTIVE PREVIEW: {selectedTheme.name.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  previewDevice === "desktop" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Desktop View"
              >
                <Laptop className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  previewDevice === "mobile" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <a
                href={`/?theme=${selectedThemeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Iframe Viewport */}
          <div
            className={`transition-all duration-300 mx-auto rounded-3xl overflow-hidden border border-slate-300 shadow-2xl bg-black ${
              previewDevice === "mobile" ? "w-[390px] h-[780px]" : "w-full h-[780px]"
            }`}
          >
            <iframe
              ref={iframeRef}
              src={`/?theme=${selectedThemeId}`}
              className="w-full h-full border-0"
              title="Live Website Theme Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
