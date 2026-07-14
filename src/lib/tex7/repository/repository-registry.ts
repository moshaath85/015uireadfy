import type { Tex7RepositoryContext } from "./repository-context";
import type { Tex7RepositoryContract } from "./repository-contracts";
import type { Tex7RepositoryProvider, Tex7RepositoryProviderMetadata } from "./repository-provider";
import type { Tex7RepositoryResult } from "./repository-result";

export interface Tex7RepositoryRegistration<TEntity extends Record<string, unknown>> {
  readonly repository: Tex7RepositoryContract<TEntity>;
  readonly providerId: string;
  readonly productId?: string;
  readonly tenantId?: string;
}

export interface Tex7RepositoryProviderRegistry {
  readonly registerProvider: (
    provider: Tex7RepositoryProvider,
  ) => Tex7RepositoryResult<Tex7RepositoryProviderMetadata>;
  readonly getProvider: (providerId: string) => Tex7RepositoryProvider | undefined;
  readonly listProviders: () => readonly Tex7RepositoryProviderMetadata[];
}

export interface Tex7RepositoryRegistry {
  readonly registerRepository: <TEntity extends Record<string, unknown>>(
    registration: Tex7RepositoryRegistration<TEntity>,
  ) => Tex7RepositoryResult<Tex7RepositoryContract<TEntity>>;
  readonly getRepository: <TEntity extends Record<string, unknown>>(
    repositoryKey: string,
    context: Tex7RepositoryContext,
  ) => Tex7RepositoryResult<Tex7RepositoryContract<TEntity> | null>;
  readonly hasRepository: (
    repositoryKey: string,
    context: Tex7RepositoryContext,
  ) => Tex7RepositoryResult<boolean>;
  readonly listRepositoryKeys: (providerId?: string) => readonly string[];
}
