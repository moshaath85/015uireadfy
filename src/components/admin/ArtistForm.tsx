"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { artistsFormConfig, type ArtistsFormEntity } from "@/lib/cms/artists/artists-form-config";
import type { ArtistValidationIssue } from "@/lib/cms/artists/artists-validation";
import type { FormMode, FormSectionDefinition, FormValues } from "@/lib/forms";
import { FormActions } from "./FormActions";
import { FormField } from "./FormField";

export interface ArtistFormState {
  readonly status: "idle" | "success" | "error";
  readonly message: string;
  readonly artistId?: string;
  readonly issues: readonly ArtistValidationIssue[];
}

export type ArtistFormAction = (state: ArtistFormState, formData: FormData) => Promise<ArtistFormState>;

export interface ArtistFormProps {
  readonly action?: ArtistFormAction;
  readonly initialState?: ArtistFormState;
  readonly mode?: Extract<FormMode, "create" | "edit">;
  readonly values?: FormValues<ArtistsFormEntity>;
}

type ArtistPanelKey = "shared-information" | "arabic-translation" | "english-translation";

const disabledArtistFormState: ArtistFormState = {
  status: "idle",
  message: "Saving is not connected for this form yet.",
  issues: [],
};

const artistPanels = [
  {
    key: "shared-information",
    label: "Shared",
    title: "Shared",
    description: "Profile, contact, media, and publishing settings used in every language.",
  },
  {
    key: "arabic-translation",
    label: "Arabic",
    title: "Arabic",
    description: "Arabic name, biography, summary, SEO, and image text.",
  },
  {
    key: "english-translation",
    label: "English",
    title: "English",
    description: "English name, biography, summary, SEO, and image text.",
  },
] as const;

async function disabledArtistFormAction(): Promise<ArtistFormState> {
  return disabledArtistFormState;
}

