import { PrismaClient } from "@prisma/client";

type Tex7PrismaGlobal = typeof globalThis & {
  tex7PrismaClient?: PrismaClient;
};

export type Tex7DatabaseEnvironment = "development" | "staging" | "production" | "unknown";

export interface Tex7DatabaseEnvironmentResolution {
  readonly databaseEnvironment: Tex7DatabaseEnvironment;
  readonly netlifyContext?: string;
  readonly nodeEnvironment?: string;
  readonly hasDatabaseUrl: boolean;
  readonly isLocalOrAtomsDevelopment: boolean;
}

export interface Tex7DatabaseEnvironmentSafety {
  readonly ok: boolean;
  readonly reason: string;
  readonly productionProtected: boolean;
  readonly stagingOnly: boolean;
}

const globalForPrisma = globalThis as Tex7PrismaGlobal;

function normalizeDatabaseEnvironment(value: string | undefined): Tex7DatabaseEnvironment {
  if (value === "development" || value === "staging" || value === "production") {
    return value;
  }

  return "unknown";
}

function resolveEnvironmentFromNetlifyContext(
  netlifyContext: string | undefined,
): Tex7DatabaseEnvironment | undefined {
  if (netlifyContext === "production") {
    return "production";
  }

  if (netlifyContext === "deploy-preview" || netlifyContext === "branch-deploy") {
    return "staging";
  }

  return undefined;
}

export function resolveTex7DatabaseEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): Tex7DatabaseEnvironmentResolution {
  const netlifyContext = env.CONTEXT;
  const explicitEnvironment = normalizeDatabaseEnvironment(env.TEX7_DATABASE_ENV);
  const netlifyEnvironment = resolveEnvironmentFromNetlifyContext(netlifyContext);
  const nodeEnvironment = env.NODE_ENV;

  return {
    databaseEnvironment:
      explicitEnvironment !== "unknown"
        ? explicitEnvironment
        : netlifyEnvironment ?? (nodeEnvironment === "development" ? "development" : "unknown"),
    netlifyContext,
    nodeEnvironment,
    hasDatabaseUrl: Boolean(env.DATABASE_URL),
    isLocalOrAtomsDevelopment: nodeEnvironment === "development" && !netlifyContext,
  };
}

export function evaluateTex7DatabaseEnvironmentSafety(
  env: NodeJS.ProcessEnv = process.env,
): Tex7DatabaseEnvironmentSafety {
  const resolution = resolveTex7DatabaseEnvironment(env);

  if (resolution.isLocalOrAtomsDevelopment && resolution.databaseEnvironment === "production") {
    return {
      ok: false,
      reason: "Local and Atoms development runtimes must not select the Production database.",
      productionProtected: true,
      stagingOnly: false,
    };
  }

  if (
    (resolution.netlifyContext === "deploy-preview" || resolution.netlifyContext === "branch-deploy") &&
    resolution.databaseEnvironment !== "staging"
  ) {
    return {
      ok: false,
      reason: "Netlify preview and branch deploy contexts must use the Staging database only.",
      productionProtected: true,
      stagingOnly: false,
    };
  }

  if (resolution.netlifyContext === "production" && resolution.databaseEnvironment !== "production") {
    return {
      ok: false,
      reason: "Netlify production context must use the Production database only.",
      productionProtected: true,
      stagingOnly: false,
    };
  }

  return {
    ok: true,
    reason: "Database environment selection is compatible with the current runtime context.",
    productionProtected: resolution.databaseEnvironment !== "production" || resolution.netlifyContext === "production",
    stagingOnly:
      resolution.databaseEnvironment === "staging" &&
      (resolution.netlifyContext === "deploy-preview" || resolution.netlifyContext === "branch-deploy"),
  };
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}

export function getTex7PrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return createPrismaClient();
  }

  if (!globalForPrisma.tex7PrismaClient) {
    globalForPrisma.tex7PrismaClient = createPrismaClient();
  }

  return globalForPrisma.tex7PrismaClient;
}

export const tex7PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getTex7PrismaClient(), property, receiver);
  },
});