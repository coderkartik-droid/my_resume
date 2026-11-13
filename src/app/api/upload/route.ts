import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // 1. Fetch cataloged assets from Prisma
    const cataloged = await prisma.mediaAsset.findMany({
      where: { visible: true },
      orderBy: { createdAt: "desc" },
    });
    const catalogedNames = new Set(cataloged.map((a) => a.fileName));

    // 2. Discover any uncataloged existing disk files and auto-index into Prisma
    const diskFiles = await fs.readdir(uploadsDir);
    for (const name of diskFiles) {
      if (!catalogedNames.has(name)) {
        try {
          const filePath = path.join(uploadsDir, name);
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            const ext = path.extname(name).toLowerCase();
            let mime = "application/octet-stream";
            if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
              mime = `image/${ext.replace(".", "").replace("jpg", "jpeg")}`;
            }

            const newAsset = await prisma.mediaAsset.create({
              data: {
                fileName: name,
                originalName: name,
                mimeType: mime,
                fileSize: stats.size,
                fileSizeFormatted: formatBytes(stats.size),
                url: `/uploads/${name}`,
                storagePath: filePath,
                category: "general",
                visible: true,
              },
            });
            cataloged.push(newAsset);
          }
        } catch {
          // Skip unreadable files
        }
      }
    }

    // Return unified list formatted for admin frontend
    const formatted = cataloged.map((a) => ({
      id: a.id,
      name: a.fileName,
      originalName: a.originalName,
      url: a.url,
      size: a.fileSize,
      fileSizeFormatted: a.fileSizeFormatted,
      category: a.category,
      updatedAt: a.updatedAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("List media assets error:", error);
    return NextResponse.json({ error: "Failed to list media assets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name
    const ext = path.extname(file.name) || ".png";
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
    const uniqueFileName = `${cleanBase}_${Date.now()}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueFileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    // Record in Prisma MediaAsset model
    const asset = await prisma.mediaAsset.create({
      data: {
        fileName: uniqueFileName,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: buffer.length,
        fileSizeFormatted: formatBytes(buffer.length),
        url: publicUrl,
        storagePath: filePath,
        category,
        visible: true,
      },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPLOAD_MEDIA",
        resource: "MediaAsset",
        resourceId: asset.id,
        details: JSON.stringify({ fileName: asset.fileName, size: asset.fileSizeFormatted }),
      },
    }).catch(() => {});

    return NextResponse.json({
      id: asset.id,
      url: publicUrl,
      name: uniqueFileName,
      size: asset.fileSize,
      fileSizeFormatted: asset.fileSizeFormatted,
    });
  } catch (error) {
    console.error("Upload media error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");
    const id = searchParams.get("id");

    if (!filename && !id) {
      return NextResponse.json({ error: "Filename or Asset ID required" }, { status: 400 });
    }

    let asset = null;
    if (id) {
      asset = await prisma.mediaAsset.findUnique({ where: { id } });
    } else if (filename) {
      const safeName = path.basename(filename);
      asset = await prisma.mediaAsset.findFirst({ where: { fileName: safeName } });
    }

    const targetFileName = asset ? asset.fileName : path.basename(filename || "");
    const safeName = path.basename(targetFileName);
    const filePath = path.join(process.cwd(), "public", "uploads", safeName);

    // Remove from disk
    try {
      await fs.unlink(filePath);
    } catch {
      // Disk file may already be removed
    }

    // Remove or soft-delete from Prisma
    if (asset) {
      await prisma.mediaAsset.delete({ where: { id: asset.id } }).catch(() => {});
    }

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "DELETE_MEDIA",
        resource: "MediaAsset",
        resourceId: asset?.id || targetFileName,
        details: JSON.stringify({ fileName: targetFileName }),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: "File removed" });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
