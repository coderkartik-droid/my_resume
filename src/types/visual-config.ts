export interface HeroVisualConfig {
  badgeText: string;
  badgeVisible: boolean;
  name: string;
  roleTicker: string[];
  roleTickerVisible: boolean;
  introBio: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  ctaButtonsVisible: boolean;
  socialLinksVisible: boolean;
  metricCardsVisible: boolean;
  metric1Value: number;
  metric1Suffix: string;
  metric1Label: string;
  metric2Value: number;
  metric2Suffix: string;
  metric2Label: string;
  metric3Value: number;
  metric3Suffix: string;
  metric3Label: string;
  alignment: "left" | "center";
  layoutStyle: "split" | "centered" | "compact";
  threeDCenterpieceVisible: boolean;
  scrollIndicatorVisible: boolean;
}

export interface ThreeDVisualConfig {
  monolithVisible: boolean;
  monolithWireframe: boolean;
  monolithScale: number; // 0.6 - 1.6
  ringsVisible: boolean;
  ringsSpeed: number; // 0.2 - 2.5
  ringsCount: number; // 1 - 4
  glassSpheresVisible: boolean;
  glassSpheresCount: number; // 0 - 8
  floatingPolyhedraVisible: boolean;
  stardustParticlesVisible: boolean;
  stardustDensity: number; // 100 - 1000
  lightingIntensity: number; // 0.3 - 2.5
  mouseTrackingSensitivity: number; // 0 - 2.0
  cameraDistance: number; // 5.5 - 10.0
}

export interface SectionItemConfig {
  id: string; // "hero" | "about" | "experience" | "skills" | "projects" | "achievements" | "services" | "testimonials" | "contact" | "footer"
  name: string;
  enabled: boolean;
  order: number;
  customTitle?: string;
  customSubtitle?: string;
}

export interface AboutVisualConfig {
  badgeText: string;
  headline: string;
  subtext: string;
  showLiveShader: boolean;
  showPillars: boolean;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;
  pillar4Title: string;
  pillar4Desc: string;
}

export interface ContactVisualConfig {
  badgeText: string;
  headline: string;
  subtext: string;
  email: string;
  telemetryStatus: string;
  telemetryLatency: string;
  encryptionLabel: string;
  showTelemetry: boolean;
  showConfetti: boolean;
}

export interface FooterVisualConfig {
  watermarkText: string;
  tagline: string;
  copyrightText: string;
  showIstClock: boolean;
  showBackToTop: boolean;
}

export interface SiteRevision {
  id: string;
  name: string;
  timestamp: string;
  data: SiteVisualConfigData;
}

export interface SiteVisualConfigData {
  hero: HeroVisualConfig;
  threeD: ThreeDVisualConfig;
  sections: SectionItemConfig[];
  about: AboutVisualConfig;
  contact: ContactVisualConfig;
  footer: FooterVisualConfig;
  version?: number;
  publishedAt?: string;
}

export const DEFAULT_HERO_CONFIG: HeroVisualConfig = {
  badgeText: "AVAILABLE FOR HIGH-IMPACT INITIATIVES",
  badgeVisible: true,
  name: "KARTIK KHAJURIA",
  roleTicker: [
    "Creative Developer & Technologist",
    "3D WebGL / Spatial Architect",
    "High-Performance Full-Stack Engineer",
    "Interactive Digital Experience Craftsman",
  ],
  roleTickerVisible: true,
  introBio:
    "Merging architectural precision, cinematic WebGL 3D, and high-performance engineering to build unforgettable digital landscapes.",
  primaryCtaText: "Explore Projects",
  primaryCtaLink: "#projects",
  secondaryCtaText: "Download Resume",
  secondaryCtaLink: "/resume.pdf",
  ctaButtonsVisible: true,
  socialLinksVisible: true,
  metricCardsVisible: true,
  metric1Value: 3,
  metric1Suffix: "+",
  metric1Label: "Years Exp.",
  metric2Value: 15,
  metric2Suffix: "+",
  metric2Label: "Projects Built",
  metric3Value: 100,
  metric3Suffix: "%",
  metric3Label: "Commitment",
  alignment: "left",
  layoutStyle: "split",
  threeDCenterpieceVisible: true,
  scrollIndicatorVisible: true,
};

