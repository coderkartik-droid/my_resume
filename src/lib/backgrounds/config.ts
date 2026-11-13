import {
  BackgroundConfigState,
  BackgroundThemeSettingsMap,
  DEFAULT_BACKGROUND_CONFIG,
  DEFAULT_BACKGROUND_THEME_ID,
  isBackgroundThemeId,
  isBackgroundSpeed,
  normalizeBackgroundSettings,
  normalizeThemeSettingsMap,
} from "@/types/background";

export const BACKGROUND_CONFIG_ID = "active_background_config";

/** Structural shape of the `BackgroundThemeConfig` Prisma row. */
export interface BackgroundConfigRow {
  activeThemeId: string;
  previousThemeId: string | null;
  animationEnabled: boolean;
  animationSpeed: string;
  brightness: number;
  particleDensity: number;
  parallaxEnabled: boolean;
  themeSettings: string | null;
  updatedAt: Date;
}

export interface SerializedBackgroundConfig {
  state: BackgroundConfigState;
  themeSettings: BackgroundThemeSettingsMap;
}

/**
 * Converts a stored row into the safe, typed shape the UI and the public
 * background layer consume. A missing row falls back to the documented
 * defaults, which keeps the public site on the original matrix rain until an
 * administrator explicitly applies another theme.
 */
export function serializeBackgroundConfig(
  row: BackgroundConfigRow | null
): SerializedBackgroundConfig {
  if (!row) {
    return { state: DEFAULT_BACKGROUND_CONFIG, themeSettings: {} };
  }

  const settings = normalizeBackgroundSettings({
    animationEnabled: row.animationEnabled,
    speed: isBackgroundSpeed(row.animationSpeed) ? row.animationSpeed : "normal",
    brightness: row.brightness,
    particleDensity: row.particleDensity,
    parallaxEnabled: row.parallaxEnabled,
  });

  let themeSettings: BackgroundThemeSettingsMap = {};
  if (row.themeSettings) {
    try {
      themeSettings = normalizeThemeSettingsMap(JSON.parse(row.themeSettings));
    } catch {
      themeSettings = {};
    }
  }

  return {
    state: {
      activeThemeId: isBackgroundThemeId(row.activeThemeId)
        ? row.activeThemeId
        : DEFAULT_BACKGROUND_THEME_ID,
      previousThemeId: isBackgroundThemeId(row.previousThemeId)
        ? row.previousThemeId
        : null,
      settings,
      updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
    },
    themeSettings,
  };
}

export function serializeThemeSettingsMap(
  map: BackgroundThemeSettingsMap
): string {
  return JSON.stringify(map);
}
