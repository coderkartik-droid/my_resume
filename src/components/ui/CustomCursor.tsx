"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const { currentTheme, animations } = useTheme();

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia("(pointer: fine)").matches) {
      setIsTouchDevice(false);
    } else {
      return;
    }

    if (!animations.enabled || !animations.cursorEffects) {
      return;
    }

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPosition({ x: targetX, y: targetY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("button") ||
          target.closest("a") ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest("select") ||
          target.closest(".cursor-pointer") ||
          target.closest("[role='button']"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const render = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      setTrailingPos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, animations]);

  if (isTouchDevice || !isVisible || !animations.enabled || !animations.cursorEffects) {
    return null;
  }

  return (
    <>
      {/* Central Precision Micro Dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isHovered ? 0 : 1})`,
        }}
      >
        <div
          className="w-2 h-2 rounded-full shadow-lg"
          style={{
            backgroundColor: "var(--theme-accent, var(--theme-primary))",
            boxShadow: "0 0 10px var(--theme-glow)",
          }}
        />
      </div>

      {/* Trailing Fluid Magnetic Ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)`,
        }}
      >
        <div
          className={`rounded-full border transition-all duration-200 ease-out flex items-center justify-center ${
            isHovered
              ? "w-12 h-12 scale-110 shadow-2xl backdrop-blur-[1px]"
              : "w-8 h-8 scale-100 opacity-60"
          }`}
          style={{
            borderColor: isHovered
              ? "var(--theme-accent, var(--theme-primary))"
              : "var(--theme-border-glow, rgba(255,255,255,0.3))",
            backgroundColor: isHovered
              ? "color-mix(in srgb, var(--theme-primary) 12%, transparent)"
              : "transparent",
            boxShadow: isHovered ? "0 0 25px var(--theme-glow)" : "none",
          }}
        >
          {isHovered && (
            <div
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{
                backgroundColor: "var(--theme-accent, var(--theme-primary))",
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
