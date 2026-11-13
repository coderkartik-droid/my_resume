import { ThemeDefinition, ThemeCustomOverrides, AnimationConfig } from "@/types/theme";
import { getThemeById } from "./registry";

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  enabled: true,
  intensity: "normal",
  pageTransitions: "fade",
  scrollAnimations: "reveal",
  hoverEffects: "3d-tilt",
  backgroundStyle: "interactive-canvas",
  speed: 1.0,
  delay: 0.1,
  parallaxIntensity: 0.5,
  cursorEffects: true,
  particleEffects: true,
  threeDEffects: true,
  sectionOverrides: {},
};

export function buildThemeVariables(
  themeOrId: ThemeDefinition | string,
  overrides?: ThemeCustomOverrides | null
): Record<string, string> {
  const theme = typeof themeOrId === "string" ? getThemeById(themeOrId) : themeOrId;

  const bg = overrides?.backgroundColor || theme.colors.background;
  const card = overrides?.cardColor || theme.colors.card;
  const fg = overrides?.textColor || theme.colors.foreground;
  const primary = overrides?.primaryColor || theme.colors.primary;
  const secondary = overrides?.secondaryColor || theme.colors.secondary;
  const accent = overrides?.accentColor || theme.colors.accent;
  const headingFont = overrides?.headingFont || theme.typography.headingFont;
  const bodyFont = overrides?.bodyFont || theme.typography.bodyFont;
  const radius = overrides?.borderRadius || theme.cardStyle.radius;
  const shadow = overrides?.shadowStyle || theme.cardStyle.shadow;

  return {
    "--theme-bg": bg,
    "--theme-bg-secondary": theme.colors.backgroundSecondary,
    "--theme-card": card,
    "--theme-card-hover": theme.colors.cardHover,
    "--theme-fg": fg,
    "--theme-fg-muted": theme.colors.foregroundMuted,
    "--theme-primary": primary,
    "--theme-primary-gradient": theme.colors.primaryGradient,
    "--theme-secondary": secondary,
    "--theme-accent": accent,
    "--theme-border": theme.colors.border,
    "--theme-border-glow": theme.colors.borderGlow,
    "--theme-glow": theme.colors.glow,
    "--theme-font-heading": headingFont,
    "--theme-font-body": bodyFont,
    "--theme-font-accent": theme.typography.accentFont,
    "--theme-radius": radius,
    "--theme-border-width": theme.cardStyle.borderWidth,
    "--theme-backdrop-blur": theme.cardStyle.backdropBlur,
    "--theme-shadow": shadow,
    "--theme-btn-radius": theme.buttonStyle.radius,
  };
}

export function buildThemeCSSString(
  themeOrId: ThemeDefinition | string,
  overrides?: ThemeCustomOverrides | null,
  selector = ":root"
): string {
  const vars = buildThemeVariables(themeOrId, overrides);
  const rules = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `${selector} {\n${rules}\n}`;
}

export function getAnimationMultiplier(intensity?: string): number {
  switch (intensity) {
    case "subtle":
      return 0.5;
    case "advanced":
      return 1.4;
    case "extreme":
      return 2.0;
    case "normal":
    default:
      return 1.0;
  }
}
