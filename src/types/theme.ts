export type ThemeId =
  | "apple-minimal"
  | "midnight-dark"
  | "ocean-blue"
  | "emerald-luxury"
  | "royal-purple"
  | "sunset-gradient"
  | "cyberpunk-neon"
  | "glassmorphism"
  | "aurora"
  | "swiss-editorial"
  | "corporate-professional"
  | "luxury-gold"
  | "material-modern"
  | "soft-pastel"
  | "monochrome"
  | "crimson-red"
  | "arctic-frost"
  | "forest-green"
  | "creative-portfolio"
  | "futuristic-ai";

export type AnimationIntensity = "subtle" | "normal" | "advanced" | "extreme";

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  card: string;
  cardHover: string;
  foreground: string;
  foregroundMuted: string;
  primary: string;
  primaryGradient: string;
  secondary: string;
  accent: string;
  border: string;
  borderGlow: string;
  glow: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  accentFont: string;
}

export interface ThemeCardStyle {
  radius: string; // e.g. "0.75rem", "1.5rem"
  borderWidth: string; // e.g. "1px"
  backdropBlur: string; // e.g. "16px"
  shadow: string;
}

export interface ThemeButtonStyle {
  radius: string;
  variant: "gradient" | "solid" | "glow" | "minimal" | "cyber" | "frosted";
}

export interface ThemeNavbarStyle {
  variant: "floating-glass" | "solid-minimal" | "pill" | "editorial-bar" | "cyber-hud";
}

export interface ThemeAnimationPersonality {
  intensity: AnimationIntensity;
  style: "fluid" | "geometric" | "snappy" | "cosmic" | "cyber" | "editorial";
  backgroundVibe: "aurora" | "particles" | "mesh" | "minimal" | "cyber" | "geometric" | "frost";
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  category: "minimal" | "dark" | "vibrant" | "luxury" | "editorial" | "futuristic";
  mode: "dark" | "light";
  colors: ThemeColors;
  typography: ThemeTypography;
  cardStyle: ThemeCardStyle;
  buttonStyle: ThemeButtonStyle;
  navbarStyle: ThemeNavbarStyle;
  animationPersonality: ThemeAnimationPersonality;
}

export interface ThemeCustomOverrides {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  cardColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius?: string;
  shadowStyle?: string;
  animationIntensity?: AnimationIntensity;
  colorMode?: "dark" | "light";
  layoutDensity?: "compact" | "normal" | "spacious" | "bento";
}

export interface AnimationSectionConfig {
  enabled: boolean;
  intensity?: AnimationIntensity;
}

export interface AnimationConfig {
  enabled: boolean;
  intensity: AnimationIntensity;
  pageTransitions: "fade" | "slide" | "scale" | "blur" | "none";
  scrollAnimations: "reveal" | "stagger" | "parallax" | "subtle" | "none";
  hoverEffects: "3d-tilt" | "glow" | "lift" | "minimal";
  backgroundStyle: "interactive-canvas" | "particles" | "gradient-mesh" | "geometric" | "minimal" | "none";
  speed: number; // 0.5 to 2.0 (1.0 is normal)
  delay: number; // 0 to 0.5s
  parallaxIntensity: number; // 0 to 1
  cursorEffects: boolean;
  particleEffects: boolean;
  threeDEffects: boolean;
  sectionOverrides?: Record<string, AnimationSectionConfig>;
}

export interface FullThemeState {
  activeThemeId: ThemeId;
  draftThemeId?: ThemeId | null;
  previousThemeId?: ThemeId | null;
  customOverrides?: ThemeCustomOverrides;
  animationSettings?: AnimationConfig;
  updatedAt?: string | Date;
}
