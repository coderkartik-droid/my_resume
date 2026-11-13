"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Save,
  Check,
  AlertCircle,
  Eye,
  RotateCcw,
  Mail,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";
import type { ContactVisualConfig, SiteVisualConfigData } from "@/types/visual-config";
import { DEFAULT_CONTACT_CONFIG } from "@/types/visual-config";

export default function AdminContactManager() {
  const [contactConfig, setContactConfig] = useState<ContactVisualConfig>(DEFAULT_CONTACT_CONFIG);
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
        if (data.contact) {
          setContactConfig(data.contact);
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
          section: "contact",
          data: contactConfig,
          publishNow: publishImmediate,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      showNotification(
        "success",
        publishImmediate
          ? "Contact configuration published live!"
          : "Contact configuration saved as draft."
      );
    } catch {
      showNotification("error", "Failed to save Contact section settings");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset Contact section settings to default?")) {
      setContactConfig(DEFAULT_CONTACT_CONFIG);
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
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure direct communication channels, inquiry forms, and availability guidelines.
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
          {/* Header & Typography */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Section Heading &amp; Copy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">Section Badge</label>
                <input
                  type="text"
                  value={contactConfig.badgeText}
                  onChange={(e) => setContactConfig({ ...contactConfig, badgeText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">Headline</label>
                <input
                  type="text"
                  value={contactConfig.headline}
                  onChange={(e) => setContactConfig({ ...contactConfig, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-mono">Subtext / Invitation</label>
              <textarea
                rows={3}
                value={contactConfig.subtext}
                onChange={(e) => setContactConfig({ ...contactConfig, subtext: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Availability & Inquiries Card */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Availability &amp; Response Guidelines</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">Availability Status Text</label>
                <input
                  type="text"
                  value={contactConfig.telemetryStatus}
                  onChange={(e) => setContactConfig({ ...contactConfig, telemetryStatus: e.target.value })}
                  placeholder="e.g. Open to select roles & high-impact contracts"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">Typical Response Time</label>
                <input
                  type="text"
                  value={contactConfig.telemetryLatency}
                  onChange={(e) => setContactConfig({ ...contactConfig, telemetryLatency: e.target.value })}
                  placeholder="e.g. Within 24 Hours"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">Security / Verified Badge Label</label>
                <input
                  type="text"
                  value={contactConfig.encryptionLabel}
                  onChange={(e) => setContactConfig({ ...contactConfig, encryptionLabel: e.target.value })}
                  placeholder="e.g. Direct Reach"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">Recipient Email</label>
                <input
                  type="email"
                  value={contactConfig.email}
                  onChange={(e) => setContactConfig({ ...contactConfig, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactConfig.showTelemetry}
                  onChange={(e) => setContactConfig({ ...contactConfig, showTelemetry: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-700 font-mono">Show Availability Box</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactConfig.showConfetti}
                  onChange={(e) => setContactConfig({ ...contactConfig, showConfetti: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-700 font-mono">Celebratory Confetti on Submit</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
