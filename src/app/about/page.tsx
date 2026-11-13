import { prisma } from "@/lib/prisma";
import { getPublicShellData } from "@/lib/public-shell";
import PublicChrome from "@/components/public/PublicChrome";
import PageHeader from "@/components/public/PageHeader";
import AboutSection from "@/components/sections/AboutSection";
import ProfileSection from "@/components/sections/ProfileSection";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.profile.findFirst();
  const name = profile?.name || "Kartik Khajuria";
  return {
    title: `About ${name} | Philosophy & Capabilities`,
    description:
      profile?.bio ||
      `Discover the philosophy, capabilities and background of ${name}.`,
  };
}

export default async function AboutPage() {
  const {
    profile,
    visualConfig,
    themeId,
    overrides,
    animations,
    footerConfig,
    backgroundConfig,
  } = await getPublicShellData();

  return (
    <PublicChrome
      profile={profile}
      initialThemeId={themeId}
      initialOverrides={overrides}
      initialAnimations={animations}
      footerConfig={footerConfig}
      backgroundConfig={backgroundConfig}
    >
      <PageHeader
        eyebrow="About"
        title="Philosophy & Capabilities"
      />
      <AboutSection profile={profile} config={visualConfig.about} />
      <ProfileSection profile={profile} />
    </PublicChrome>
  );
}
