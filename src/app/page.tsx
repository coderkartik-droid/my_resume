import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getPublicShellData } from "@/lib/public-shell";
import PublicChrome from "@/components/public/PublicChrome";
import HomeLanding from "@/components/public/HomeLanding";

// Enforce dynamic server-side rendering on every request to reflect immediate database updates
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.profile.findFirst();
  return {
    title:
      profile?.websiteTitle ||
      "Kartik Khajuria — World-Class Creative Developer & Full-Stack Portfolio",
    description:
      profile?.bio ||
      "World-class personal portfolio of Kartik Khajuria featuring interactive 3D WebGL experiences, full-stack architectures, and 20 dynamic themes.",
  };
}

export default async function HomePage() {
  const [
    { profile, visualConfig, themeId, overrides, animations, footerConfig, backgroundConfig },
    projects,
    skills,
  ] = await Promise.all([
      getPublicShellData(),
      prisma.project.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        include: {
          files: {
            where: { visible: true },
            orderBy: { order: "asc" },
          },
        },
      }),
      prisma.skill.findMany({
        orderBy: { order: "asc" },
      }),
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
      <HomeLanding
        profile={profile}
        projects={projects}
        skills={skills}
        visualConfig={visualConfig}
      />
    </PublicChrome>
  );
}
