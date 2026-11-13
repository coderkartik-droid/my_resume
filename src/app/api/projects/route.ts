import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { formatProjectNumber } from "@/lib/utils";

// GET /api/projects - fetch projects sorted by order
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("all") === "true";
    const session = await getAdminSession();

    const whereClause = includeAll && session ? {} : { published: true };

    const projects = await prisma.project.findMany({
      where: whereClause,
      orderBy: { order: "asc" },
      include: {
        files: {
          where: session ? {} : { visible: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - create new project (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Determine highest order
    const lastProject = await prisma.project.findFirst({
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastProject?.order ?? 0) + 1;
    const displayNumber = data.displayNumber || formatProjectNumber(nextOrder);

    // Create unique slug if not provided
    const baseSlug = (data.title || "project")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    let slug = data.slug || baseSlug;
    const existingSlug = await prisma.project.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newProject = await prisma.project.create({
      data: {
        title: data.title,
        slug,
        order: data.order !== undefined ? Number(data.order) : nextOrder,
        displayNumber,
        category: data.category || "Web Development",
        shortDesc: data.shortDesc || "",
        fullDesc: data.fullDesc || "",
        objectives: data.objectives || "",
        problem: data.problem || "",
        solution: data.solution || "",
        keyFeatures: typeof data.keyFeatures === "string" ? data.keyFeatures : JSON.stringify(data.keyFeatures || []),
        challenges: data.challenges || "",
        techStack: data.techStack || "",
        thumbnailUrl: data.thumbnailUrl || null,
        screenshots: typeof data.screenshots === "string" ? data.screenshots : JSON.stringify(data.screenshots || []),
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
        documentationUrl: data.documentationUrl || null,
        videoDemoUrl: data.videoDemoUrl || null,
        status: data.status || "Completed",
        featured: Boolean(data.featured),
        published: data.published !== undefined ? Boolean(data.published) : true,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/projects");
    } catch {}

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects - bulk reorder projects (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items } = body as { items: Array<{ id: string; order: number; displayNumber?: string }> };

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items array is required for reordering" },
        { status: 400 }
      );
    }

    // Execute atomic batch update
    await prisma.$transaction(
      items.map((item, index) => {
        const sequentialOrder = index + 1;
        const autoDisplayNumber = formatProjectNumber(sequentialOrder);
        return prisma.project.update({
          where: { id: item.id },
          data: {
            order: sequentialOrder,
            displayNumber: item.displayNumber || autoDisplayNumber,
          },
        });
      })
    );

    const updated = await prisma.project.findMany({
      orderBy: { order: "asc" },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/projects");
    } catch {}

    return NextResponse.json({ success: true, projects: updated });
  } catch (error) {
    console.error("Error reordering projects:", error);
    return NextResponse.json(
      { error: "Failed to reorder projects" },
      { status: 500 }
    );
  }
}

