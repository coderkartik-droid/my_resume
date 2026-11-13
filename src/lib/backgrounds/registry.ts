import {
  BackgroundThemeDefinition,
  BackgroundThemeId,
  DEFAULT_BACKGROUND_THEME_ID,
} from "@/types/background";

/**
 * The six selectable animated backgrounds offered by the Background Theme
 * Studio. Definitions are pure metadata — the actual painting lives in
 * `src/components/backgrounds/`.
 */
export const BACKGROUND_THEMES: BackgroundThemeDefinition[] = [
  {
    id: "matrix-hacker",
    name: "Matrix Hacker",
    tagline: "Digital rain",
    description:
      "Deep black void with vertical columns of falling neon-green binary digits, bright leading glyphs and a soft phosphor glow.",
    accent: "#22e06b",
    supportsParticleDensity: true,
    supportsParallax: false,
    recommendedSpeed: "normal",
    thumbnailGradient:
      "radial-gradient(circle at 50% 0%, rgba(34,224,107,0.35), transparent 60%), linear-gradient(180deg, #010603 0%, #041a0c 60%, #010603 100%)",
  },
  {
    id: "milky-way",
    name: "Milky Way Galaxy",
    tagline: "Cosmic night sky",
    description:
      "A realistic deep-space night sky: navy-black gradients, layered nebula clouds, a soft galactic band and thousands of twinkling stars with gentle parallax depth.",
    accent: "#8fb4ff",
    supportsParticleDensity: true,
    supportsParallax: true,
    recommendedSpeed: "slow",
    thumbnailGradient:
      "radial-gradient(ellipse at 65% 30%, rgba(143,180,255,0.30), transparent 55%), radial-gradient(ellipse at 30% 70%, rgba(147,112,219,0.28), transparent 60%), linear-gradient(160deg, #01030c 0%, #050b22 55%, #01030c 100%)",
  },
  {
    id: "aurora-borealis",
    name: "Aurora Borealis",
    tagline: "Northern lights",
    description:
      "Soft flowing ribbons of northern light in green, cyan, blue and violet drifting slowly across a deep polar sky.",
    accent: "#4ade80",
    supportsParticleDensity: true,
    supportsParallax: false,
    recommendedSpeed: "slow",
    thumbnailGradient:
      "radial-gradient(ellipse at 25% 15%, rgba(74,222,128,0.45), transparent 55%), radial-gradient(ellipse at 70% 25%, rgba(129,140,248,0.35), transparent 60%), linear-gradient(190deg, #030716 0%, #071a2b 60%, #02040d 100%)",
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    tagline: "Abyssal blue",
    description:
      "Dark underwater atmosphere with deep blue gradients, slow shafts of filtered light and gently drifting plankton particles.",
    accent: "#38bdf8",
    supportsParticleDensity: true,
    supportsParallax: false,
    recommendedSpeed: "slow",
    thumbnailGradient:
      "radial-gradient(ellipse at 50% -10%, rgba(56,189,248,0.35), transparent 60%), linear-gradient(180deg, #031428 0%, #02101f 50%, #01060f 100%)",
  },
  {
    id: "cosmic-particles",
    name: "Cosmic Particles",
    tagline: "Stardust field",
    description:
      "A premium obsidian backdrop filled with glowing particles suspended at different depths, floating slowly with a subtle parallax drift.",
    accent: "#a78bfa",
    supportsParticleDensity: true,
    supportsParallax: true,
    recommendedSpeed: "normal",
    thumbnailGradient:
      "radial-gradient(circle at 30% 30%, rgba(167,139,250,0.35), transparent 55%), radial-gradient(circle at 75% 70%, rgba(56,189,248,0.28), transparent 55%), linear-gradient(200deg, #05060f 0%, #0a0a1c 55%, #04040c 100%)",
  },
  {
    id: "cyberpunk-city",
    name: "Cyberpunk City",
    tagline: "Neon metropolis",
    description:
      "A dark futuristic skyline silhouetted against neon purple, blue and pink haze, with distant vertical light beams and atmospheric fog.",
    accent: "#f472b6",
    supportsParticleDensity: true,
    supportsParallax: true,
    recommendedSpeed: "normal",
    thumbnailGradient:
      "radial-gradient(ellipse at 20% 100%, rgba(244,114,182,0.40), transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(56,189,248,0.35), transparent 55%), linear-gradient(180deg, #07030f 0%, #150425 55%, #05010c 100%)",
  },
];

export const BACKGROUND_REGISTRY: Record<BackgroundThemeId, BackgroundThemeDefinition> =
  BACKGROUND_THEMES.reduce(
    (acc, theme) => {
      acc[theme.id] = theme;
      return acc;
    },
    {} as Record<BackgroundThemeId, BackgroundThemeDefinition>
  );

export function getBackgroundTheme(id: string): BackgroundThemeDefinition {
  return (
    BACKGROUND_REGISTRY[id as BackgroundThemeId] ??
    BACKGROUND_REGISTRY[DEFAULT_BACKGROUND_THEME_ID]
  );
}
