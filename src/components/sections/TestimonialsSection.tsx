"use client";

import { MessageSquareQuote, Star, Quote, ShieldCheck } from "lucide-react";
import { sound } from "@/lib/sound";
import type { Testimonial } from "@/types";
import { useTheme } from "@/context/ThemeContext";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const { currentTheme } = useTheme();

  return (
    <section id="testimonials" className="py-28 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/3 right-0 w-[550px] h-[550px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#5145E5" }}
      />
      <div
        className="absolute bottom-10 -left-40 w-[600px] h-[600px] rounded-full blur-[170px] pointer-events-none opacity-20"
        style={{ backgroundColor: "#38BDF8" }}
      />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-4">
            <div className="theme-badge">
              <MessageSquareQuote className="w-3.5 h-3.5 text-sky-400" />
              <span>CLIENT &amp; COLLEAGUE REVIEWS</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading uppercase tracking-tight text-white">
              Endorsements &amp; <span className="theme-gradient-text">Testimonials</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-md leading-relaxed font-normal">
            Unvarnished feedback from engineering executives, startup founders, and design leads who collaborated with me.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test) => (
            <div
              key={test.id}
              onMouseEnter={() => sound.playHover()}
              className="theme-card theme-card-hover p-8 sm:p-10 rounded-3xl flex flex-col justify-between group space-y-6 relative overflow-hidden"
            >
              <div className="space-y-5">
                {/* 5-Star Rating & Decorative Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {[...Array(test.rating || 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-indigo-400/30" />
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic font-normal">
                  &ldquo;{test.quote}&rdquo;
                </p>
              </div>

              {/* Author Attribution */}
              <div className="flex items-center gap-4 pt-5 border-t border-white/10">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #5145E5 0%, #38BDF8 100%)",
                    color: "#FFFFFF",
                  }}
                >
                  {test.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div>
                  <div className="text-base font-bold font-heading tracking-tight text-white">
                    {test.author}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    {test.role} &bull; <span className="text-sky-300 font-semibold">{test.company}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
