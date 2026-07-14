import type { Tex7DatabaseCapabilities } from "./database-capabilities";
import type { Tex7DatabaseContext } from "./database-context";
import type { Tex7DatabaseHealthContract } from "./database-health";
import type { Tex7DatabaseResult } from "./database-result";
import type { Tex7DatabaseTransactionController } from "./database-transaction";
import type { Tex7DatabaseVersionMetadata } from "./database-version";

export type Tex7DatabaseConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected"
  | "failed";

export interface Tex7DatabaseConnectionOptions {
  readonly providerId: string;
  readonly productId: string;
  readonly tenantId?: string;
  readonly connectionName?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface Tex7DatabaseConnectionState {
  readonly providerId: string;
  readonly status: Tex7DatabaseConnectionStatus;
  readonly connectedAt?: string;
  readonly disconnectedAt?: string;
  readonly lastError?: string;
}

export interface Tex7DatabaseConnection {
  readonly providerId: string;
  readonly capabilities: Tex7DatabaseCapabilities;
  readonly version: Tex7DatabaseVersionMetadata;
  readonly state: () => Tex7DatabaseConnectionState;
  readonly connect: (options: Tex7DatabaseConnectionOptions) => Promise<Tex7DatabaseResult<Tex7DatabaseContext>>;
  readonly disconnect: () => Promise<Tex7DatabaseResult<Tex7DatabaseConnectionState>>;
  readonly health: Tex7DatabaseHealthContract;
  readonly transactions: Tex7DatabaseTransactionController;
}
