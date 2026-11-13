"use client";

import { useEffect, useState } from "react";
import { Save, Upload, Check, AlertCircle, RefreshCw, User, Globe, FileText, Lock, KeyRound } from "lucide-react";
import type { Profile } from "@/types";

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Password update form state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [updatingPw, setUpdatingPw] = useState(false);

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
    setTimeout(() => setNotification(null), 3000);
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
      showNotification("success", "Settings and Profile updated successfully!");
    } catch {
      showNotification("error", "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      showNotification("error", "New password and confirmation do not match.");
      return;
    }
    if (newPw.length < 8) {
      showNotification("error", "New password must be at least 8 characters long.");
      return;
    }

    try {
      setUpdatingPw(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
          confirmPassword: confirmPw,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      showNotification("success", "Admin password successfully updated!");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification("error", err.message);
      } else {
        showNotification("error", "Failed to update password.");
      }
    } finally {
      setUpdatingPw(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "resume"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      if (type === "avatar") setUploadingAvatar(true);
      else setUploadingResume(true);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (type === "avatar") {
        setProfile((prev) => ({ ...prev, avatarUrl: data.url }));
      } else {
        setProfile((prev) => ({ ...prev, resumeUrl: data.url }));
      }
      showNotification("success", `${type === "avatar" ? "Photo" : "Resume"} uploaded!`);
    } catch {
      showNotification("error", "File upload failed.");
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 font-sans text-xs">
        <div className="w-8 h-8 border-2 border-[#176BFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading profile settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Identity & Global Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize personal branding, biographical narrative, social links, and resume document.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* About Section Management */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-[#176BFF]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              About Me & Personal Brand
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Kartik Khajuria"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Professional Tagline *</label>
              <input
                type="text"
                required
                value={profile.tagline || ""}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                placeholder="Creative Developer | Full-Stack Architect | WebGL Specialist"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Hero Quotation / Intro Hook *</label>
            <input
              type="text"
              required
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="I build digital experiences that combine creativity, technology and innovation."
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">About Me Detailed Narrative</label>
            <textarea
              rows={4}
              value={profile.aboutStory || ""}
              onChange={(e) => setProfile({ ...profile, aboutStory: e.target.value })}
              placeholder="Your professional journey, passion, design philosophy, and goals..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
            />
          </div>

          {/* Profile Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Profile Photo (URL or File)
            </label>
            <div className="flex items-center gap-4">
              {profile.avatarUrl && (
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={profile.avatarUrl || ""}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  placeholder="https://... or /uploads/..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                />
                <label className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#176BFF] hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingAvatar ? "..." : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "avatar")}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Channels & Socials */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Contact Channels & Social Ecosystem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Contact Email *</label>
              <input
                type="email"
                required
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="kartikkhajuria643@gmail.com"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone (Optional)</label>
              <input
                type="text"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 7518850297"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Location</label>
              <input
                type="text"
                value={profile.location || ""}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="Mathura, Uttar Pradesh, India"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">GitHub URL</label>
              <input
                type="url"
                value={profile.githubUrl || ""}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                placeholder="https://github.com/kartik"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={profile.linkedinUrl || ""}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/kartik"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">X / Twitter URL</label>
              <input
                type="url"
                value={profile.twitterUrl || ""}
                onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })}
                placeholder="https://x.com/kartik"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
              />
            </div>
          </div>
        </div>

        {/* Global Website Meta & Resume */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-[#7957FF]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Global Website Config & Resume PDF
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Website Meta Title</label>
              <input
                type="text"
                value={profile.websiteTitle || ""}
                onChange={(e) => setProfile({ ...profile, websiteTitle: e.target.value })}
                placeholder="Kartik Khajuria — Creative Developer & 3D Specialist"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Resume PDF File / URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profile.resumeUrl || ""}
                  onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                  placeholder="/resume.pdf or https://..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF] font-mono"
                />
                <label className="px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[#7957FF] hover:bg-purple-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingResume ? "..." : "Upload PDF"}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "resume")}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Footer Brand Statement</label>
            <input
              type="text"
              value={profile.footerText || ""}
              onChange={(e) => setProfile({ ...profile, footerText: e.target.value })}
              placeholder="Crafted with passion, WebGL precision & cutting-edge Next.js architecture."
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
            />
          </div>
        </div>

        {/* Security & Admin Passcode Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock className="w-4 h-4 text-[#873EFF]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Administrator Password & Credentials
            </h2>
          </div>

          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl">
            <p className="text-xs text-purple-900">
              Active Admin Account: <strong className="text-slate-900 font-mono">KARTIK</strong>. You can update your access passcode here anytime. Passwords are securely hashed with bcrypt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Current Password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Current password"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#873EFF] focus:ring-1 focus:ring-[#873EFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#873EFF] focus:ring-1 focus:ring-[#873EFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#873EFF] focus:ring-1 focus:ring-[#873EFF]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handlePasswordUpdate}
              disabled={updatingPw || !currentPw || !newPw}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] via-[#873EFF] to-[#00D9FF] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {updatingPw ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              <span>Update Password</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
