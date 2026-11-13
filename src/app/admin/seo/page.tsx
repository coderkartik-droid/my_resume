"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  Save,
  Check,
  AlertCircle,
  Eye,
  Share2,
  Sparkles,
  Upload,
} from "lucide-react";
import type { Profile } from "@/types";

export default function AdminSeoPage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Save failed");
      showNotification("success", "SEO and Metadata configuration updated!");
    } catch {
      showNotification("error", "Failed to update SEO settings");
    } finally {
      setSaving(false);
    }
  };

  const siteTitle = profile.websiteTitle || "Kartik Khajuria — World-Class Creative Developer & 3D Portfolio";
  const bio = profile.bio || "World-class personal portfolio featuring interactive 3D WebGL experiences, full-stack architectures, and 20 dynamic themes.";

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
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SEO &amp; OpenGraph Settings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure search engine indexing, social sharing meta cards, and search snippet previews.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save SEO Settings"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Form Controls */}
        <form onSubmit={handleSave} className="md:col-span-7 space-y-6">
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>Search Engine Metadata</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-mono">
                Website Meta Title *
              </label>
              <input
                type="text"
                required
                value={profile.websiteTitle || ""}
                onChange={(e) => setProfile({ ...profile, websiteTitle: e.target.value })}
                placeholder="e.g. Kartik Khajuria — Creative Technologist & 3D WebGL Portfolio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-mono">
                Recommended length: 50-60 characters ({siteTitle.length} characters)
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-mono">
                Meta Description *
              </label>
              <textarea
                rows={4}
                required
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Brief summary of your architectural focus, capabilities, and key projects..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none resize-none"
              />
              <span className="text-[10px] text-slate-400 font-mono">
                Recommended length: 120-160 characters ({bio.length} characters)
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-mono">
                Social Share Image (OG Image URL)
              </label>
              <input
                type="text"
                value={profile.avatarUrl || ""}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                placeholder="/uploads/og-banner.png or full image URL"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        </form>

        {/* Live Search & Social Previews */}
        <div className="md:col-span-5 space-y-6">
          {/* Google Search Snippet Preview */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3 font-sans">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Google Search Result Preview
            </div>

            <div className="space-y-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-600 truncate flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>https://kartikkhajuria.com</span>
              </div>
              <div className="text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                {siteTitle}
              </div>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {bio}
              </p>
            </div>
          </div>

          {/* Social Card Preview */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Social Share Preview (X &bull; LinkedIn)</span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-white">
              {profile.avatarUrl ? (
                <div className="aspect-[1.91/1] w-full overflow-hidden bg-black">
                  <img
                    src={profile.avatarUrl}
                    alt="Social preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[1.91/1] w-full flex items-center justify-center bg-slate-800 text-slate-400 text-xs font-mono">
                  No preview banner specified
                </div>
              )}
              <div className="p-4 space-y-1 bg-slate-950">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">kartikkhajuria.com</span>
                <div className="text-xs font-bold text-white line-clamp-1">{siteTitle}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">{bio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
