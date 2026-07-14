import { collectionsFormConfig, type CollectionsFormEntity } from "@/lib/cms/collections/collections-form-config";
import type { FormMode, FormValues } from "@/lib/forms";
import { FormActions } from "./FormActions";
import { FormField } from "./FormField";

export interface CollectionFormProps {
  readonly action?: (formData: FormData) => void | Promise<void>;
  readonly message?: string;
  readonly mode?: Extract<FormMode, "create" | "edit">;
  readonly status?: "error" | "success";
  readonly values?: FormValues<CollectionsFormEntity>;
}

export function CollectionForm({ action, message, mode = "create", status, values }: CollectionFormProps) {
  const form = mode === "edit" ? collectionsFormConfig.editForm : collectionsFormConfig.createForm;
  const initialValues = {
    ...form.initialValues,
    ...values,
  };

  const sections = form.sections ?? [];
  const fallbackSubmitLabel = mode === "edit" ? "Save Collection" : "Create Collection";
  const statusMessage =
    message ??
    (action
      ? "Collection save uses guarded development-only JSON persistence."
      : "Collection mutation is not connected yet. This form is prepared for a future guarded save action.");
  const helperText = action
    ? "JSON persistence is development-only and remains guarded for production."
    : "No collection data will be saved until a future save action is approved and connected.";

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
              <FormField<CollectionsFormEntity> field={field} key={field.key} values={initialValues} />
            ))}
          </div>
        </section>
      ))}

      <FormActions
        cancelHref="/admin/collections"
        cancelLabel={form.cancelLabel ?? "Cancel"}
        helperText={helperText}
        submitDisabled={!action}
        submitLabel={form.submitLabel ?? fallbackSubmitLabel}
      />
    </form>
  );
}