"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX, Menu, X, ArrowUpRight } from "lucide-react";
import { sound } from "@/lib/sound";
import { useTheme } from "@/context/ThemeContext";
import BackgroundMusicPlayer from "@/components/ui/BackgroundMusicPlayer";
import { PRIMARY_NAV_LINKS } from "@/lib/navigation";

interface NavbarProps {
  brandName?: string;
}

export default function Navbar({ brandName = "Kartik Khajuria" }: NavbarProps) {
  const { currentTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [audioActive, setAudioActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setAudioActive(sound.isEnabled());

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress(totalScroll > 0 ? (currentScroll / totalScroll) * 100 : 0);
      setScrolled(currentScroll > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const toggleSound = () => {
    const newState = sound.toggle();
    setAudioActive(newState);
  };

  const navLinks = PRIMARY_NAV_LINKS.map((link) => ({ ...link, id: link.href }));

  return (
    <>
      {/* Top Laser Progress Rail */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/[0.04] z-50 pointer-events-none">
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${scrollProgress}%`,
            background: "linear-gradient(90deg, #5145E5 0%, #38BDF8 60%, #A78BFA 100%)",
            boxShadow: "0 0 12px rgba(56, 189, 248, 0.6)",
          }}
        />
      </div>

      {/* Floating Spatial Pill Navigation Dock */}
      <header
        className={`fixed top-4 inset-x-0 mx-auto max-w-[1380px] px-4 sm:px-6 z-40 transition-all duration-300 ${
          scrolled ? "py-1" : "py-2"
        }`}
      >
        <div
          className="glass-panel flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full relative shadow-[0_24px_50px_-10px_rgba(0,0,0,0.85)] border border-white/10"
        >
          {/* Brand Monogram & Name */}
          <Link
            href="/"
            onMouseEnter={() => sound.playHover()}
            onClick={() => sound.playClick()}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-black text-xs text-white shadow-xl transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #5145E5 0%, #38BDF8 100%)",
                  boxShadow: "0 0 20px rgba(81, 69, 229, 0.4)",
                }}
              >
                {brandName.charAt(0)}
              </div>
              <div className="absolute inset-0 rounded-full border border-sky-400/40 animate-ping opacity-30 pointer-events-none" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  {brandName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" title="Available for work" />
              </div>
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold flex items-center gap-1">
                <span className="text-sky-400">Creative Technologist</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.06] backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] tracking-wider transition-all duration-200 relative ${
                    isActive
                      ? "font-bold text-white shadow-lg shadow-indigo-950/40"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                  }`}
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(135deg, rgba(81, 69, 229, 0.35) 0%, rgba(56, 189, 248, 0.35) 100%)",
                          borderColor: "rgba(56, 189, 248, 0.4)",
                          borderWidth: "1px",
                          boxShadow: "0 0 16px rgba(56, 189, 248, 0.2)",
                        }
                      : {}
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Ambient Background Music Controller */}
            <BackgroundMusicPlayer embeddedInNavbar />

            {/* UI Audio SFX Toggle */}
            <button
              onClick={toggleSound}
              aria-label="Toggle UI Sound Effects"
              className="p-2 sm:p-2.5 rounded-full border border-white/10 hover:border-white/25 text-xs transition-all cursor-pointer bg-white/[0.04] hover:bg-white/[0.08]"
              title={audioActive ? "Mute interactive UI audio effects" : "Enable interactive UI audio effects"}
            >
              {audioActive ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Quick Contact CTA Button */}
            <Link
              href="/contact"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider text-white bg-gradient-to-r from-[#5145E5] via-[#4338CA] to-[#38BDF8] shadow-lg shadow-indigo-900/30 hover:scale-105 transition-all duration-200 border border-white/15 cursor-pointer"
            >
              <span>CONNECT</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-200" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full border border-white/10 hover:border-white/30 transition-all cursor-pointer bg-white/[0.04]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden mt-2 p-5 rounded-3xl border border-white/10 bg-[#080D1B]/95 backdrop-blur-2xl shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.href);
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => {
                      sound.playClick();
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-2xl font-mono text-xs tracking-wider transition-all text-center ${
                      isActive
                        ? "font-bold text-white shadow-md bg-gradient-to-r from-indigo-600/40 to-sky-600/40 border border-sky-400/40"
                        : "text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <BackgroundMusicPlayer embeddedInNavbar />
              <button
                onClick={toggleSound}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                {audioActive ? "SFX: ACTIVE" : "SFX: MUTED"}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
