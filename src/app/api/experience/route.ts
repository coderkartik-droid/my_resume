import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const where = type ? { type } : {};
    const experiences = await prisma.experience.findMany({
      where,
      orderBy: { order: "asc" },
    });
    return NextResponse.json(experiences);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const lastExp = await prisma.experience.findFirst({ orderBy: { order: "desc" } });
    const nextOrder = (lastExp?.order ?? 0) + 1;

    const exp = await prisma.experience.create({
      data: {
        type: data.type || "work",
        role: data.role,
        organization: data.organization,
        location: data.location || null,
        period: data.period,
        description: data.description,
        skills: data.skills || null,
        order: data.order !== undefined ? Number(data.order) : nextOrder,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/experience");
    } catch {}

    return NextResponse.json(exp, { status: 201 });
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const updated = await prisma.experience.update({
      where: { id: data.id },
      data: {
        type: data.type,
        role: data.role,
        organization: data.organization,
        location: data.location,
        period: data.period,
        description: data.description,
        skills: data.skills,
        order: data.order !== undefined ? Number(data.order) : undefined,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/experience");
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating experience:", error);
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.experience.delete({ where: { id } });

    try {
      revalidatePath("/");
      revalidatePath("/api/experience");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}

