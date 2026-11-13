/**
 * Background Theme Studio — shared domain types.
 *
 * This is a presentation-only layer: it controls the animated canvas that sits
 * *behind* the existing public website. No foreground component, layout or
 * colour theme is affected by these values.
 */

export type BackgroundThemeId =
  | "matrix-hacker"
  | "milky-way"
  | "aurora-borealis"
  | "deep-ocean"
  | "cosmic-particles"
  | "cyberpunk-city";

export type BackgroundSpeed = "slow" | "normal" | "fast";

export interface BackgroundSettings {
  /** Master switch — when off, a single static frame is painted. */
  animationEnabled: boolean;
  speed: BackgroundSpeed;
  /** 0.5 – 1.5 multiplier applied as a composited overlay. */
  brightness: number;
  /** 0.5 – 2 multiplier applied to particle / star / glyph counts. */
  particleDensity: number;
  /** Enables pointer-driven depth movement where the theme supports it. */
  parallaxEnabled: boolean;
}

export interface BackgroundThemeDefinition {
  id: BackgroundThemeId;
  name: string;
  tagline: string;
  description: string;
  /** Primary neon / glow accent, used for admin chrome. */
  accent: string;
  /** Whether the theme scales its element count with Particle Density. */
  supportsParticleDensity: boolean;
  /** Whether the theme reacts to Parallax. */
  supportsParallax: boolean;
  /** Recommended animation speed for the theme's intended feel. */
  recommendedSpeed: BackgroundSpeed;
  /** Pure-CSS gradient used for the lightweight admin gallery thumbnail. */
  thumbnailGradient: string;
}

export interface BackgroundConfigState {
  activeThemeId: BackgroundThemeId;
  previousThemeId: BackgroundThemeId | null;
  settings: BackgroundSettings;
  updatedAt: string | null;
}

/** Last-used settings per theme, so switching back restores a familiar look. */
export type BackgroundThemeSettingsMap = Partial<
  Record<BackgroundThemeId, BackgroundSettings>
>;

export const BACKGROUND_SPEED_MULTIPLIER: Record<BackgroundSpeed, number> = {
  slow: 0.55,
  normal: 1,
  fast: 1.7,
};

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  animationEnabled: true,
  speed: "normal",
  brightness: 1,
  particleDensity: 1,
  parallaxEnabled: true,
};

/** The matrix rain that shipped before this feature stays the default look. */
export const DEFAULT_BACKGROUND_THEME_ID: BackgroundThemeId = "matrix-hacker";

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfigState = {
  activeThemeId: DEFAULT_BACKGROUND_THEME_ID,
  previousThemeId: null,
  settings: DEFAULT_BACKGROUND_SETTINGS,
  updatedAt: null,
};

export const BACKGROUND_THEME_IDS: BackgroundThemeId[] = [
  "matrix-hacker",
  "milky-way",
  "aurora-borealis",
  "deep-ocean",
  "cosmic-particles",
  "cyberpunk-city",
];

export function isBackgroundThemeId(value: unknown): value is BackgroundThemeId {
  return typeof value === "string" && (BACKGROUND_THEME_IDS as string[]).includes(value);
}

export function isBackgroundSpeed(value: unknown): value is BackgroundSpeed {
  return value === "slow" || value === "normal" || value === "fast";
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Coerces arbitrary input (request body / DB row) into a safe settings object.
 * Never throws — invalid values fall back to the documented defaults.
 */
export function normalizeBackgroundSettings(input: unknown): BackgroundSettings {
  const raw = (input ?? {}) as Partial<Record<keyof BackgroundSettings, unknown>>;
  const rawBrightness = Number(raw.brightness);
  const rawDensity = Number(raw.particleDensity);

  return {
    animationEnabled:
      typeof raw.animationEnabled === "boolean"
        ? raw.animationEnabled
        : DEFAULT_BACKGROUND_SETTINGS.animationEnabled,
    speed: isBackgroundSpeed(raw.speed) ? raw.speed : DEFAULT_BACKGROUND_SETTINGS.speed,
    brightness: Number.isFinite(rawBrightness)
      ? clamp(rawBrightness, 0.5, 1.5)
      : DEFAULT_BACKGROUND_SETTINGS.brightness,
    particleDensity: Number.isFinite(rawDensity)
      ? clamp(rawDensity, 0.5, 2)
      : DEFAULT_BACKGROUND_SETTINGS.particleDensity,
    parallaxEnabled:
      typeof raw.parallaxEnabled === "boolean"
        ? raw.parallaxEnabled
        : DEFAULT_BACKGROUND_SETTINGS.parallaxEnabled,
  };
}

/**
 * Coerces a stored per-theme settings map into a safe object. Unknown keys and
 * malformed entries are silently dropped.
 */
export function normalizeThemeSettingsMap(input: unknown): BackgroundThemeSettingsMap {
  if (!input || typeof input !== "object") return {};
  const result: BackgroundThemeSettingsMap = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (isBackgroundThemeId(key)) {
      result[key] = normalizeBackgroundSettings(value);
    }
  }
  return result;
}
