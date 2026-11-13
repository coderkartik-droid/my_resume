"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Check, AlertCircle, Briefcase, GraduationCap, Award, X } from "lucide-react";
import type { Experience } from "@/types";

export default function AdminExperiencePage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Experience | null>(null);
  const [form, setForm] = useState({
    type: "work",
    role: "",
    organization: "",
    location: "",
    period: "",
    description: "",
    skills: "",
    order: 0,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/experience");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
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
      type: filterType === "all" ? "work" : filterType,
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
      type: item.type,
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
          body: JSON.stringify({ id: editingItem.id, ...form }),
        });
        if (!res.ok) throw new Error("Update failed");
        showNotification("success", "Timeline entry updated");
      } else {
        const res = await fetch("/api/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Create failed");
        showNotification("success", "Timeline entry added");
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      showNotification("error", "Error saving entry");
    }
  };

  const handleDelete = async (id: string, role: string) => {
    if (!confirm(`Delete "${role}"?`)) return;
    try {
      const res = await fetch(`/api/experience?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("success", "Entry deleted");
        fetchItems();
      } else {
        showNotification("error", "Error deleting entry");
      }
    } catch {
      showNotification("error", "Error deleting entry");
    }
  };

  const filteredItems =
    filterType === "all" ? items : items.filter((i) => i.type === filterType);

  const getIcon = (type: string) => {
    switch (type) {
      case "work":
        return <Briefcase className="w-4 h-4 text-[#176BFF]" />;
      case "education":
        return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case "achievement":
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <Briefcase className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Career Journey & Education</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage work experience, academic degrees, and major milestones displayed on the public career timeline.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Timeline Item</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: "all", label: "All Items" },
          { key: "work", label: "Work Experience" },
          { key: "education", label: "Education" },
          { key: "achievement", label: "Achievements & Awards" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === tab.key
                ? "bg-[#176BFF] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-sans text-xs">
          <div className="w-8 h-8 border-2 border-[#176BFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading timeline...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white border border-slate-200/80 rounded-2xl max-w-xl mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#176BFF] mx-auto mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No Timeline Entries Recorded</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-5">
            Add authentic roles, academic degrees, and achievements to populate the public career timeline.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 mx-auto cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Timeline Entry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-[#176BFF]/40 hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{item.role}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                      {item.type}
                    </span>
                    <span className="text-xs text-[#176BFF] font-semibold">@{item.organization}</span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl">{item.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Period: {item.period}</span>
                    {item.location && <span>· {item.location}</span>}
                    {item.skills && <span>· Skills: {item.skills}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[#176BFF] hover:bg-blue-100 transition-all cursor-pointer"
                  title="Edit Entry"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.role)}
                  className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingItem ? "Edit Timeline Entry" : "Add Timeline Entry"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  >
                    <option value="work">Work Experience</option>
                    <option value="education">Education</option>
                    <option value="achievement">Achievement / Award</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Time Period *</label>
                  <input
                    type="text"
                    required
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    placeholder="2023 — Present"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Role / Degree / Honor *</label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Lead 3D Engineer or B.Tech Computer Science"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Organization *</label>
                  <input
                    type="text"
                    required
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    placeholder="Company or University"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Bengaluru, India / Remote"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe key responsibilities, achievements, and impact..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Skills Highlighted (Comma separated)</label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="Three.js, React, Node.js, WebGL"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
