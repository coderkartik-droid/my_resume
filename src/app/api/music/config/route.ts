import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let config = await prisma.musicConfig.findFirst({
      where: { id: "active_music_config" },
    });

    if (!config) {
      config = await prisma.musicConfig.create({
        data: {
          id: "active_music_config",
          enabled: true,
          showTopbarToggle: true,
          defaultVolume: 0.35,
          autoplayAttempt: false,
          loop: true,
          shuffle: false,
          playbackMode: "playlist",
          activePlaylist: "all",
          buttonStyle: "equalizer",
          buttonPosition: "topbar-right",
          maxUploadSizeMb: 50,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Get music config error:", error);
    return NextResponse.json({ error: "Failed to fetch music settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const dataToUpdate: {
      enabled?: boolean;
      showTopbarToggle?: boolean;
      defaultTrackId?: string | null;
      defaultVolume?: number;
      autoplayAttempt?: boolean;
      loop?: boolean;
      shuffle?: boolean;
      playbackMode?: string;
      activePlaylist?: string;
      buttonStyle?: string;
      buttonPosition?: string;
      maxUploadSizeMb?: number;
    } = {};

    if (body.enabled !== undefined) dataToUpdate.enabled = Boolean(body.enabled);
    if (body.showTopbarToggle !== undefined) dataToUpdate.showTopbarToggle = Boolean(body.showTopbarToggle);
    if (body.defaultTrackId !== undefined) {
      dataToUpdate.defaultTrackId = body.defaultTrackId ? String(body.defaultTrackId) : null;
      if (body.defaultTrackId) {
        // Also update track.isDefault
        await prisma.musicTrack.updateMany({
          data: { isDefault: false },
        });
        await prisma.musicTrack.update({
          where: { id: body.defaultTrackId },
          data: { isDefault: true },
        }).catch(() => {});
      }
    }
    if (body.defaultVolume !== undefined) {
      dataToUpdate.defaultVolume = Math.max(0, Math.min(1, Number(body.defaultVolume)));
    }
    if (body.autoplayAttempt !== undefined) dataToUpdate.autoplayAttempt = Boolean(body.autoplayAttempt);
    if (body.loop !== undefined) dataToUpdate.loop = Boolean(body.loop);
    if (body.shuffle !== undefined) dataToUpdate.shuffle = Boolean(body.shuffle);
    if (body.playbackMode !== undefined) dataToUpdate.playbackMode = String(body.playbackMode);
    if (body.activePlaylist !== undefined) dataToUpdate.activePlaylist = String(body.activePlaylist);
    if (body.buttonStyle !== undefined) dataToUpdate.buttonStyle = String(body.buttonStyle);
    if (body.buttonPosition !== undefined) dataToUpdate.buttonPosition = String(body.buttonPosition);
    if (body.maxUploadSizeMb !== undefined) {
      dataToUpdate.maxUploadSizeMb = Math.max(1, Math.min(500, Number(body.maxUploadSizeMb) || 50));
    }

    const updated = await prisma.musicConfig.upsert({
      where: { id: "active_music_config" },
      update: dataToUpdate,
      create: {
        id: "active_music_config",
        enabled: dataToUpdate.enabled ?? true,
        showTopbarToggle: dataToUpdate.showTopbarToggle ?? true,
        defaultTrackId: dataToUpdate.defaultTrackId ?? null,
        defaultVolume: dataToUpdate.defaultVolume ?? 0.35,
        autoplayAttempt: dataToUpdate.autoplayAttempt ?? false,
        loop: dataToUpdate.loop ?? true,
        shuffle: dataToUpdate.shuffle ?? false,
        playbackMode: dataToUpdate.playbackMode ?? "playlist",
        activePlaylist: dataToUpdate.activePlaylist ?? "all",
        buttonStyle: dataToUpdate.buttonStyle ?? "equalizer",
        buttonPosition: dataToUpdate.buttonPosition ?? "topbar-right",
        maxUploadSizeMb: dataToUpdate.maxUploadSizeMb ?? 50,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/api/music");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Music settings updated successfully",
      config: updated,
    });
  } catch (error) {
    console.error("Update music config error:", error);
    return NextResponse.json({ error: "Failed to update music settings" }, { status: 500 });
  }
}
