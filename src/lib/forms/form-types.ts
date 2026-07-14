export type FormEntityId = string | number;

export type FormMode = "create" | "edit" | "view";

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "status"
  | "visibility"
  | "image"
  | "url"
  | "email"
  | "json";

export interface FormOption {
  readonly label: string;
  readonly value: string;
  readonly description?: string;
}

export interface FormFieldDefinition<TEntity extends Record<string, unknown> = Record<string, unknown>> {
  readonly key: keyof TEntity & string;
  readonly label: string;
  readonly type: FormFieldType;
  readonly required?: boolean;
  readonly readonly?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly description?: string;
  readonly options?: readonly FormOption[];
  readonly defaultValue?: unknown;
}

export interface FormSectionDefinition<TEntity extends Record<string, unknown> = Record<string, unknown>> {
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly fields: readonly FormFieldDefinition<TEntity>[];
}

export type FormValues<TEntity extends Record<string, unknown> = Record<string, unknown>> = Partial<TEntity>;

export interface FormValidationIssue<TEntity extends Record<string, unknown> = Record<string, unknown>> {
  readonly field: keyof TEntity & string;
  readonly message: string;
  readonly code?: string;
}

export interface FormValidationResult<TEntity extends Record<string, unknown> = Record<string, unknown>> {
  readonly valid: boolean;
  readonly issues: readonly FormValidationIssue<TEntity>[];
}

export interface FormSubmitResult<TEntity extends Record<string, unknown> = Record<string, unknown>> {
  readonly success: boolean;
  readonly values?: FormValues<TEntity>;
  readonly issues?: readonly FormValidationIssue<TEntity>[];
}