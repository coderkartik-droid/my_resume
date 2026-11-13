"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  ThemeDefinition,
  ThemeId,
  ThemeCustomOverrides,
  AnimationConfig,
} from "@/types/theme";
import { getThemeById, THEME_REGISTRY } from "@/lib/themes/registry";
import {
  buildThemeVariables,
  DEFAULT_ANIMATION_CONFIG,
} from "@/lib/themes/theme-engine";

interface ThemeContextType {
  currentTheme: ThemeDefinition;
  activeThemeId: ThemeId;
  overrides: ThemeCustomOverrides | null;
  animations: AnimationConfig;
  setTheme: (id: ThemeId) => void;
  setOverrides: (overrides: ThemeCustomOverrides | null) => void;
  setAnimations: (config: AnimationConfig) => void;
  isPreview: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: THEME_REGISTRY["midnight-dark"],
  activeThemeId: "midnight-dark",
  overrides: null,
  animations: DEFAULT_ANIMATION_CONFIG,
  setTheme: () => {},
  setOverrides: () => {},
  setAnimations: () => {},
  isPreview: false,
});

export function ThemeProvider({
  children,
  initialThemeId = "midnight-dark",
  initialOverrides = null,
  initialAnimations = DEFAULT_ANIMATION_CONFIG,
}: {
  children: React.ReactNode;
  initialThemeId?: string;
  initialOverrides?: ThemeCustomOverrides | null;
  initialAnimations?: AnimationConfig;
}) {
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>(
    (initialThemeId as ThemeId) in THEME_REGISTRY
      ? (initialThemeId as ThemeId)
      : "midnight-dark"
  );
  const [overrides, setOverrides] = useState<ThemeCustomOverrides | null>(initialOverrides);
  const [animations, setAnimations] = useState<AnimationConfig>(initialAnimations || DEFAULT_ANIMATION_CONFIG);
  const [isPreview, setIsPreview] = useState(false);

  // Read URL params or postMessage for iframe preview
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const previewTheme = urlParams.get("theme") as ThemeId;
    if (previewTheme && previewTheme in THEME_REGISTRY) {
      setActiveThemeId(previewTheme);
      setIsPreview(true);
    }

    // Listen to postMessage from Admin Theme Studio
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PORTFOLIO_THEME_PREVIEW") {
        if (event.data.themeId && event.data.themeId in THEME_REGISTRY) {
          setActiveThemeId(event.data.themeId);
        }
        if (event.data.overrides !== undefined) {
          setOverrides(event.data.overrides);
        }
        if (event.data.animations !== undefined) {
          setAnimations(event.data.animations);
        }
        setIsPreview(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const currentTheme = useMemo(() => {
    return getThemeById(activeThemeId);
  }, [activeThemeId]);

  // Apply CSS Variables directly onto document.documentElement
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const vars = buildThemeVariables(currentTheme, overrides);

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }

    // Update root background and color directly for instantaneous paint
    root.style.backgroundColor = vars["--theme-bg"];
    root.style.color = vars["--theme-fg"];

    if (currentTheme.mode === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [currentTheme, overrides]);

  const value = useMemo(
    () => ({
      currentTheme,
      activeThemeId,
      overrides,
      animations,
      setTheme: (id: ThemeId) => setActiveThemeId(id),
      setOverrides,
      setAnimations,
      isPreview,
    }),
    [currentTheme, activeThemeId, overrides, animations, isPreview]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
