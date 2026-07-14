import { createHash } from "crypto";
import { getStorageProvider } from "@/lib/storage";
import { saveMediaRecord, type MediaPersistenceInput } from "@/lib/cms/production-prisma";
import type { Media } from "@/types";

const maximumUploadBytes = 20 * 1024 * 1024;
const allowedMimePrefixes = ["image/", "video/", "audio/"];
const allowedDocumentTypes = new Set(["application/pdf"]);

export interface UploadMediaOptions {
  readonly organizationId: string;
  readonly altText: string;
  readonly visibility?: "PUBLIC" | "PRIVATE" | "VIP" | "HIDDEN";
  readonly keyPrefix?: string;
}

function classifyMedia(mimeType: string): MediaPersistenceInput["mediaType"] {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (allowedDocumentTypes.has(mimeType)) return "DOCUMENT";
  return "OTHER";
}

function validateFile(file: File): void {
  const allowed = allowedMimePrefixes.some((prefix) => file.type.startsWith(prefix)) || allowedDocumentTypes.has(file.type);
  if (!allowed) throw new Error("Unsupported media file type.");
  if (file.size <= 0) throw new Error("The uploaded file is empty.");
  if (file.size > maximumUploadBytes) throw new Error("Media files must be 20 MB or smaller.");
}

export async function uploadMediaFile(file: File, options: UploadMediaOptions): Promise<Media> {
  validateFile(file);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const storage = getStorageProvider();
  const uploaded = await storage.upload({
    bytes,
    contentType: file.type || "application/octet-stream",
    filename: file.name,
    keyPrefix: options.keyPrefix,
  });

  const saved = await saveMediaRecord({
    filename: uploaded.key.split("/").pop() ?? file.name,
    originalFilename: file.name,
    mimeType: file.type || "application/octet-stream",
    mediaType: classifyMedia(file.type),
    storagePath: uploaded.publicUrl,
    altText: options.altText,
    fileSize: uploaded.size,
    visibility: options.visibility ?? "PRIVATE",
    checksum,
  }, { organizationId: options.organizationId });

  if (!saved.ok) {
    await storage.delete(uploaded.key).catch(() => undefined);
    throw new Error(saved.message);
  }

  return saved.record;
}
