import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const last = await prisma.service.findFirst({ orderBy: { order: "desc" } });
    const nextOrder = (last?.order ?? 0) + 1;

    const svc = await prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon || "Box",
        features: typeof data.features === "string" ? data.features : JSON.stringify(data.features || []),
        order: data.order !== undefined ? Number(data.order) : nextOrder,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/services");
    } catch {}

    return NextResponse.json(svc, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const updated = await prisma.service.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon,
        features: typeof data.features === "string" ? data.features : JSON.stringify(data.features || []),
        order: data.order !== undefined ? Number(data.order) : undefined,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/services");
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.service.delete({ where: { id } });

    try {
      revalidatePath("/");
      revalidatePath("/api/services");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}

