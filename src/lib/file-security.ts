import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const ALLOWED_EXTENSIONS: Record<string, { type: string; defaultMime: string; defaultButton: string }> = {
  ".apk": { type: "APK", defaultMime: "application/vnd.android.package-archive", defaultButton: "Download APK" },
  ".aab": { type: "AAB", defaultMime: "application/octet-stream", defaultButton: "Download App Bundle" },
  ".exe": { type: "EXE", defaultMime: "application/x-msdownload", defaultButton: "Download EXE" },
  ".msi": { type: "MSI", defaultMime: "application/x-msi", defaultButton: "Download Installer" },
  ".zip": { type: "ZIP", defaultMime: "application/zip", defaultButton: "Download Source (.zip)" },
  ".rar": { type: "RAR", defaultMime: "application/x-rar-compressed", defaultButton: "Download Archive (.rar)" },
  ".pdf": { type: "PDF", defaultMime: "application/pdf", defaultButton: "Download Documentation" },
  ".jar": { type: "JAR", defaultMime: "application/java-archive", defaultButton: "Download JAR" },
  ".deb": { type: "DEB", defaultMime: "application/vnd.debian.binary-package", defaultButton: "Download DEB" },
  ".appimage": { type: "APPIMAGE", defaultMime: "application/x-executable", defaultButton: "Download AppImage" },
};

// Maximum allowed size: 150 MB
export const MAX_FILE_SIZE = 150 * 1024 * 1024;

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function validateExtension(fileName: string): {
  valid: boolean;
  ext: string;
  type: string;
  mime: string;
  defaultButton: string;
} {
  const ext = path.extname(fileName).toLowerCase();
  const info = ALLOWED_EXTENSIONS[ext];
  if (!info) {
    return {
      valid: false,
      ext,
      type: "OTHER",
      mime: "application/octet-stream",
      defaultButton: "Download File",
    };
  }
  return {
    valid: true,
    ext,
    type: info.type,
    mime: info.defaultMime,
    defaultButton: info.defaultButton,
  };
}

export function sanitizeFileName(name: string): string {
  // Strip null bytes and directory navigation
  const clean = path.basename(name).replace(/[\0\/\\:\*\?"<>\|]/g, "_");
  return clean || "downloadable_asset.bin";
}

export function getStorageDirectory(): string {
  // Stored in storage/project-files/ outside the public/ directory to prevent arbitrary direct execution
  return path.join(process.cwd(), "storage", "project-files");
}

export function generateStorageName(ext: string): string {
  const token = crypto.randomBytes(16).toString("hex");
  return `pfile_${Date.now()}_${token}${ext}.bin`;
}

export async function ensureStorageDirectory(): Promise<string> {
  const dir = getStorageDirectory();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export function isSafeFilePath(targetPath: string): boolean {
  const storageDir = path.resolve(getStorageDirectory());
  const resolvedTarget = path.resolve(targetPath);
  return resolvedTarget.startsWith(storageDir);
}
