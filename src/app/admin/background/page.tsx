"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  ExternalLink,
  Gauge,
  Laptop,
  Layers,
  MousePointer2,
  Palette,
  RotateCcw,
  Save,
  Sliders,
  Smartphone,
  Sparkles,
  Undo2,
  Zap,
} from "lucide-react";
import BackgroundCanvas from "@/components/3d/BackgroundCanvas";
import { BACKGROUND_THEMES, getBackgroundTheme } from "@/lib/backgrounds/registry";
import {
  BackgroundSettings,
  BackgroundSpeed,
  BackgroundThemeId,
  BackgroundThemeSettingsMap,
  DEFAULT_BACKGROUND_SETTINGS,
  DEFAULT_BACKGROUND_THEME_ID,
} from "@/types/background";

type Notification = { type: "success" | "error"; text: string };
type BusyAction = "apply" | "settings" | "reset" | "rollback" | null;

const SPEED_OPTIONS: { value: BackgroundSpeed; label: string; hint: string }[] = [
  { value: "slow", label: "Slow", hint: "Calm, cinematic drift" },
  { value: "normal", label: "Normal", hint: "Balanced default" },
  { value: "fast", label: "Fast", hint: "Energetic motion" },
];

function settingsEqual(a: BackgroundSettings, b: BackgroundSettings): boolean {
  return (
    a.animationEnabled === b.animationEnabled &&
    a.speed === b.speed &&
    Math.abs(a.brightness - b.brightness) < 0.001 &&
    Math.abs(a.particleDensity - b.particleDensity) < 0.001 &&
    a.parallaxEnabled === b.parallaxEnabled
  );
}

