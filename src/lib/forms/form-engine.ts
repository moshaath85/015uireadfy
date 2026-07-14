import type {
  FormSubmitResult,
  FormValidationResult,
  FormValues
} from "./form-types";

export interface FormEngine<TEntity extends Record<string, unknown> = Record<string, unknown>> {
  initialize(values?: FormValues<TEntity>): FormValues<TEntity>;
  validate(values: FormValues<TEntity>): FormValidationResult<TEntity>;
  submit(values: FormValues<TEntity>): Promise<FormSubmitResult<TEntity>>;
  reset(values?: FormValues<TEntity>): FormValues<TEntity>;
}