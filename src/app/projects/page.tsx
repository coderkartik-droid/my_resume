import { prisma } from "@/lib/prisma";
import { getPublicShellData } from "@/lib/public-shell";
import PublicChrome from "@/components/public/PublicChrome";
import PageHeader from "@/components/public/PageHeader";
import ProjectsPageClient from "@/components/public/ProjectsPageClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.profile.findFirst();
  const name = profile?.name || "Kartik Khajuria";
  return {
    title: `Projects & Case Studies | ${name}`,
    description:
      "A curated collection of shipped products, WebGL experiments and full-stack platforms.",
  };
}

export default async function ProjectsPage() {
  const [
    { profile, themeId, overrides, animations, footerConfig, backgroundConfig },
    projects,
  ] = await Promise.all([
      getPublicShellData(),
      prisma.project.findMany({
        where: { published: true },
        orderBy: [{ createdAt: "desc" }, { order: "asc" }],
        include: {
          files: {
            where: { visible: true },
            orderBy: { order: "asc" },
          },
        },
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
      <PageHeader eyebrow="Projects" title="Selected Creations" />
      <ProjectsPageClient projects={projects} />
    </PublicChrome>
  );
}
