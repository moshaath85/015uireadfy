import type {
  FormFieldDefinition,
  FormMode,
  FormSectionDefinition,
  FormValues
} from "./form-types";

export interface FormConfiguration<TEntity extends Record<string, unknown> = Record<string, unknown>> {
  readonly formKey: string;
  readonly moduleKey: string;
  readonly title: string;
  readonly description?: string;
  readonly mode: FormMode;
  readonly fields: readonly FormFieldDefinition<TEntity>[];
  readonly sections?: readonly FormSectionDefinition<TEntity>[];
  readonly initialValues?: FormValues<TEntity>;
  readonly submitLabel?: string;
  readonly cancelLabel?: string;
}

export interface FormModuleConfiguration<TEntity extends Record<string, unknown> = Record<string, unknown>> {
  readonly moduleKey: string;
  readonly entityLabel: string;
  readonly createForm: FormConfiguration<TEntity>;
  readonly editForm: FormConfiguration<TEntity>;
}

export interface FormConfigurationRegistry {
  readonly forms: readonly FormConfiguration[];
}