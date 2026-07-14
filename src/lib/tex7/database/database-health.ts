import type { Tex7DatabaseCapabilities } from "./database-capabilities";
import type { Tex7DatabaseResult } from "./database-result";
import type { Tex7DatabaseVersionMetadata } from "./database-version";

export type Tex7DatabaseHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface Tex7DatabaseHealthCheck {
  readonly name: string;
  readonly required: boolean;
  readonly status: Tex7DatabaseHealthStatus;
  readonly durationMs?: number;
  readonly message?: string;
  readonly checkedAt: string;
}

export interface Tex7DatabaseHealthReport {
  readonly providerId: string;
  readonly status: Tex7DatabaseHealthStatus;
  readonly checkedAt: string;
  readonly capabilities: Tex7DatabaseCapabilities;
  readonly version: Tex7DatabaseVersionMetadata;
  readonly checks: readonly Tex7DatabaseHealthCheck[];
}

export interface Tex7DatabaseHealthContract {
  readonly checkHealth: () => Promise<Tex7DatabaseResult<Tex7DatabaseHealthReport>>;
  readonly checkReadiness: () => Promise<Tex7DatabaseResult<Tex7DatabaseHealthReport>>;
}
