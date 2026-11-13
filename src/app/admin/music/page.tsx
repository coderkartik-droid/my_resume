"use client";

import { useEffect, useState, useRef } from "react";
import {
  Music,
  Upload,
  Play,
  Pause,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Plus,
  ArrowUp,
  ArrowDown,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  Sparkles,
  Sliders,
  Radio,
  FileAudio,
  ListMusic,
  Star,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  CheckCircle2,
  Settings,
  Disc3,
  X,
  FolderSync,
} from "lucide-react";
import type { MusicTrack, MusicConfig } from "@/types";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function BackgroundMusicManager() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [config, setConfig] = useState<MusicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "settings">("library");

  // Filtering & Search
  const [selectedPlaylistFilter, setSelectedPlaylistFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Audio Preview Bar State
  const [previewTrack, setPreviewTrack] = useState<MusicTrack | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [previewVolume, setPreviewVolume] = useState(0.4);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Upload Form Modal / Tab State
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [uploadAlbum, setUploadAlbum] = useState("");
  const [uploadPlaylist, setUploadPlaylist] = useState("Default");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [uploadIsDefault, setUploadIsDefault] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Metadata Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editAlbum, setEditAlbum] = useState("");
  const [editPlaylist, setEditPlaylist] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Replace Audio File Modal State
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceTrack, setReplaceTrack] = useState<MusicTrack | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacing, setReplacing] = useState(false);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTrack, setDeletingTrack] = useState<MusicTrack | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Config Form Draft
  const [draftConfig, setDraftConfig] = useState<Partial<MusicConfig>>({});

  useEffect(() => {
    fetchMusicData();
  }, []);

  const showNotify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchMusicData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/music?all=true", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load music data");
      const data = await res.json();
      setTracks(data.tracks || []);
      setConfig(data.config || null);
      if (data.config) {
        setDraftConfig(data.config);
      }
    } catch (err: unknown) {
      console.error(err);
      showNotify("error", "Error loading background music system");
    } finally {
      setLoading(false);
    }
  };

  // Preview Audio Engine setup
  useEffect(() => {
    const audio = previewAudioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setPreviewTime(audio.currentTime);
    const onDurationChange = () => setPreviewDuration(audio.duration || 0);
    const onEnded = () => setIsPreviewPlaying(false);
    const onPause = () => setIsPreviewPlaying(false);
    const onPlay = () => setIsPreviewPlaying(true);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, []);

  const handleTogglePreview = (track: MusicTrack) => {
    const audio = previewAudioRef.current;
    if (!audio) return;

    if (previewTrack?.id === track.id) {
      if (isPreviewPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
    } else {
      setPreviewTrack(track);
      audio.src = track.audioUrl;
      audio.volume = previewVolume;
      audio.load();
      audio.play().catch(console.error);
    }
  };

  const handleStopPreview = () => {
    const audio = previewAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPreviewTrack(null);
    setIsPreviewPlaying(false);
  };

  // Quick Master Music Toggle
  const handleToggleMasterEnabled = async () => {
    if (!config) return;
    const newEnabled = !config.enabled;
    try {
      const res = await fetch("/api/music/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newEnabled }),
      });
      if (!res.ok) throw new Error("Failed to update master setting");
      const data = await res.json();
      setConfig(data.config);
      setDraftConfig((prev) => ({ ...prev, enabled: newEnabled }));
      showNotify(
        "success",
        newEnabled ? "Background Music System Activated!" : "Background Music System Deactivated (Silent)"
      );
    } catch {
      showNotify("error", "Failed to update background music status");
    }
  };

  // Quick Topbar Toggle Visibility
  const handleToggleTopbarVisibility = async () => {
    if (!config) return;
    const newShow = !config.showTopbarToggle;
    try {
      const res = await fetch("/api/music/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showTopbarToggle: newShow }),
      });
      if (!res.ok) throw new Error("Failed to update visibility");
      const data = await res.json();
      setConfig(data.config);
      setDraftConfig((prev) => ({ ...prev, showTopbarToggle: newShow }));
      showNotify(
        "success",
        newShow ? "Topbar Music Toggle is now Visible" : "Topbar Music Toggle is now Hidden"
      );
    } catch {
      showNotify("error", "Failed to update topbar button visibility");
    }
  };

  // Quick Track Enable/Disable Toggle
  const handleToggleTrackEnabled = async (track: MusicTrack) => {
    try {
      const res = await fetch(`/api/music/track/${track.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !track.enabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle track");
      const data = await res.json();
      setTracks((prev) => prev.map((t) => (t.id === track.id ? data.track : t)));
      showNotify(
        "success",
        data.track.enabled ? `"${track.title}" is now active` : `"${track.title}" disabled`
      );
    } catch {
      showNotify("error", "Failed to update track status");
    }
  };

  // Set Track as Default Song
  const handleSetDefaultTrack = async (track: MusicTrack) => {
    try {
      const res = await fetch(`/api/music/track/${track.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error("Failed to set default track");
      await fetchMusicData();
      showNotify("success", `"${track.title}" is now the default background song!`);
    } catch {
      showNotify("error", "Failed to set default song");
    }
  };

  // Reorder Songs: Move Up or Down
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;

    const newTracks = [...tracks];
    const temp = newTracks[index];
    newTracks[index] = newTracks[targetIndex];
    newTracks[targetIndex] = temp;

    // Assign new sequential order values
    const updates = newTracks.map((t, idx) => ({ id: t.id, order: idx }));
    setTracks(newTracks);

    try {
      const res = await fetch("/api/music/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updates }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      showNotify("success", "Song playback order updated");
    } catch {
      showNotify("error", "Failed to update song order");
      fetchMusicData();
    }
  };

  // Handle Audio File Upload (Single or Multiple)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      showNotify("error", "Please select at least one audio file to upload");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      uploadFiles.forEach((f) => formData.append("files", f));

      if (uploadFiles.length === 1 && uploadTitle.trim()) {
        formData.append("title", uploadTitle.trim());
      }
      if (uploadArtist.trim()) formData.append("artist", uploadArtist.trim());
      if (uploadAlbum.trim()) formData.append("album", uploadAlbum.trim());

      const chosenPlaylist =
        uploadPlaylist === "__new__" && newPlaylistName.trim()
          ? newPlaylistName.trim()
          : uploadPlaylist;
      formData.append("playlist", chosenPlaylist);
      if (uploadIsDefault) formData.append("isDefault", "true");

      const res = await fetch("/api/music/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      showNotify("success", data.message || "Songs successfully uploaded!");
      setUploadFiles([]);
      setUploadTitle("");
      setUploadArtist("");
      setUploadAlbum("");
      setNewPlaylistName("");
      setUploadIsDefault(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setActiveTab("library");
      fetchMusicData();
    } catch (err: unknown) {
      showNotify("error", err instanceof Error ? err.message : "Failed to upload audio file(s)");
    } finally {
      setUploading(false);
    }
  };

  // Handle Edit Track Metadata
  const openEditModal = (track: MusicTrack) => {
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditArtist(track.artist);
    setEditAlbum(track.album || "");
    setEditPlaylist(track.playlist || "Default");
    setEditEnabled(track.enabled);
    setEditIsDefault(track.isDefault);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;

    try {
      setSavingEdit(true);
      const res = await fetch(`/api/music/track/${editingTrack.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          artist: editArtist.trim(),
          album: editAlbum.trim() || null,
          playlist: editPlaylist.trim() || "Default",
          enabled: editEnabled,
          isDefault: editIsDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update song");

      showNotify("success", "Song details updated successfully");
      setEditModalOpen(false);
      setEditingTrack(null);
      fetchMusicData();
    } catch (err: unknown) {
      showNotify("error", err instanceof Error ? err.message : "Failed to update song");
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Replace Audio File
  const openReplaceModal = (track: MusicTrack) => {
    setReplaceTrack(track);
    setReplaceFile(null);
    setReplaceModalOpen(true);
  };

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTrack || !replaceFile) {
      showNotify("error", "Please select a replacement audio file");
      return;
    }

    try {
      setReplacing(true);
      const formData = new FormData();
      formData.append("file", replaceFile);
      formData.append("replaceId", replaceTrack.id);

      const res = await fetch("/api/music/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Replacement failed");

      showNotify("success", `Audio for "${replaceTrack.title}" replaced successfully!`);
      setReplaceModalOpen(false);
      setReplaceTrack(null);
      setReplaceFile(null);
      fetchMusicData();
    } catch (err: unknown) {
      showNotify("error", err instanceof Error ? err.message : "Failed to replace audio file");
    } finally {
      setReplacing(false);
    }
  };

  // Handle Delete Track
  const openDeleteModal = (track: MusicTrack) => {
    setDeletingTrack(track);
    setDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!deletingTrack) return;
    try {
      setDeleting(true);
      if (previewTrack?.id === deletingTrack.id) {
        handleStopPreview();
      }

      const res = await fetch(`/api/music/track/${deletingTrack.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
      showNotify("success", `Deleted song "${deletingTrack.title}"`);
      setDeleteModalOpen(false);
      setDeletingTrack(null);
      fetchMusicData();
    } catch {
      showNotify("error", "Failed to delete song");
    } finally {
      setDeleting(false);
    }
  };

  // Save Config Settings
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      const res = await fetch("/api/music/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftConfig),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save configuration");

      setConfig(data.config);
      showNotify("success", "Music configuration saved successfully!");
    } catch (err: unknown) {
      showNotify("error", err instanceof Error ? err.message : "Failed to save music settings");
    } finally {
      setSavingConfig(false);
    }
  };

  // Filtered tracks
  const distinctPlaylists = Array.from(
    new Set(tracks.map((t) => t.playlist || "Default").filter(Boolean))
  );

  const filteredTracks = tracks.filter((t) => {
    const matchesPlaylist =
      selectedPlaylistFilter === "all" || t.playlist === selectedPlaylistFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlaylist && matchesSearch;
  });

  const totalStorageBytes = tracks.reduce((sum, t) => sum + (t.fileSize || 0), 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans pb-32">
      {/* Hidden Audio element for Admin Previews */}
      <audio ref={previewAudioRef} preload="metadata" />

      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all animate-in fade-in slide-in-from-bottom-5 ${
            notification.type === "success"
              ? "bg-emerald-600 text-white border border-emerald-400"
              : "bg-rose-600 text-white border border-rose-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* =========================================================================
          MODULE HEADER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Background Music Manager
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                Curate website soundtracks, audio playlists & visitor ambient controls
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab("upload")}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Song(s)</span>
          </button>

          <button
            onClick={fetchMusicData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono transition-all cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MASTER SYSTEM BANNER
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Master Power Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Music System Master
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  config?.enabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
              />
              <span className="text-base font-extrabold text-slate-900">
                {config?.enabled ? "System Active" : "Disabled (Silent)"}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleMasterEnabled}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              config?.enabled
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 border border-slate-300 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {config?.enabled ? "Turn OFF" : "Turn ON"}
          </button>
        </div>

        {/* Topbar Toggle Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Topbar Toggle Button
            </span>
            <div className="text-base font-extrabold text-slate-900">
              {config?.showTopbarToggle ? "Visible in Topbar" : "Hidden from Topbar"}
            </div>
          </div>
          <button
            onClick={handleToggleTopbarVisibility}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              config?.showTopbarToggle
                ? "bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                : "bg-slate-100 border border-slate-300 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {config?.showTopbarToggle ? "Hide" : "Show"}
          </button>
        </div>

        {/* Total Songs & Playlists */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Library Tracks
            </span>
            <div className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>{tracks.length} Songs</span>
              <span className="text-xs font-normal text-slate-500 font-mono">
                ({tracks.filter((t) => t.enabled).length} Active)
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
            {distinctPlaylists.length} Playlists
          </span>
        </div>

        {/* Storage Size & Default Song */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Storage Usage
            </span>
            <div className="text-base font-extrabold text-slate-900">
              {formatBytes(totalStorageBytes)}
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
            Max: {config?.maxUploadSizeMb || 50} MB/song
          </span>
        </div>
      </div>

      {/* =========================================================================
          TAB NAVIGATION
          ========================================================================= */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("library")}
          className={`pb-3 px-4 font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeTab === "library"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ListMusic className="w-4 h-4" />
          <span>Song Library & Playlists ({tracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("upload")}
          className={`pb-3 px-4 font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeTab === "upload"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Audio</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeTab === "settings"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System & Playback Settings</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: SONG LIBRARY
          ========================================================================= */}
      {activeTab === "library" && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, artist or filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">Playlist:</span>
              <select
                value={selectedPlaylistFilter}
                onChange={(e) => setSelectedPlaylistFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Playlists ({tracks.length})</option>
                {distinctPlaylists.map((pl) => (
                  <option key={pl} value={pl}>
                    {pl} ({tracks.filter((t) => t.playlist === pl).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Song Table */}
          {filteredTracks.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
              <FileAudio className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No songs found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {tracks.length === 0
                  ? "Upload your first background music file (MP3, WAV, OGG, AAC, M4A) to get started."
                  : "No songs match your search or playlist filter."}
              </p>
              {tracks.length === 0 && (
                <button
                  onClick={() => setActiveTab("upload")}
                  className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono font-bold"
                >
                  Upload First Song
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">Order</th>
                      <th className="py-3 px-4 w-14 text-center">Preview</th>
                      <th className="py-3 px-4">Title & Details</th>
                      <th className="py-3 px-4">Playlist</th>
                      <th className="py-3 px-4">Format / Size</th>
                      <th className="py-3 px-4 text-center">Default</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTracks.map((track, idx) => {
                      const isPreviewingThis = previewTrack?.id === track.id && isPreviewPlaying;
                      return (
                        <tr
                          key={track.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            !track.enabled ? "opacity-60 bg-slate-50/40" : ""
                          }`}
                        >
                          {/* Order Buttons */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveOrder(idx, "up")}
                                className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-20 text-slate-600 cursor-pointer"
                                title="Move song up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono text-[11px] font-bold text-slate-500">
                                {idx + 1}
                              </span>
                              <button
                                disabled={idx === filteredTracks.length - 1}
                                onClick={() => handleMoveOrder(idx, "down")}
                                className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-20 text-slate-600 cursor-pointer"
                                title="Move song down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Preview Play/Pause button */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleTogglePreview(track)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer mx-auto ${
                                isPreviewingThis
                                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105"
                                  : "bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600"
                              }`}
                              title={isPreviewingThis ? "Pause Preview" : "Preview Track"}
                            >
                              {isPreviewingThis ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>
                          </td>

                          {/* Title & Artist */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{track.title}</span>
                              {track.isDefault && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono font-bold">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 font-mono text-[11px] mt-0.5 flex items-center gap-2">
                              <span>{track.artist || "Unknown Artist"}</span>
                              {track.album && (
                                <>
                                  <span>·</span>
                                  <span className="text-slate-400">{track.album}</span>
                                </>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-xs">
                              {track.fileName}
                            </div>
                          </td>

                          {/* Playlist */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-[11px] font-semibold border border-indigo-100">
                              <ListMusic className="w-3 h-3" />
                              <span>{track.playlist || "Default"}</span>
                            </span>
                          </td>

                          {/* Format / Duration / Size */}
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className="uppercase text-slate-800">
                                {track.fileName.split(".").pop() || "audio"}
                              </span>
                              <span>·</span>
                              <span>{formatDuration(track.duration)}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatBytes(track.fileSize)}
                            </div>
                          </td>

                          {/* Default Song Action */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleSetDefaultTrack(track)}
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                track.isDefault
                                  ? "text-amber-500 hover:text-amber-600 bg-amber-50"
                                  : "text-slate-300 hover:text-amber-400 hover:bg-slate-100"
                              }`}
                              title={track.isDefault ? "Current Default Song" : "Set as Default Song"}
                            >
                              <Star
                                className={`w-5 h-5 ${track.isDefault ? "fill-current" : ""}`}
                              />
                            </button>
                          </td>

                          {/* Enabled / Disabled Toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleTrackEnabled(track)}
                              className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold transition-all cursor-pointer ${
                                track.enabled
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {track.enabled ? "Active" : "Disabled"}
                            </button>
                          </td>

                          {/* Actions: Edit, Replace, Delete */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(track)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                title="Edit Title & Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => openReplaceModal(track)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-indigo-600 transition-colors cursor-pointer"
                                title="Replace Audio File"
                              >
                                <FolderSync className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => openDeleteModal(track)}
                                className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                                title="Delete Song"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: UPLOAD AUDIO CENTER
          ========================================================================= */}
      {activeTab === "upload" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900">Upload Background Audio</h2>
            <p className="text-xs text-slate-500 font-mono">
              Upload MP3, WAV, OGG, AAC or M4A audio. Multiple files can be selected simultaneously.
            </p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            {/* Drag & Drop File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-3xl p-8 text-center transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/ogg,audio/aac,audio/m4a,audio/mp4,audio/flac,.mp3,.wav,.ogg,.aac,.m4a,.flac"
                onChange={(e) => {
                  if (e.target.files) {
                    setUploadFiles(Array.from(e.target.files));
                  }
                }}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>

              {uploadFiles.length > 0 ? (
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 text-sm block">
                    {uploadFiles.length} file{uploadFiles.length > 1 ? "s" : ""} selected:
                  </span>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadFiles.map((f, i) => (
                      <div
                        key={i}
                        className="text-xs font-mono text-indigo-700 bg-white/70 py-1 px-3 rounded-lg inline-block mx-1 shadow-xs"
                      >
                        {f.name} ({formatBytes(f.size)})
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">Click to choose different files</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Drop audio files here or click to browse
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Supported formats: MP3, WAV, OGG, AAC, M4A, FLAC
                  </p>
                  <p className="text-[10px] text-indigo-600 font-mono">
                    Max size: {config?.maxUploadSizeMb || 50} MB per file
                  </p>
                </div>
              )}
            </div>

            {/* Metadata Fields (Optional or for single file) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Song Title {uploadFiles.length > 1 && "(Applies only to single file)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Neon Horizon"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  disabled={uploadFiles.length > 1}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                />
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  Leave blank to auto-generate from file name
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Artist Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kartik Khajuria"
                  value={uploadArtist}
                  onChange={(e) => setUploadArtist(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Album / Collection</label>
                <input
                  type="text"
                  placeholder="e.g. Portfolio Ambience"
                  value={uploadAlbum}
                  onChange={(e) => setUploadAlbum(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Playlist Category</label>
                <select
                  value={uploadPlaylist}
                  onChange={(e) => setUploadPlaylist(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Default">Default</option>
                  {distinctPlaylists
                    .filter((p) => p !== "Default")
                    .map((pl) => (
                      <option key={pl} value={pl}>
                        {pl}
                      </option>
                    ))}
                  <option value="__new__">+ Create New Playlist...</option>
                </select>

                {uploadPlaylist === "__new__" && (
                  <input
                    type="text"
                    placeholder="Enter new playlist name..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-mono text-indigo-900 focus:outline-none"
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* Checkbox: Make Default Song */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="uploadDefault"
                checked={uploadIsDefault}
                onChange={(e) => setUploadIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
              <label htmlFor="uploadDefault" className="text-xs font-bold text-slate-700 cursor-pointer">
                Set as Default Background Song for new visitors
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setUploadFiles([]);
                  setActiveTab("library");
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold font-mono hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || uploadFiles.length === 0}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Song(s)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SYSTEM CONFIGURATION SETTINGS
          ========================================================================= */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-4xl space-y-8">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Background Music Settings</h2>
            <p className="text-xs text-slate-500 font-mono">
              Configure visitor playback policies, default song selection, audio volume and navigation button aesthetics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Master System Active */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Enable Background Music System
                </label>
                <input
                  type="checkbox"
                  checked={draftConfig.enabled ?? true}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                When disabled, all website audio playback is silenced immediately and the music player remains silent.
              </p>
            </div>

            {/* Show Topbar Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Show Topbar Music Toggle
                </label>
                <input
                  type="checkbox"
                  checked={draftConfig.showTopbarToggle ?? true}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({ ...prev, showTopbarToggle: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                Display the animated music player toggle button in the navigation bar for visitors.
              </p>
            </div>

            {/* Default Song Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Default Song
              </label>
              <select
                value={draftConfig.defaultTrackId || ""}
                onChange={(e) =>
                  setDraftConfig((prev) => ({ ...prev, defaultTrackId: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Auto (First active song)</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} - {t.artist} ({t.playlist})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 font-mono block">
                Song selected first when visitor starts background music
              </span>
            </div>

            {/* Default Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Default Volume</span>
                <span className="font-mono text-indigo-600">
                  {Math.round((draftConfig.defaultVolume ?? 0.35) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={draftConfig.defaultVolume ?? 0.35}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    defaultVolume: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[10px] text-slate-400 font-mono block">
                Recommended volume for background ambience: 30% - 40%
              </span>
            </div>

            {/* Autoplay Attempt Policy */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Autoplay Attempt (Browser-Compliant)
                </label>
                <input
                  type="checkbox"
                  checked={draftConfig.autoplayAttempt ?? false}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      autoplayAttempt: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                Respects modern browser security policies: attempts audio playback only upon first visitor gesture or interaction without throwing unhandled exceptions.
              </p>
            </div>

            {/* Playback Mode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Default Playback Mode
              </label>
              <select
                value={draftConfig.playbackMode || "playlist"}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    playbackMode: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="playlist">Sequential Playlist</option>
                <option value="single">Single Track Loop</option>
                <option value="shuffle">Shuffle Random</option>
              </select>
              <span className="text-[10px] text-slate-400 font-mono block">
                How songs transition once the active track ends
              </span>
            </div>

            {/* Active Playlist Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Active Website Playlist
              </label>
              <select
                value={draftConfig.activePlaylist || "all"}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    activePlaylist: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Available Songs</option>
                {distinctPlaylists.map((pl) => (
                  <option key={pl} value={pl}>
                    {pl}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 font-mono block">
                Which playlist is served to website visitors
              </span>
            </div>

            {/* Music Button Style */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Music Button Style
              </label>
              <select
                value={draftConfig.buttonStyle || "equalizer"}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    buttonStyle: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="equalizer">Animated Equalizer Bars</option>
                <option value="vinyl">Rotating Holographic Vinyl Disc</option>
                <option value="compact">Minimal Compact Icon</option>
              </select>
            </div>

            {/* Music Button Position */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Button Position
              </label>
              <select
                value={draftConfig.buttonPosition || "topbar-right"}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    buttonPosition: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="topbar-right">Top Navigation Bar (Right)</option>
                <option value="floating-bottom-right">Floating Quick Action (Bottom-Right)</option>
              </select>
            </div>

            {/* Max Upload Size Limit (MB) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Max Upload Size Limit (MB)
              </label>
              <input
                type="number"
                min={5}
                max={250}
                value={draftConfig.maxUploadSizeMb ?? 50}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    maxUploadSizeMb: parseInt(e.target.value) || 50,
                  }))
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 font-mono block">
                Enforced server-side during song uploads (default: 50MB)
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {savingConfig ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Music Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          STICKY PREVIEW DOCK (Dedicated Admin Sound Previewer)
          ========================================================================= */}
      {previewTrack && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-slate-900/95 text-white border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <FileAudio className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                Admin Preview
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {previewTrack.playlist}
              </span>
            </div>
            <h4 className="font-bold text-xs truncate mt-0.5">{previewTrack.title}</h4>
            <p className="text-[10px] font-mono text-slate-400 truncate">
              {previewTrack.artist} · {formatDuration(previewTime)} / {formatDuration(previewDuration)}
            </p>
          </div>

          {/* Scrub Bar */}
          <div className="hidden sm:block flex-1 max-w-xs">
            <input
              type="range"
              min={0}
              max={previewDuration || 100}
              step={0.1}
              value={previewTime}
              onChange={(e) => {
                if (previewAudioRef.current) {
                  previewAudioRef.current.currentTime = parseFloat(e.target.value);
                  setPreviewTime(parseFloat(e.target.value));
                }
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleTogglePreview(previewTrack)}
              className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shadow hover:scale-105 transition-transform cursor-pointer"
            >
              {isPreviewPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleStopPreview}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Stop Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: EDIT SONG DETAILS
          ========================================================================= */}
      {editModalOpen && editingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Edit Song Metadata</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Song Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Artist Name</label>
                <input
                  type="text"
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Album Name</label>
                <input
                  type="text"
                  value={editAlbum}
                  onChange={(e) => setEditAlbum(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Playlist</label>
                <input
                  type="text"
                  value={editPlaylist}
                  onChange={(e) => setEditPlaylist(e.target.value)}
                  placeholder="e.g. Chill Ambient"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editEnabled}
                    onChange={(e) => setEditEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                  />
                  <span>Active in Playlist</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsDefault}
                    onChange={(e) => setEditIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                  />
                  <span>Set as Default</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: REPLACE AUDIO FILE
          ========================================================================= */}
      {replaceModalOpen && replaceTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Replace Audio File</h3>
                <p className="text-xs text-slate-500 font-mono truncate max-w-xs mt-0.5">
                  Replacing for: {replaceTrack.title}
                </p>
              </div>
              <button
                onClick={() => setReplaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div
                onClick={() => replaceFileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/ogg,audio/aac,audio/m4a,audio/mp4,audio/flac,.mp3,.wav,.ogg,.aac,.m4a,.flac"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReplaceFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <FolderSync className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                {replaceFile ? (
                  <div className="text-xs font-mono font-bold text-indigo-700">
                    Selected: {replaceFile.name} ({formatBytes(replaceFile.size)})
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-xs text-slate-700 block">
                      Choose replacement audio file
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      MP3, WAV, OGG, AAC or M4A
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 font-mono leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800">
                Notice: The existing audio file will be safely replaced on disk. Song title, artist, playlist, and order will be preserved.
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReplaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replacing || !replaceFile}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {replacing ? "Replacing..." : "Confirm Replacement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: DELETE CONFIRMATION
          ========================================================================= */}
      {deleteModalOpen && deletingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Delete Song?</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Are you sure you want to permanently delete &quot;{deletingTrack.title}&quot;?
              </p>
            </div>

            <div className="pt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
