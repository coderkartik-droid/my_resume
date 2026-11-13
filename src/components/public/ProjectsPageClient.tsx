"use client";

import { useState } from "react";
import type { Project } from "@/types";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ProjectDetailsModal from "@/components/ui/ProjectDetailsModal";

interface ProjectsPageClientProps {
  projects: Project[];
}

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <ProjectsSection projects={projects} onSelectProject={setSelectedProject} />
      <ProjectDetailsModal
        project={selectedProject}
        allProjects={projects}
        onClose={() => setSelectedProject(null)}
        onNavigate={(p) => setSelectedProject(p)}
      />
    </>
  );
}
