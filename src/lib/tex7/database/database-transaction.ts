import type { Tex7DatabaseAuditContext } from "./database-context";
import type { Tex7DatabaseResult } from "./database-result";

export type Tex7TransactionIsolationLevel =
  | "read-uncommitted"
  | "read-committed"
  | "repeatable-read"
  | "serializable";

export interface Tex7TransactionOptions {
  readonly isolationLevel?: Tex7TransactionIsolationLevel;
  readonly readOnly?: boolean;
  readonly timeoutMs?: number;
  readonly audit?: Tex7DatabaseAuditContext;
}

export interface Tex7DatabaseTransaction {
  readonly id: string;
  readonly providerId: string;
  readonly startedAt: string;
  readonly options: Tex7TransactionOptions;
  readonly status: "active" | "committed" | "rolled-back" | "failed";
}

export interface Tex7DatabaseTransactionController {
  readonly begin: (options?: Tex7TransactionOptions) => Promise<Tex7DatabaseResult<Tex7DatabaseTransaction>>;
  readonly commit: (transaction: Tex7DatabaseTransaction) => Promise<Tex7DatabaseResult<Tex7DatabaseTransaction>>;
  readonly rollback: (transaction: Tex7DatabaseTransaction) => Promise<Tex7DatabaseResult<Tex7DatabaseTransaction>>;
  readonly withTransaction: <TResult>(
    handler: (transaction: Tex7DatabaseTransaction) => Promise<Tex7DatabaseResult<TResult>>,
    options?: Tex7TransactionOptions,
  ) => Promise<Tex7DatabaseResult<TResult>>;
}
