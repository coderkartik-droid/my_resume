import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Testimonials GET error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { author, role, company, avatarUrl, quote, rating, featured, order } = body;

    if (!author || !quote) {
      return NextResponse.json({ error: "Author and quote are required" }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        author,
        role: role || "Collaborator",
        company: company || "Independent",
        avatarUrl: avatarUrl || null,
        quote,
        rating: rating !== undefined ? Number(rating) : 5,
        featured: featured !== undefined ? Boolean(featured) : true,
        order: order !== undefined ? Number(order) : 0,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/testimonials");
    } catch {}

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Testimonial create error:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, author, role, company, avatarUrl, quote, rating, featured, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(author && { author }),
        ...(role !== undefined && { role }),
        ...(company !== undefined && { company }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(quote && { quote }),
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/testimonials");
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Testimonial update error:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
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

    await prisma.testimonial.delete({ where: { id } });

    try {
      revalidatePath("/");
      revalidatePath("/api/testimonials");
    } catch {}

    return NextResponse.json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    console.error("Testimonial delete error:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
