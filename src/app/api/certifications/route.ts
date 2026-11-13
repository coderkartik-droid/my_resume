import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const certs = await prisma.certification.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(certs);
  } catch (error) {
    console.error("Certifications GET error:", error);
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, issuer, issueDate, credentialUrl, badgeUrl, skills, order } = body;

    if (!title || !issuer) {
      return NextResponse.json({ error: "Title and issuer are required" }, { status: 400 });
    }

    const cert = await prisma.certification.create({
      data: {
        title,
        issuer,
        issueDate: issueDate || "Recent",
        credentialUrl: credentialUrl || null,
        badgeUrl: badgeUrl || null,
        skills: skills || null,
        order: order !== undefined ? Number(order) : 0,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/certifications");
    } catch {}

    return NextResponse.json(cert, { status: 201 });
  } catch (error) {
    console.error("Certification create error:", error);
    return NextResponse.json({ error: "Failed to create certification" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, issuer, issueDate, credentialUrl, badgeUrl, skills, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updated = await prisma.certification.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(issuer && { issuer }),
        ...(issueDate !== undefined && { issueDate }),
        ...(credentialUrl !== undefined && { credentialUrl }),
        ...(badgeUrl !== undefined && { badgeUrl }),
        ...(skills !== undefined && { skills }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/certifications");
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Certification update error:", error);
    return NextResponse.json({ error: "Failed to update certification" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.certification.delete({ where: { id } });

    try {
      revalidatePath("/");
      revalidatePath("/api/certifications");
    } catch {}

    return NextResponse.json({ success: true, message: "Certification deleted" });
  } catch (error) {
    console.error("Certification delete error:", error);
    return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 });
  }
}