function findPanelSection(
  sections: readonly FormSectionDefinition<ArtistsFormEntity>[],
  sectionKey: string,
) {
  return sections.find((section) => section.key === sectionKey);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getStringValue(values: FormValues<ArtistsFormEntity>, key: keyof ArtistsFormEntity & string): string {
  const value = values[key];
  return typeof value === "string" ? value : "";
}

function renderSection(
  section: FormSectionDefinition<ArtistsFormEntity>,
  values: FormValues<ArtistsFormEntity>,
) {
  return (
    <section className="admin-form-section" key={section.key} aria-labelledby={`section-${section.key}`}>
      <div className="admin-form-section__heading">
        <h4 className="admin-form-section__title" id={`section-${section.key}`}>
          {section.title}
        </h4>
        {section.description ? (
          <p className="admin-form-section__description">{section.description}</p>
        ) : null}
      </div>
      <div className="admin-form-section__fields">
        {section.fields.map((field) => (
          <FormField<ArtistsFormEntity> field={field} key={field.key} values={values} />
        ))}
      </div>
    </section>
  );
}

export function ArtistForm({
  action = disabledArtistFormAction,
  initialState = disabledArtistFormState,
  mode = "create",
  values,
}: ArtistFormProps) {
  const [state, formAction] = useFormState(action, initialState);
  const router = useRouter();
  const [activePanelKey, setActivePanelKey] = useState<ArtistPanelKey>("shared-information");
  const [manualSlug, setManualSlug] = useState(typeof values?.slug === "string" ? values.slug : "");
  const form = mode === "edit" ? artistsFormConfig.editForm : artistsFormConfig.createForm;
  const initialValues = {
    ...form.initialValues,
    ...values,
  };

  const preferredName = getStringValue(initialValues, "name_en") || getStringValue(initialValues, "name_ar");
  const generatedSlug = useMemo(() => slugify(preferredName), [preferredName]);
  const slugValue = manualSlug || generatedSlug;
  const valuesWithSlug = {
    ...initialValues,
    slug: slugValue,
  };

  const sections = form.sections ?? [];
  const advancedSection = findPanelSection(sections, "advanced-settings");
  const fallbackSubmitLabel = mode === "edit" ? "Save Artist" : "Create Artist";
  const hasEnabledAction = action !== disabledArtistFormAction;
  const submitDisabled = !hasEnabledAction;

  useEffect(() => {
    if (mode === "create" && state.status === "success" && state.artistId) {
      router.replace(`/admin/artists/${state.artistId}/edit?created=1`);
    }
  }, [mode, router, state.artistId, state.status]);

  return (
    <form action={formAction} className="admin-form" aria-label={form.title}>
      <div className="admin-form__intro">
        <h2 className="admin-form__title">{form.title}</h2>
        <p className="admin-form__description">{form.description}</p>
      </div>

      <div aria-live="polite" role={state.status === "error" ? "alert" : "status"}>
        <p className="admin-form__description">
          {state.message || "Complete the fields below, then save the artist."}
        </p>
        {state.artistId ? (
          <p className="admin-form__description">Artist saved. Continue editing from the artist edit page.</p>
        ) : null}
        {state.issues.length > 0 ? (
          <ul>
            {state.issues.map((issue) => (
              <li key={`${issue.field}-${issue.message}`}>{issue.message}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <input name="slug" type="hidden" value={slugValue} />
      <input name="display_order" type="hidden" value={Number(valuesWithSlug.display_order ?? 0)} />

      <nav aria-label="Artist editing sections" className="admin-form-section">
        <div
          role="tablist"
          aria-label="Artist editing sections"
          style={{
            background: "#ffffff",
            border: "1px solid #d8d8d8",
            display: "grid",
            gap: "8px",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            padding: "8px"
          }}
        >
          {artistPanels.map((panel) => {
            const selected = panel.key === activePanelKey;

            return (
              <button
                aria-controls={`artist-panel-${panel.key}`}
                aria-selected={selected}
                key={panel.key}
                onClick={() => setActivePanelKey(panel.key)}
                role="tab"
                type="button"
                style={{
                  background: selected ? "#1f1f1f" : "#f7f7f5",
                  border: selected ? "1px solid #1f1f1f" : "1px solid #d8d8d8",
                  color: selected ? "#ffffff" : "#1f1f1f",
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: "14px",
                  fontWeight: selected ? 600 : 400,
                  padding: "12px 14px"
                }}
              >
                {panel.label}
              </button>
            );
          })}
        </div>
      </nav>

      {artistPanels.map((panel) => {
        const selected = panel.key === activePanelKey;
        const section = findPanelSection(sections, panel.key);

        return (
          <section
            aria-labelledby={`artist-panel-title-${panel.key}`}
            className="admin-form-section"
            hidden={!selected}
            id={`artist-panel-${panel.key}`}
            key={panel.key}
            role="tabpanel"
          >
            <div className="admin-form-section__heading">
              <h3 className="admin-form-section__title" id={`artist-panel-title-${panel.key}`}>
                {panel.title}
              </h3>
              <p className="admin-form-section__description">{panel.description}</p>
            </div>
            {section ? renderSection(section, valuesWithSlug) : null}
          </section>
        );
      })}

      {mode === "edit" && advancedSection ? (
        <details className="admin-form-section">
          <summary className="admin-form-section__title" style={{ cursor: "pointer" }}>
            Advanced settings
          </summary>
          <p className="admin-form-section__description">
            The page URL is generated automatically from the artist name. Edit it only if the public URL needs a specific value.
          </p>
          <label className="admin-form-field" htmlFor="artist-manual-slug">
            <span className="admin-form-field__label">Page URL</span>
            <input
              className="admin-form-field__control"
              id="artist-manual-slug"
              onChange={(event) => setManualSlug(slugify(event.currentTarget.value))}
              placeholder={generatedSlug || "artist-name"}
              type="text"
              value={manualSlug}
            />
          </label>
          {renderSection(advancedSection, valuesWithSlug)}
        </details>
      ) : null}

      <FormActions
        cancelHref="/admin/artists"
        cancelLabel={form.cancelLabel ?? "Cancel"}
        helperText="Save the artist, then continue editing from the artist edit page."
        submitDisabled={submitDisabled}
        submitLabel={form.submitLabel ?? fallbackSubmitLabel}
      />
    </form>
  );
}
