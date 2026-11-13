import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProjectDetailClient from "@/components/ui/ProjectDetailClient";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      files: {
        where: { visible: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} | Case Study`,
    description: project.shortDesc,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      files: {
        where: { visible: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const allProjects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  const currentIndex = allProjects.findIndex((p) => p.id === project.id);
  const prevProject =
    allProjects.length > 1
      ? currentIndex > 0
        ? allProjects[currentIndex - 1]
        : allProjects[allProjects.length - 1]
      : null;
  const nextProject =
    allProjects.length > 1
      ? currentIndex < allProjects.length - 1
        ? allProjects[currentIndex + 1]
        : allProjects[0]
      : null;

  let keyFeaturesList: string[] = [];
  if (project.keyFeatures) {
    try {
      keyFeaturesList = JSON.parse(project.keyFeatures);
    } catch {
      keyFeaturesList = project.keyFeatures.split("\n").filter(Boolean);
    }
  }

  let screenshotsList: string[] = [];
  if (project.screenshots) {
    try {
      screenshotsList = JSON.parse(project.screenshots);
    } catch {
      screenshotsList = project.screenshots.split("\n").filter(Boolean);
    }
  }

  const techStackList = project.techStack
    ? project.techStack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <ProjectDetailClient
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
      keyFeaturesList={keyFeaturesList}
      screenshotsList={screenshotsList}
      techStackList={techStackList}
    />
  );
}
