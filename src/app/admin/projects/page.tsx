"use client";

import { useEffect, useState, useRef } from "react";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Star,
  ExternalLink,
  Upload,
  Check,
  AlertCircle,
  Save,
  RefreshCw,
  X,
  FolderKanban,
  Download,
  Smartphone,
  Monitor,
  Archive,
  FileText,
  Package,
  BookOpen,
  Play,
} from "lucide-react";
import type { Project, ProjectFile } from "@/types";
import { formatProjectNumber } from "@/lib/utils";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formState, setFormState] = useState({
    title: "",
    slug: "",
    category: "Web Development",
    shortDesc: "",
    fullDesc: "",
    objectives: "",
    problem: "",
    solution: "",
    keyFeaturesText: "",
    challenges: "",
    techStack: "",
    thumbnailUrl: "",
    screenshotsText: "",
    liveUrl: "",
    githubUrl: "",
    documentationUrl: "",
    videoDemoUrl: "",
    status: "Completed",
    featured: false,
    published: true,
  });

  // Project Files State for Edit Modal
  const [editingProjectFiles, setEditingProjectFiles] = useState<ProjectFile[]>([]);
  const [uploadingProjectFile, setUploadingProjectFile] = useState(false);
  const [projectFileToUpload, setProjectFileToUpload] = useState<File | null>(null);
  const [fileCustomName, setFileCustomName] = useState("");
  const [fileDesc, setFileDesc] = useState("");
  const [fileBtnText, setFileBtnText] = useState("");
  const [fileVer, setFileVer] = useState("v1.0.0");
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects?all=true");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Reordering helpers
  const moveItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === projects.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Recalculate orders and display numbers
    const updated = reordered.map((p, idx) => ({
      ...p,
      order: idx + 1,
      displayNumber: formatProjectNumber(idx + 1),
    }));

    setProjects(updated);
    saveOrder(updated);
  };

  const handlePositionChange = (currentIndex: number, newPosition: number) => {
    const targetIndex = Math.max(0, Math.min(projects.length - 1, newPosition - 1));
    if (targetIndex === currentIndex) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((p, idx) => ({
      ...p,
      order: idx + 1,
      displayNumber: formatProjectNumber(idx + 1),
    }));

    setProjects(updated);
    saveOrder(updated);
  };

  // Drag handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...projects];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    const updated = reordered.map((p, idx) => ({
      ...p,
      order: idx + 1,
      displayNumber: formatProjectNumber(idx + 1),
    }));

    setDraggedIndex(index);
    setProjects(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    saveOrder(projects);
  };

  // Save new sequential order to backend
  const saveOrder = async (itemsToSave?: Project[]) => {
    const list = itemsToSave || projects;
    try {
      setSavingOrder(true);
      const orders = list.map((p, idx) => ({
        id: p.id,
        order: idx + 1,
        displayNumber: formatProjectNumber(idx + 1),
      }));

      const res = await fetch("/api/projects/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });

      if (res.ok) {
        showNotification("success", "Sequential project order synchronized!");
      } else {
        throw new Error("Failed to reorder");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Error saving display order");
    } finally {
      setSavingOrder(false);
    }
  };

  // Toggle publish status
  const togglePublish = async (project: Project) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !project.published }),
      });
      if (res.ok) {
        setProjects(projects.map((p) => (p.id === project.id ? { ...p, published: !p.published } : p)));
        showNotification("success", `Project ${project.published ? "moved to drafts" : "published to live portfolio"}`);
      }
    } catch {
      showNotification("error", "Failed to update project status");
    }
  };

  // Toggle featured status
  const toggleFeatured = async (project: Project) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !project.featured }),
      });
      if (res.ok) {
        setProjects(projects.map((p) => (p.id === project.id ? { ...p, featured: !p.featured } : p)));
        showNotification("success", `Project ${project.featured ? "unmarked as featured" : "marked as featured"}`);
      }
    } catch {
      showNotification("error", "Failed to toggle featured status");
    }
  };

  // Delete project
  const deleteProject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("success", "Project deleted and remaining projects renumbered.");
        fetchProjects();
      } else {
        showNotification("error", "Failed to delete project");
      }
    } catch {
      showNotification("error", "Error deleting project");
    }
  };

  // Modal open helpers
  const openCreateModal = () => {
    setEditingProject(null);
    setFormState({
      title: "",
      slug: "",
      category: "Web Development",
      shortDesc: "",
      fullDesc: "",
      objectives: "",
      problem: "",
      solution: "",
      keyFeaturesText: "",
      challenges: "",
      techStack: "",
      thumbnailUrl: "",
      screenshotsText: "",
      liveUrl: "",
      githubUrl: "",
      documentationUrl: "",
      videoDemoUrl: "",
      status: "Completed",
      featured: false,
      published: true,
    });
    setEditingProjectFiles([]);
    setProjectFileToUpload(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    let parsedFeatures = "";
    if (p.keyFeatures) {
      try {
        const arr = JSON.parse(p.keyFeatures);
        parsedFeatures = Array.isArray(arr) ? arr.join("\n") : p.keyFeatures;
      } catch {
        parsedFeatures = p.keyFeatures;
      }
    }

    let parsedScreenshots = "";
    if (p.screenshots) {
      try {
        const arr = JSON.parse(p.screenshots);
        parsedScreenshots = Array.isArray(arr) ? arr.join("\n") : p.screenshots;
      } catch {
        parsedScreenshots = p.screenshots;
      }
    }

    setFormState({
      title: p.title,
      slug: p.slug,
      category: p.category,
      shortDesc: p.shortDesc,
      fullDesc: p.fullDesc || "",
      objectives: p.objectives || "",
      problem: p.problem || "",
      solution: p.solution || "",
      keyFeaturesText: parsedFeatures,
      challenges: p.challenges || "",
      techStack: p.techStack,
      thumbnailUrl: p.thumbnailUrl || "",
      screenshotsText: parsedScreenshots,
      liveUrl: p.liveUrl || "",
      githubUrl: p.githubUrl || "",
      documentationUrl: p.documentationUrl || "",
      videoDemoUrl: p.videoDemoUrl || "",
      status: p.status,
      featured: p.featured,
      published: p.published,
    });
    setEditingProjectFiles(p.files || []);
    setProjectFileToUpload(null);
    fetch(`/api/project-files?projectId=${p.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEditingProjectFiles(data);
      })
      .catch(() => {});
    setModalOpen(true);
  };

  const handleProjectFileUpload = async () => {
    if (!projectFileToUpload || !editingProject) return;
    try {
      setUploadingProjectFile(true);
      const formData = new FormData();
      formData.append("file", projectFileToUpload);
      formData.append("projectId", editingProject.id);
      if (fileCustomName.trim()) formData.append("fileName", fileCustomName.trim());
      if (fileDesc.trim()) formData.append("fileDescription", fileDesc.trim());
      if (fileBtnText.trim()) formData.append("buttonText", fileBtnText.trim());
      if (fileVer.trim()) formData.append("version", fileVer.trim());

      const res = await fetch("/api/project-files", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setEditingProjectFiles((prev) => [...prev, data]);
      setProjectFileToUpload(null);
      setFileCustomName("");
      setFileDesc("");
      setFileBtnText("");
      setFileVer("v1.0.0");
      showNotification("success", `Attached ${data.fileName} to project!`);
      fetchProjects();
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error uploading file");
    } finally {
      setUploadingProjectFile(false);
    }
  };

  const handleDeleteProjectFile = async (fileId: string) => {
    if (!confirm("Remove this downloadable file?")) return;
    try {
      const res = await fetch(`/api/project-files?id=${fileId}`, { method: "DELETE" });
      if (res.ok) {
        setEditingProjectFiles((prev) => prev.filter((f) => f.id !== fileId));
        showNotification("success", "Downloadable file removed");
        fetchProjects();
      }
    } catch {
      showNotification("error", "Failed to remove file");
    }
  };

  const handleToggleFileVisibility = async (fileId: string, currentVisible: boolean) => {
    try {
      const res = await fetch("/api/project-files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fileId, visible: !currentVisible }),
      });
      if (res.ok) {
        setEditingProjectFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, visible: !currentVisible } : f))
        );
        showNotification("success", `Download link ${!currentVisible ? "Enabled" : "Disabled"}`);
        fetchProjects();
      }
    } catch {
      showNotification("error", "Failed to toggle file visibility");
    }
  };

  const handleUpdateFileButtonText = async (fileId: string, currentText: string) => {
    const newText = window.prompt("Enter custom download link text (e.g. Download Android Application (.APK)):", currentText);
    if (newText === null || newText.trim() === currentText) return;
    try {
      const res = await fetch("/api/project-files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fileId, buttonText: newText.trim() }),
      });
      if (res.ok) {
        setEditingProjectFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, buttonText: newText.trim() } : f))
        );
        showNotification("success", "Download link text updated!");
        fetchProjects();
      }
    } catch {
      showNotification("error", "Failed to update download link text");
    }
  };

  // Handle image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "screenshot") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingImage(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (field === "thumbnail") {
        setFormState((prev) => ({ ...prev, thumbnailUrl: data.url }));
      } else {
        setFormState((prev) => ({
          ...prev,
          screenshotsText: prev.screenshotsText ? `${prev.screenshotsText}\n${data.url}` : data.url,
        }));
      }
      showNotification("success", "Image uploaded successfully!");
    } catch {
      showNotification("error", "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  // Form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const featuresArray = formState.keyFeaturesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const screenshotsArray = formState.screenshotsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...formState,
      keyFeatures: JSON.stringify(featuresArray),
      screenshots: JSON.stringify(screenshotsArray),
    };

    try {
      if (editingProject) {
        const res = await fetch(`/api/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        showNotification("success", "Project updated successfully!");
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Creation failed");
        showNotification("success", "Project created successfully!");
      }

      setModalOpen(false);
      fetchProjects();
    } catch {
      showNotification("error", "Failed to save project.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border flex items-center gap-3 shadow-xl transition-all ${
            notification.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700"
              : "bg-rose-600 text-white border-rose-700"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Management & Ordering</h1>
          <p className="text-xs text-slate-500 mt-1">
            Control display order, numbering (01, 02, 03...), case study details, and visibility.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => saveOrder()}
            disabled={savingOrder}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 border border-slate-200 transition-all cursor-pointer"
          >
            {savingOrder ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#176BFF]" />
            ) : (
              <Save className="w-4 h-4 text-[#176BFF]" />
            )}
            <span>Auto-Save Numbers</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Order Management Instructions Banner */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <div className="p-1 rounded bg-blue-200 text-[#176BFF] font-bold text-[10px]">INFO</div>
        <div>
          <strong className="text-blue-950">Drag & Drop or 1-Click Move:</strong> You can drag items using the grip handle, use the Up/Down arrows, or select a slot number directly. The public portfolio updates its sequential numbering (`01`, `02`, `03`...) immediately.
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-sans text-xs">
          <div className="w-8 h-8 border-2 border-[#176BFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading project catalogue...
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white border border-slate-200/80 rounded-2xl max-w-2xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#176BFF] mx-auto mb-4">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Projects Added Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
            All fictional project data has been cleared. Add your real projects below with case study objectives, problem statements, solutions, screenshots, live demo links, and GitHub repositories.
          </p>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 mx-auto shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Real Project</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p, index) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all ${
                draggedIndex === index
                  ? "opacity-50 scale-[0.99] border-[#176BFF] bg-blue-50/50"
                  : "bg-white border-slate-200/80 hover:border-[#176BFF]/40 hover:shadow-sm"
              }`}
            >
              {/* Left: Reorder Handle, Number, Details */}
              <div className="flex items-center gap-4 flex-1">
                {/* Drag Handle */}
                <div
                  className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Display Number Badge */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center font-mono font-bold text-[#176BFF]">
                  <span className="text-[10px] text-slate-400">POS</span>
                  <span className="text-sm">{p.displayNumber}</span>
                </div>

                {/* Thumbnail Preview */}
                {p.thumbnailUrl && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                    <img
                      src={p.thumbnailUrl}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {p.category}
                    </span>
                    {p.featured && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#176BFF] border border-blue-200">
                        ★ Featured
                      </span>
                    )}
                    {p.files && p.files.length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{p.files.length} {p.files.length === 1 ? "Asset" : "Assets"}</span>
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        p.published
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {p.published ? "Live" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">{p.shortDesc}</p>
                  <p className="text-[11px] font-mono text-slate-400">Tech: {p.techStack}</p>
                </div>
              </div>

              {/* Right: Order controls & action buttons */}
              <div className="flex items-center gap-2 mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap">
                {/* Position changer */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono px-1.5 text-slate-700 font-bold">
                    {index + 1} / {projects.length}
                  </span>
                  <button
                    onClick={() => moveItem(index, "down")}
                    disabled={index === projects.length - 1}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Move to specific slot */}
                <select
                  value={index + 1}
                  onChange={(e) => handlePositionChange(index, Number(e.target.value))}
                  className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-2 py-2 font-mono focus:outline-none focus:border-[#176BFF] cursor-pointer"
                  title="Move to specific position"
                >
                  {projects.map((_, i) => (
                    <option key={i} value={i + 1}>
                      Pos {formatProjectNumber(i + 1)}
                    </option>
                  ))}
                </select>

                {/* Preview live */}
                <a
                  href={`/projects/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-[#176BFF] hover:bg-blue-50 transition-all cursor-pointer"
                  title="View Live Case Study"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Featured toggle */}
                <button
                  onClick={() => toggleFeatured(p)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    p.featured
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700"
                  }`}
                  title={p.featured ? "Unfeature" : "Mark Featured"}
                >
                  <Star className={`w-4 h-4 ${p.featured ? "fill-amber-500" : ""}`} />
                </button>

                {/* Publish toggle */}
                <button
                  onClick={() => togglePublish(p)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    p.published
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-slate-100 border-slate-200 text-slate-400"
                  }`}
                  title={p.published ? "Unpublish to draft" : "Publish to live portfolio"}
                >
                  {p.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEditModal(p)}
                  className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[#176BFF] hover:bg-blue-100 transition-all cursor-pointer"
                  title="Edit Project"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteProject(p.id, p.title)}
                  className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT PROJECT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProject ? "Edit Project Case Study" : "Create New Project"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  All fields will appear on the 3D portfolio and detailed project page.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="e.g. NovaSphere — 3D Audio Visualizer"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    URL Slug (Optional, auto-generated)
                  </label>
                  <input
                    type="text"
                    value={formState.slug}
                    onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                    placeholder="novasphere-3d-audio-visualizer"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    placeholder="Creative 3D / WebGL, Full-Stack Web App, AI & Tools..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Featured">Featured</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Beta">Beta</option>
                    <option value="Concept">Concept</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Short Description (Cards & Previews) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formState.shortDesc}
                  onChange={(e) => setFormState({ ...formState, shortDesc: e.target.value })}
                  placeholder="A concise 1-2 sentence hook describing the essence of the project..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Technology Stack (Comma separated) *
                </label>
                <input
                  type="text"
                  required
                  value={formState.techStack}
                  onChange={(e) => setFormState({ ...formState, techStack: e.target.value })}
                  placeholder="Three.js, WebGL, TypeScript, Next.js, GLSL, Framer Motion"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF] font-mono"
                />
              </div>

              {/* Case Study Details Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#176BFF]">
                  Detailed Case Study Sections (Full Project Page)
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Project Overview</label>
                  <textarea
                    rows={3}
                    value={formState.fullDesc}
                    onChange={(e) => setFormState({ ...formState, fullDesc: e.target.value })}
                    placeholder="Comprehensive deep-dive into the project background and purpose..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Objectives</label>
                    <textarea
                      rows={2}
                      value={formState.objectives}
                      onChange={(e) => setFormState({ ...formState, objectives: e.target.value })}
                      placeholder="Key targets, requirements, and metric goals..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Statement</label>
                    <textarea
                      rows={2}
                      value={formState.problem}
                      onChange={(e) => setFormState({ ...formState, problem: e.target.value })}
                      placeholder="What friction or limitation was this designed to solve?"
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">My Engineered Solution</label>
                    <textarea
                      rows={2}
                      value={formState.solution}
                      onChange={(e) => setFormState({ ...formState, solution: e.target.value })}
                      placeholder="How you architected and implemented the answer..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Challenges & Technical Hurdles</label>
                    <textarea
                      rows={2}
                      value={formState.challenges}
                      onChange={(e) => setFormState({ ...formState, challenges: e.target.value })}
                      placeholder="Complex hurdles faced and how they were overcome..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Features (One feature per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formState.keyFeaturesText}
                    onChange={(e) => setFormState({ ...formState, keyFeaturesText: e.target.value })}
                    placeholder="Real-time WebGL shader synthesis&#10;Off-screen audio processing&#10;Spatial sound panning"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF] font-mono"
                  />
                </div>
              </div>

              {/* Media & URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Project Thumbnail Image (URL or Upload)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formState.thumbnailUrl}
                      onChange={(e) => setFormState({ ...formState, thumbnailUrl: e.target.value })}
                      placeholder="https://... or /uploads/..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                    />
                    <label className="px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#176BFF] hover:bg-blue-100 text-xs font-medium flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "thumbnail")}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Screenshots (One image URL per line or Upload)
                  </label>
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={formState.screenshotsText}
                      onChange={(e) => setFormState({ ...formState, screenshotsText: e.target.value })}
                      placeholder="https://images.unsplash.com/...&#10;/uploads/image2.png"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF] font-mono"
                    />
                    <label className="inline-flex px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs cursor-pointer items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#176BFF]" />
                      <span>Attach screenshot file</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "screenshot")}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={formState.liveUrl}
                    onChange={(e) => setFormState({ ...formState, liveUrl: e.target.value })}
                    placeholder="https://yourproject.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    GitHub Repository URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formState.githubUrl}
                    onChange={(e) => setFormState({ ...formState, githubUrl: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Documentation URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formState.documentationUrl}
                    onChange={(e) => setFormState({ ...formState, documentationUrl: e.target.value })}
                    placeholder="https://docs.yourproject.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Video Demo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formState.videoDemoUrl}
                    onChange={(e) => setFormState({ ...formState, videoDemoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or loom.com/..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>
              </div>

              {/* =========================================================================
                  DOWNLOADABLE PROJECT FILES (OPTIONAL)
                 ========================================================================= */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                        <Download className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        Downloadable Project Files (Optional)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Upload .APK, .EXE, .MSI, .ZIP, .RAR, .PDF, .JAR, .DEB, or .APPIMAGE packages for visitors to download.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
                    Optional Feature
                  </span>
                </div>

                {editingProject ? (
                  <div className="space-y-4">
                    {/* Upload Dropzone */}
                    <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-[#176BFF] transition-all space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                          ref={projectFileInputRef}
                          type="file"
                          accept=".apk,.aab,.exe,.msi,.zip,.rar,.pdf,.jar,.deb,.appimage"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setProjectFileToUpload(f);
                              if (!fileCustomName) setFileCustomName(f.name);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => projectFileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 border border-slate-200 cursor-pointer whitespace-nowrap"
                        >
                          <Upload className="w-4 h-4 text-[#176BFF]" />
                          <span>Select Binary / Package</span>
                        </button>
                        <span className="text-xs text-slate-500 font-mono">
                          {projectFileToUpload ? (
                            <span className="font-bold text-slate-800">
                              Selected: {projectFileToUpload.name} ({(projectFileToUpload.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          ) : (
                            "No file selected yet (.apk, .exe, .zip, etc.)"
                          )}
                        </span>
                      </div>

                      {projectFileToUpload && (
                        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block uppercase font-mono mb-1">
                              Display File Name
                            </label>
                            <input
                              type="text"
                              value={fileCustomName}
                              onChange={(e) => setFileCustomName(e.target.value)}
                              placeholder="e.g. AuraOS-Setup.exe"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block uppercase font-mono mb-1">
                              Download Link Text (e.g. Download Android Application (.APK))
                            </label>
                            <input
                              type="text"
                              value={fileBtnText}
                              onChange={(e) => setFileBtnText(e.target.value)}
                              placeholder="e.g. Download Windows Application (.EXE)"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <button
                              type="button"
                              onClick={handleProjectFileUpload}
                              disabled={uploadingProjectFile}
                              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                              {uploadingProjectFile ? (
                                <span>Uploading...</span>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Attach File</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Attached files list */}
                    {editingProjectFiles.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 font-mono block">
                            Attached Project Downloads ({editingProjectFiles.length}):
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Click link text to edit &bull; Toggle status for public visibility
                          </span>
                        </div>
                        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                          {editingProjectFiles.map((file) => (
                            <div key={file.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-emerald-600 border border-slate-200 text-[10px] uppercase">
                                  {file.fileType}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800">{file.fileName}</span>
                                    <span className="text-slate-400 text-[10px]">({file.fileSizeFormatted})</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    <span>Link Text:</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateFileButtonText(file.id, file.buttonText || "")}
                                      className="text-[#176BFF] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                                      title="Click to edit link text"
                                    >
                                      <span>&ldquo;{file.buttonText || `Download ${file.fileType}`}&rdquo;</span>
                                      <Edit className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {/* Visibility Toggle: Enabled / Disabled */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleFileVisibility(file.id, file.visible)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                    file.visible
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                                  }`}
                                  title={file.visible ? "Publicly Visible - Click to disable" : "Hidden - Click to enable"}
                                >
                                  {file.visible ? (
                                    <>
                                      <Eye className="w-3 h-3 text-emerald-600" />
                                      <span>Enabled</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3 h-3 text-slate-400" />
                                      <span>Disabled</span>
                                    </>
                                  )}
                                </button>

                                <a
                                  href={`/api/downloads/${file.id}`}
                                  download
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700"
                                  title="Test Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteProjectFile(file.id)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 cursor-pointer"
                                  title="Remove File"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400 font-mono bg-white rounded-xl border border-slate-200">
                        No downloadable files attached to this project. The public download section will be cleanly hidden.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                    💡 Please save this project first. Once created, you can attach unlimited downloadable binaries (.APK, .EXE, .ZIP, etc.).
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(e) => setFormState({ ...formState, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#176BFF] focus:ring-[#176BFF]"
                  />
                  <span className="text-sm font-medium text-slate-800">Mark as Featured Showcase</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.published}
                    onChange={(e) => setFormState({ ...formState, published: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#176BFF] focus:ring-[#176BFF]"
                  />
                  <span className="text-sm font-medium text-slate-800">Published (Visible in 3D Showcase)</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  {editingProject ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
