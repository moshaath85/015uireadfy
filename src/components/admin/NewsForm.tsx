import { VisibilityStatus } from "@/types";
import { newsCategoryOptions, newsVisibilityOptions } from "@/lib/cms/news/news-form-config";
import type { FormMode, FormValues } from "@/lib/forms";
import { FormActions } from "./FormActions";

export interface NewsFormProps {
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

export function NewsForm({ action, message, mode = "create", status, values = {} }: NewsFormProps) {
  const title = mode === "edit" ? "Edit News Item" : "Create News Item";
  const description =
    mode === "edit"
      ? "Configuration for the guarded News update workflow."
      : "Configuration for the guarded News creation workflow.";
  const submitLabel = mode === "edit" ? "Save News Item" : "Create News Item";
  const statusMessage =
    message ??
    (action
      ? "News save uses guarded development-only JSON persistence."
      : "News mutation is prepared for a future guarded save action.");
  const helperText = action
    ? "JSON persistence is development-only and remains guarded for production."
    : "No news data will be saved until a future save action is connected.";

  return (
    <form action={action} className="admin-form" aria-label={title}>
      <div className="admin-form__intro">
        <h2 className="admin-form__title">{title}</h2>
        <p className="admin-form__description">{description}</p>
      </div>

      <div aria-live="polite" role={status === "error" ? "alert" : "status"}>
        <p className="admin-form__description">{statusMessage}</p>
      </div>

      <section className="admin-form-section" aria-labelledby="news-section-identity">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="news-section-identity">Identity</h3>
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

      <section className="admin-form-section" aria-labelledby="news-section-summary">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="news-section-summary">Summary</h3>
        </div>
        <div className="admin-form-section__fields">
          <label className="admin-form-field">
            <span className="admin-form-field__label">Excerpt (English) *</span>
            <textarea className="admin-form-field__control admin-form-field__control--textarea" name="excerpt_en" required rows={4} defaultValue={stringValue(values.excerpt_en)} />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Excerpt (Arabic) *</span>
            <textarea className="admin-form-field__control admin-form-field__control--textarea" name="excerpt_ar" required rows={4} defaultValue={stringValue(values.excerpt_ar)} />
          </label>
        </div>
      </section>

      <section className="admin-form-section" aria-labelledby="news-section-content">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="news-section-content">Content</h3>
        </div>
        <div className="admin-form-section__fields">
          <label className="admin-form-field">
            <span className="admin-form-field__label">Content (English) *</span>
            <textarea className="admin-form-field__control admin-form-field__control--textarea" name="content_en" required rows={7} defaultValue={stringValue(values.content_en)} />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Content (Arabic) *</span>
            <textarea className="admin-form-field__control admin-form-field__control--textarea" name="content_ar" required rows={7} defaultValue={stringValue(values.content_ar)} />
          </label>
        </div>
      </section>

      <section className="admin-form-section" aria-labelledby="news-section-publishing">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="news-section-publishing">Publishing</h3>
        </div>
        <div className="admin-form-section__fields">
          <label className="admin-form-field">
            <span className="admin-form-field__label">Category *</span>
            <select className="admin-form-field__control admin-form-field__control--select" name="category" required defaultValue={stringValue(values.category, "gallery_news")}>
              {newsCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
              {values.category && !newsCategoryOptions.some((option) => option.value === values.category) ? (
                <option value={String(values.category)}>{String(values.category)}</option>
              ) : null}
            </select>
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Publish Date *</span>
            <input className="admin-form-field__control" name="publish_date" required type="date" defaultValue={stringValue(values.publish_date)} />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Image</span>
            <select className="admin-form-field__control admin-form-field__control--select" name="image_id" defaultValue={stringValue(values.image_id)}>
              <option value="">No image selected</option>
              {stringValue(values.image_id) ? <option value={stringValue(values.image_id)}>Current selected media</option> : null}
            </select>
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Upload Image</span>
            <input accept="image/*" className="admin-form-field__control" name="image_id__upload" type="file" />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Replace Image</span>
            <input accept="image/*" className="admin-form-field__control" name="image_id__replace" type="file" />
          </label>
          <label className="admin-form-field admin-form-field--checkbox">
            <span className="admin-form-field__checkbox-label">
              <input className="admin-form-field__checkbox" name="image_id__remove" type="checkbox" value="true" />
              <span>Remove Image</span>
            </span>
          </label>
          <label className="admin-form-field"><span className="admin-form-field__label">Alt text (English)</span><input className="admin-form-field__control" name="image_id__alt_en" /></label>
          <label className="admin-form-field"><span className="admin-form-field__label">Alt text (Arabic)</span><input className="admin-form-field__control" dir="rtl" name="image_id__alt_ar" /></label>
          <label className="admin-form-field"><span className="admin-form-field__label">Caption (English)</span><input className="admin-form-field__control" name="image_id__caption_en" /></label>
          <label className="admin-form-field"><span className="admin-form-field__label">Caption (Arabic)</span><input className="admin-form-field__control" dir="rtl" name="image_id__caption_ar" /></label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Visibility *</span>
            <select className="admin-form-field__control admin-form-field__control--select" name="visibility_status" required defaultValue={stringValue(values.visibility_status, VisibilityStatus.Private)}>
              {newsVisibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <FormActions
        cancelHref="/admin/news"
        cancelLabel="Cancel"
        helperText={helperText}
        submitDisabled={!action}
        submitLabel={submitLabel}
      />
    </form>
  );
}