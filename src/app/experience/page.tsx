import { prisma } from "@/lib/prisma";
import { getPublicShellData } from "@/lib/public-shell";
import PublicChrome from "@/components/public/PublicChrome";
import PageHeader from "@/components/public/PageHeader";
import ExperienceSection from "@/components/sections/ExperienceSection";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.profile.findFirst();
  const name = profile?.name || "Kartik Khajuria";
  return {
    title: `Career & Experience | ${name}`,
    description:
      "Professional timeline covering roles, education and the milestones behind the craft.",
  };
}

export default async function ExperiencePage() {
  const [
    { profile, themeId, overrides, animations, footerConfig, backgroundConfig },
    experience,
  ] = await Promise.all([
    getPublicShellData(),
    prisma.experience.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <PublicChrome
      profile={profile}
      initialThemeId={themeId}
      initialOverrides={overrides}
      initialAnimations={animations}
      footerConfig={footerConfig}
      backgroundConfig={backgroundConfig}
    >
      <PageHeader eyebrow="Career" title="Professional Expedition" />
      <ExperienceSection experience={experience} />
    </PublicChrome>
  );
}
