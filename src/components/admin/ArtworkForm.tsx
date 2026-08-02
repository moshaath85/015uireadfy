"use client";

import { useMemo, useState } from "react";
import { artworksFormConfig, type ArtworksFormEntity } from "@/lib/cms/artworks/artworks-form-config";
import type { FormMode, FormValues } from "@/lib/forms";
import type { Media } from "@/types";
import { FormActions } from "./FormActions";
import { FormField } from "./FormField";
import {
  RelationshipPicker,
  type RelationshipPickerItem,
} from "./relationships";

interface ArtworkRelationshipOption {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
}

export interface ArtworkFormProps {
  readonly action?: (formData: FormData) => void | Promise<void>;
  readonly artistOptions?: readonly ArtworkRelationshipOption[];
  readonly collectionOptions?: readonly ArtworkRelationshipOption[];
  readonly mediaOptions?: readonly Media[];
  readonly message?: string;
  readonly mode?: Extract<FormMode, "create" | "edit">;
  readonly status?: "error" | "success";
  readonly values?: FormValues<ArtworksFormEntity>;
}

function toInitialRelationshipId(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toRelationshipPickerItems(options: readonly ArtworkRelationshipOption[]): readonly RelationshipPickerItem[] {
  return options.map((option) => ({
    id: option.id,
    label: option.label,
    description: option.description,
  }));
}

export function ArtworkForm({
  action,
  artistOptions = [],
  collectionOptions = [],
  mediaOptions = [],
  message,
  mode = "create",
  status,
  values,
}: ArtworkFormProps) {
  const form = mode === "edit" ? artworksFormConfig.editForm : artworksFormConfig.createForm;
  const initialValues = {
    ...form.initialValues,
    ...values,
  };

  const sections = form.sections ?? [];
  const fallbackSubmitLabel = mode === "edit" ? "Save Artwork" : "Create Artwork";
  const statusMessage =
    message ??
    (action
      ? "Artwork save is active and persists changes to PostgreSQL."
      : "Artwork save action is currently unavailable for this form.");
  const helperText = action
    ? "Changes are saved when submission succeeds."
    : "Saving is currently unavailable in this form.";
  const [artistSearchValue, setArtistSearchValue] = useState("");
  const [collectionSearchValue, setCollectionSearchValue] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState(toInitialRelationshipId(initialValues.artist_id));
  const [selectedCollectionId, setSelectedCollectionId] = useState(toInitialRelationshipId(initialValues.collection_id));

  const artistPickerItems = useMemo(
    () => toRelationshipPickerItems(artistOptions),
    [artistOptions],
  );
  const collectionPickerItems = useMemo(
    () => toRelationshipPickerItems(collectionOptions),
    [collectionOptions],
  );

  const filteredArtistItems = useMemo(() => {
    const query = artistSearchValue.trim().toLowerCase();

    if (!query) {
      return artistPickerItems;
    }

    return artistPickerItems.filter((item) =>
      [item.id, item.label, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [artistPickerItems, artistSearchValue]);

  const filteredCollectionItems = useMemo(() => {
    const query = collectionSearchValue.trim().toLowerCase();

    if (!query) {
      return collectionPickerItems;
    }

    return collectionPickerItems.filter((item) =>
      [item.id, item.label, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [collectionPickerItems, collectionSearchValue]);

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
            {section.fields.map((field) => {
              if (field.key === "artist_id") {
                return (
                  <div className="admin-form-field" key={field.key}>
                    <input name="artist_id" type="hidden" value={selectedArtistId} />
                    <RelationshipPicker
                      emptyMessage="No artists match the current search."
                      items={filteredArtistItems}
                      mode="single"
                      onSearchChange={setArtistSearchValue}
                      onSelectionChange={(nextSelectedIds) => setSelectedArtistId(nextSelectedIds[0] ?? "")}
                      searchPlaceholder="Search by artist name or ID"
                      searchValue={artistSearchValue}
                      selectedIds={selectedArtistId ? [selectedArtistId] : []}
                      selectedTitle="Selected artist"
                      title={field.label}
                    />
                  </div>
                );
              }

              if (field.key === "collection_id") {
                return (
                  <div className="admin-form-field" key={field.key}>
                    <input name="collection_id" type="hidden" value={selectedCollectionId} />
                    <RelationshipPicker
                      emptyMessage="No collections match the current search."
                      items={filteredCollectionItems}
                      mode="single"
                      onSearchChange={setCollectionSearchValue}
                      onSelectionChange={(nextSelectedIds) => setSelectedCollectionId(nextSelectedIds[0] ?? "")}
                      searchPlaceholder="Search by collection title or ID"
                      searchValue={collectionSearchValue}
                      selectedIds={selectedCollectionId ? [selectedCollectionId] : []}
                      selectedTitle="Selected collection"
                      title={field.label}
                    />
                  </div>
                );
              }

              return (
                <FormField<ArtworksFormEntity> field={field} key={field.key} mediaOptions={mediaOptions} values={initialValues} />
              );
            })}
          </div>
        </section>
      ))}

      <FormActions
        cancelHref="/admin/artworks"
        cancelLabel={form.cancelLabel ?? "Cancel"}
        helperText={helperText}
        submitDisabled={!action}
        submitLabel={form.submitLabel ?? fallbackSubmitLabel}
      />
    </form>
  );
}