export const DEFAULT_THREED_CONFIG: ThreeDVisualConfig = {
  monolithVisible: true,
  monolithWireframe: true,
  monolithScale: 1.0,
  ringsVisible: true,
  ringsSpeed: 1.0,
  ringsCount: 3,
  glassSpheresVisible: true,
  glassSpheresCount: 5,
  floatingPolyhedraVisible: true,
  stardustParticlesVisible: true,
  stardustDensity: 450,
  lightingIntensity: 1.2,
  mouseTrackingSensitivity: 1.0,
  cameraDistance: 7.8,
};

export const DEFAULT_SECTIONS_CONFIG: SectionItemConfig[] = [
  { id: "hero", name: "Hero 3D Introduction", enabled: true, order: 0 },
  { id: "about", name: "About & Live Shader Dossier", enabled: true, order: 1 },
  { id: "experience", name: "Career Experience Timeline", enabled: true, order: 2 },
  { id: "skills", name: "3D Constellation & Skills", enabled: true, order: 3 },
  { id: "projects", name: "3D Perspective Project Gallery", enabled: true, order: 4 },
  { id: "achievements", name: "Credentials & Accolades", enabled: true, order: 5 },
  { id: "services", name: "Architectural Capabilities", enabled: true, order: 6 },
  { id: "testimonials", name: "Client Endorsements", enabled: true, order: 7 },
  { id: "contact", name: "Command Center & Inquiries", enabled: true, order: 8 },
  { id: "footer", name: "Signature Horizon Footer", enabled: true, order: 9 },
];

export const DEFAULT_ABOUT_CONFIG: AboutVisualConfig = {
  badgeText: "PHILOSOPHY & CAPABILITIES",
  headline: "Architecting Immersive Digital Frontiers",
  subtext:
    "I engineer spatial WebGL interfaces, distributed cloud systems, and fluid micro-interactions designed to leave lasting impressions.",
  showLiveShader: true,
  showPillars: true,
  pillar1Title: "Spatial 3D & WebGL",
  pillar1Desc:
    "Custom Three.js pipelines, procedural shaders, and GPU-optimized rendering designed for fluid, responsive interactions across all viewports.",
  pillar2Title: "Full-Stack Reliability",
  pillar2Desc:
    "Type-safe architectures powered by Next.js, React 19, TypeScript, Prisma, and distributed microservices with zero layout shifts.",
  pillar3Title: "Micro-Interaction Design",
  pillar3Desc:
    "Lenis inertial momentum scrolling, magnetic physics buttons, dynamic cursor followers, and bespoke Web Audio feedback.",
  pillar4Title: "Engineering Standards",
  pillar4Desc:
    "Disciplined engineering with clean architecture, strict type safety, responsive fluid typography, and reliable cross-platform accessibility.",
};

export const DEFAULT_CONTACT_CONFIG: ContactVisualConfig = {
  badgeText: "DIRECT COMMUNICATION",
  headline: "Let's Build Something Extraordinary",
  subtext:
    "Whether commissioning a full-scale 3D WebGL platform, a scalable full-stack application, or exploring technical leadership, feel free to reach out.",
  email: "kartikkhajuria643@gmail.com",
  telemetryStatus: "Available for select roles & high-impact contracts",
  telemetryLatency: "< 24 Hours Response",
  encryptionLabel: "Direct Inquiries",
  showTelemetry: true,
  showConfetti: true,
};

export const DEFAULT_FOOTER_CONFIG: FooterVisualConfig = {
  watermarkText: "KARTIK KHAJURIA · CREATIVE DEV",
  tagline: "Merging architectural precision, cinematic WebGL 3D, and high-performance engineering.",
  copyrightText: "All Rights Reserved. Handcrafted with precision & Three.js.",
  showIstClock: true,
  showBackToTop: true,
};

export const DEFAULT_SITE_VISUAL_CONFIG: SiteVisualConfigData = {
  hero: DEFAULT_HERO_CONFIG,
  threeD: DEFAULT_THREED_CONFIG,
  sections: DEFAULT_SECTIONS_CONFIG,
  about: DEFAULT_ABOUT_CONFIG,
  contact: DEFAULT_CONTACT_CONFIG,
  footer: DEFAULT_FOOTER_CONFIG,
  version: 1,
};
