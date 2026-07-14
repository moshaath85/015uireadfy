export interface StorageUploadInput {
  readonly bytes: Uint8Array;
  readonly contentType: string;
  readonly filename: string;
  readonly keyPrefix?: string;
}

export interface StorageUploadResult {
  readonly key: string;
  readonly publicUrl: string;
  readonly provider: string;
  readonly size: number;
  readonly etag?: string;
}

export interface StorageProvider {
  readonly name: string;
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  delete(key: string): Promise<void>;
}

export class StorageConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageConfigurationError";
  }
}
