"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, Clock, Check, AlertCircle, Send, X } from "lucide-react";
import type { Message } from "@/types";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
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

  const toggleReadStatus = async (msg: Message) => {
    try {
      const res = await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, read: !msg.read }),
      });
      if (res.ok) {
        setMessages(messages.map((m) => (m.id === msg.id ? { ...m, read: !m.read } : m)));
        if (selectedMessage?.id === msg.id) {
          setSelectedMessage({ ...selectedMessage, read: !msg.read });
        }
        showNotification("success", `Marked as ${msg.read ? "unread" : "read"}`);
      }
    } catch {
      showNotification("error", "Failed to update status");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
        showNotification("success", "Message deleted");
      }
    } catch {
      showNotification("error", "Error deleting message");
    }
  };

  const openMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      toggleReadStatus(msg);
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Inquiries & Leads</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming project opportunities, messages, and client inquiries from the portfolio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#176BFF] text-xs font-semibold">
            {unreadCount} Unread Inquiries
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === "all"
              ? "bg-[#176BFF] text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All ({messages.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === "unread"
              ? "bg-[#176BFF] text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === "read"
              ? "bg-[#176BFF] text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Read ({messages.length - unreadCount})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-sans text-xs">
          <div className="w-8 h-8 border-2 border-[#176BFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading messages...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-500 text-xs shadow-sm">
          No inquiries found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                msg.read
                  ? "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
                  : "bg-blue-50/50 border-blue-200 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.read ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-[#176BFF] border border-blue-200"
                  }`}
                >
                  {msg.read ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{msg.name}</span>
                    <span className="text-xs text-[#176BFF] font-mono">&lt;{msg.email}&gt;</span>
                    {!msg.read && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#176BFF] text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800">{msg.subject}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">{msg.message}</p>
                </div>
              </div>

              <div
                className="flex items-center gap-3 self-end md:self-center"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => toggleReadStatus(msg)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                  title={msg.read ? "Mark as unread" : "Mark as read"}
                >
                  {msg.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#176BFF]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedMessage.name}</h3>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-xs text-[#176BFF] hover:underline font-mono"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Subject
                </span>
                <h4 className="text-sm font-semibold text-slate-900 mt-0.5">{selectedMessage.subject}</h4>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Date Received
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-2">
                  Message Body
                </span>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReadStatus(selectedMessage)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Mark as {selectedMessage.read ? "Unread" : "Read"}
                  </button>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    className="px-4 py-2 rounded-xl bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
