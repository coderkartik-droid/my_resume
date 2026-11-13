import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import {
  validateAudioFile,
  sanitizeAudioFileName,
  ensureAudioStorageDir,
  safelyDeleteAudioFile,
} from "@/lib/music-security";

export const dynamic = "force-dynamic";

function cleanTitleFromFilename(fileName: string): string {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  return base
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await prisma.musicConfig.findFirst({
      where: { id: "active_music_config" },
    });
    const maxSizeBytes = (config?.maxUploadSizeMb || 50) * 1024 * 1024;

    const formData = await req.formData();
    const replaceId = formData.get("replaceId") as string | null;
    const customTitle = formData.get("title") as string | null;
    const customArtist = formData.get("artist") as string | null;
    const customAlbum = formData.get("album") as string | null;
    const customPlaylist = formData.get("playlist") as string | null;
    const makeDefault = formData.get("isDefault") === "true";

    // Gather all files from form data: either named "file" or "files"
    const files: File[] = [];
    const directFiles = formData.getAll("files");
    const singleFile = formData.get("file");

    if (directFiles && directFiles.length > 0) {
      for (const item of directFiles) {
        if (item instanceof File && item.size > 0) {
          files.push(item);
        }
      }
    } else if (singleFile instanceof File && singleFile.size > 0) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No audio file provided. Please select at least one file." },
        { status: 400 }
      );
    }

    const audioDir = await ensureAudioStorageDir();
    const results = [];

    // If replacing an existing song
    if (replaceId && files.length === 1) {
      const file = files[0];
      const validation = validateAudioFile(file.name, file.type);
      if (!validation.valid) {
        return NextResponse.json(
          {
            error: `Invalid file format: ${file.name}. Supported formats: MP3, WAV, OGG, AAC, M4A, FLAC.`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          {
            error: `File ${file.name} exceeds max allowed size of ${config?.maxUploadSizeMb || 50} MB.`,
          },
          { status: 400 }
        );
      }

      const existingTrack = await prisma.musicTrack.findUnique({
        where: { id: replaceId },
      });

      if (!existingTrack) {
        return NextResponse.json({ error: "Target song to replace not found" }, { status: 404 });
      }

      // Delete old file if present
      if (existingTrack.storagePath) {
        await safelyDeleteAudioFile(existingTrack.storagePath);
      } else if (existingTrack.audioUrl) {
        await safelyDeleteAudioFile(existingTrack.audioUrl);
      }

      const safeName = sanitizeAudioFileName(file.name);
      const filePath = path.join(audioDir, safeName);
      const bytes = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(bytes));

      const updatedTrack = await prisma.musicTrack.update({
        where: { id: replaceId },
        data: {
          title: customTitle?.trim() || existingTrack.title,
          artist: customArtist?.trim() || existingTrack.artist,
          album: customAlbum?.trim() || existingTrack.album,
          playlist: customPlaylist?.trim() || existingTrack.playlist,
          audioUrl: `/uploads/audio/${safeName}`,
          storagePath: filePath,
          fileName: file.name,
          mimeType: validation.mime,
          fileSize: file.size,
          isDefault: makeDefault ? true : existingTrack.isDefault,
        },
      });

      if (makeDefault) {
        await prisma.musicTrack.updateMany({
          where: { id: { not: replaceId } },
          data: { isDefault: false },
        });
        await prisma.musicConfig.update({
          where: { id: "active_music_config" },
          data: { defaultTrackId: replaceId },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Song replaced successfully",
        track: updatedTrack,
      });
    }

    // Otherwise, normal upload (single or multiple)
    // Get highest existing order
    const maxOrderTrack = await prisma.musicTrack.findFirst({
      orderBy: { order: "desc" },
    });
    let currentOrder = maxOrderTrack ? maxOrderTrack.order + 1 : 0;

    // Check if this is the very first track in the system
    const totalExistingCount = await prisma.musicTrack.count();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateAudioFile(file.name, file.type);
      if (!validation.valid) {
        return NextResponse.json(
          {
            error: `File "${file.name}" has an unsupported format. Supported formats: MP3, WAV, OGG, AAC, M4A, FLAC.`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the maximum allowed size of ${config?.maxUploadSizeMb || 50} MB.`,
          },
          { status: 400 }
        );
      }

      const safeName = sanitizeAudioFileName(file.name);
      const filePath = path.join(audioDir, safeName);
      const bytes = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(bytes));

      const isFirst = totalExistingCount === 0 && i === 0;
      const shouldBeDefault = makeDefault ? i === 0 : isFirst;

      const trackTitle =
        files.length === 1 && customTitle?.trim()
          ? customTitle.trim()
          : cleanTitleFromFilename(file.name);

      const trackArtist = customArtist?.trim() || "Unknown Artist";
      const trackAlbum = customAlbum?.trim() || "Portfolio Soundscapes";
      const trackPlaylist = customPlaylist?.trim() || "Default";

      const createdTrack = await prisma.musicTrack.create({
        data: {
          title: trackTitle,
          artist: trackArtist,
          album: trackAlbum,
          playlist: trackPlaylist,
          audioUrl: `/uploads/audio/${safeName}`,
          storagePath: filePath,
          fileName: file.name,
          mimeType: validation.mime,
          fileSize: file.size,
          order: currentOrder++,
          enabled: true,
          isDefault: shouldBeDefault,
        },
      });

      if (shouldBeDefault) {
        await prisma.musicTrack.updateMany({
          where: { id: { not: createdTrack.id } },
          data: { isDefault: false },
        });
        await prisma.musicConfig.update({
          where: { id: "active_music_config" },
          data: { defaultTrackId: createdTrack.id },
        });
      }

      results.push(createdTrack);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${results.length} song${results.length > 1 ? "s" : ""}`,
      tracks: results,
    });
  } catch (error) {
    console.error("Audio upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload audio file(s). Please try again." },
      { status: 500 }
    );
  }
}
