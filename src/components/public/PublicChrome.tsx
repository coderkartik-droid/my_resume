"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/context/ThemeContext";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import FloatingQuickActions from "@/components/ui/FloatingQuickActions";
import type { Profile, ThemeCustomOverrides, AnimationConfig } from "@/types";
import type { FooterVisualConfig } from "@/types/visual-config";
import type { BackgroundConfigState } from "@/types/background";

const BackgroundCanvas = dynamic(
  () => import("@/components/3d/BackgroundCanvas"),
  { ssr: false }
);

interface PublicChromeProps {
  profile: Profile | null;
  brandName?: string;
  footerConfig?: FooterVisualConfig;
  initialThemeId?: string;
  initialOverrides?: ThemeCustomOverrides | null;
  initialAnimations?: AnimationConfig;
  /** Background Theme Studio selection, resolved server-side from the database. */
  backgroundConfig?: BackgroundConfigState;
  children: ReactNode;
}

/**
 * Consistent shared chrome for every public page: theme provider, ambient
 * background, floating navigation, page content, footer and quick actions.
 *
 * The background is a decorative layer that always sits behind the existing
 * foreground — layout, navigation, content and footer are left untouched.
 */
export default function PublicChrome({
  profile,
  brandName,
  footerConfig,
  initialThemeId,
  initialOverrides,
  initialAnimations,
  backgroundConfig,
  children,
}: PublicChromeProps) {
  return (
    <ThemeProvider
      initialThemeId={initialThemeId}
      initialOverrides={initialOverrides}
      initialAnimations={initialAnimations}
    >
      <SmoothScrollProvider>
        <div className="relative min-h-screen font-sans selection:bg-purple-600 selection:text-white overflow-x-hidden">
          <CustomCursor />
          <BackgroundCanvas
            themeId={backgroundConfig?.activeThemeId}
            settings={backgroundConfig?.settings}
          />
          <Navbar brandName={brandName || profile?.name || "Kartik Khajuria"} />
          {children}
          <Footer profile={profile} config={footerConfig} />
          <FloatingQuickActions />
        </div>
      </SmoothScrollProvider>
    </ThemeProvider>
  );
}
