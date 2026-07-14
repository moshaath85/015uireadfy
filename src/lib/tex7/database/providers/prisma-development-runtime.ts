import type { Tex7RepositoryContract } from "@/lib/tex7/repository";
import {
  prismaArtistRepository,
  prismaArtworkRepository,
  prismaCertificateRepository,
  prismaCollectionRepository,
  prismaExhibitionRepository,
  prismaMediaRepository,
  prismaProjectRepository,
} from "@/lib/tex7/repository/providers";
import {
  prismaNewsRepository,
  prismaPublicationRepository,
  prismaServiceRepository,
} from "@/lib/tex7/repository/providers/prisma-gallery-core-repositories";
import type { Tex7DatabaseCapabilities } from "../database-capabilities";
import type { Tex7DatabaseConnection, Tex7DatabaseConnectionOptions, Tex7DatabaseConnectionState } from "../database-connection";
import type { Tex7DatabaseContext } from "../database-context";
import type { Tex7DatabaseHealthReport } from "../database-health";
import type { Tex7DatabaseProvider } from "../database-provider";
import { tex7DatabaseFailure, tex7DatabaseSuccess, type Tex7DatabaseResult } from "../database-result";
import type { Tex7DatabaseTransaction, Tex7TransactionOptions } from "../database-transaction";
import type { Tex7DatabaseVersionMetadata } from "../database-version";
import { TEX7_DATABASE_FOUNDATION_VERSION } from "../database-version";
import { getTex7PrismaClient } from "./prisma-client";

export const TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID = "prisma-development";
export const TEX7_JSON_RUNTIME_PROVIDER_ID = "json";
export const TEX7_DATABASE_RUNTIME_ENV = "TEX7_DATABASE_RUNTIME";

export type Tex7DevelopmentRuntimeProviderId =
  | typeof TEX7_JSON_RUNTIME_PROVIDER_ID
  | typeof TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID;

export type Tex7PrismaDevelopmentRepositoryKey =
  | "gallery015.media.prisma"
  | "gallery015.artist.prisma"
  | "gallery015.collection.prisma"
  | "gallery015.artwork.prisma"
  | "gallery015.certificate.prisma"
  | "gallery015.exhibition.prisma"
  | "gallery015.project.prisma"
  | "gallery015.news.prisma"
  | "gallery015.publication.prisma"
  | "gallery015.service.prisma";

export interface Tex7DevelopmentRuntimeResolution {
  readonly activeProviderId: Tex7DevelopmentRuntimeProviderId;
  readonly requestedProviderId?: string;
  readonly environment: string;
  readonly prismaEnabled: boolean;
  readonly reason: string;
}

const prismaDevelopmentCapabilities: Tex7DatabaseCapabilities = {
  providerFamily: "postgresql",
  query: {
    supportsOffsetPagination: true,
    supportsCursorPagination: false,
    supportsFiltering: true,
    supportsCompoundFiltering: true,
    supportsSorting: true,
    supportsFullTextSearch: false,
  },
  records: {
    supportsOptimisticLocking: false,
    supportsSoftDelete: true,
    supportsAuditFields: true,
    supportsVersionedRecords: false,
  },
  transactions: {
    supportsTransactions: false,
    supportsNestedTransactions: false,
    supportsSavepoints: false,
    supportsReadOnlyTransactions: false,
  },
  migrations: {
    supportsSchemaInspection: false,
    supportsSchemaVersioning: false,
    supportsDryRun: true,
    supportsRollback: false,
  },
  healthChecks: {
    supportsReadCheck: true,
    supportsWriteCheck: false,
    supportsLatencyCheck: true,
  },
  repositoryRegistration: {
    supportsRuntimeRegistration: false,
    supportsProviderScopedRepositories: true,
  },
};

const prismaDevelopmentVersion: Tex7DatabaseVersionMetadata = {
  ...TEX7_DATABASE_FOUNDATION_VERSION,
  providerVersion: {
    major: 0,
    minor: 1,
    patch: 0,
    label: "sprint-76-development-prisma-runtime",
  },
  productId: "gallery-015",
};

const prismaRepositories: Readonly<Record<Tex7PrismaDevelopmentRepositoryKey, Tex7RepositoryContract<Record<string, unknown>>>> = {
  "gallery015.media.prisma": prismaMediaRepository as Tex7RepositoryContract<Record<string, unknown>>,
  "gallery015.artist.prisma": prismaArtistRepository as Tex7RepositoryContract<Record<string, unknown>>,
  "gallery015.collection.prisma": prismaCollectionRepository as Tex7RepositoryContract<Record<string, unknown>>,
  "gallery015.artwork.prisma": prismaArtworkRepository as Tex7RepositoryContract<Record<string, unknown>>,
  "gallery015.certificate.prisma": prismaCertificateRepository as Tex7RepositoryContract<Record<string, unknown>>,
  "gallery015.exhibition.prisma": prismaExhibitionRepository as Tex7RepositoryContract<Record<string, unknown>>,
  "gallery015.project.prisma": prismaProjectRepository as Tex7RepositoryContract<Record<string, unknown>>,
  "gallery015.news.prisma": prismaNewsRepository as Tex7RepositoryContract<Record<string, unknown>>,
  "gallery015.publication.prisma": prismaPublicationRepository as Tex7RepositoryContract<Record<string, unknown>>,
  "gallery015.service.prisma": prismaServiceRepository as Tex7RepositoryContract<Record<string, unknown>>,
};

