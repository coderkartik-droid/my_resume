import { prisma } from "@/lib/prisma";
import { getPublicShellData } from "@/lib/public-shell";
import PublicChrome from "@/components/public/PublicChrome";
import PageHeader from "@/components/public/PageHeader";
import AchievementsSection from "@/components/sections/AchievementsSection";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.profile.findFirst();
  const name = profile?.name || "Kartik Khajuria";
  return {
    title: `Accolades & Certifications | ${name}`,
    description:
      "Certifications, awards and recognitions earned across the engineering journey.",
  };
}

export default async function AchievementsPage() {
  const [
    { profile, themeId, overrides, animations, footerConfig, backgroundConfig },
    certifications,
    experience,
  ] = await Promise.all([
    getPublicShellData(),
    prisma.certification.findMany({ orderBy: { order: "asc" } }),
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
      <PageHeader eyebrow="Accolades" title="Credentials & Recognition" />
      <AchievementsSection
        certifications={certifications}
        achievements={experience.filter((e) => e.type === "achievement")}
      />
    </PublicChrome>
  );
}
