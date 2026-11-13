import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { formatProjectNumber } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        files: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        order: data.order !== undefined ? Number(data.order) : undefined,
        displayNumber: data.displayNumber,
        category: data.category,
        shortDesc: data.shortDesc,
        fullDesc: data.fullDesc,
        objectives: data.objectives,
        problem: data.problem,
        solution: data.solution,
        keyFeatures: typeof data.keyFeatures === "string" ? data.keyFeatures : JSON.stringify(data.keyFeatures || []),
        challenges: data.challenges,
        techStack: data.techStack,
        thumbnailUrl: data.thumbnailUrl,
        screenshots: typeof data.screenshots === "string" ? data.screenshots : JSON.stringify(data.screenshots || []),
        liveUrl: data.liveUrl,
        githubUrl: data.githubUrl,
        documentationUrl: data.documentationUrl !== undefined ? data.documentationUrl : undefined,
        videoDemoUrl: data.videoDemoUrl !== undefined ? data.videoDemoUrl : undefined,
        status: data.status,
        featured: data.featured !== undefined ? Boolean(data.featured) : undefined,
        published: data.published !== undefined ? Boolean(data.published) : undefined,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/projects");
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.project.delete({ where: { id } });

    // Re-index remaining projects sequentially
    const remaining = await prisma.project.findMany({
      orderBy: { order: "asc" },
    });

    await prisma.$transaction(
      remaining.map((p, idx) => {
        const newOrder = idx + 1;
        return prisma.project.update({
          where: { id: p.id },
          data: {
            order: newOrder,
            displayNumber: formatProjectNumber(newOrder),
          },
        });
      })
    );

    try {
      revalidatePath("/");
      revalidatePath("/api/projects");
    } catch {}

    return NextResponse.json({ success: true, message: "Project deleted and renumbered" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

