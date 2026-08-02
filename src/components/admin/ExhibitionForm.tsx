"use client";

import { useMemo, useState } from "react";
import { exhibitionsFormConfig, type ExhibitionsFormEntity } from "@/lib/cms/exhibitions/exhibitions-form-config";
import type { FormMode, FormValues } from "@/lib/forms";
import { FormActions } from "./FormActions";
import { FormField } from "./FormField";
import {
  RelationshipManager,
  RelationshipPicker,
  type ManagedRelationshipItem,
  type RelationshipPickerItem,
} from "./relationships";

interface ExhibitionRelationshipOption {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
}

export interface ExhibitionFormProps {
  readonly action?: (formData: FormData) => void | Promise<void>;
  readonly artistOptions?: readonly ExhibitionRelationshipOption[];
  readonly artworkOptions?: readonly ExhibitionRelationshipOption[];
  readonly initialArtistIds?: readonly string[];
  readonly initialArtworkIds?: readonly string[];
  readonly message?: string;
  readonly mode?: Extract<FormMode, "create" | "edit">;
  readonly status?: "error" | "success";
  readonly values?: FormValues<ExhibitionsFormEntity>;
}

function toPickerItems(options: readonly ExhibitionRelationshipOption[]): readonly RelationshipPickerItem[] {
  return options.map((option) => ({
    id: option.id,
    label: option.label,
    description: option.description,
  }));
}

function toManagedItems(
  selectedIds: readonly string[],
  items: readonly RelationshipPickerItem[],
): readonly ManagedRelationshipItem[] {
  return selectedIds.map((selectedId, index) => {
    const selectedItem = items.find((item) => item.id === selectedId);

    return {
      id: selectedId,
      label: selectedItem?.label ?? selectedId,
      description: selectedItem?.description,
      order: index + 1,
    };
  });
}

function reorderSelectedIds(
  selectedIds: readonly string[],
  itemId: string,
  direction: "up" | "down",
): readonly string[] {
  const currentIndex = selectedIds.indexOf(itemId);

  if (currentIndex === -1) {
    return selectedIds;
  }

  if (direction === "up" && currentIndex === 0) {
    return selectedIds;
  }

  if (direction === "down" && currentIndex === selectedIds.length - 1) {
    return selectedIds;
  }

  const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  const nextSelectedIds = [...selectedIds];
  const [movedId] = nextSelectedIds.splice(currentIndex, 1);
  nextSelectedIds.splice(swapIndex, 0, movedId);
  return nextSelectedIds;
}

