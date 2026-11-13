import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const ALLOWED_AUDIO_EXTENSIONS: Record<string, { mime: string; label: string }> = {
  ".mp3": { mime: "audio/mpeg", label: "MP3 Audio" },
  ".wav": { mime: "audio/wav", label: "WAV Audio" },
  ".ogg": { mime: "audio/ogg", label: "OGG Audio" },
  ".aac": { mime: "audio/aac", label: "AAC Audio" },
  ".m4a": { mime: "audio/mp4", label: "M4A Audio" },
  ".flac": { mime: "audio/flac", label: "FLAC Audio" },
  ".weba": { mime: "audio/webm", label: "WebA Audio" },
};

export const ALLOWED_AUDIO_MIMES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "application/ogg",
  "audio/aac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/flac",
  "audio/webm",
  "audio/x-matroska",
]);

export function validateAudioFile(fileName: string, mimeType?: string): {
  valid: boolean;
  ext: string;
  mime: string;
  label: string;
} {
  const ext = path.extname(fileName).toLowerCase();
  const info = ALLOWED_AUDIO_EXTENSIONS[ext];

  if (!info) {
    return {
      valid: false,
      ext,
      mime: mimeType || "application/octet-stream",
      label: "Unsupported format",
    };
  }

  // If MIME is provided, ensure it's not an executable disguised with an audio extension
  if (mimeType && mimeType !== "application/octet-stream") {
    const isAllowedMime = ALLOWED_AUDIO_MIMES.has(mimeType.toLowerCase());
    if (!isAllowedMime) {
      // Some operating systems might send generic mime, so check extension compatibility
      if (!mimeType.startsWith("audio/") && !mimeType.startsWith("video/mp4")) {
        return {
          valid: false,
          ext,
          mime: mimeType,
          label: "Invalid MIME type",
        };
      }
    }
  }

  return {
    valid: true,
    ext,
    mime: info.mime,
    label: info.label,
  };
}

export function sanitizeAudioFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const rawBase = path.basename(originalName, ext);
  const cleanBase = rawBase.replace(/[^a-zA-Z0-9_\-\s]/g, "_").trim().substring(0, 50);
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  return `${cleanBase || "audio"}_${Date.now()}_${randomSuffix}${ext}`;
}

export function getAudioStorageDir(): string {
  return path.join(process.cwd(), "public", "uploads", "audio");
}

export async function ensureAudioStorageDir(): Promise<string> {
  const dir = getAudioStorageDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function safelyDeleteAudioFile(filePathOrUrl: string): Promise<boolean> {
  try {
    let targetPath = filePathOrUrl;
    if (filePathOrUrl.startsWith("/uploads/audio/")) {
      const fileName = path.basename(filePathOrUrl);
      targetPath = path.join(getAudioStorageDir(), fileName);
    }

    // Security check: ensure path is within public/uploads/audio
    const resolvedTarget = path.resolve(/*turbopackIgnore: true*/ targetPath);
    const resolvedDir = path.resolve(/*turbopackIgnore: true*/ getAudioStorageDir());

    if (!resolvedTarget.startsWith(resolvedDir)) {
      console.warn("Attempted directory traversal in safelyDeleteAudioFile:", targetPath);
      return false;
    }

    await fs.unlink(resolvedTarget);
    return true;
  } catch (err: unknown) {
    // If file doesn't exist, ignore
    const nodeErr = err as { code?: string };
    if (nodeErr.code !== "ENOENT") {
      console.error("Error deleting audio file:", err);
    }
    return false;
  }
}
