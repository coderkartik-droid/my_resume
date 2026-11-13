"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Check, AlertCircle, Sparkles, X } from "lucide-react";
import type { Service } from "@/types";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "Sparkles",
    featuresText: "",
    order: 0,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data);
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
    setEditingService(null);
    setForm({
      title: "",
      description: "",
      icon: "Sparkles",
      featuresText: "",
      order: services.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (svc: Service) => {
    setEditingService(svc);
    let parsedFeatures = "";
    if (svc.features) {
      try {
        const arr = JSON.parse(svc.features);
        parsedFeatures = Array.isArray(arr) ? arr.join("\n") : svc.features;
      } catch {
        parsedFeatures = svc.features;
      }
    }
    setForm({
      title: svc.title,
      description: svc.description,
      icon: svc.icon || "Sparkles",
      featuresText: parsedFeatures,
      order: svc.order,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const featuresArray = form.featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: form.title,
      description: form.description,
      icon: form.icon,
      features: JSON.stringify(featuresArray),
      order: form.order,
    };

    try {
      if (editingService) {
        const res = await fetch("/api/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingService.id, ...payload }),
        });
        if (!res.ok) throw new Error("Update failed");
        showNotification("success", "Service updated");
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        showNotification("success", "Service created");
      }
      setModalOpen(false);
      fetchServices();
    } catch {
      showNotification("error", "Failed to save service");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete service "${title}"?`)) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("success", "Service deleted");
        fetchServices();
      } else {
        showNotification("error", "Error deleting service");
      }
    } catch {
      showNotification("error", "Error deleting service");
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Services & Offerings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage the service offerings and digital capabilities shown on the public site.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-sans text-xs">
          <div className="w-8 h-8 border-2 border-[#176BFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading services...
        </div>
      ) : services.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-500 text-xs shadow-sm">
          No services defined.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc) => {
            let features: string[] = [];
            if (svc.features) {
              try {
                features = JSON.parse(svc.features);
              } catch {
                features = [];
              }
            }

            return (
              <div
                key={svc.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-[#176BFF]/40 hover:shadow-sm flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#176BFF]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-semibold">#{svc.order}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{svc.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{svc.description}</p>

                  {features.length > 0 && (
                    <ul className="space-y-1.5 mb-6">
                      {features.map((f, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#176BFF]" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(svc)}
                    className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[#176BFF] hover:bg-blue-100 transition-all cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id, svc.title)}
                    className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingService ? "Edit Service" : "Add Service"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Interactive 3D Web Experiences"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed description of value provided..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Bullet Capabilities (One per line)
                </label>
                <textarea
                  rows={3}
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  placeholder="WebGL & Custom Shaders&#10;Particle Physics Systems&#10;GPU Performance Optimization"
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Display Order</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF] font-mono"
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
