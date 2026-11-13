"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  Check,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Calendar,
  MapPin,
  Building2,
  X,
} from "lucide-react";
import type { Experience } from "@/types";

export default function EducationManagerPage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Experience | null>(null);
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
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/experience");
      if (res.ok) {
        const data: Experience[] = await res.json();
        setItems(data.filter((item) => item.type === "education"));
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

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      role: "",
      organization: "",
      location: "",
      period: "",
      description: "",
      skills: "",
      order: items.length + 1,
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
      const payload = {
        ...form,
        type: "education",
        id: editingItem?.id,
      };

      const res = await fetch("/api/experience", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save education record");

      showNotification(
        "success",
        editingItem ? "Education record updated!" : "New education record added!"
      );
      setModalOpen(false);
      fetchEducation();
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error saving");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this education record?")) return;

    try {
      const res = await fetch(`/api/experience?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete record");

      showNotification("success", "Education record deleted");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error deleting");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Academic Background &amp; Education
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wide">
                {items.length} Records
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Manage degrees, university qualifications, coursework, and honors.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education</span>
        </button>
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

      {/* Education Records List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading education records...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Education Records Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your Bachelor&apos;s or Master&apos;s degrees, technical diplomas, and certifications to highlight your academic foundation.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-mono font-bold cursor-pointer"
          >
            Add First Degree
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.period}
                  </span>
                  {item.location && (
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.location}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{item.role}</h3>
                  <div className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    {item.organization}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>

                {item.skills && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.skills.split(",").map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-mono"
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-start">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs cursor-pointer"
                  title="Edit Record"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs cursor-pointer"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                {editingItem ? "Edit Education Record" : "Add Education Record"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700">
                  Degree / Program Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Technology in Computer Science & Engineering"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GLA University / State University"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathura, Uttar Pradesh, India"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700">
                    Duration / Period
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2020 — 2024"
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700">
                  Description / Specialization &amp; Honors
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specialized in Computer Science, High-Performance Systems, Web Architectures, and Algorithms."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700">
                  Key Coursework &amp; Subjects (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Computer Graphics, Algorithms, System Design, Operating Systems"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  {editingItem ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
