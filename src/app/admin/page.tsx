"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Wrench,
  GraduationCap,
  Sparkles,
  Mail,
  Palette,
  Zap,
  ArrowUpRight,
  Plus,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  MessageSquareQuote,
  Music,
} from "lucide-react";
import type { Project, Message } from "@/types";
import { getThemeById } from "@/lib/themes/registry";

interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  totalSkills: number;
  totalExperience: number;
  totalServices: number;
  totalTestimonials: number;
  totalCertifications: number;
  totalMessages: number;
  unreadMessages: number;
  activeTheme: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    publishedProjects: 0,
    totalSkills: 0,
    totalExperience: 0,
    totalServices: 0,
    totalTestimonials: 0,
    totalCertifications: 0,
    totalMessages: 0,
    unreadMessages: 0,
    activeTheme: "midnight-dark",
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [projRes, skillRes, expRes, msgRes, servRes, testRes, certRes, themeRes] =
        await Promise.all([
          fetch("/api/projects?all=true"),
          fetch("/api/skills"),
          fetch("/api/experience"),
          fetch("/api/messages"),
          fetch("/api/services"),
          fetch("/api/testimonials"),
          fetch("/api/certifications"),
          fetch("/api/theme"),
        ]);

      const projectsData: Project[] = projRes.ok ? await projRes.json() : [];
      const skills = skillRes.ok ? await skillRes.json() : [];
      const exp = expRes.ok ? await expRes.json() : [];
      const messages: Message[] = msgRes.ok ? await msgRes.json() : [];
      const services = servRes.ok ? await servRes.json() : [];
      const testimonials = testRes.ok ? await testRes.json() : [];
      const certs = certRes.ok ? await certRes.json() : [];
      const themeConfig = themeRes.ok ? await themeRes.json() : { activeThemeId: "midnight-dark" };

      const published = projectsData.filter((p) => p.published).length;
      const unread = Array.isArray(messages) ? messages.filter((m) => !m.read).length : 0;

      setStats({
        totalProjects: projectsData.length,
        publishedProjects: published,
        totalSkills: skills.length,
        totalExperience: exp.length,
        totalServices: services.length,
        totalTestimonials: testimonials.length,
        totalCertifications: certs.length,
        totalMessages: Array.isArray(messages) ? messages.length : 0,
        unreadMessages: unread,
        activeTheme: themeConfig.activeThemeId || "midnight-dark",
      });

      setProjects(projectsData);
      if (Array.isArray(messages)) {
        setRecentMessages(messages.slice(0, 5));
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const currentThemeObj = getThemeById(stats.activeTheme);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>EXECUTIVE COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Kartik!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Your personal portfolio is operating across 14 interactive sections with 20 real-time switchable themes and GPU-accelerated motion systems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/admin/themes"
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Palette className="w-4 h-4" />
            <span>Theme Studio (20 Themes)</span>
          </Link>

          <Link
            href="/admin/music"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
          >
            <Music className="w-4 h-4 text-emerald-400" />
            <span>Music Manager</span>
          </Link>

          <Link
            href="/admin/animations"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 text-purple-300" />
            <span>Animation Studio</span>
          </Link>
        </div>
      </div>

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
          <span>{notification.message}</span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1: Theme */}
        <Link
          href="/admin/themes"
          className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-indigo-500 hover:shadow-md transition-all group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
              Active Theme
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Palette className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {currentThemeObj.name}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">20 Pro Styles Ready</div>
        </Link>

        {/* Metric 2: Projects */}
        <Link
          href="/admin/projects"
          className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
              Projects
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
            {stats.totalProjects}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            {stats.publishedProjects} Published
          </div>
        </Link>

        {/* Metric 3: Skills */}
        <Link
          href="/admin/skills"
          className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
              Skills
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
            {stats.totalSkills}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">27 Catalogued</div>
        </Link>

        {/* Metric 4: Career */}
        <Link
          href="/admin/experience"
          className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
              Timeline
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
            {stats.totalExperience}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Work &amp; Education</div>
        </Link>

        {/* Metric 5: Testimonials */}
        <Link
          href="/admin/testimonials"
          className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
              Reviews
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
            {stats.totalTestimonials}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">5-Star Endorsements</div>
        </Link>

        {/* Metric 6: Messages */}
        <Link
          href="/admin/messages"
          className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-rose-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
              Messages
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">
            {stats.totalMessages}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            {stats.unreadMessages > 0 ? (
              <span className="text-rose-600 font-bold">{stats.unreadMessages} Unread</span>
            ) : (
              "All Caught Up"
            )}
          </div>
        </Link>
      </div>

      {/* Main Content Grid: Projects on Left, Messages on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Signature Projects Table */}
        <div className="lg:col-span-8 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Featured Projects Catalog</span>
                <span className="text-[11px] font-mono text-slate-400">({projects.length})</span>
              </h2>
              <p className="text-xs text-slate-500">Live portfolio case studies and architectures.</p>
            </div>

            <Link
              href="/admin/projects"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Num</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-500">
                      {project.displayNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{project.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{project.shortDesc}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                        {project.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          project.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {project.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/projects`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Messages & Quick Links */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Messages Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-500" />
                <span>Recent Inquiries</span>
              </h2>
              <Link
                href="/admin/messages"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View All
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-mono">
                No inquiries yet. Form submissions from the homepage will appear here instantly.
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      msg.read
                        ? "border-slate-100 bg-slate-50/50"
                        : "border-indigo-100 bg-indigo-50/40 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{msg.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-indigo-700 font-medium truncate">{msg.subject}</div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Command Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                href="/admin/themes"
                className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center gap-2"
              >
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>Theme Studio</span>
              </Link>

              <Link
                href="/admin/animations"
                className="p-3 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Animations</span>
              </Link>

              <Link
                href="/admin/skills"
                className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex items-center gap-2"
              >
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>Skills Matrix</span>
              </Link>

              <Link
                href="/admin/settings"
                className="p-3 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>Profile &amp; SEO</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