export default function BackgroundThemeStudioPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyAction>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [activeThemeId, setActiveThemeId] = useState<BackgroundThemeId>(
    DEFAULT_BACKGROUND_THEME_ID
  );
  const [previousThemeId, setPreviousThemeId] = useState<BackgroundThemeId | null>(null);
  const [activeSettings, setActiveSettings] = useState<BackgroundSettings>(
    DEFAULT_BACKGROUND_SETTINGS
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Draft (preview-only) state — never touches the public site until applied.
  const [selectedThemeId, setSelectedThemeId] = useState<BackgroundThemeId>(
    DEFAULT_BACKGROUND_THEME_ID
  );
  const [settings, setSettings] = useState<BackgroundSettings>(DEFAULT_BACKGROUND_SETTINGS);
  const [themeSettings, setThemeSettings] = useState<BackgroundThemeSettingsMap>({});
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const showNotification = useCallback((type: Notification["type"], text: string) => {
    setNotification({ type, text });
    window.setTimeout(() => setNotification(null), 4000);
  }, []);

  const applyResponse = useCallback(
    (data: {
      activeThemeId?: string;
      previousThemeId?: string | null;
      settings?: BackgroundSettings;
      themeSettings?: BackgroundThemeSettingsMap;
      updatedAt?: string | null;
    }) => {
      if (data.activeThemeId) setActiveThemeId(data.activeThemeId as BackgroundThemeId);
      setPreviousThemeId((data.previousThemeId as BackgroundThemeId | null) ?? null);
      if (data.settings) {
        setActiveSettings(data.settings);
        setSettings(data.settings);
      }
      if (data.themeSettings) setThemeSettings(data.themeSettings);
      setUpdatedAt(data.updatedAt ?? null);
      if (data.activeThemeId) setSelectedThemeId(data.activeThemeId as BackgroundThemeId);
    },
    []
  );

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/background", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load background configuration");
      applyResponse(data);
    } catch (err) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "Failed to load background configuration"
      );
    } finally {
      setLoading(false);
    }
  }, [applyResponse, showNotification]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const publishedTheme = getBackgroundTheme(activeThemeId);
  const selectedTheme = getBackgroundTheme(selectedThemeId);

  const isDirty = useMemo(
    () => selectedThemeId !== activeThemeId || !settingsEqual(settings, activeSettings),
    [selectedThemeId, activeThemeId, settings, activeSettings]
  );

  const handleSelectTheme = (id: BackgroundThemeId) => {
    setSelectedThemeId(id);
    const saved = themeSettings[id];
    setSettings(
      saved
        ? { ...saved }
        : { ...DEFAULT_BACKGROUND_SETTINGS, speed: getBackgroundTheme(id).recommendedSpeed }
    );
  };

  const patchSettings = (patch: Partial<BackgroundSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const handleApplyTheme = async () => {
    try {
      setBusy("apply");
      const res = await fetch("/api/background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply", themeId: selectedThemeId, settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply background theme");
      applyResponse(data);
      showNotification("success", `“${selectedTheme.name}” is now live on the public website.`);
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to apply theme");
    } finally {
      setBusy(null);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setBusy("settings");
      const res = await fetch("/api/background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-settings", settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save background settings");
      applyResponse(data);
      showNotification("success", "Background settings saved.");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = () => {
    setSelectedThemeId(activeThemeId);
    setSettings({ ...activeSettings });
    showNotification("success", "Preview discarded — nothing was changed on the public site.");
  };

  const handleRollback = async () => {
    if (!previousThemeId) return;
    try {
      setBusy("rollback");
      const res = await fetch("/api/background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rollback" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rollback failed");
      applyResponse(data);
      showNotification("success", "Reverted to the previous background theme.");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Rollback failed");
    } finally {
      setBusy(null);
    }
  };

  const handleResetDefault = async () => {
    if (!window.confirm("Reset the background to the default Matrix Hacker theme and default settings?")) {
      return;
    }
    try {
      setBusy("reset");
      const res = await fetch("/api/background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-default" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      applyResponse(data);
      showNotification("success", "Background reset to the default Matrix Hacker theme.");
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(null);
    }
  };

  const handleOpenLivePreview = () => {
    const params = new URLSearchParams({
      bg: selectedThemeId,
      bgSpeed: settings.speed,
      bgBright: String(settings.brightness),
      bgDensity: String(settings.particleDensity),
      bgAnim: settings.animationEnabled ? "1" : "0",
      bgParallax: settings.parallaxEnabled ? "1" : "0",
    });
    window.open(`/?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  const lastUpdatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Background Theme Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono font-bold uppercase tracking-wider">
                6 Themes
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Switch the animated background behind your public website — no code changes, no
              effect on your existing layout.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenLivePreview}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Preview this theme overlaid on the real homepage in a new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview on real site</span>
          </button>

          {previousThemeId && (
            <button
              onClick={handleRollback}
              disabled={busy === "rollback"}
              className="px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title={`Revert to ${getBackgroundTheme(previousThemeId).name}`}
            >
              <Undo2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Rollback</span>
            </button>
          )}

          <button
            onClick={handleResetDefault}
            disabled={busy === "reset"}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to default</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2.5 shadow-sm ${
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

      {/* ── Active theme status ────────────────────────────────────────── */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">
              Active on public website
            </div>
            <div className="text-sm font-extrabold flex items-center gap-2">
              <span>{publishedTheme.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                LIVE
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Animation: {activeSettings.animationEnabled ? "ON" : "OFF"}
          </span>
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            {activeSettings.speed.toUpperCase()}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Brightness {activeSettings.brightness.toFixed(2)}×
          </span>
          {lastUpdatedLabel && <span className="text-slate-500">Saved {lastUpdatedLabel}</span>}
        </div>
      </div>

      {loading ? (
        <div className="p-16 bg-white border border-slate-200 rounded-3xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
            Loading theme configuration…
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* ── Theme gallery ─────────────────────────────────────────── */}
          <div className="xl:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Theme Gallery
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BACKGROUND_THEMES.map((theme) => {
                const isActive = activeThemeId === theme.id;
                const isSelected = selectedThemeId === theme.id;

                return (
                  <div
                    key={theme.id}
                    className={`rounded-2xl border bg-white overflow-hidden transition-all flex flex-col ${
                      isSelected
                        ? "border-indigo-600 ring-2 ring-indigo-600/25 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Thumbnail */}
                    <button
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className="relative block w-full aspect-[16/10] cursor-pointer group"
                      style={{ background: theme.thumbnailGradient }}
                      aria-label={`Preview ${theme.name}`}
                    >
                      <span
                        className="absolute inset-0 opacity-[0.14]"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
                          backgroundSize: "22px 22px",
                        }}
                      />
                      <span className="absolute inset-x-3 bottom-2 flex items-end justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/75">
                          {theme.tagline}
                        </span>
                        <span
                          className="w-9 h-1.5 rounded-full"
                          style={{
                            backgroundColor: theme.accent,
                            boxShadow: `0 0 12px ${theme.accent}`,
                          }}
                        />
                      </span>
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/25 flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-lg bg-white/95 text-slate-900 text-[11px] font-bold flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </span>
                      </span>
                      {isActive && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold font-mono uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </button>

                    {/* Meta */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{theme.name}</h3>
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {theme.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9.5px] font-mono font-bold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Animated
                        </span>
                        {theme.supportsParticleDensity && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500 text-[9.5px] font-mono font-bold uppercase">
                            Density
                          </span>
                        )}
                        {theme.supportsParallax && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500 text-[9.5px] font-mono font-bold uppercase">
                            Parallax
                          </span>
                        )}
                      </div>

                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          Rec. speed: {theme.recommendedSpeed}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectTheme(theme.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-slate-900/5 text-slate-700 hover:bg-slate-900/10"
                          }`}
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                          {isSelected ? "Selected" : "Select Theme"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Live preview + settings ───────────────────────────────── */}
          <div className="xl:col-span-5 space-y-5 xl:sticky xl:top-24">
            {/* Live preview */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Live Preview
                  </h2>
                </div>
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      previewDevice === "desktop"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    aria-label="Desktop preview"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    aria-label="Mobile preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div
                className={`relative mx-auto transition-all duration-300 ${
                  previewDevice === "desktop"
                    ? "w-full aspect-[16/10]"
                    : "w-full max-w-[280px] aspect-[9/19]"
                }`}
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-xl">
                  <BackgroundCanvas
                    className="absolute inset-0 overflow-hidden select-none"
                    themeId={selectedThemeId}
                    settings={settings}
                    allowUrlPreview={false}
                  />

                  {/* Mock foreground so readability can be judged at a glance. */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <span className="text-[10px] font-extrabold tracking-[0.2em] text-white/85">
                        KARTIK
                      </span>
                      <span className="flex gap-3 text-[9px] font-medium text-white/60">
                        <span>About</span>
                        <span>Work</span>
                        <span>Contact</span>
                      </span>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-start justify-center gap-1.5 px-5">
                      <span className="text-[8.5px] uppercase tracking-[0.3em] text-white/55">
                        Preview
                      </span>
                      <h4 className="text-base sm:text-lg font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                        Creative Developer
                      </h4>
                      <p className="text-[10.5px] leading-relaxed text-white/80 max-w-[78%]">
                        This is how your background sits behind the existing headings, text and
                        buttons.
                      </p>
                      <span className="mt-1 px-3 py-1 rounded-full text-[10px] font-semibold text-white border border-white/30 bg-white/10 backdrop-blur-sm">
                        Explore Projects
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[10.5px] text-slate-500 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-px" />
                Previewing never changes your public website. Nothing goes live until you press
                <strong className="font-semibold text-slate-700">Apply Theme</strong>.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleApplyTheme}
                  disabled={busy === "apply" || (!isDirty && selectedThemeId === activeThemeId)}
                  className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {busy === "apply" ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isDirty ? "Apply Theme" : "Theme is live"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={busy !== null}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Theme settings */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Theme Settings
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {selectedTheme.name}
                </span>
              </div>

              {/* Animation toggle */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Background Animation</p>
                    <p className="text-[10.5px] text-slate-500">
                      Off renders one calm, static frame.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.animationEnabled}
                  onClick={() => patchSettings({ animationEnabled: !settings.animationEnabled })}
                  className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                    settings.animationEnabled ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                  style={{ height: 22 }}
                >
                  <span
                    className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${
                      settings.animationEnabled ? "left-[20px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Speed */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="text-xs font-semibold text-slate-800">Animation Speed</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {SPEED_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => patchSettings({ speed: option.value })}
                      disabled={!settings.animationEnabled}
                      className={`px-2 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        settings.speed === option.value
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                      title={option.hint}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Background Brightness</span>
                  <span className="text-[10.5px] font-mono text-slate-500">
                    {settings.brightness.toFixed(2)}×
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  value={settings.brightness}
                  onChange={(e) => patchSettings({ brightness: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Particle density */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Particle Density</span>
                  <span className="text-[10.5px] font-mono text-slate-500">
                    {settings.particleDensity.toFixed(1)}×
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={settings.particleDensity}
                  disabled={!selectedTheme.supportsParticleDensity}
                  onChange={(e) => patchSettings({ particleDensity: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer disabled:opacity-40"
                />
                {!selectedTheme.supportsParticleDensity && (
                  <p className="text-[10.5px] text-slate-400">
                    Not applicable to {selectedTheme.name}.
                  </p>
                )}
              </div>

              {/* Parallax */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <MousePointer2 className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Parallax Depth</p>
                    <p className="text-[10.5px] text-slate-500">
                      {selectedTheme.supportsParallax
                        ? "Follows the pointer for subtle depth."
                        : `Not applicable to ${selectedTheme.name}.`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.parallaxEnabled && selectedTheme.supportsParallax}
                  disabled={!selectedTheme.supportsParallax}
                  onClick={() => patchSettings({ parallaxEnabled: !settings.parallaxEnabled })}
                  className={`relative w-10 rounded-full transition-colors cursor-pointer flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                    settings.parallaxEnabled && selectedTheme.supportsParallax
                      ? "bg-purple-500"
                      : "bg-slate-300"
                  }`}
                  style={{ height: 22 }}
                >
                  <span
                    className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${
                      settings.parallaxEnabled && selectedTheme.supportsParallax
                        ? "left-[20px]"
                        : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={
                    busy === "settings" || selectedThemeId !== activeThemeId || !isDirty
                  }
                  className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title={
                    selectedThemeId !== activeThemeId
                      ? "Apply the theme first, then save its settings."
                      : "Save settings for the live theme"
                  }
                >
                  {busy === "settings" ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save settings</span>
                </button>
              </div>

              <p className="text-[10.5px] text-slate-400 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
                Stored in your existing Prisma database — it survives page refreshes, server
                restarts and new visitor sessions, and only signed-in administrators can change it.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
