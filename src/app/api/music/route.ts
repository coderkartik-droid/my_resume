import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("all") === "true";

    // If requesting all tracks, check if admin
    let isAdmin = false;
    if (includeAll) {
      const session = await getAdminSession();
      isAdmin = !!session;
    }

    // Get active music config
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

    // Fetch tracks
    const whereClause: { enabled?: boolean; playlist?: string } = {};
    if (!isAdmin) {
      whereClause.enabled = true;
      if (config.activePlaylist && config.activePlaylist !== "all") {
        whereClause.playlist = config.activePlaylist;
      }
    }

    let tracks = await prisma.musicTrack.findMany({
      where: whereClause,
      orderBy: { order: "asc" },
    });

    // If visitor requested active playlist and got 0 tracks, fallback to all enabled tracks
    if (!isAdmin && tracks.length === 0) {
      tracks = await prisma.musicTrack.findMany({
        where: { enabled: true },
        orderBy: { order: "asc" },
      });
    }

    // Get all distinct playlist names across all tracks
    const allTracksWithPlaylists = await prisma.musicTrack.findMany({
      select: { playlist: true },
      distinct: ["playlist"],
    });
    const playlists = Array.from(
      new Set(allTracksWithPlaylists.map((t) => t.playlist || "Default").filter(Boolean))
    );

    // Determine default track
    let defaultTrack = null;
    if (config.defaultTrackId) {
      defaultTrack = tracks.find((t) => t.id === config.defaultTrackId) || null;
    }
    if (!defaultTrack) {
      defaultTrack = tracks.find((t) => t.isDefault) || tracks[0] || null;
    }

    return NextResponse.json({
      config,
      tracks,
      defaultTrack,
      playlists,
      totalTracks: tracks.length,
    });
  } catch (error) {
    console.error("Music API GET error:", error);
    return NextResponse.json({ error: "Failed to load music system" }, { status: 500 });
  }
}
