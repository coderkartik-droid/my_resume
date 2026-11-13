import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safelyDeleteAudioFile } from "@/lib/music-security";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const existing = await prisma.musicTrack.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const updateData: {
      title?: string;
      artist?: string;
      album?: string | null;
      playlist?: string;
      order?: number;
      enabled?: boolean;
      isDefault?: boolean;
    } = {};

    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.artist !== undefined) updateData.artist = String(body.artist).trim();
    if (body.album !== undefined) updateData.album = body.album ? String(body.album).trim() : null;
    if (body.playlist !== undefined) updateData.playlist = String(body.playlist).trim() || "Default";
    if (body.order !== undefined) updateData.order = Number(body.order) || 0;
    if (body.enabled !== undefined) updateData.enabled = Boolean(body.enabled);
    if (body.isDefault !== undefined) updateData.isDefault = Boolean(body.isDefault);

    // If making this song the default song
    if (updateData.isDefault) {
      await prisma.musicTrack.updateMany({
        where: { id: { not: id } },
        data: { isDefault: false },
      });
      await prisma.musicConfig.update({
        where: { id: "active_music_config" },
        data: { defaultTrackId: id },
      });
    }

    const updated = await prisma.musicTrack.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, track: updated });
  } catch (error) {
    console.error("Update song error:", error);
    return NextResponse.json({ error: "Failed to update song details" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.musicTrack.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Safely remove file from disk
    if (existing.storagePath) {
      await safelyDeleteAudioFile(existing.storagePath);
    } else if (existing.audioUrl) {
      await safelyDeleteAudioFile(existing.audioUrl);
    }

    // Delete database record
    await prisma.musicTrack.delete({
      where: { id },
    });

    // If this was default track, update config
    const config = await prisma.musicConfig.findFirst({
      where: { id: "active_music_config" },
    });

    if (config?.defaultTrackId === id) {
      const nextDefault = await prisma.musicTrack.findFirst({
        where: { enabled: true },
        orderBy: { order: "asc" },
      });

      await prisma.musicConfig.update({
        where: { id: "active_music_config" },
        data: {
          defaultTrackId: nextDefault ? nextDefault.id : null,
        },
      });

      if (nextDefault) {
        await prisma.musicTrack.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Song deleted successfully" });
  } catch (error) {
    console.error("Delete song error:", error);
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
  }
}
