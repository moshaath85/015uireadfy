import type { FormFieldDefinition, FormValues } from "@/lib/forms";

export interface FormFieldProps<TEntity extends Record<string, unknown> = Record<string, unknown>> {
  readonly field: FormFieldDefinition<TEntity>;
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
  values = {},
}: FormFieldProps<TEntity>) {
  const fieldId = `admin-field-${field.key}`;
  const descriptionId = field.description ? `${fieldId}-description` : undefined;
  const value = values[field.key] ?? field.defaultValue;
  const disabled = field.disabled || field.readonly;

  if (field.type === "image") {
    const selectedMediaId = toTextValue(value);
    const uploadId = `${fieldId}-upload`;
    const replaceId = `${fieldId}-replace`;
    const removeId = `${fieldId}-remove`;

    return (
      <div className="admin-form-field">
        <span className="admin-form-field__label">
          {field.label}
          {field.required ? <span aria-hidden="true"> *</span> : null}
        </span>
        <div
          style={{
            background: "#ffffff",
            border: "1px dashed #b8b8b2",
            display: "grid",
            gap: "12px",
            padding: "16px"
          }}
        >
          <label className="admin-form-field" htmlFor={fieldId}>
            <span className="admin-form-field__label">Select existing media</span>
            <select
              aria-describedby={descriptionId}
              className="admin-form-field__control admin-form-field__control--select"
              defaultValue={selectedMediaId}
              disabled={disabled}
              id={fieldId}
              name={field.key}
              required={field.required}
            >
              <option value="">No image selected</option>
              {selectedMediaId ? <option value={selectedMediaId}>Current selected media</option> : null}
            </select>
          </label>

          <div
            aria-label={`${field.label} preview`}
            style={{
              alignItems: "center",
              background: "#f7f7f5",
              border: "1px solid #d8d8d8",
              color: "#5f5f58",
              display: "flex",
              minHeight: "96px",
              padding: "12px"
            }}
          >
            {selectedMediaId ? `Preview uses selected Media record: ${selectedMediaId}` : "No preview available until media is selected or uploaded."}
          </div>

          <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <label className="admin-form-field" htmlFor={uploadId}>
              <span className="admin-form-field__label">Upload Image</span>
              <input accept="image/*" className="admin-form-field__control" disabled={disabled} id={uploadId} name={`${field.key}__upload`} type="file" />
            </label>
            <label className="admin-form-field" htmlFor={replaceId}>
              <span className="admin-form-field__label">Replace Image</span>
              <input accept="image/*" className="admin-form-field__control" disabled={disabled} id={replaceId} name={`${field.key}__replace`} type="file" />
            </label>
            <label className="admin-form-field admin-form-field--checkbox" htmlFor={removeId}>
              <span className="admin-form-field__checkbox-label">
                <input className="admin-form-field__checkbox" disabled={disabled} id={removeId} name={`${field.key}__remove`} type="checkbox" value="true" />
                <span>Remove Image</span>
              </span>
            </label>
          </div>

          <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Alt text (English)</span>
              <input className="admin-form-field__control" disabled={disabled} name={`${field.key}__alt_en`} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Alt text (Arabic)</span>
              <input className="admin-form-field__control" dir="rtl" disabled={disabled} name={`${field.key}__alt_ar`} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Caption (English)</span>
              <input className="admin-form-field__control" disabled={disabled} name={`${field.key}__caption_en`} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Caption (Arabic)</span>
              <input className="admin-form-field__control" dir="rtl" disabled={disabled} name={`${field.key}__caption_ar`} />
            </label>
          </div>
        </div>
        <FieldDescription id={descriptionId}>{field.description}</FieldDescription>
      </div>
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
