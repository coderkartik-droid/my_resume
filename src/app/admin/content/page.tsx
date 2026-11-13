"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  Compass,
  GraduationCap,
  Wrench,
  FolderKanban,
  MessageSquare,
  ShieldCheck,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Sliders,
  RefreshCw,
} from "lucide-react";
import type { SectionItemConfig, SiteVisualConfigData } from "@/types/visual-config";
import { DEFAULT_SECTIONS_CONFIG, DEFAULT_SITE_VISUAL_CONFIG } from "@/types/visual-config";

export default function WebsiteContentManager() {
  const [sections, setSections] = useState<SectionItemConfig[]>(DEFAULT_SECTIONS_CONFIG);
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    experience: 0,
    services: 0,
    testimonials: 0,
    certifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [visualRes, projRes, skillsRes, expRes, servRes, testRes, certRes] = await Promise.all([
        fetch("/api/visual-config"),
        fetch("/api/projects?all=true"),
        fetch("/api/skills"),
        fetch("/api/experience"),
        fetch("/api/services"),
        fetch("/api/testimonials"),
        fetch("/api/certifications"),
      ]);

      if (visualRes.ok) {
        const visualData: SiteVisualConfigData = await visualRes.json();
        if (visualData.sections) {
          setSections(visualData.sections);
        }
      }

      setStats({
        projects: projRes.ok ? (await projRes.json()).length : 0,
        skills: skillsRes.ok ? (await skillsRes.json()).length : 0,
        experience: expRes.ok ? (await expRes.json()).length : 0,
        services: servRes.ok ? (await servRes.json()).length : 0,
        testimonials: testRes.ok ? (await testRes.json()).length : 0,
        certifications: certRes.ok ? (await certRes.json()).length : 0,
      });
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

  const toggleSection = async (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSections(updated);

    try {
      await fetch("/api/visual-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "sections", data: updated, publishNow: true }),
      });
      showNotification("success", "Section visibility updated and published!");
    } catch {
      showNotification("error", "Failed to update section visibility");
    }
  };

  const sectionLinks: Record<string, { href: string; label: string; icon: typeof Sparkles }> = {
    hero: { href: "/admin/hero", label: "Hero 3D Introduction", icon: Sparkles },
    about: { href: "/admin/about", label: "About & Philosophy", icon: Compass },
    experience: { href: "/admin/experience", label: "Career Expedition", icon: GraduationCap },
    education: { href: "/admin/education", label: "Education & Academics", icon: BookOpen },
    skills: { href: "/admin/skills", label: "Skills & 3D Ecosystem", icon: Wrench },
    projects: { href: "/admin/projects", label: "Projects & File Downloads", icon: FolderKanban },
    services: { href: "/admin/services", label: "Architectural Services", icon: Sparkles },
    testimonials: { href: "/admin/testimonials", label: "Client Testimonials", icon: Sparkles },
    certifications: { href: "/admin/certifications", label: "Certifications & Badges", icon: ShieldCheck },
    contact: { href: "/admin/contact", label: "Contact & Inquiries", icon: MessageSquare },
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
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
            <span className="p-2 rounded-xl bg-blue-50 text-[#176BFF]">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Website Content Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central orchestration hub for all public homepage sections, visibility toggles, and direct editorial links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/editor"
            className="px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all hover:scale-105"
          >
            <Sliders className="w-4 h-4" />
            <span>Open Visual Page Editor</span>
          </Link>
        </div>
      </div>

      {/* Content Volume Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center">
          <div className="text-xs font-mono text-slate-400">PROJECTS</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.projects}</div>
          <Link href="/admin/projects" className="text-[10px] text-[#176BFF] hover:underline mt-1 block">
            Manage &rarr;
          </Link>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center">
          <div className="text-xs font-mono text-slate-400">SKILLS</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.skills}</div>
          <Link href="/admin/skills" className="text-[10px] text-[#176BFF] hover:underline mt-1 block">
            Manage &rarr;
          </Link>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center">
          <div className="text-xs font-mono text-slate-400">EXP / EDU</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.experience}</div>
          <Link href="/admin/experience" className="text-[10px] text-[#176BFF] hover:underline mt-1 block">
            Manage &rarr;
          </Link>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center">
          <div className="text-xs font-mono text-slate-400">SERVICES</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.services}</div>
          <Link href="/admin/services" className="text-[10px] text-[#176BFF] hover:underline mt-1 block">
            Manage &rarr;
          </Link>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center">
          <div className="text-xs font-mono text-slate-400">TESTIMONIALS</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.testimonials}</div>
          <Link href="/admin/testimonials" className="text-[10px] text-[#176BFF] hover:underline mt-1 block">
            Manage &rarr;
          </Link>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center">
          <div className="text-xs font-mono text-slate-400">CREDENTIALS</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.certifications}</div>
          <Link href="/admin/certifications" className="text-[10px] text-[#176BFF] hover:underline mt-1 block">
            Manage &rarr;
          </Link>
        </div>
      </div>

      {/* Sections Command Grid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">All Website Sections ({sections.length})</h3>
          <span className="text-xs font-mono text-slate-400">Click &quot;Edit Content&quot; to configure any section</span>
        </div>

        <div className="divide-y divide-slate-100">
          {sections.map((sec, idx) => {
            const linkInfo = sectionLinks[sec.id] || {
              href: `/admin/${sec.id}`,
              label: sec.name,
              icon: Layers,
            };
            const Icon = linkInfo.icon;

            return (
              <div
                key={sec.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-600 text-xs">
                    0{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{sec.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                        #{sec.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {sec.enabled ? "Visible on public homepage" : "Hidden from public view"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                      sec.enabled
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {sec.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{sec.enabled ? "Live" : "Hidden"}</span>
                  </button>

                  <Link
                    href={linkInfo.href}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
                  >
                    <span>Edit Content</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
