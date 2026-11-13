import { THEME_LIST, THEME_REGISTRY, getThemeById } from "../src/lib/themes/registry";
import { buildThemeVariables, buildThemeCSSString, DEFAULT_ANIMATION_CONFIG } from "../src/lib/themes/theme-engine";
import { ThemeId } from "../src/types/theme";

console.log("=================================================");
console.log("THEME STUDIO VERIFICATION: TESTING ALL 20 THEMES");
console.log("=================================================");

console.log(`Total Themes Registered: ${THEME_LIST.length} (Expected: 20)`);

if (THEME_LIST.length !== 20) {
  throw new Error(`Expected exactly 20 themes, found ${THEME_LIST.length}`);
}

const requiredThemes: ThemeId[] = [
  "apple-minimal",
  "midnight-dark",
  "ocean-blue",
  "emerald-luxury",
  "royal-purple",
  "sunset-gradient",
  "cyberpunk-neon",
  "glassmorphism",
  "aurora",
  "swiss-editorial",
  "corporate-professional",
  "luxury-gold",
  "material-modern",
  "soft-pastel",
  "monochrome",
  "crimson-red",
  "arctic-frost",
  "forest-green",
  "creative-portfolio",
  "futuristic-ai",
];

let errors: string[] = [];

for (const themeId of requiredThemes) {
  const theme = THEME_REGISTRY[themeId];
  if (!theme) {
    errors.push(`Missing required theme: ${themeId}`);
    continue;
  }

  // Validate properties
  if (!theme.name || !theme.description || !theme.category || !theme.mode) {
    errors.push(`Theme ${themeId} is missing top-level metadata`);
  }

  const { colors, typography, cardStyle, buttonStyle, animationPersonality } = theme;

  if (
    !colors.background ||
    !colors.card ||
    !colors.foreground ||
    !colors.primary ||
    !colors.secondary ||
    !colors.accent ||
    !colors.border
  ) {
    errors.push(`Theme ${themeId} is missing core color tokens`);
  }

  if (!typography.headingFont || !typography.bodyFont) {
    errors.push(`Theme ${themeId} is missing font tokens`);
  }

  if (!cardStyle.radius || !cardStyle.shadow) {
    errors.push(`Theme ${themeId} is missing card style tokens`);
  }

  // Test token compilation
  const vars = buildThemeVariables(theme);
  if (!vars["--theme-bg"] || !vars["--theme-primary"] || !vars["--theme-card"]) {
    errors.push(`Theme ${themeId} generated incomplete CSS variables`);
  }

  const css = buildThemeCSSString(theme);
  if (!css.includes("--theme-bg:") || !css.includes("--theme-primary:")) {
    errors.push(`Theme ${themeId} generated invalid CSS string`);
  }

  console.log(`✓ [${theme.id}] "${theme.name}" (${theme.mode}) - Validated`);
}

if (errors.length > 0) {
  console.error("Errors found:", errors);
  process.exit(1);
} else {
  console.log("\nALL 20 THEMES FULLY VALIDATED AND COMPLIANT!");
}
