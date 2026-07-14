import type { RuntimeOperation, RuntimeResult } from "./runtime-result";

export type RuntimeEntityId = string | number;

export interface RuntimeEntity {
  readonly id: RuntimeEntityId;
}

export interface RuntimeActor {
  readonly id: RuntimeEntityId;
  readonly role?: string;
  readonly permissions?: readonly string[];
}

export interface RuntimeExecutionContext {
  readonly module: string;
  readonly actor?: RuntimeActor;
  readonly environment?: string;
  readonly requestId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface RuntimePermissionInput<TPayload = unknown> {
  readonly operation: RuntimeOperation;
  readonly context: RuntimeExecutionContext;
  readonly payload?: TPayload;
}

export type RuntimePermissionHandler<TPayload = unknown> = (
  input: RuntimePermissionInput<TPayload>,
) => boolean | Promise<boolean>;

export type RuntimeValidationHandler<TPayload> = (
  payload: TPayload,
  context: RuntimeExecutionContext,
) => RuntimeResult<TPayload> | Promise<RuntimeResult<TPayload>>;

export interface RuntimeReadRequest {
  readonly id: RuntimeEntityId;
}

export interface RuntimeListRequest {
  readonly search?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface RuntimeCreateRequest<TCreateInput> {
  readonly input: TCreateInput;
}

export interface RuntimeUpdateRequest<TUpdateInput> {
  readonly id: RuntimeEntityId;
  readonly input: TUpdateInput;
}