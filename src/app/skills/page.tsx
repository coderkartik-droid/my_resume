import { prisma } from "@/lib/prisma";
import { getPublicShellData } from "@/lib/public-shell";
import PublicChrome from "@/components/public/PublicChrome";
import PageHeader from "@/components/public/PageHeader";
import SkillsSection from "@/components/sections/SkillsSection";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.profile.findFirst();
  const name = profile?.name || "Kartik Khajuria";
  return {
    title: `Skills & Technologies | ${name}`,
    description:
      "Explore the full technical ecosystem: frontend, backend, databases, UI/UX, WebGL and cloud tooling.",
  };
}

export default async function SkillsPage() {
  const [
    { profile, themeId, overrides, animations, footerConfig, backgroundConfig },
    skills,
  ] = await Promise.all([
    getPublicShellData(),
    prisma.skill.findMany({ orderBy: { order: "asc" } }),
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
      <PageHeader eyebrow="Skills" title="Technical Ecosystem" />
      <SkillsSection skills={skills} />
    </PublicChrome>
  );
}
