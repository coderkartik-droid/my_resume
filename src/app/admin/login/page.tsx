"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle, Sparkles, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid username or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1B] text-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Silicon Valley Midnight Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5145E5]/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#38BDF8]/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#A78BFA]/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="glass-panel border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Top Liquid Gradient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5145E5] via-[#38BDF8] to-[#A78BFA]" />

          <div className="flex flex-col items-center mb-8 text-center pt-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5145E5] via-[#38BDF8] to-[#A78BFA] p-[2px] shadow-lg shadow-indigo-950/40 mb-4">
              <div className="w-full h-full bg-[#080D1B] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-sky-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold font-heading tracking-tight text-white flex items-center gap-2">
              <span>Command Core Portal</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Silicon Valley Administration</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="KARTIK"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Security Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl">
              <p className="text-[11px] text-indigo-300 leading-relaxed font-mono">
                <strong className="text-white">Security Verification:</strong> Enter your registered administrator credentials. Session protected by cryptographic HttpOnly cookies.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="theme-btn-primary w-full py-3.5 px-4 rounded-xl text-white text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/40 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>AUTHENTICATE SESSION</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <a
              href="/"
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              ← Return to Public Experience
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
