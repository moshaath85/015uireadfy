import { createHash, randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  StorageConfigurationError,
  type StorageProvider,
  type StorageUploadInput,
  type StorageUploadResult,
} from "./storage-provider";

interface S3StorageConfig {
  readonly bucket: string;
  readonly endpoint?: string;
  readonly publicBaseUrl: string;
  readonly region: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly forcePathStyle: boolean;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new StorageConfigurationError(`${name} is required for object storage.`);
  return value;
}

function config(): S3StorageConfig {
  return {
    bucket: required("OBJECT_STORAGE_BUCKET"),
    endpoint: process.env.OBJECT_STORAGE_ENDPOINT?.trim() || undefined,
    publicBaseUrl: required("OBJECT_STORAGE_PUBLIC_BASE_URL").replace(/\/$/, ""),
    region: process.env.OBJECT_STORAGE_REGION?.trim() || "auto",
    accessKeyId: required("OBJECT_STORAGE_ACCESS_KEY_ID"),
    secretAccessKey: required("OBJECT_STORAGE_SECRET_ACCESS_KEY"),
    forcePathStyle: process.env.OBJECT_STORAGE_FORCE_PATH_STYLE === "true",
  };
}

function safeFilename(filename: string): string {
  const normalized = filename
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return normalized || "asset";
}

function createKey(filename: string, prefix = "gallery-015"): string {
  const date = new Date();
  const folder = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${prefix.replace(/^\/+|\/+$/g, "")}/${folder}/${randomUUID()}-${safeFilename(filename)}`;
}

export class S3StorageProvider implements StorageProvider {
  readonly name = "s3-compatible";
  private readonly settings = config();
  private readonly client = new S3Client({
    region: this.settings.region,
    endpoint: this.settings.endpoint,
    forcePathStyle: this.settings.forcePathStyle,
    credentials: {
      accessKeyId: this.settings.accessKeyId,
      secretAccessKey: this.settings.secretAccessKey,
    },
  });

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    const key = createKey(input.filename, input.keyPrefix);
    const checksum = createHash("sha256").update(input.bytes).digest("base64");
    const response = await this.client.send(new PutObjectCommand({
      Bucket: this.settings.bucket,
      Key: key,
      Body: input.bytes,
      ContentType: input.contentType,
      ChecksumSHA256: checksum,
    }));

    return {
      key,
      publicUrl: `${this.settings.publicBaseUrl}/${key}`,
      provider: this.name,
      size: input.bytes.byteLength,
      etag: response.ETag?.replaceAll('"', ""),
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.settings.bucket, Key: key }));
  }
}
