"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Save,
  Eye,
  AlertCircle,
  Check,
  RotateCcw,
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Link2,
  Minus,
  Eraser,
  Code2,
  Pencil,
  History,
  Undo2,
  ExternalLink,
  Loader2,
  Trash2,
  FileText,
} from "lucide-react";
import { sanitizeRichText, richTextToPlainText } from "@/lib/sanitize";

interface PolicyRevision {
  id: string;
  title: string;
  content: string;
  version: number;
  savedBy: string | null;
  timestamp: string;
}

interface PolicyApiResponse {
  id?: string;
  title?: string;
  summary?: string | null;
  isPublished?: boolean;
  hasPublishedContent?: boolean;
  version?: number;
  content?: string;
  publishedContent?: string;
  draftContent?: string;
  hasDraft?: boolean;
  lastEditedBy?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  revisions?: PolicyRevision[];
  error?: string;
}

type ViewMode = "editor" | "source" | "preview";

const DEFAULT_TEMPLATE = `<h2>Introduction</h2>
<p>This Privacy Policy explains how this website collects, uses and protects any information that you provide while browsing or contacting me.</p>
<h2>Information I Collect</h2>
<ul>
  <li>Contact details you submit voluntarily through the contact form, such as your name, email address and message.</li>
  <li>Anonymous analytics data such as pages visited and device type, used solely to improve the website.</li>
</ul>
<h2>How I Use Your Information</h2>
<p>Any information collected is used only to respond to your enquiry, improve the website experience and maintain security. Your data is never sold or rented to third parties.</p>
<h2>Data Retention &amp; Security</h2>
<p>Reasonable technical and organisational measures are applied to safeguard your information. Submitted data is retained only for as long as necessary to fulfil the purpose for which it was collected.</p>
<h2>Your Rights</h2>
<p>You may request access to, correction of, or deletion of your personal data at any time by reaching out via the contact page.</p>
<h2>Changes To This Policy</h2>
<p>This policy may be updated periodically. The "last updated" date at the top of this page reflects the most recent revision.</p>`;

