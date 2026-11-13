import { prisma } from "@/lib/prisma";
import { DEFAULT_ANIMATION_CONFIG } from "@/lib/themes/theme-engine";
import { serializeBackgroundConfig } from "@/lib/backgrounds/config";
import {
  DEFAULT_SITE_VISUAL_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from "@/types/visual-config";
import type { SiteVisualConfigData, FooterVisualConfig } from "@/types/visual-config";
import type { Profile, ThemeCustomOverrides, AnimationConfig } from "@/types";
import type { BackgroundConfigState } from "@/types/background";

export interface PublicShellData {
  profile: Profile | null;
  themeId: string;
  overrides: ThemeCustomOverrides | null;
  animations: AnimationConfig;
  visualConfig: SiteVisualConfigData;
  footerConfig: FooterVisualConfig;
  /** Animated background layer (Background Theme Studio). */
  backgroundConfig: BackgroundConfigState;
}

/**
 * Shared data loader for every public page. Reuses the exact same Prisma
 * models and configuration the existing homepage relies on, so all public
 * routes stay visually and thematically consistent.
 */
export async function getPublicShellData(): Promise<PublicShellData> {
  const [profile, themeConfig, visualConfigRow, backgroundRow] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.themeConfig.findFirst(),
    prisma.siteVisualConfig.findFirst(),
    prisma.backgroundThemeConfig.findFirst(),
  ]);

  let overrides: ThemeCustomOverrides | null = null;
  if (themeConfig?.customOverrides) {
    try {
      overrides = JSON.parse(themeConfig.customOverrides);
    } catch {
      overrides = null;
    }
  }

  let animations: AnimationConfig = DEFAULT_ANIMATION_CONFIG;
  if (themeConfig?.animationSettings) {
    try {
      animations = JSON.parse(themeConfig.animationSettings);
    } catch {
      animations = DEFAULT_ANIMATION_CONFIG;
    }
  }

  let visualConfig: SiteVisualConfigData = DEFAULT_SITE_VISUAL_CONFIG;
  if (visualConfigRow?.publishedConfig) {
    try {
      visualConfig = {
        ...DEFAULT_SITE_VISUAL_CONFIG,
        ...JSON.parse(visualConfigRow.publishedConfig),
      };
    } catch {
      visualConfig = DEFAULT_SITE_VISUAL_CONFIG;
    }
  }

  return {
    profile,
    themeId: themeConfig?.activeThemeId || "midnight-dark",
    overrides,
    animations,
    visualConfig,
    footerConfig: visualConfig.footer || DEFAULT_FOOTER_CONFIG,
    backgroundConfig: serializeBackgroundConfig(backgroundRow).state,
  };
}
