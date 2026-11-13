"use client";

import { useEffect, useState, useRef } from "react";
import {
  FolderKanban,
  Upload,
  Download,
  Trash2,
  Check,
  AlertCircle,
  FileText,
  Smartphone,
  Monitor,
  Archive,
  Package,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
  ShieldCheck,
  Layers,
  HardDrive,
  BarChart2,
} from "lucide-react";
import type { Project, ProjectFile } from "@/types";

export default function ProjectFilesManager() {
  const [files, setFiles] = useState<(ProjectFile & { project?: { id: string; title: string; slug: string } })[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Upload Form Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState("");
  const [customFileName, setCustomFileName] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [fileVersion, setFileVersion] = useState("v1.0.0");
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [filesRes, projectsRes] = await Promise.all([
        fetch("/api/project-files"),
        fetch("/api/projects?all=true"),
      ]);

      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setFiles(filesData);
      }
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        if (projectsData.length > 0 && !uploadProjectId) {
          setUploadProjectId(projectsData[0].id);
        }
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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) {
      showNotification("error", "Please select a valid file to upload");
      return;
    }
    if (!uploadProjectId) {
      showNotification("error", "Please select an associated project");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedUploadFile);
      formData.append("projectId", uploadProjectId);
      if (customFileName.trim()) formData.append("fileName", customFileName.trim());
      if (fileDescription.trim()) formData.append("fileDescription", fileDescription.trim());
      if (buttonText.trim()) formData.append("buttonText", buttonText.trim());
      if (fileVersion.trim()) formData.append("version", fileVersion.trim());

      const res = await fetch("/api/project-files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      showNotification("success", `File "${data.fileName}" uploaded securely!`);
      setUploadModalOpen(false);
      setSelectedUploadFile(null);
      setCustomFileName("");
      setFileDescription("");
      setButtonText("");
      setFileVersion("v1.0.0");
      fetchInitialData();
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const toggleVisibility = async (file: ProjectFile) => {
    try {
      const res = await fetch("/api/project-files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: file.id, visible: !file.visible }),
      });
      if (res.ok) {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, visible: !f.visible } : f))
        );
        showNotification("success", `File visibility updated`);
      }
    } catch {
      showNotification("error", "Failed to update visibility");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete downloadable file "${name}"?`)) return;
    try {
      const res = await fetch(`/api/project-files?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        showNotification("success", "File removed from storage & database");
      } else {
        showNotification("error", "Failed to delete file");
      }
    } catch {
      showNotification("error", "Error deleting file");
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "APK":
      case "AAB":
        return <Smartphone className="w-5 h-5 text-emerald-500" />;
      case "EXE":
      case "MSI":
        return <Monitor className="w-5 h-5 text-blue-500" />;
      case "ZIP":
      case "RAR":
        return <Archive className="w-5 h-5 text-amber-500" />;
      case "PDF":
        return <FileText className="w-5 h-5 text-rose-500" />;
      default:
        return <Package className="w-5 h-5 text-cyan-500" />;
    }
  };

  // Metrics
  const totalDownloads = files.reduce((acc, f) => acc + (f.downloadCount || 0), 0);
  const totalBytes = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
  const totalMegabytes = (totalBytes / (1024 * 1024)).toFixed(1);
  const projectsWithDownloads = new Set(files.map((f) => f.projectId)).size;

  const filteredFiles = files.filter((f) => {
    const matchesProject = selectedProjectId === "all" || f.projectId === selectedProjectId;
    const matchesSearch =
      searchQuery.trim() === "" ||
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.fileType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.project?.title && f.project.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProject && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
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
              <HardDrive className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project File &amp; Asset Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Securely upload, organize, and monitor downloadable binaries (.APK, .EXE, .MSI, .ZIP, .RAR, .PDF, .JAR, .DEB).
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-105"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Project Asset</span>
        </button>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL ASSETS</span>
            <Package className="w-4 h-4 text-[#176BFF]" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{files.length}</div>
          <div className="text-[11px] text-slate-500">Across {projectsWithDownloads} portfolio projects</div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL DOWNLOADS</span>
            <BarChart2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalDownloads}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Logged &amp; tracked securely</div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>STORAGE CONSUMED</span>
            <HardDrive className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalMegabytes} MB</div>
          <div className="text-[11px] text-slate-500">Stored outside public web root</div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>SUPPORTED FORMATS</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xs font-mono font-bold text-slate-700 mt-2 flex flex-wrap gap-1">
            {["APK", "EXE", "MSI", "ZIP", "PDF", "JAR"].map((fmt) => (
              <span key={fmt} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px]">
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-mono border border-slate-200 bg-slate-50 focus:outline-none"
          >
            <option value="all">All Projects ({files.length})</option>
            {projects.map((p) => {
              const count = files.filter((f) => f.projectId === p.id).length;
              return (
                <option key={p.id} value={p.id}>
                  {p.title} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file name, format, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-mono border border-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Files Table / List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">
            Loading downloadable assets...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#176BFF] flex items-center justify-center mx-auto">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Downloadable Assets Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No downloadable files have been attached yet. Click &quot;Upload Project Asset&quot; to attach an APK, EXE, or ZIP package to any portfolio project.
              </p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold shadow-sm"
            >
              Upload First Asset
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Asset</th>
                  <th className="py-3 px-5">Associated Project</th>
                  <th className="py-3 px-5">Format &amp; Size</th>
                  <th className="py-3 px-5">Downloads</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {filteredFiles.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
                          {getFileIcon(f.fileType)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{f.fileName}</div>
                          <div className="text-[11px] text-[#176BFF] font-semibold mt-0.5">
                            Link Text: &ldquo;{f.buttonText || `Download ${f.fileType}`}&rdquo;
                          </div>
                          {f.fileDescription ? (
                            <div className="text-[11px] text-slate-500 line-clamp-1">{f.fileDescription}</div>
                          ) : (
                            <div className="text-[10px] text-slate-400">No description</div>
                          )}
                          {f.version && (
                            <span className="text-[10px] text-indigo-600 font-semibold">{f.version}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-800">{f.project?.title || "Unknown Project"}</div>
                      <span className="text-[10px] text-slate-400">ID: {f.projectId.slice(0, 8)}...</span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                        <span>{f.fileType}</span>
                        <span>&bull;</span>
                        <span>{f.fileSizeFormatted}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-800 text-sm">{f.downloadCount || 0}</div>
                      <span className="text-[10px] text-slate-400">Authorized requests</span>
                    </td>

                    <td className="py-4 px-5">
                      <button
                        onClick={() => toggleVisibility(f)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          f.visible
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {f.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{f.visible ? "Public" : "Hidden"}</span>
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/downloads/${f.id}`}
                          download
                          className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors"
                          title="Test Direct Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => handleDelete(f.id, f.fileName)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#176BFF]" />
                <h3 className="text-lg font-bold text-slate-900">Upload Project Asset</h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">
                  Select Associated Project *
                </label>
                <select
                  value={uploadProjectId}
                  onChange={(e) => setUploadProjectId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayNumber} &bull; {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Dropzone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">
                  File (.APK, .EXE, .MSI, .ZIP, .RAR, .PDF, .JAR, .DEB, .APPIMAGE) *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#176BFF] text-center cursor-pointer transition-all bg-slate-50 hover:bg-blue-50/30"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".apk,.aab,.exe,.msi,.zip,.rar,.pdf,.jar,.deb,.appimage"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setSelectedUploadFile(f);
                        if (!customFileName) setCustomFileName(f.name);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#176BFF] flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  {selectedUploadFile ? (
                    <div>
                      <span className="text-xs font-bold text-slate-900 font-mono block">
                        {selectedUploadFile.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for upload
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">
                        Click to select or drag and drop file here
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Max file size: 150 MB &bull; Validated MIME types
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. AuraOS-Installer-x64.exe"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">Version Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. v1.2.0"
                    value={fileVersion}
                    onChange={(e) => setFileVersion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">
                    Download Link Text (e.g. Download Android Application (.APK))
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Download Windows Application (.EXE)"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">Description / Architecture</label>
                  <input
                    type="text"
                    placeholder="e.g. Windows 64-bit Standalone Executable"
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading || !selectedUploadFile}
                  className="px-5 py-2 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Encrypting &amp; Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Asset</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
