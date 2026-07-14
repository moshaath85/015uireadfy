import { S3StorageProvider } from "./s3-storage-provider";
import type { StorageProvider } from "./storage-provider";

let provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  provider ??= new S3StorageProvider();
  return provider;
}

export type {
  StorageProvider,
  StorageUploadInput,
  StorageUploadResult,
} from "./storage-provider";
export { StorageConfigurationError } from "./storage-provider";