function currentEnvironment(): string {
  return process.env.NODE_ENV ?? "production";
}

function requestedRuntime(): string | undefined {
  return process.env[TEX7_DATABASE_RUNTIME_ENV];
}

function isPrismaDevelopmentRequested(environment = currentEnvironment(), requestedProviderId = requestedRuntime()): boolean {
  return environment === "development" && requestedProviderId === TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID;
}

function nowIso(): string {
  return new Date().toISOString();
}

function createHealthReport(status: "healthy" | "degraded" | "unhealthy", message: string): Tex7DatabaseHealthReport {
  const checkedAt = nowIso();

  return {
    providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
    status,
    checkedAt,
    capabilities: prismaDevelopmentCapabilities,
    version: prismaDevelopmentVersion,
    checks: [
      {
        name: "prisma-development-readiness",
        required: true,
        status,
        checkedAt,
        message,
      },
    ],
  };
}

function createUnsupportedTransactionResult(
  operation: string,
  transaction?: Tex7DatabaseTransaction,
): Tex7DatabaseResult<Tex7DatabaseTransaction> {
  return tex7DatabaseFailure(
    "TEX7_PRISMA_DEVELOPMENT_TRANSACTION_DISABLED",
    "Prisma development runtime transactions are not enabled in Sprint 76.",
    {
      recoverable: true,
      details: {
        operation,
        transactionId: transaction?.id,
        writesEnabled: false,
      },
      meta: {
        providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
        operation,
      },
    },
  );
}

function createPrismaDevelopmentConnection(): Tex7DatabaseConnection {
  let state: Tex7DatabaseConnectionState = {
    providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
    status: "idle",
  };

  return {
    providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
    capabilities: prismaDevelopmentCapabilities,
    version: prismaDevelopmentVersion,
    state: () => state,
    async connect(options: Tex7DatabaseConnectionOptions): Promise<Tex7DatabaseResult<Tex7DatabaseContext>> {
      if (!isPrismaDevelopmentRequested()) {
        state = {
          providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
          status: "disconnected",
          lastError: "Prisma development runtime was not explicitly requested.",
        };

        return tex7DatabaseFailure(
          "TEX7_PRISMA_DEVELOPMENT_RUNTIME_INACTIVE",
          "Prisma runtime activates only in development when TEX7_DATABASE_RUNTIME=prisma-development.",
          {
            recoverable: true,
            details: {
              environment: currentEnvironment(),
              requestedProviderId: requestedRuntime(),
              fallbackProviderId: TEX7_JSON_RUNTIME_PROVIDER_ID,
            },
            meta: {
              providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
              operation: "connect",
            },
          },
        );
      }

      state = {
        providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
        status: "connected",
        connectedAt: nowIso(),
      };

      return tex7DatabaseSuccess(
        {
          productId: options.productId,
          tenantId: options.tenantId,
          providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
          capabilities: prismaDevelopmentCapabilities,
          version: prismaDevelopmentVersion,
          metadata: {
            connectionName: options.connectionName,
            writesEnabled: false,
            jsonFallbackProviderId: TEX7_JSON_RUNTIME_PROVIDER_ID,
            ...options.metadata,
          },
        },
        {
          providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
          operation: "connect",
        },
      );
    },
    async disconnect(): Promise<Tex7DatabaseResult<Tex7DatabaseConnectionState>> {
      state = {
        providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
        status: "disconnected",
        disconnectedAt: nowIso(),
      };

      return tex7DatabaseSuccess(state, {
        providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
        operation: "disconnect",
      });
    },
    health: {
      async checkHealth() {
        if (!isPrismaDevelopmentRequested()) {
          return tex7DatabaseSuccess(
            createHealthReport("degraded", "Prisma runtime is inactive; JSON remains the active runtime."),
            {
              providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
              operation: "checkHealth",
            },
          );
        }

        const startedAt = Date.now();

        try {
          await getTex7PrismaClient().$queryRaw`SELECT 1`;
          const checkedAt = nowIso();

          return tex7DatabaseSuccess(
            {
              providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
              status: "healthy",
              checkedAt,
              capabilities: prismaDevelopmentCapabilities,
              version: prismaDevelopmentVersion,
              checks: [
                {
                  name: "prisma-read",
                  required: true,
                  status: "healthy",
                  durationMs: Date.now() - startedAt,
                  checkedAt,
                  message: "Prisma development read check completed.",
                },
              ],
            },
            {
              providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
              operation: "checkHealth",
            },
          );
        } catch (error) {
          return tex7DatabaseSuccess(
            createHealthReport(
              "unhealthy",
              error instanceof Error ? error.message : "Prisma development read check failed.",
            ),
            {
              providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
              operation: "checkHealth",
            },
          );
        }
      },
      async checkReadiness() {
        return tex7DatabaseSuccess(
          createHealthReport(
            isPrismaDevelopmentRequested() ? "healthy" : "degraded",
            isPrismaDevelopmentRequested()
              ? "Prisma development runtime is explicitly requested."
              : "JSON runtime remains active until Prisma is explicitly requested in development.",
          ),
          {
            providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
            operation: "checkReadiness",
          },
        );
      },
    },
    transactions: {
      begin(options?: Tex7TransactionOptions) {
        void options;
        return Promise.resolve(
          createUnsupportedTransactionResult("begin", {
            id: "prisma-development-transactions-disabled",
            providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
            startedAt: nowIso(),
            options: options ?? {},
            status: "failed",
          }),
        );
      },
      commit(transaction: Tex7DatabaseTransaction) {
        return Promise.resolve(createUnsupportedTransactionResult("commit", transaction));
      },
      rollback(transaction: Tex7DatabaseTransaction) {
        return Promise.resolve(createUnsupportedTransactionResult("rollback", transaction));
      },
      async withTransaction<TResult>() {
        return tex7DatabaseFailure(
          "TEX7_PRISMA_DEVELOPMENT_TRANSACTION_DISABLED",
          "Prisma development runtime transactions are not enabled in Sprint 76.",
          {
            recoverable: true,
            details: {
              writesEnabled: false,
            },
            meta: {
              providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
              operation: "withTransaction",
            },
          },
        );
      },
    },
  };
}

