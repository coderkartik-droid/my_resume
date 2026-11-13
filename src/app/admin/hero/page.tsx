"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Type,
  Layout,
  Link as LinkIcon,
  Activity,
  ArrowRight,
  Download,
  Mail,
  Box,
} from "lucide-react";
import type { HeroVisualConfig, SiteVisualConfigData } from "@/types/visual-config";
import { DEFAULT_HERO_CONFIG, DEFAULT_SITE_VISUAL_CONFIG } from "@/types/visual-config";

export default function HeroManagerPage() {
  const [hero, setHero] = useState<HeroVisualConfig>(DEFAULT_HERO_CONFIG);
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
        if (effective.hero) {
          setHero(effective.hero);
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

  const updateHero = (updater: (prev: HeroVisualConfig) => HeroVisualConfig) => {
    setHero((prev) => {
      const next = updater(prev);
      setFullConfig((full) => ({ ...full, hero: next }));
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
          draftData: { ...fullConfig, hero },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save hero draft");
      showNotification("success", "Hero draft saved successfully!");
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
          configData: { ...fullConfig, hero },
          versionName: `Hero Updated ${new Date().toLocaleDateString()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish hero");
      showNotification("success", "Hero section changes published live!");
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error publishing");
    } finally {
      setPublishing(false);
    }
  };

  const handleReset = () => {
    setHero(DEFAULT_HERO_CONFIG);
    setFullConfig((prev) => ({ ...prev, hero: DEFAULT_HERO_CONFIG }));
    showNotification("success", "Hero reset to factory default configuration.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-500">Loading Hero Section Manager...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Hero Section Manager
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold uppercase tracking-wide">
                Landing Zone
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Customize typography, designations, CTAs, metrics, and 3D placement.
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

      {/* Main Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Card 1: Identity & Typography */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2 font-bold text-sm text-slate-900">
            <Type className="w-4 h-4 text-indigo-600" />
            <h3>Identity &amp; Typography</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700">Display Name</label>
            <input
              type="text"
              value={hero.name}
              onChange={(e) => updateHero((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-700">Eyebrow Ribbon</label>
              <label className="flex items-center gap-1.5 text-xs font-mono text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hero.badgeVisible !== false}
                  onChange={(e) =>
                    updateHero((prev) => ({ ...prev, badgeVisible: e.target.checked }))
                  }
                  className="rounded text-indigo-600"
                />
                <span>Visible</span>
              </label>
            </div>
            <input
              type="text"
              value={hero.badgeText}
              onChange={(e) => updateHero((prev) => ({ ...prev, badgeText: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-700">
                Designation Tickers (comma separated)
              </label>
              <label className="flex items-center gap-1.5 text-xs font-mono text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hero.roleTickerVisible !== false}
                  onChange={(e) =>
                    updateHero((prev) => ({ ...prev, roleTickerVisible: e.target.checked }))
                  }
                  className="rounded text-indigo-600"
                />
                <span>Visible</span>
              </label>
            </div>
            <input
              type="text"
              value={hero.roleTicker.join(", ")}
              onChange={(e) =>
                updateHero((prev) => ({
                  ...prev,
                  roleTicker: e.target.value.split(",").map((s) => s.trim()),
                }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700">Editorial Bio</label>
            <textarea
              rows={3}
              value={hero.introBio}
              onChange={(e) => updateHero((prev) => ({ ...prev, introBio: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>
        </div>

        {/* Card 2: CTA Buttons & Metrics */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2 font-bold text-sm text-slate-900">
            <LinkIcon className="w-4 h-4 text-indigo-600" />
            <h3>Actions &amp; Metrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-600">
                Primary Button Text
              </label>
              <input
                type="text"
                value={hero.primaryCtaText}
                onChange={(e) =>
                  updateHero((prev) => ({ ...prev, primaryCtaText: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-600">
                Primary Button URL
              </label>
              <input
                type="text"
                value={hero.primaryCtaLink}
                onChange={(e) =>
                  updateHero((prev) => ({ ...prev, primaryCtaLink: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-600">
                Secondary Button Text
              </label>
              <input
                type="text"
                value={hero.secondaryCtaText}
                onChange={(e) =>
                  updateHero((prev) => ({ ...prev, secondaryCtaText: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-600">
                Secondary Button URL
              </label>
              <input
                type="text"
                value={hero.secondaryCtaLink}
                onChange={(e) =>
                  updateHero((prev) => ({ ...prev, secondaryCtaLink: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-mono font-bold text-slate-700">
              Metric Counters
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <input
                  type="number"
                  value={hero.metric1Value}
                  onChange={(e) =>
                    updateHero((prev) => ({ ...prev, metric1Value: Number(e.target.value) }))
                  }
                  className="w-full px-2 py-1 rounded border text-xs font-mono font-bold"
                />
                <input
                  type="text"
                  value={hero.metric1Label}
                  onChange={(e) =>
                    updateHero((prev) => ({ ...prev, metric1Label: e.target.value }))
                  }
                  className="w-full px-2 py-1 rounded border text-[10px] font-mono"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <input
                  type="number"
                  value={hero.metric2Value}
                  onChange={(e) =>
                    updateHero((prev) => ({ ...prev, metric2Value: Number(e.target.value) }))
                  }
                  className="w-full px-2 py-1 rounded border text-xs font-mono font-bold"
                />
                <input
                  type="text"
                  value={hero.metric2Label}
                  onChange={(e) =>
                    updateHero((prev) => ({ ...prev, metric2Label: e.target.value }))
                  }
                  className="w-full px-2 py-1 rounded border text-[10px] font-mono"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <input
                  type="number"
                  value={hero.metric3Value}
                  onChange={(e) =>
                    updateHero((prev) => ({ ...prev, metric3Value: Number(e.target.value) }))
                  }
                  className="w-full px-2 py-1 rounded border text-xs font-mono font-bold"
                />
                <input
                  type="text"
                  value={hero.metric3Label}
                  onChange={(e) =>
                    updateHero((prev) => ({ ...prev, metric3Label: e.target.value }))
                  }
                  className="w-full px-2 py-1 rounded border text-[10px] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Visibility Switches */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
            <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={hero.threeDCenterpieceVisible !== false}
                onChange={(e) =>
                  updateHero((prev) => ({
                    ...prev,
                    threeDCenterpieceVisible: e.target.checked,
                  }))
                }
                className="rounded text-indigo-600"
              />
              <span>3D Centerpiece</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={hero.ctaButtonsVisible !== false}
                onChange={(e) =>
                  updateHero((prev) => ({ ...prev, ctaButtonsVisible: e.target.checked }))
                }
                className="rounded text-indigo-600"
              />
              <span>CTA Buttons</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={hero.socialLinksVisible !== false}
                onChange={(e) =>
                  updateHero((prev) => ({ ...prev, socialLinksVisible: e.target.checked }))
                }
                className="rounded text-indigo-600"
              />
              <span>Social Links</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={hero.scrollIndicatorVisible !== false}
                onChange={(e) =>
                  updateHero((prev) => ({ ...prev, scrollIndicatorVisible: e.target.checked }))
                }
                className="rounded text-indigo-600"
              />
              <span>Scroll Indicator</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