export default function AdminPrivacyPolicyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [rollingBack, setRollingBack] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [title, setTitle] = useState("Privacy Policy");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);

  const [meta, setMeta] = useState({
    isPublished: false,
    hasPublishedContent: false,
    hasDraft: false,
    version: 0,
    lastEditedBy: null as string | null,
    publishedAt: null as string | null,
    updatedAt: null as string | null,
  });
  const [revisions, setRevisions] = useState<PolicyRevision[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [syncKey, setSyncKey] = useState(0);

  const editorRef = useRef<HTMLDivElement | null>(null);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const applyResponse = useCallback((data: PolicyApiResponse) => {
    setTitle(data.title || "Privacy Policy");
    setSummary(data.summary || "");
    setContent(data.content || "");
    setMeta({
      isPublished: !!data.isPublished,
      hasPublishedContent: !!data.hasPublishedContent,
      hasDraft: !!data.hasDraft,
      version: data.version ?? 0,
      lastEditedBy: data.lastEditedBy ?? null,
      publishedAt: data.publishedAt ?? null,
      updatedAt: data.updatedAt ?? null,
    });
    setRevisions(Array.isArray(data.revisions) ? data.revisions : []);
    setDirty(false);
    setSyncKey((k) => k + 1);
  }, []);

  const loadPolicy = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/privacy-policy", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load policy");
      const data: PolicyApiResponse = await res.json();
      applyResponse(data);
    } catch {
      showNotification("error", "Unable to load the Privacy Policy document.");
    } finally {
      setLoading(false);
    }
  }, [applyResponse, showNotification]);

  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  // Push content into the contentEditable element only on explicit syncs
  // (initial load, discard, rollback, mode switch) to preserve the caret.
  useEffect(() => {
    if (viewMode === "editor" && editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncKey, viewMode, loading]);

  const syncFromEditor = useCallback(() => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setDirty(true);
    }
  }, []);

  const runCommand = useCallback(
    (command: string, value?: string) => {
      if (viewMode !== "editor" || !editorRef.current) return;
      editorRef.current.focus();
      document.execCommand(command, false, value);
      syncFromEditor();
    },
    [viewMode, syncFromEditor]
  );

  const handleInsertLink = useCallback(() => {
    const url = window.prompt("Enter the destination URL (https://… , mailto: or a relative path):");
    if (!url) return;
    runCommand("createLink", url.trim());
  }, [runCommand]);

  const postAction = useCallback(
    async (
      action: "save-draft" | "publish" | "discard-draft" | "rollback",
      extra?: Record<string, unknown>
    ) => {
      const res = await fetch("/api/privacy-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, title, summary, content, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      return data as { message?: string } & PolicyApiResponse;
    },
    [title, summary, content]
  );

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const data = await postAction("save-draft");
      showNotification("success", data.message || "Draft saved.");
      setDirty(false);
      setMeta((m) => ({ ...m, hasDraft: true }));
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const data = await postAction("publish");
      showNotification("success", data.message || "Privacy Policy published live.");
      await loadPolicy();
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to publish policy.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscardDraft = async () => {
    if (!window.confirm("Discard the current draft and restore the published content?")) return;
    try {
      await postAction("discard-draft");
      showNotification("success", "Draft discarded. Editor restored to published content.");
      await loadPolicy();
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to discard draft.");
    }
  };

  const handleRollback = async (revisionId: string) => {
    if (!window.confirm("Restore this revision and publish it live?")) return;
    try {
      setRollingBack(revisionId);
      const data = await postAction("rollback", { revisionId });
      showNotification("success", data.message || "Revision restored.");
      await loadPolicy();
    } catch (err) {
      showNotification("error", err instanceof Error ? err.message : "Failed to restore revision.");
    } finally {
      setRollingBack(null);
    }
  };

  const stats = useMemo(() => {
    const plain = richTextToPlainText(content);
    const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    return { words, characters: plain.length };
  }, [content]);

  const safePreview = useMemo(() => sanitizeRichText(content), [content]);

  const publishedLabel = meta.publishedAt
    ? new Date(meta.publishedAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const toolbarButtons: {
    label: string;
    icon: typeof Bold;
    command: string;
    value?: string;
    action?: () => void;
  }[] = [
    { label: "Heading 2", icon: Heading2, command: "formatBlock", value: "<h2>" },
    { label: "Heading 3", icon: Heading3, command: "formatBlock", value: "<h3>" },
    { label: "Paragraph", icon: Pilcrow, command: "formatBlock", value: "<p>" },
    { label: "Bold", icon: Bold, command: "bold" },
    { label: "Italic", icon: Italic, command: "italic" },
    { label: "Underline", icon: Underline, command: "underline" },
    { label: "Bulleted list", icon: List, command: "insertUnorderedList" },
    { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
    { label: "Quote", icon: Quote, command: "formatBlock", value: "<blockquote>" },
    { label: "Insert link", icon: Link2, command: "", action: handleInsertLink },
    { label: "Divider", icon: Minus, command: "insertHorizontalRule" },
    { label: "Clear formatting", icon: Eraser, command: "removeFormat" },
  ];

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
          {notification.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-xs font-semibold max-w-sm">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Author, save as draft and publish the public Privacy Policy page — no code changes required.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Page</span>
          </Link>

          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing || loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving…" : "Save Draft"}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={saving || publishing || loading}
            className="px-4 py-2 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{publishing ? "Publishing…" : "Publish Live"}</span>
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Status</div>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                meta.hasPublishedContent ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="text-sm font-bold text-slate-900">
              {meta.hasPublishedContent ? "Published" : "Not published"}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Version</div>
          <div className="mt-1.5 text-sm font-bold text-slate-900 font-mono">v{meta.version || 0}</div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Editor State</div>
          <div className="mt-1.5 text-sm font-bold text-slate-900">
            {dirty ? "Unsaved changes" : meta.hasDraft ? "Draft saved" : "In sync"}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Last Published</div>
          <div className="mt-1.5 text-xs font-semibold text-slate-700">
            {publishedLabel || "—"}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading Privacy Policy document…
        </div>
      ) : (
        <>
          {/* Document metadata */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Document Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">Policy Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setDirty(true);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-mono">
                  Summary / Meta Description
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="Short description shown under the page title and used for SEO."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Content Editor</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {stats.words} words · {stats.characters.toLocaleString()} chars
                </span>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
                {(
                  [
                    { mode: "editor", label: "Rich Text", icon: Pencil },
                    { mode: "source", label: "HTML", icon: Code2 },
                    { mode: "preview", label: "Preview", icon: Eye },
                  ] as { mode: ViewMode; label: string; icon: typeof Pencil }[]
                ).map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => {
                      if (mode === "editor") syncFromEditor();
                      setViewMode(mode);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                      viewMode === mode
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {viewMode === "editor" && (
              <div className="flex flex-wrap items-center gap-1 p-3 border-b border-slate-100 bg-slate-50/60 sticky top-0 z-10">
                {toolbarButtons.map((btn, idx) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={`${btn.label}-${idx}`}
                      type="button"
                      title={btn.label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => (btn.action ? btn.action() : runCommand(btn.command, btn.value))}
                      className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <button
                  type="button"
                  title="Undo"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => runCommand("undo")}
                  className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Insert starter template"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (content.trim() && !window.confirm("Replace the current content with the starter template?")) return;
                    setContent(DEFAULT_TEMPLATE);
                    setDirty(true);
                    setSyncKey((k) => k + 1);
                  }}
                  className="ml-auto px-3 py-1.5 rounded-lg text-[11px] font-semibold text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                >
                  Insert Template
                </button>
              </div>
            )}

            <div className="p-5">
              {viewMode === "editor" && (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncFromEditor}
                  onBlur={syncFromEditor}
                  data-placeholder="Write the privacy policy…"
                  className="min-h-[420px] rounded-xl border border-slate-200 p-5 text-sm leading-relaxed text-slate-800 focus:outline-none focus:border-indigo-500 policy-content policy-content--admin"
                />
              )}

              {viewMode === "source" && (
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setDirty(true);
                  }}
                  spellCheck={false}
                  className="w-full min-h-[420px] rounded-xl border border-slate-200 p-5 text-xs font-mono leading-relaxed text-slate-800 focus:outline-none focus:border-indigo-500 resize-y"
                  placeholder="<h2>Introduction</h2><p>…</p>"
                />
              )}

              {viewMode === "preview" && (
                <div className="rounded-xl border border-slate-200 p-5 bg-[#0B1020]">
                  <div
                    className="policy-content"
                    dangerouslySetInnerHTML={{ __html: safePreview }}
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Content is sanitised on save and on render — scripts, inline handlers and unsafe URLs are stripped automatically.
                </span>
              </p>
              {meta.hasDraft && (
                <button
                  onClick={handleDiscardDraft}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 self-start cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Discard draft</span>
                </button>
              )}
            </div>
          </div>

          {/* Revisions */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Published Revisions ({revisions.length})</h3>
              <span className="text-[11px] text-slate-400 font-mono ml-auto">
                Restoring a revision publishes it live
              </span>
            </div>

            {revisions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                No previous revisions yet. Each publish preserves the prior version here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-600">v{rev.version}</span>
                        <span className="text-xs font-semibold text-slate-800 truncate">{rev.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(rev.timestamp).toLocaleString("en-GB")}
                        {rev.savedBy ? ` · ${rev.savedBy}` : ""}
                        {" · "}
                        {richTextToPlainText(rev.content).slice(0, 70)}
                        {richTextToPlainText(rev.content).length > 70 ? "…" : ""}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRollback(rev.id)}
                      disabled={rollingBack === rev.id}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 disabled:opacity-50 self-start cursor-pointer"
                    >
                      {rollingBack === rev.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>Restore</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
