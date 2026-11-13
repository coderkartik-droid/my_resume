import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import {
  ensureStorageDirectory,
  formatBytes,
  generateStorageName,
  isSafeFilePath,
  MAX_FILE_SIZE,
  sanitizeFileName,
  validateExtension,
} from "@/lib/file-security";

// GET /api/project-files?projectId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const whereClause: { projectId?: string; visible?: boolean } = {};
    if (projectId) {
      whereClause.projectId = projectId;
    }

    const session = await getAdminSession();
    // Non-admin can only see visible files
    if (!session) {
      whereClause.visible = true;
    }

    const files = await prisma.projectFile.findMany({
      where: whereClause,
      orderBy: { order: "asc" },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Fetch project files error:", error);
    return NextResponse.json({ error: "Failed to fetch project files" }, { status: 500 });
  }
}

// POST /api/project-files
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const customName = formData.get("fileName") as string | null;
    const description = formData.get("fileDescription") as string | null;
    const customButtonText = formData.get("buttonText") as string | null;
    const version = formData.get("version") as string | null;
    const order = formData.get("order") ? Number(formData.get("order")) : 0;
    const replaceFileId = formData.get("replaceFileId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Associated project not found" }, { status: 404 });
    }

    // Size limit verification
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds maximum allowed size of ${formatBytes(MAX_FILE_SIZE)}` },
        { status: 400 }
      );
    }

    // Extension & security validation
    const extCheck = validateExtension(file.name);
    if (!extCheck.valid) {
      return NextResponse.json(
        {
          error: `Unsupported file format '${extCheck.ext}'. Allowed formats: .apk, .aab, .exe, .msi, .zip, .rar, .pdf, .jar, .deb, .appimage`,
        },
        { status: 400 }
      );
    }

    const originalName = sanitizeFileName(file.name);
    const displayName = customName ? sanitizeFileName(customName) : originalName;
    const storageDir = await ensureStorageDirectory();
    const storageName = generateStorageName(extCheck.ext);
    const storagePath = path.join(storageDir, storageName);

    // Write file securely to disk outside public execution boundary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(storagePath, buffer);

    // If replacing an existing file in-place:
    if (replaceFileId) {
      const existing = await prisma.projectFile.findUnique({ where: { id: replaceFileId } });
      if (existing) {
        if (existing.storagePath && isSafeFilePath(existing.storagePath)) {
          try {
            await fs.unlink(existing.storagePath);
          } catch (e) {
            console.warn("Could not remove old binary on replace:", e);
          }
        }

        const replaced = await prisma.projectFile.update({
          where: { id: replaceFileId },
          data: {
            fileName: displayName,
            originalName,
            fileType: extCheck.type,
            mimeType: extCheck.mime,
            fileSize: file.size,
            fileSizeFormatted: formatBytes(file.size),
            storagePath,
            buttonText: customButtonText || existing.buttonText || extCheck.defaultButton,
            version: version || existing.version,
            fileDescription: description !== null ? description : existing.fileDescription,
          },
          include: {
            project: {
              select: { id: true, title: true, slug: true },
            },
          },
        });

        return NextResponse.json(replaced);
      }
    }

    const record = await prisma.projectFile.create({
      data: {
        projectId,
        fileName: displayName,
        originalName,
        fileType: extCheck.type,
        mimeType: extCheck.mime,
        fileSize: file.size,
        fileSizeFormatted: formatBytes(file.size),
        fileDescription: description || null,
        storagePath,
        downloadUrl: `/api/downloads/temp`, // Updated below with its own cuid
        buttonText: customButtonText || extCheck.defaultButton,
        version: version || "v1.0.0",
        visible: true,
        order,
      },
    });

    // Update actual download URL with generated ID
    const updated = await prisma.projectFile.update({
      where: { id: record.id },
      data: {
        downloadUrl: `/api/downloads/${record.id}`,
      },
      include: {
        project: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    console.error("Project file upload error:", error);
    return NextResponse.json({ error: "Failed to upload project file" }, { status: 500 });
  }
}

// PUT /api/project-files
export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    if (!data.id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const updated = await prisma.projectFile.update({
      where: { id: data.id },
      data: {
        fileName: data.fileName ? sanitizeFileName(data.fileName) : undefined,
        fileDescription: data.fileDescription !== undefined ? data.fileDescription : undefined,
        buttonText: data.buttonText !== undefined ? data.buttonText : undefined,
        version: data.version !== undefined ? data.version : undefined,
        visible: data.visible !== undefined ? Boolean(data.visible) : undefined,
        order: data.order !== undefined ? Number(data.order) : undefined,
      },
      include: {
        project: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Project file update error:", error);
    return NextResponse.json({ error: "Failed to update project file" }, { status: 500 });
  }
}

// DELETE /api/project-files?id=...
export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const file = await prisma.projectFile.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Safely remove disk file if within storage directory
    if (file.storagePath && isSafeFilePath(file.storagePath)) {
      try {
        await fs.unlink(file.storagePath);
      } catch (err) {
        console.warn("Could not delete physical file:", err);
      }
    }

    await prisma.projectFile.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "File removed" });
  } catch (error) {
    console.error("Project file delete error:", error);
    return NextResponse.json({ error: "Failed to delete project file" }, { status: 500 });
  }
}
