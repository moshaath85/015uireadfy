import { publicationsFormConfig, type PublicationsFormEntity } from "@/lib/cms/publications/publications-form-config";
import type { FormMode, FormValues } from "@/lib/forms";
import { FormActions } from "./FormActions";
import { FormField } from "./FormField";

export interface PublicationFormProps {
  readonly action?: (formData: FormData) => void | Promise<void>;
  readonly message?: string;
  readonly mode?: Extract<FormMode, "create" | "edit">;
  readonly status?: "error" | "success";
  readonly values?: FormValues<PublicationsFormEntity>;
}

export function PublicationForm({ action, message, mode = "create", status, values }: PublicationFormProps) {
  const form = mode === "edit" ? publicationsFormConfig.editForm : publicationsFormConfig.createForm;
  const initialValues = {
    ...form.initialValues,
    ...values,
  };

  const sections = form.sections ?? [];
  const fallbackSubmitLabel = mode === "edit" ? "Save Publication" : "Create Publication";
  const statusMessage =
    message ??
    (action
      ? "Publication save is connected to PostgreSQL persistence."
      : "Publication mutation is not connected.");
  const helperText = action
    ? "Values are saved to PostgreSQL for the active organization."
    : "No publication data will be saved until a save action is connected.";

  return (
    <form action={action} className="admin-form" aria-label={form.title}>
      <div className="admin-form__intro">
        <h2 className="admin-form__title">{form.title}</h2>
        <p className="admin-form__description">{form.description}</p>
      </div>

      <div aria-live="polite" role={status === "error" ? "alert" : "status"}>
        <p className="admin-form__description">{statusMessage}</p>
      </div>

      {sections.map((section) => (
        <section className="admin-form-section" key={section.key} aria-labelledby={`section-${section.key}`}>
          <div className="admin-form-section__heading">
            <h3 className="admin-form-section__title" id={`section-${section.key}`}>
              {section.title}
            </h3>
            {section.description ? (
              <p className="admin-form-section__description">{section.description}</p>
            ) : null}
          </div>
          <div className="admin-form-section__fields">
            {section.fields.map((field) => (
              <FormField<PublicationsFormEntity> field={field} key={field.key} values={initialValues} />
            ))}
          </div>
        </section>
      ))}

      <FormActions
        cancelHref="/admin/publications"
        cancelLabel={form.cancelLabel ?? "Cancel"}
        helperText={helperText}
        submitDisabled={!action}
        submitLabel={form.submitLabel ?? fallbackSubmitLabel}
      />
    </form>
  );
}
