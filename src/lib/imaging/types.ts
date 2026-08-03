export type CropStatus =
  | "AUTO_APPROVED"
  | "NEEDS_REVIEW"
  | "APPROVED_MANUALLY"
  | "REJECTED"
  | "ALREADY_CROPPED"
  | "PROCESSING_FAILED";

export interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CropMetadata {
  sourceAssetKey: string;
  sourceUrl: string;
  originalWidth: number;
  originalHeight: number;
  detectedBackground: {
    color: string;
    confidence: number;
  };
  cropRect: CropRect;
  frameRect: CropRect | null;
  safePadding: number;
  perspectiveCorrected: boolean;
  perspectiveMatrix: number[][] | null;
  outputWidth: number;
  outputHeight: number;
  confidenceComponents: {
    backgroundDetection: number;
    edgeDetection: number;
    rectangularity: number;
    overall: number;
  };
  processorVersion: string;
  checksum: string;
}

export const PROCESSOR_VERSION = "1.0.0";

export const SAFE_PADDING_DEFAULT = 0.01; // 1%
export const SAFE_PADDING_MIN = 0.005; // 0.5%
export const SAFE_PADDING_MAX = 0.02; // 2%

export const AUTO_APPROVE_THRESHOLD = 0.92;
export const REVIEW_THRESHOLD = 0.75;
