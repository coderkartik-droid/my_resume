import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const lastSkill = await prisma.skill.findFirst({ orderBy: { order: "desc" } });
    const nextOrder = (lastSkill?.order ?? 0) + 1;

    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        category: data.category || "Frontend Development",
        level: data.level || "Expert",
        icon: data.icon || "Code",
        order: data.order !== undefined ? Number(data.order) : nextOrder,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/skills");
    } catch {}

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const updated = await prisma.skill.update({
      where: { id: data.id },
      data: {
        name: data.name,
        category: data.category,
        level: data.level,
        icon: data.icon,
        order: data.order !== undefined ? Number(data.order) : undefined,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/skills");
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.skill.delete({ where: { id } });

    try {
      revalidatePath("/");
      revalidatePath("/api/skills");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}

