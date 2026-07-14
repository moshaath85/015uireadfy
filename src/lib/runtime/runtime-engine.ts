import type {
  RuntimeCreateRequest,
  RuntimeEntity,
  RuntimeExecutionContext,
  RuntimeListRequest,
  RuntimePermissionHandler,
  RuntimeReadRequest,
  RuntimeUpdateRequest,
  RuntimeValidationHandler,
} from "./runtime-context";
import {
  runtimeFailure,
  runtimeSuccess,
  type RuntimeOperation,
  type RuntimeResult,
} from "./runtime-result";

export interface RuntimeListData<TEntity extends RuntimeEntity> {
  readonly items: readonly TEntity[];
  readonly total: number;
}

export interface RuntimeEngineHandlers<
  TEntity extends RuntimeEntity,
  TCreateInput,
  TUpdateInput,
> {
  readonly canExecute?: RuntimePermissionHandler;
  readonly validateCreate?: RuntimeValidationHandler<TCreateInput>;
  readonly validateUpdate?: RuntimeValidationHandler<TUpdateInput>;
  readonly list?: (
    request: RuntimeListRequest,
    context: RuntimeExecutionContext,
  ) => Promise<RuntimeListData<TEntity>> | RuntimeListData<TEntity>;
  readonly read?: (
    request: RuntimeReadRequest,
    context: RuntimeExecutionContext,
  ) => Promise<TEntity | null> | TEntity | null;
  readonly create?: (
    request: RuntimeCreateRequest<TCreateInput>,
    context: RuntimeExecutionContext,
  ) => Promise<TEntity> | TEntity;
  readonly update?: (
    request: RuntimeUpdateRequest<TUpdateInput>,
    context: RuntimeExecutionContext,
  ) => Promise<TEntity | null> | TEntity | null;
}

export interface RuntimeEngine<
  TEntity extends RuntimeEntity,
  TCreateInput,
  TUpdateInput,
> {
  list(
    request: RuntimeListRequest,
    context: RuntimeExecutionContext,
  ): Promise<RuntimeResult<RuntimeListData<TEntity>>>;
  read(
    request: RuntimeReadRequest,
    context: RuntimeExecutionContext,
  ): Promise<RuntimeResult<TEntity>>;
  validateCreate(
    input: TCreateInput,
    context: RuntimeExecutionContext,
  ): Promise<RuntimeResult<TCreateInput>>;
  validateUpdate(
    input: TUpdateInput,
    context: RuntimeExecutionContext,
  ): Promise<RuntimeResult<TUpdateInput>>;
  create(
    request: RuntimeCreateRequest<TCreateInput>,
    context: RuntimeExecutionContext,
  ): Promise<RuntimeResult<TEntity>>;
  update(
    request: RuntimeUpdateRequest<TUpdateInput>,
    context: RuntimeExecutionContext,
  ): Promise<RuntimeResult<TEntity>>;
}

async function canExecute<TPayload>(
  operation: RuntimeOperation,
  context: RuntimeExecutionContext,
  payload: TPayload | undefined,
  handler?: RuntimePermissionHandler<TPayload>,
): Promise<boolean> {
  if (!handler) {
    return true;
  }

  return handler({
    operation,
    context,
    payload,
  });
}

function missingHandlerResult(operation: RuntimeOperation): RuntimeResult<never> {
  return runtimeFailure(operation, "RUNTIME_ERROR", `Runtime ${operation} handler is not configured.`);
}

function runtimeErrorResult(operation: RuntimeOperation, error: unknown): RuntimeResult<never> {
  const message = error instanceof Error ? error.message : "Runtime execution failed.";

  return runtimeFailure(operation, "RUNTIME_ERROR", message);
}

export function createRuntimeEngine<
  TEntity extends RuntimeEntity,
  TCreateInput,
  TUpdateInput,
>(
  handlers: RuntimeEngineHandlers<TEntity, TCreateInput, TUpdateInput>,
): RuntimeEngine<TEntity, TCreateInput, TUpdateInput> {
  return {
    async list(request, context) {
      const operation: RuntimeOperation = "list";

      try {
        const permitted = await canExecute(operation, context, request, handlers.canExecute);

        if (!permitted) {
          return runtimeFailure(operation, "PERMISSION_DENIED", "Runtime list operation is not permitted.");
        }

        if (!handlers.list) {
          return missingHandlerResult(operation);
        }

        const data = await handlers.list(request, context);

        return runtimeSuccess(operation, data);
      } catch (error) {
        return runtimeErrorResult(operation, error);
      }
    },

    async read(request, context) {
      const operation: RuntimeOperation = "read";

      try {
        const permitted = await canExecute(operation, context, request, handlers.canExecute);

        if (!permitted) {
          return runtimeFailure(operation, "PERMISSION_DENIED", "Runtime read operation is not permitted.");
        }

        if (!handlers.read) {
          return missingHandlerResult(operation);
        }

        const entity = await handlers.read(request, context);

        if (!entity) {
          return runtimeFailure(operation, "NOT_FOUND", "Runtime record was not found.");
        }

        return runtimeSuccess(operation, entity);
      } catch (error) {
        return runtimeErrorResult(operation, error);
      }
    },

    async validateCreate(input, context) {
      const operation: RuntimeOperation = "validate";

      try {
        if (!handlers.validateCreate) {
          return runtimeSuccess(operation, input);
        }

        return handlers.validateCreate(input, context);
      } catch (error) {
        return runtimeErrorResult(operation, error);
      }
    },

    async validateUpdate(input, context) {
      const operation: RuntimeOperation = "validate";

      try {
        if (!handlers.validateUpdate) {
          return runtimeSuccess(operation, input);
        }

        return handlers.validateUpdate(input, context);
      } catch (error) {
        return runtimeErrorResult(operation, error);
      }
    },

    async create(request, context) {
      const operation: RuntimeOperation = "create";

      try {
        const permitted = await canExecute(operation, context, request, handlers.canExecute);

        if (!permitted) {
          return runtimeFailure(operation, "PERMISSION_DENIED", "Runtime create operation is not permitted.");
        }

        const validation = await this.validateCreate(request.input, context);

        if (!validation.ok) {
          return validation;
        }

        if (!handlers.create) {
          return missingHandlerResult(operation);
        }

        const entity = await handlers.create(
          {
            input: validation.data,
          },
          context,
        );

        return runtimeSuccess(operation, entity);
      } catch (error) {
        return runtimeErrorResult(operation, error);
      }
    },

    async update(request, context) {
      const operation: RuntimeOperation = "update";

      try {
        const permitted = await canExecute(operation, context, request, handlers.canExecute);

        if (!permitted) {
          return runtimeFailure(operation, "PERMISSION_DENIED", "Runtime update operation is not permitted.");
        }

        const validation = await this.validateUpdate(request.input, context);

        if (!validation.ok) {
          return validation;
        }

        if (!handlers.update) {
          return missingHandlerResult(operation);
        }

        const entity = await handlers.update(
          {
            id: request.id,
            input: validation.data,
          },
          context,
        );

        if (!entity) {
          return runtimeFailure(operation, "NOT_FOUND", "Runtime record was not found.");
        }

        return runtimeSuccess(operation, entity);
      } catch (error) {
        return runtimeErrorResult(operation, error);
      }
    },
  };
}