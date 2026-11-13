"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, MessageSquare } from "lucide-react";
import { sound } from "@/lib/sound";

export default function FloatingQuickActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="p-3 rounded-full text-xs shadow-2xl transition-all hover:scale-115 cursor-pointer animate-in fade-in zoom-in-75 duration-200 glass-panel border border-white/15 text-sky-400 hover:text-white"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Floating Contact CTA */}
      <Link
        href="/contact"
        onClick={() => sound.playClick()}
        aria-label="Direct message Kartik"
        className="theme-btn-primary p-3.5 sm:px-5 sm:py-3.5 rounded-full text-xs font-mono font-bold flex items-center gap-2.5 shadow-[0_12px_32px_rgba(81,69,229,0.5)] transition-all hover:scale-108 cursor-pointer border border-white/20"
      >
        <MessageSquare className="w-4 h-4 text-sky-200" />
        <span className="hidden sm:inline tracking-wider">LET&apos;S TALK</span>
      </Link>
    </div>
  );
}
