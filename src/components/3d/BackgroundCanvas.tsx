"use client";

import { useMemo, useState } from "react";
import {
  BackgroundSettings,
  DEFAULT_BACKGROUND_SETTINGS,
  DEFAULT_BACKGROUND_THEME_ID,
  isBackgroundSpeed,
} from "@/types/background";
import { useBackgroundCanvas } from "@/components/backgrounds/useBackgroundCanvas";
import { createBackgroundScene } from "@/components/backgrounds/scenes";

export interface BackgroundCanvasProps {
  /** Active background theme id, resolved from the database. */
  themeId?: string;
  /** Animation / brightness / density / parallax settings. */
  settings?: BackgroundSettings;
  /**
   * Wrapper classes. Defaults to the site-wide fixed, non-interactive layer
   * that sits behind every foreground component.
   */
  className?: string;
  /** Allows `?bg=` preview overrides — used by the admin preview link. */
  allowUrlPreview?: boolean;
}

const SITE_LAYER_CLASS =
  "pointer-events-none fixed inset-0 z-0 overflow-hidden select-none";

/**
 * The animated background layer for the public website.
 *
 * Purely decorative: it is rendered behind all content, never accepts pointer
 * events, falls back to a single static frame when the visitor prefers reduced
 * motion or the animation is switched off, and pauses entirely while the tab is
 * hidden. The foreground is never touched.
 */
export default function BackgroundCanvas({
  themeId = DEFAULT_BACKGROUND_THEME_ID,
  settings = DEFAULT_BACKGROUND_SETTINGS,
  className = SITE_LAYER_CLASS,
  allowUrlPreview = true,
}: BackgroundCanvasProps) {
  const [urlOverride] = useState<{
    themeId: string | null;
    settings: Partial<BackgroundSettings>;
  } | null>(() => {
    if (!allowUrlPreview || typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const previewTheme = params.get("bg");
    const speed = params.get("bgSpeed");
    const brightness = params.get("bgBright");
    const density = params.get("bgDensity");
    const animate = params.get("bgAnim");
    const parallax = params.get("bgParallax");

    const overrides: Partial<BackgroundSettings> = {};
    if (isBackgroundSpeed(speed)) overrides.speed = speed;
    if (brightness !== null && Number.isFinite(Number(brightness))) {
      overrides.brightness = Number(brightness);
    }
    if (density !== null && Number.isFinite(Number(density))) {
      overrides.particleDensity = Number(density);
    }
    if (animate !== null) overrides.animationEnabled = animate !== "0";
    if (parallax !== null) overrides.parallaxEnabled = parallax !== "0";

    if (!previewTheme && Object.keys(overrides).length === 0) return null;
    return { themeId: previewTheme, settings: overrides };
  });

  const activeThemeId = urlOverride?.themeId || themeId;

  const effectiveSettings = useMemo<BackgroundSettings>(
    () => ({ ...settings, ...(urlOverride?.settings ?? {}) }),
    [settings, urlOverride]
  );

  const createScene = useMemo(
    () => createBackgroundScene(activeThemeId),
    [activeThemeId]
  );

  const { containerRef, canvasRef } = useBackgroundCanvas(
    createScene,
    effectiveSettings,
    activeThemeId
  );

  const brightness = effectiveSettings.brightness;

  return (
    <div ref={containerRef} aria-hidden="true" className={className}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={brightness === 1 ? undefined : { filter: `brightness(${brightness})` }}
      />
    </div>
  );
}
