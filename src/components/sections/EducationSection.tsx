"use client";

import { GraduationCap, Award, BookOpen, Calendar, MapPin } from "lucide-react";
import type { Experience } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface EducationSectionProps {
  experience: Experience[];
}

export default function EducationSection({ experience }: EducationSectionProps) {
  const { currentTheme } = useTheme();

  const educationItems = experience
    .filter((e) => e.type === "education")
    .sort((a, b) => a.order - b.order);

  return (
    <section id="education" className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 relative z-10 space-y-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
          <div>
            <div className="theme-badge mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ACADEMIC FOUNDATION</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
              Formal <span className="theme-gradient-text">Education</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-mono opacity-70 max-w-md">
            Rigorous foundations in computer science theory, graphics mathematics, and system architecture.
          </p>
        </div>

        {/* Education Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {educationItems.map((item) => (
            <div
              key={item.id}
              className="theme-card theme-card-hover p-8 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--theme-primary) 15%, transparent)",
                      color: "var(--theme-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-mono font-bold border"
                    style={{
                      backgroundColor: "var(--theme-card)",
                      borderColor: "var(--theme-border)",
                      color: "var(--theme-accent, var(--theme-primary))",
                    }}
                  >
                    {item.period}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">{item.role}</h3>
                  <div className="text-xs font-mono opacity-75 font-semibold">
                    {item.organization} {item.location && `• ${item.location}`}
                  </div>
                </div>

                <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.skills && (
                <div className="pt-6 border-t border-white/5 mt-6">
                  <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider mb-2">
                    Key Focus Disciplines:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.split(",").map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-mono border"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          borderColor: "var(--theme-border)",
                        }}
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
