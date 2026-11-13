import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import fsp from "fs/promises";
import { isSafeFilePath } from "@/lib/file-security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Download ID is required" }, { status: 400 });
    }

    const file = await prisma.projectFile.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, title: true, published: true },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "Requested file not found" }, { status: 404 });
    }

    if (!file.visible) {
      return NextResponse.json({ error: "This file is currently unavailable" }, { status: 403 });
    }

    // Security verify: ensure the path exists and is inside storage directory
    if (!file.storagePath || !isSafeFilePath(file.storagePath)) {
      console.error("Potential path traversal or invalid storage path:", file.storagePath);
      return NextResponse.json({ error: "Invalid file location" }, { status: 400 });
    }

    let stats: fs.Stats;
    try {
      stats = await fsp.stat(file.storagePath);
    } catch {
      return NextResponse.json({ error: "File asset missing on server" }, { status: 404 });
    }

    // Increment download count asynchronously
    prisma.projectFile
      .update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      })
      .catch((e) => console.error("Error updating download count:", e));

    // Log the download event
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    prisma.downloadLog
      .create({
        data: {
          fileId: file.id,
          ip: typeof ip === "string" ? ip.split(",")[0].trim() : "unknown",
          userAgent: userAgent.slice(0, 255),
        },
      })
      .catch((e) => console.error("Error logging download:", e));

    // Create stream
    const fileStream = fs.createReadStream(file.storagePath);
    const safeDownloadName = encodeURIComponent(file.fileName).replace(/['()]/g, escape);

    // Return streaming response with attachment disposition
    return new Response(fileStream as unknown as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.fileName}"; filename*=UTF-8''${safeDownloadName}`,
        "Content-Length": stats.size.toString(),
        "Cache-Control": "public, max-age=86400, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Download endpoint error:", error);
    return NextResponse.json({ error: "Failed to process download" }, { status: 500 });
  }
}