export const tex7PrismaDevelopmentProvider: Tex7DatabaseProvider = {
  metadata: {
    id: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
    displayName: "TEX7 Prisma Development Runtime",
    family: "postgresql",
    version: prismaDevelopmentVersion,
    capabilities: prismaDevelopmentCapabilities,
  },
  async createConnection(options: Tex7DatabaseConnectionOptions) {
    const connection = createPrismaDevelopmentConnection();
    const connectResult = await connection.connect(options);

    if (!connectResult.ok) {
      return connectResult;
    }

    return tex7DatabaseSuccess(connection, {
      providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
      operation: "createConnection",
    });
  },
  supportsCapability(capabilityPath: string): boolean {
    const supportedCapabilities = new Set([
      "query.supportsOffsetPagination",
      "query.supportsFiltering",
      "query.supportsCompoundFiltering",
      "query.supportsSorting",
      "records.supportsSoftDelete",
      "records.supportsAuditFields",
      "healthChecks.supportsReadCheck",
      "healthChecks.supportsLatencyCheck",
      "repositoryRegistration.supportsProviderScopedRepositories",
    ]);

    return supportedCapabilities.has(capabilityPath);
  },
};

export function resolveTex7DevelopmentRuntime(
  environment = currentEnvironment(),
  requestedProviderId = requestedRuntime(),
): Tex7DevelopmentRuntimeResolution {
  if (isPrismaDevelopmentRequested(environment, requestedProviderId)) {
    return {
      activeProviderId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
      requestedProviderId,
      environment,
      prismaEnabled: true,
      reason: "Prisma runtime is explicitly enabled for development.",
    };
  }

  return {
    activeProviderId: TEX7_JSON_RUNTIME_PROVIDER_ID,
    requestedProviderId,
    environment,
    prismaEnabled: false,
    reason:
      environment === "development"
        ? "JSON runtime remains active because Prisma was not explicitly requested."
        : "JSON runtime remains active outside development.",
  };
}

export function getTex7PrismaDevelopmentRepository<TEntity extends Record<string, unknown>>(
  repositoryKey: Tex7PrismaDevelopmentRepositoryKey,
  environment = currentEnvironment(),
  requestedProviderId = requestedRuntime(),
): Tex7DatabaseResult<Tex7RepositoryContract<TEntity> | null> {
  const resolution = resolveTex7DevelopmentRuntime(environment, requestedProviderId);

  if (!resolution.prismaEnabled) {
    return tex7DatabaseSuccess(null, {
      providerId: resolution.activeProviderId,
      operation: "getPrismaDevelopmentRepository",
    });
  }

  return tex7DatabaseSuccess(prismaRepositories[repositoryKey] as Tex7RepositoryContract<TEntity>, {
    providerId: TEX7_PRISMA_DEVELOPMENT_PROVIDER_ID,
    operation: "getPrismaDevelopmentRepository",
  });
}

export function listTex7PrismaDevelopmentRepositoryKeys(
  environment = currentEnvironment(),
  requestedProviderId = requestedRuntime(),
): readonly Tex7PrismaDevelopmentRepositoryKey[] {
  return isPrismaDevelopmentRequested(environment, requestedProviderId)
    ? (Object.keys(prismaRepositories) as Tex7PrismaDevelopmentRepositoryKey[])
    : [];
}