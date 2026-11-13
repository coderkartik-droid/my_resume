import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    let profile = await prisma.profile.findFirst();
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: "profile_default",
          name: "Kartik Khajuria",
          tagline: "Creative Developer | Full-Stack Software Engineer",
          bio: "Crafting high-impact interactive 3D web experiences, modern user interfaces, and scalable full-stack applications.",
          email: "kartikkhajuria643@gmail.com",
          phone: "+91 7518850297",
          location: "Mathura, Uttar Pradesh, India",
          websiteTitle: "Kartik Khajuria — Creative Developer & 3D Interactive Portfolio",
          footerText: "Designed & developed with precision, WebGL shaders & Next.js architecture.",
        },
      });
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const existing = await prisma.profile.findFirst();

    const updated = await prisma.profile.upsert({
      where: { id: existing?.id || "profile_default" },
      update: {
        name: data.name,
        tagline: data.tagline,
        bio: data.bio,
        aboutStory: data.aboutStory,
        avatarUrl: data.avatarUrl,
        resumeUrl: data.resumeUrl,
        email: data.email,
        phone: data.phone,
        location: data.location,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        twitterUrl: data.twitterUrl,
        websiteTitle: data.websiteTitle,
        footerText: data.footerText,
      },
      create: {
        id: "profile_default",
        name: data.name || "Kartik",
        tagline: data.tagline || "",
        bio: data.bio || "",
        aboutStory: data.aboutStory || "",
        avatarUrl: data.avatarUrl || null,
        resumeUrl: data.resumeUrl || null,
        email: data.email || "",
        phone: data.phone || null,
        location: data.location || "",
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        twitterUrl: data.twitterUrl || null,
        websiteTitle: data.websiteTitle || "Kartik Portfolio",
        footerText: data.footerText || "",
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/profile");
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

