"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Terminal,
  Activity,
  Copy,
  Check,
} from "lucide-react";
import type { Profile } from "@/types";
import { sound } from "@/lib/sound";
import { useTheme } from "@/context/ThemeContext";
import type { ContactVisualConfig } from "@/types/visual-config";
import { DEFAULT_CONTACT_CONFIG } from "@/types/visual-config";

interface ContactSectionProps {
  profile?: Profile | null;
  config?: ContactVisualConfig;
}

export default function ContactSection({ profile, config }: ContactSectionProps) {
  const { currentTheme } = useTheme();
  const cfg = config || DEFAULT_CONTACT_CONFIG;
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to deliver message.");
      }

      setSuccess(true);
      sound.playSuccess();

      // Premium celebratory confetti burst
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.65 },
        colors: ["#5145E5", "#38BDF8", "#A78BFA", "#FFFFFF"],
      });

      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error transmitting message. Please try again or reach out directly.");
      }
    } finally {
      setLoading(false);
    }
  };

  const email = profile?.email || "kartikkhajuria643@gmail.com";
  const phone = profile?.phone || "+91 7518850297";
  const location = profile?.location || "Mathura, Uttar Pradesh, India";

  return (
    <section id="contact" className="py-28 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/4 left-1/4 w-[650px] h-[650px] rounded-full blur-[180px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#5145E5" }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#38BDF8" }}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="theme-badge">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>{cfg.badgeText || "DIRECT INQUIRIES • GET IN TOUCH"}</span>
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                SECTION 07
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading uppercase tracking-[-0.03em] leading-[0.94] text-white">
              {cfg.headline || "Let's Build Something Extraordinary."}
            </h2>
          </div>

          <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-md leading-relaxed font-normal">
            {cfg.subtext ||
              "Whether you are commissioning a high-end 3D WebGL website, architecting an enterprise cloud platform, or seeking engineering leadership, my inbox is open."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
          {/* Left Column: Direct Communication Channels & Telemetry */}
          <div className="lg:col-span-5 space-y-5">
            {/* Direct Communication & Availability Telemetry Card */}
            {cfg.showTelemetry !== false && (
              <div className="theme-card p-6 sm:p-7 rounded-3xl space-y-4 font-mono shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
                      DIRECT INQUIRIES OPEN
                    </span>
                  </div>
                  <span className="text-slate-400 text-[10px] tracking-wider uppercase">
                    {cfg.encryptionLabel || "Direct Reach"}
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-400">Representative</span>
                    <span className="font-semibold text-white">Kartik Khajuria</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-400">Typical Response</span>
                    <span className="text-emerald-400 font-semibold">{cfg.telemetryLatency || "Within 24 Hours"}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-400">Timezone</span>
                    <span className="text-white/90">IST (UTC+5:30) &bull; Global Availability</span>
                  </div>
                  <div className="pt-2.5 border-t border-white/10 text-[11px] text-sky-300 font-medium">
                    {cfg.telemetryStatus || "Available for select full-time roles, contracts & advisory."}
                  </div>
                </div>
              </div>
            )}

            {/* Direct Channels Cards */}
            <div className="theme-card theme-card-hover p-5 sm:p-6 rounded-3xl space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                      Direct Email
                    </div>
                    <a
                      href={`mailto:${email}`}
                      className="text-xs sm:text-sm font-bold font-mono text-white hover:text-sky-300 transition-colors break-all"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(email, "email")}
                  className="p-2 rounded-xl border border-white/10 hover:border-sky-400/40 text-slate-400 hover:text-white transition-all cursor-pointer bg-white/[0.03]"
                  title="Copy email address"
                >
                  {copiedKey === "email" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="theme-card theme-card-hover p-5 sm:p-6 rounded-3xl space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 bg-sky-500/15 text-sky-400 border border-sky-500/25">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                      Voice &amp; WhatsApp
                    </div>
                    <a
                      href={`tel:${phone}`}
                      className="text-xs sm:text-sm font-bold font-mono text-white hover:text-sky-300 transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(phone, "phone")}
                  className="p-2 rounded-xl border border-white/10 hover:border-sky-400/40 text-slate-400 hover:text-white transition-all cursor-pointer bg-white/[0.03]"
                  title="Copy phone number"
                >
                  {copiedKey === "phone" ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="theme-card theme-card-hover p-5 sm:p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 bg-purple-500/15 text-purple-400 border border-purple-500/25">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                    Current Base
                  </div>
                  <div className="text-xs sm:text-sm font-bold font-mono text-white">{location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Contact Terminal Form */}
          <div className="lg:col-span-7">
            <div className="theme-card p-8 sm:p-12 rounded-3xl relative shadow-2xl">
              {/* Top ambient highlight line */}
              <div
                className="absolute top-0 inset-x-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, #5145E5, #38BDF8, #A78BFA)" }}
              />

              {success && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-3 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  <span>
                    Transmission delivered successfully! I will review your requirements and respond within 24 hours.
                  </span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-3 animate-in fade-in duration-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Vance"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-2xl text-xs font-mono border glass-input transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-2xl text-xs font-mono border glass-input transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                    Subject / Project Scope *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="3D WebGL Platform / Full-Stack Initiative / Advisory"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl text-xs font-mono border glass-input transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                    Project Details &amp; Vision *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Outline your requirements, timeline, budget, or ideas..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl text-xs font-mono border glass-input resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="theme-btn-primary w-full py-4 text-xs font-mono font-bold tracking-widest flex items-center justify-center gap-3 cursor-pointer shadow-xl disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>TRANSMIT MESSAGE</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
