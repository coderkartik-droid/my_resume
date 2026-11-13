import Link from "next/link";
import { ArrowLeft, Home, Compass, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F7FF] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-600/20 via-pink-600/20 to-cyan-500/20 blur-[130px] pointer-events-none" />

      <div className="max-w-xl w-full text-center space-y-8 relative z-10 p-8 sm:p-12 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl">
        {/* Error Code Hologram */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs uppercase tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>404: Coordinate Discrepancy</span>
          </div>

          <h1 className="text-7xl sm:text-9xl font-black font-mono tracking-tighter bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(135,62,255,0.4)]">
            404
          </h1>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
            Lost in the Digital Dimension
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono leading-relaxed">
            The spatial coordinate or resource you requested has transitioned into hyperspace or does not exist on this portfolio server.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-purple-600 to-cyan-500 hover:opacity-95 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-purple-900/30 transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Return to Portfolio</span>
          </Link>

          <Link
            href="/#projects"
            className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Projects</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