export function ExhibitionForm({
  action,
  artistOptions = [],
  artworkOptions = [],
  initialArtistIds = [],
  initialArtworkIds = [],
  message,
  mode = "create",
  status,
  values,
}: ExhibitionFormProps) {
  const form = mode === "edit" ? exhibitionsFormConfig.editForm : exhibitionsFormConfig.createForm;
  const initialValues = {
    ...form.initialValues,
    ...values,
  };

  const sections = form.sections ?? [];
  const fallbackSubmitLabel = mode === "edit" ? "Save Exhibition" : "Create Exhibition";
  const statusMessage =
    message ??
    (action
      ? "Exhibition save is active and persists changes to PostgreSQL."
      : "Exhibition save action is currently unavailable for this form.");
  const helperText = action
    ? "Changes are saved when submission succeeds."
    : "Saving is currently unavailable in this form.";
  const [artistSearchValue, setArtistSearchValue] = useState("");
  const [artworkSearchValue, setArtworkSearchValue] = useState("");
  const [selectedArtistIds, setSelectedArtistIds] = useState<readonly string[]>(initialArtistIds);
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<readonly string[]>(initialArtworkIds);

  const artistPickerItems = useMemo(() => toPickerItems(artistOptions), [artistOptions]);
  const artworkPickerItems = useMemo(() => toPickerItems(artworkOptions), [artworkOptions]);

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

  const filteredArtworkItems = useMemo(() => {
    const query = artworkSearchValue.trim().toLowerCase();

    if (!query) {
      return artworkPickerItems;
    }

    return artworkPickerItems.filter((item) =>
      [item.id, item.label, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [artworkPickerItems, artworkSearchValue]);

  const managedArtists = useMemo(
    () => toManagedItems(selectedArtistIds, artistPickerItems),
    [artistPickerItems, selectedArtistIds],
  );

  const managedArtworks = useMemo(
    () => toManagedItems(selectedArtworkIds, artworkPickerItems),
    [artworkPickerItems, selectedArtworkIds],
  );

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
              <FormField<ExhibitionsFormEntity> field={field} key={field.key} values={initialValues} />
            ))}
          </div>
        </section>
      ))}

      <section className="admin-form-section" aria-labelledby="section-exhibition-artists">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="section-exhibition-artists">
            Exhibition Artists
          </h3>
          <p className="admin-form-section__description">
            Select and organize artists for this exhibition.
          </p>
        </div>
        <div className="admin-form-section__fields">
          <input name="exhibition_artist_ids" type="hidden" value="" />
          {selectedArtistIds.map((artistId) => (
            <input key={artistId} name="exhibition_artist_ids" type="hidden" value={artistId} />
          ))}
          <RelationshipPicker
            emptyMessage="No artists available."
            id="exhibition-artists"
            items={filteredArtistItems}
            mode="multiple"
            onSearchChange={setArtistSearchValue}
            onSelectionChange={setSelectedArtistIds}
            searchPlaceholder="Search artists by name, slug, or ID"
            searchValue={artistSearchValue}
            selectedIds={selectedArtistIds}
            selectedTitle="Selected artists"
            title="Add artists"
          />
          <RelationshipManager
            emptyMessage="No artists selected yet."
            items={managedArtists}
            onMoveDown={(itemId) =>
              setSelectedArtistIds((currentIds) => reorderSelectedIds(currentIds, itemId, "down"))
            }
            onMoveUp={(itemId) =>
              setSelectedArtistIds((currentIds) => reorderSelectedIds(currentIds, itemId, "up"))
            }
            onRemove={(itemId) =>
              setSelectedArtistIds((currentIds) =>
                currentIds.filter((currentId) => currentId !== itemId),
              )
            }
            title="Manage selected artists"
          />
        </div>
      </section>

      <section className="admin-form-section" aria-labelledby="section-exhibition-artworks">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="section-exhibition-artworks">
            Exhibition Artworks
          </h3>
          <p className="admin-form-section__description">
            Select and organize artworks for this exhibition.
          </p>
        </div>
        <div className="admin-form-section__fields">
          <input name="exhibition_artwork_ids" type="hidden" value="" />
          {selectedArtworkIds.map((artworkId) => (
            <input key={artworkId} name="exhibition_artwork_ids" type="hidden" value={artworkId} />
          ))}
          <RelationshipPicker
            emptyMessage="No artworks available."
            id="exhibition-artworks"
            items={filteredArtworkItems}
            mode="multiple"
            onSearchChange={setArtworkSearchValue}
            onSelectionChange={setSelectedArtworkIds}
            searchPlaceholder="Search artworks by title, slug, or ID"
            searchValue={artworkSearchValue}
            selectedIds={selectedArtworkIds}
            selectedTitle="Selected artworks"
            title="Add artworks"
          />
          <RelationshipManager
            emptyMessage="No artworks selected yet."
            items={managedArtworks}
            onMoveDown={(itemId) =>
              setSelectedArtworkIds((currentIds) => reorderSelectedIds(currentIds, itemId, "down"))
            }
            onMoveUp={(itemId) =>
              setSelectedArtworkIds((currentIds) => reorderSelectedIds(currentIds, itemId, "up"))
            }
            onRemove={(itemId) =>
              setSelectedArtworkIds((currentIds) =>
                currentIds.filter((currentId) => currentId !== itemId),
              )
            }
            title="Manage selected artworks"
          />
        </div>
      </section>

      <FormActions
        cancelHref="/admin/exhibitions"
        cancelLabel={form.cancelLabel ?? "Cancel"}
        helperText={helperText}
        submitDisabled={!action}
        submitLabel={form.submitLabel ?? fallbackSubmitLabel}
      />
    </form>
  );
}
