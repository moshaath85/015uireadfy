import { VisibilityStatus } from "@/types";
import { projectStatusOptions, projectVisibilityOptions } from "@/lib/cms/projects/projects-form-config";
import type { FormMode, FormValues } from "@/lib/forms";
import { FormActions } from "./FormActions";

export interface ProjectFormProps {
  readonly action?: (formData: FormData) => void | Promise<void>;
  readonly message?: string;
  readonly mode?: Extract<FormMode, "create" | "edit">;
  readonly status?: "error" | "success";
  readonly values?: FormValues<Record<string, unknown>>;
}

function stringValue(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function yearToCompletionDate(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}-12-31`;
  }

  if (typeof value === "string" && /^\d{4}$/.test(value)) {
    return `${value}-12-31`;
  }

  return "";
}

export function ProjectForm({ action, message, mode = "create", status, values = {} }: ProjectFormProps) {
  const title = mode === "edit" ? "Edit Project" : "Create Project";
  const description =
    mode === "edit"
      ? "Configuration for the guarded Projects update workflow."
      : "Configuration for the guarded Projects creation workflow.";
  const submitLabel = mode === "edit" ? "Save Project" : "Create Project";
  const statusMessage =
    message ??
    (action
      ? "Project save uses guarded development-only JSON persistence."
      : "Project mutation is not connected yet. This form is prepared for a future guarded save action.");
  const helperText = action
    ? "JSON persistence is development-only and remains guarded for production."
    : "No project data will be saved until a future save action is approved and connected.";

  const clientValue = stringValue(values.client, stringValue(values.client_en));
  const completionDateValue = stringValue(values.completion_date, yearToCompletionDate(values.year));

  return (
    <form action={action} className="admin-form" aria-label={title}>
      <div className="admin-form__intro">
        <h2 className="admin-form__title">{title}</h2>
        <p className="admin-form__description">{description}</p>
      </div>

      <div aria-live="polite" role={status === "error" ? "alert" : "status"}>
        <p className="admin-form__description">{statusMessage}</p>
      </div>

      <section className="admin-form-section" aria-labelledby="section-identity">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="section-identity">Identity</h3>
        </div>
        <div className="admin-form-section__fields">
          <label className="admin-form-field">
            <span className="admin-form-field__label">Title (English) *</span>
            <input className="admin-form-field__control" name="title_en" required defaultValue={stringValue(values.title_en)} />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Title (Arabic) *</span>
            <input className="admin-form-field__control" name="title_ar" required defaultValue={stringValue(values.title_ar)} />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Slug *</span>
            <input className="admin-form-field__control" name="slug" required defaultValue={stringValue(values.slug)} />
          </label>
        </div>
      </section>

      <section className="admin-form-section" aria-labelledby="section-content">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="section-content">Content</h3>
        </div>
        <div className="admin-form-section__fields">
          <label className="admin-form-field">
            <span className="admin-form-field__label">Description (English) *</span>
            <textarea className="admin-form-field__control admin-form-field__control--textarea" name="description_en" required rows={5} defaultValue={stringValue(values.description_en)} />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Description (Arabic) *</span>
            <textarea className="admin-form-field__control admin-form-field__control--textarea" name="description_ar" required rows={5} defaultValue={stringValue(values.description_ar)} />
          </label>
        </div>
      </section>

      <section className="admin-form-section" aria-labelledby="section-details">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="section-details">Project Details</h3>
        </div>
        <div className="admin-form-section__fields">
          <label className="admin-form-field">
            <span className="admin-form-field__label">Client *</span>
            <input className="admin-form-field__control" name="client" required defaultValue={clientValue} />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Location *</span>
            <input className="admin-form-field__control" name="location" required defaultValue={stringValue(values.location)} />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Completion Date *</span>
            <input className="admin-form-field__control" name="completion_date" required type="date" defaultValue={completionDateValue} />
          </label>
        </div>
      </section>


      <section className="admin-form-section" aria-labelledby="section-media">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="section-media">Media</h3>
        </div>
        <div className="admin-form-section__fields">
          <label className="admin-form-field">
            <span className="admin-form-field__label">Project Image</span>
            <select className="admin-form-field__control admin-form-field__control--select" name="cover_media_id" defaultValue={stringValue(values.cover_media_id)}>
              <option value="">No image selected</option>
              {stringValue(values.cover_media_id) ? <option value={stringValue(values.cover_media_id)}>Current selected media</option> : null}
            </select>
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Upload Image</span>
            <input accept="image/*" className="admin-form-field__control" name="cover_media_id__upload" type="file" />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Replace Image</span>
            <input accept="image/*" className="admin-form-field__control" name="cover_media_id__replace" type="file" />
          </label>
          <label className="admin-form-field admin-form-field--checkbox">
            <span className="admin-form-field__checkbox-label">
              <input className="admin-form-field__checkbox" name="cover_media_id__remove" type="checkbox" value="true" />
              <span>Remove Image</span>
            </span>
          </label>
          <label className="admin-form-field"><span className="admin-form-field__label">Alt text (English)</span><input className="admin-form-field__control" name="cover_media_id__alt_en" /></label>
          <label className="admin-form-field"><span className="admin-form-field__label">Alt text (Arabic)</span><input className="admin-form-field__control" dir="rtl" name="cover_media_id__alt_ar" /></label>
          <label className="admin-form-field"><span className="admin-form-field__label">Caption (English)</span><input className="admin-form-field__control" name="cover_media_id__caption_en" /></label>
          <label className="admin-form-field"><span className="admin-form-field__label">Caption (Arabic)</span><input className="admin-form-field__control" dir="rtl" name="cover_media_id__caption_ar" /></label>
        </div>
      </section>

      <section className="admin-form-section" aria-labelledby="section-workflow">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="section-workflow">Workflow</h3>
        </div>
        <div className="admin-form-section__fields">
          <label className="admin-form-field">
            <span className="admin-form-field__label">Status *</span>
            <select className="admin-form-field__control admin-form-field__control--select" name="status" required defaultValue={stringValue(values.status, "planned")}>
              {projectStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Visibility *</span>
            <select className="admin-form-field__control admin-form-field__control--select" name="visibility_status" required defaultValue={stringValue(values.visibility_status, VisibilityStatus.Private)}>
              {projectVisibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <FormActions
        cancelHref="/admin/projects"
        cancelLabel="Cancel"
        helperText={helperText}
        submitDisabled={!action}
        submitLabel={submitLabel}
      />
    </form>
  );
}