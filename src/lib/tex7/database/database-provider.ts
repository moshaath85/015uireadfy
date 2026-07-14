import type { Tex7DatabaseCapabilities, Tex7DatabaseProviderFamily } from "./database-capabilities";
import type { Tex7DatabaseConnection, Tex7DatabaseConnectionOptions } from "./database-connection";
import type { Tex7DatabaseRepositoryContract, Tex7RepositoryRegistration } from "./database-contracts";
import type { Tex7DatabaseResult } from "./database-result";
import type { Tex7DatabaseVersionMetadata } from "./database-version";

export interface Tex7DatabaseProviderMetadata {
  readonly id: string;
  readonly displayName: string;
  readonly family: Tex7DatabaseProviderFamily;
  readonly version: Tex7DatabaseVersionMetadata;
  readonly capabilities: Tex7DatabaseCapabilities;
}

export interface Tex7DatabaseProvider {
  readonly metadata: Tex7DatabaseProviderMetadata;
  readonly createConnection: (
    options: Tex7DatabaseConnectionOptions,
  ) => Promise<Tex7DatabaseResult<Tex7DatabaseConnection>>;
  readonly supportsCapability: (capabilityPath: string) => boolean;
}

export interface Tex7DatabaseProviderRegistry {
  readonly registerProvider: (provider: Tex7DatabaseProvider) => Tex7DatabaseResult<Tex7DatabaseProviderMetadata>;
  readonly getProvider: (providerId: string) => Tex7DatabaseProvider | undefined;
  readonly listProviders: () => readonly Tex7DatabaseProviderMetadata[];
}

export interface Tex7DatabaseRepositoryRegistry {
  readonly registerRepository: <TEntity extends Record<string, unknown>>(
    registration: Tex7RepositoryRegistration<TEntity>,
  ) => Tex7DatabaseResult<Tex7DatabaseRepositoryContract<TEntity>>;
  readonly getRepository: <TEntity extends Record<string, unknown>>(
    key: string,
    providerId?: string,
  ) => Tex7DatabaseRepositoryContract<TEntity> | undefined;
  readonly listRepositoryKeys: (providerId?: string) => readonly string[];
}
