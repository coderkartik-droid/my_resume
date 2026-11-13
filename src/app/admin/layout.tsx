"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Palette,
  Zap,
  FolderKanban,
  Wrench,
  GraduationCap,
  Sparkles,
  MessageSquareQuote,
  ShieldCheck,
  Mail,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Box,
  Sliders,
  Image as ImageIcon,
  Layers,
  BookOpen,
  Type,
  Globe,
  HardDrive,
  Compass,
  Trophy,
  MessageSquare,
  FileDown,
  UserCheck,
  Music,
  Paintbrush,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Password change modal state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        if (data.authenticated) {
          setAdminUser(data.user.username);
          if (data.user.mustChangePassword) {
            setMustChangePassword(true);
          }
        } else {
          router.replace("/admin/login");
        }

        // Fetch unread messages count
        const msgRes = await fetch("/api/messages");
        if (msgRes.ok) {
          const messages = await msgRes.json();
          if (Array.isArray(messages)) {
            const unread = messages.filter((m: { read: boolean }) => !m.read).length;
            setUnreadMessages(unread);
          }
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/admin/login");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword !== confirmPassword) {
      setPwError("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }

    try {
      setChangingPw(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setPwSuccess("Password securely updated!");
      setTimeout(() => {
        setMustChangePassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPwSuccess("");
      }, 1500);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Error updating password");
    } finally {
      setChangingPw(false);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4 p-8 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 tracking-wider uppercase font-mono">
            Verifying Admin Credentials...
          </p>
        </div>
      </div>
    );
  }

  const navCategories = [
    {
      title: "Core Studio",
      items: [
        { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
        { label: "Website Content Hub", href: "/admin/content", icon: Layers, badge: "Master" },
        { label: "Visual Page Editor", href: "/admin/editor", icon: Sliders, badge: "Studio" },
        { label: "Theme Studio", href: "/admin/themes", icon: Palette, badge: "20 Themes" },
        { label: "Background Music Manager", href: "/admin/music", icon: Music, badge: "Audio" },
        { label: "3D Control Studio", href: "/admin/3d", icon: Box, badge: "WebGL" },
        { label: "Animation Studio", href: "/admin/animations", icon: Zap },
      ],
    },
    {
      title: "Appearance & Design",
      items: [
        {
          label: "Background Themes",
          href: "/admin/background",
          icon: Paintbrush,
          badge: "6 Themes",
        },
      ],
    },
    {
      title: "Website Content",
      items: [
        {
          label: "Privacy Policy",
          href: "/admin/privacy-policy",
          icon: ShieldCheck,
          badge: "CMS",
        },
      ],
    },
    {
      title: "Homepage Sections",
      items: [
        { label: "Hero Manager", href: "/admin/hero", icon: Sparkles },
        { label: "About Manager", href: "/admin/about", icon: UserCheck },
        { label: "Skills Matrix", href: "/admin/skills", icon: Wrench },
        { label: "Experience & Timeline", href: "/admin/experience", icon: GraduationCap },
        { label: "Education & Academics", href: "/admin/education", icon: BookOpen },
        { label: "Contact Inquiries", href: "/admin/contact", icon: Mail },
      ],
    },
    {
      title: "Portfolio & Assets",
      items: [
        { label: "Projects & Portfolio", href: "/admin/projects", icon: FolderKanban },
        { label: "Project Files & Downloads", href: "/admin/project-files", icon: FileDown, badge: "Files" },
        { label: "Media Library", href: "/admin/media", icon: ImageIcon },
        { label: "Services", href: "/admin/services", icon: Sparkles },
        { label: "Achievements", href: "/admin/achievements", icon: Trophy },
        { label: "Certifications", href: "/admin/certifications", icon: ShieldCheck },
        { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
      ],
    },
    {
      title: "Global & Branding",
      items: [
        { label: "Typography System", href: "/admin/typography", icon: Type },
        { label: "SEO & Social OpenGraph", href: "/admin/seo", icon: Globe },
        { label: "Section Sequences", href: "/admin/sections", icon: Layers },
        {
          label: "Direct Messages",
          href: "/admin/messages",
          icon: MessageSquare,
          badge: unreadMessages > 0 ? `${unreadMessages} new` : undefined,
        },
        { label: "Website Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Forced Password Modal */}
      {mustChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-3">
                <KeyRound className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Set Permanent Password</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Please set your secure permanent password to unlock the admin dashboard.
              </p>
            </div>

            {pwError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPw}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {changingPw ? "Updating..." : "Update & Unlock Dashboard"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-wider uppercase">Portfolio OS Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern SaaS Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0F172A] text-white flex flex-col transform transition-transform duration-200 ease-in-out shadow-xl md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5 uppercase">
                Portfolio OS
              </h2>
              <p className="text-[10px] font-mono text-indigo-300">Command Center</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3.5 space-y-4 overflow-y-auto">
          {navCategories.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded-md ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Live Site & Sign Out */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-[#0B1120]">
          <div className="px-3.5 py-2 rounded-xl bg-white/5 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white uppercase tracking-wider">
                {adminUser || "KARTIK"}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
              Online
            </span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>Live Website</span>
            </div>
            <span className="text-xs text-slate-400">↗</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500 font-medium">
              Database Sync: <strong className="text-slate-800">Prisma SQLite Connected</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/themes"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 transition-all"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme Studio</span>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all"
            >
              <span>View Public Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-6 md:p-8 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}
