"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type {
  Project,
  Skill,
  Experience,
  Service,
  Profile,
  Testimonial,
  Certification,
  ThemeCustomOverrides,
  AnimationConfig,
} from "@/types";
import type { SiteVisualConfigData } from "@/types/visual-config";
import { DEFAULT_SITE_VISUAL_CONFIG, DEFAULT_SECTIONS_CONFIG } from "@/types/visual-config";

import { ThemeProvider } from "@/context/ThemeContext";
import CustomCursor from "@/components/ui/CustomCursor";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import AchievementsSection from "@/components/sections/AchievementsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactSection from "@/components/ui/ContactSection";
import Footer from "@/components/ui/Footer";
import FloatingQuickActions from "@/components/ui/FloatingQuickActions";
import ProjectDetailsModal from "@/components/ui/ProjectDetailsModal";

// Dynamic imports for 3D graphics scenes to safeguard SSR & hydration
const LoadingScreen = dynamic(() => import("@/components/3d/LoadingScene"), {
  ssr: false,
});
const BackgroundCanvas = dynamic(
  () => import("@/components/3d/BackgroundCanvas"),
  { ssr: false }
);

interface HomeClientProps {
  initialProfile: Profile | null;
  initialProjects: Project[];
  initialSkills: Skill[];
  initialExperience: Experience[];
  initialServices: Service[];
  initialTestimonials: Testimonial[];
  initialCertifications: Certification[];
  initialThemeId?: string;
  initialOverrides?: ThemeCustomOverrides | null;
  initialAnimations?: AnimationConfig;
  initialVisualConfig?: SiteVisualConfigData | null;
}

export default function HomeClient({
  initialProfile,
  initialProjects,
  initialSkills,
  initialExperience,
  initialServices,
  initialTestimonials,
  initialCertifications,
  initialThemeId = "midnight-dark",
  initialOverrides = null,
  initialAnimations,
  initialVisualConfig,
}: HomeClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [visualConfig, setVisualConfig] = useState<SiteVisualConfigData>(
    initialVisualConfig || DEFAULT_SITE_VISUAL_CONFIG
  );

  const displayName = visualConfig.hero?.name || initialProfile?.name || "Kartik Khajuria";

  // Synchronize visual configuration whenever new published config is received from server
  useEffect(() => {
    if (initialVisualConfig) {
      setVisualConfig(initialVisualConfig);
    }
  }, [initialVisualConfig]);

  // Listen for Live Page Editor real-time broadcast previews
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === "PORTFOLIO_VISUAL_CONFIG_PREVIEW" &&
        event.data.visualConfig
      ) {
        setVisualConfig(event.data.visualConfig);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sectionRegistry: Record<string, React.ReactNode> = {
    hero: (
      <HeroSection
        key="hero"
        profile={initialProfile}
        heroConfig={visualConfig.hero}
        threeDConfig={visualConfig.threeD}
      />
    ),
    about: (
      <AboutSection
        key="about"
        profile={initialProfile}
        config={visualConfig.about}
      />
    ),
    experience: (
      <ExperienceSection key="experience" experience={initialExperience} />
    ),
    skills: <SkillsSection key="skills" skills={initialSkills} />,
    projects: (
      <ProjectsSection
        key="projects"
        projects={initialProjects}
        onSelectProject={(p) => setSelectedProject(p)}
      />
    ),
    achievements: (
      <AchievementsSection
        key="achievements"
        certifications={initialCertifications}
        achievements={initialExperience.filter((e) => e.type === "achievement")}
      />
    ),
    services: initialServices && initialServices.length > 0 ? (
      <ServicesSection key="services" services={initialServices} />
    ) : null,
    testimonials: initialTestimonials && initialTestimonials.length > 0 ? (
      <TestimonialsSection key="testimonials" testimonials={initialTestimonials} />
    ) : null,
    contact: (
      <ContactSection
        key="contact"
        profile={initialProfile}
        config={visualConfig.contact}
      />
    ),
    footer: (
      <Footer
        key="footer"
        profile={initialProfile}
        config={visualConfig.footer}
      />
    ),
  };

  const configuredSections = visualConfig.sections && visualConfig.sections.length > 0
    ? visualConfig.sections
    : DEFAULT_SECTIONS_CONFIG;

  const sortedSections = [...configuredSections]
    .filter((sec) => sec.enabled !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <ThemeProvider
      initialThemeId={initialThemeId}
      initialOverrides={initialOverrides}
      initialAnimations={initialAnimations}
    >
      <SmoothScrollProvider>
        <div className="relative min-h-screen font-sans selection:bg-purple-600 selection:text-white overflow-x-hidden">
          {/* Custom Precision Cursor (Desktop Only) */}
          <CustomCursor />

          {/* Cinematic 3D Loading Screen */}
          {isLoading && (
            <LoadingScreen
              brandName={displayName.toUpperCase()}
              onLoaded={() => setIsLoading(false)}
            />
          )}

          {/* Theme-Adaptive Background Ambient Particle Canvas */}
          <BackgroundCanvas />

          {/* SECTION 01: Premium Floating Header */}
          <Navbar brandName={displayName} />

          {/* Dynamically Ordered & Toggled Sections from Visual Control Center */}
          {sortedSections.map((sec) => sectionRegistry[sec.id] || null)}

          {/* Floating Quick Action Buttons */}
          <FloatingQuickActions />

          {/* Interactive Full-Screen Project Case Study Modal */}
          <ProjectDetailsModal
            project={selectedProject}
            allProjects={initialProjects}
            onClose={() => setSelectedProject(null)}
            onNavigate={(p) => setSelectedProject(p)}
          />
        </div>
      </SmoothScrollProvider>
    </ThemeProvider>
  );
}
