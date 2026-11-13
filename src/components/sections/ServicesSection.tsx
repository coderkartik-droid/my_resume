"use client";

import { Sparkles, CheckCircle2, ArrowRight, Layout, Globe, Box, Server, Shield, Zap } from "lucide-react";
import { sound } from "@/lib/sound";
import type { Service } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  const { currentTheme } = useTheme();

  const getServiceIcon = (index: number) => {
    switch (index % 6) {
      case 0:
        return <Box className="w-6 h-6 text-sky-400" />;
      case 1:
        return <Zap className="w-6 h-6 text-indigo-400" />;
      case 2:
        return <Server className="w-6 h-6 text-emerald-400" />;
      case 3:
        return <Layout className="w-6 h-6 text-purple-400" />;
      case 4:
        return <Globe className="w-6 h-6 text-cyan-400" />;
      default:
        return <Shield className="w-6 h-6 text-rose-400" />;
    }
  };

  return (
    <section id="services" className="py-28 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/3 -left-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#5145E5" }}
      />
      <div
        className="absolute bottom-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#38BDF8" }}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-4">
            <div className="theme-badge">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>CAPABILITIES &amp; OFFERINGS</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading uppercase tracking-[-0.03em] leading-[0.94] text-white">
              Services &amp; <span className="theme-gradient-text">Expertise</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-md leading-relaxed font-normal">
            End-to-end digital solutions tailored for venture-backed startups, global enterprises, and visionary digital brands.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            let features: string[] = [];
            if (service.features) {
              try {
                features = JSON.parse(service.features);
              } catch {
                features = service.features.split(",").map((f) => f.trim());
              }
            }

            return (
              <div
                key={service.id}
                onMouseEnter={() => sound.playHover()}
                className="theme-card theme-card-hover p-8 rounded-3xl flex flex-col justify-between group space-y-6"
              >
                <div className="space-y-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg bg-white/[0.05] border border-white/10">
                    {getServiceIcon(idx)}
                  </div>

                  <h3 className="text-xl font-bold font-heading tracking-tight text-white group-hover:text-sky-300 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {service.description}
                  </p>

                  {features.length > 0 && (
                    <ul className="space-y-2.5 pt-3 border-t border-white/10">
                      {features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2.5 text-xs font-mono text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <a
                    href="#contact"
                    onClick={() => sound.playClick()}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 group-hover:gap-3 transition-all"
                  >
                    <span>Inquire About Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
