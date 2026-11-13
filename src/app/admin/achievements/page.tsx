"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Plus,
  Trash2,
  Edit,
  Check,
  AlertCircle,
  Trophy,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { Experience } from "@/types";

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Experience | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState({
    role: "",
    organization: "",
    location: "",
    period: "",
    description: "",
    skills: "",
    order: 0,
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/experience");
      if (res.ok) {
        const data: Experience[] = await res.json();
        const filtered = data.filter((item) => item.type === "achievement");
        setAchievements(filtered);
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

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      role: "",
      organization: "",
      location: "",
      period: new Date().getFullYear().toString(),
      description: "",
      skills: "",
      order: achievements.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Experience) => {
    setEditingItem(item);
    setForm({
      role: item.role,
      organization: item.organization,
      location: item.location || "",
      period: item.period,
      description: item.description,
      skills: item.skills || "",
      order: item.order,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await fetch("/api/experience", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingItem.id, type: "achievement", ...form }),
        });
        if (!res.ok) throw new Error("Update failed");
        showNotification("success", "Achievement updated successfully!");
      } else {
        const res = await fetch("/api/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "achievement", ...form }),
        });
        if (!res.ok) throw new Error("Creation failed");
        showNotification("success", "New achievement recorded!");
      }
      setModalOpen(false);
      fetchAchievements();
    } catch {
      showNotification("error", "Failed to save achievement");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete achievement "${title}"?`)) return;
    try {
      const res = await fetch(`/api/experience?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("success", "Achievement deleted");
        fetchAchievements();
      }
    } catch {
      showNotification("error", "Error deleting achievement");
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
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Achievements &amp; Accolades</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage awards, hackathons, publications, and competitive coding accolades.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Achievement</span>
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">
            Loading accolades...
          </div>
        ) : achievements.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Accolades Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Record hackathon achievements, university awards, open-source recognitions, or design contest victories.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-[#176BFF] text-white text-xs font-semibold"
            >
              Add First Achievement
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {achievements.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.role}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {item.period}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">{item.organization}</div>
                  <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">{item.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.role)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingItem ? "Edit Achievement" : "Add Achievement"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Award / Recognition Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Place — National WebGL Hackathon"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono">Awarding Body *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Devfolio / HackFest"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-mono">Year / Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024"
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the significance or criteria for the award..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  {editingItem ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
