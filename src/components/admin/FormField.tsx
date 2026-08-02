"use client";

import type { FormFieldDefinition, FormValues } from "@/lib/forms";
import type { Media } from "@/types";
import { MediaPicker } from "./media";

export interface FormFieldProps<TEntity extends Record<string, unknown> = Record<string, unknown>> {
  readonly field: FormFieldDefinition<TEntity>;
  readonly mediaOptions?: readonly Media[];
  readonly values?: FormValues<TEntity>;
}

function toInputValue(value: unknown): string | number | readonly string[] | undefined {
  if (value === undefined || value === null || typeof value === "boolean") {
    return undefined;
  }

  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  return String(value);
}

function toTextValue(value: unknown): string {
  if (value === undefined || value === null || typeof value === "boolean") {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}

function getInputType(type: FormFieldDefinition["type"]): string {
  if (type === "email" || type === "number" || type === "url" || type === "date") {
    return type;
  }

  if (type === "datetime") {
    return "datetime-local";
  }

  return "text";
}

function FieldDescription({ id, children }: { readonly id?: string; readonly children?: string }) {
  if (!children) {
    return null;
  }

  return (
    <p className="admin-form-field__description" id={id}>
      {children}
    </p>
  );
}

export function FormField<TEntity extends Record<string, unknown> = Record<string, unknown>>({
  field,
  mediaOptions = [],
  values = {},
}: FormFieldProps<TEntity>) {
  const fieldId = `admin-field-${field.key}`;
  const descriptionId = field.description ? `${fieldId}-description` : undefined;
  const value = values[field.key] ?? field.defaultValue;
  const disabled = field.disabled || field.readonly;

  if (field.type === "image") {
    return (
      <MediaPicker
        disabled={disabled}
        fieldName={field.key}
        label={field.label}
        media={mediaOptions}
        required={field.required}
        selectedMediaId={toTextValue(value)}
      />
    );
  }

  if (field.type === "textarea" || field.type === "json") {
    return (
      <div className="admin-form-field">
        <label className="admin-form-field__label" htmlFor={fieldId}>
          {field.label}
          {field.required ? <span aria-hidden="true"> *</span> : null}
        </label>
        <textarea
          aria-describedby={descriptionId}
          className="admin-form-field__control admin-form-field__control--textarea"
          defaultValue={toTextValue(value)}
          disabled={disabled}
          id={fieldId}
          name={field.key}
          placeholder={field.placeholder}
          readOnly={field.readonly}
          required={field.required}
          rows={field.type === "json" ? 8 : 5}
        />
        <FieldDescription id={descriptionId}>{field.description}</FieldDescription>
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="admin-form-field admin-form-field--checkbox">
        <label className="admin-form-field__checkbox-label" htmlFor={fieldId}>
          <input
            className="admin-form-field__checkbox"
            defaultChecked={Boolean(value)}
            disabled={disabled}
            id={fieldId}
            name={field.key}
            type="checkbox"
          />
          <span>{field.label}</span>
        </label>
        <FieldDescription id={descriptionId}>{field.description}</FieldDescription>
      </div>
    );
  }

  if (field.options?.length) {
    return (
      <div className="admin-form-field">
        <label className="admin-form-field__label" htmlFor={fieldId}>
          {field.label}
          {field.required ? <span aria-hidden="true"> *</span> : null}
        </label>
        <select
          aria-describedby={descriptionId}
          className="admin-form-field__control admin-form-field__control--select"
          defaultValue={toTextValue(value)}
          disabled={disabled}
          id={fieldId}
          name={field.key}
          required={field.required}
        >
          <option value="">Select {field.label}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldDescription id={descriptionId}>{field.description}</FieldDescription>
      </div>
    );
  }

  return (
    <div className="admin-form-field">
      <label className="admin-form-field__label" htmlFor={fieldId}>
        {field.label}
        {field.required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        aria-describedby={descriptionId}
        className="admin-form-field__control"
        defaultValue={toInputValue(value)}
        disabled={disabled}
        id={fieldId}
        name={field.key}
        placeholder={field.placeholder}
        readOnly={field.readonly}
        required={field.required}
        type={getInputType(field.type)}
      />
      <FieldDescription id={descriptionId}>{field.description}</FieldDescription>
    </div>
  );
}
