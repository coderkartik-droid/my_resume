import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let updates: { id: string; order: number }[] = [];

    if (Array.isArray(body.items)) {
      updates = body.items;
    } else if (Array.isArray(body.trackIds)) {
      updates = body.trackIds.map((id: string, index: number) => ({
        id,
        order: index,
      }));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No reorder data provided" }, { status: 400 });
    }

    await prisma.$transaction(
      updates.map((item) =>
        prisma.musicTrack.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    const reorderedTracks = await prisma.musicTrack.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: "Song ordering updated successfully",
      tracks: reorderedTracks,
    });
  } catch (error) {
    console.error("Reorder tracks error:", error);
    return NextResponse.json({ error: "Failed to reorder songs" }, { status: 500 });
  }
}
