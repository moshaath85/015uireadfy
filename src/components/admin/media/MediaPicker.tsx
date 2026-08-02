"use client";

import { useMemo, useState } from "react";
import type { Media } from "@/types";

export interface MediaPickerProps {
  readonly disabled?: boolean;
  readonly fieldName: string;
  readonly label: string;
  readonly media: readonly Media[];
  readonly required?: boolean;
  readonly selectedMediaId?: string;
}

export function MediaPicker({
  disabled = false,
  fieldName,
  label,
  media,
  required = false,
  selectedMediaId = "",
}: MediaPickerProps) {
  const [selectedId, setSelectedId] = useState(selectedMediaId);
  const [draftId, setDraftId] = useState(selectedMediaId);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedMedia = media.find((item) => item.id === selectedId);

  const filteredMedia = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return media;
    }

    return media.filter((item) =>
      [
        item.id,
        item.alt_en,
        item.alt_ar,
        item.mime_type,
        item.storage_path,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [media, query]);

  function openPicker() {
    setDraftId(selectedId);
    setOpen(true);
  }

  function confirmSelection() {
    setSelectedId(draftId);
    setOpen(false);
  }

  return (
    <div className="admin-form-field">
      <span className="admin-form-field__label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>

      <input
        name={fieldName}
        required={required}
        type="hidden"
        value={selectedId}
      />

      <div
        style={{
          background: "#fff",
          border: "1px solid #d8d8d8",
          display: "grid",
          gap: "16px",
          padding: "16px",
        }}
      >
        {selectedMedia ? (
          <figure style={{ margin: 0 }}>
            <img
              alt={selectedMedia.alt_en || selectedMedia.alt_ar || label}
              src={selectedMedia.url}
              style={{
                aspectRatio: "4 / 3",
                background: "#f4f1ec",
                display: "block",
                maxHeight: "360px",
                objectFit: "contain",
                width: "100%",
              }}
            />
            <figcaption
              style={{
                color: "#555",
                fontSize: "12px",
                marginTop: "8px",
                overflowWrap: "anywhere",
              }}
            >
              {selectedMedia.alt_en || selectedMedia.id}
            </figcaption>
          </figure>
        ) : (
          <div
            style={{
              alignItems: "center",
              background: "#f7f7f5",
              color: "#666",
              display: "flex",
              justifyContent: "center",
              minHeight: "160px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            No media selected
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <button disabled={disabled} onClick={openPicker} type="button">
            Choose from Media Library
          </button>

          {selectedId ? (
            <button
              disabled={disabled}
              onClick={() => setSelectedId("")}
              type="button"
            >
              Remove
            </button>
          ) : null}

          <a href="/admin/media" target="_blank" rel="noreferrer">
            Upload new media
          </a>
        </div>
      </div>

      {open ? (
        <div
          aria-label="Choose media"
          aria-modal="true"
          role="dialog"
          style={{
            background: "rgba(20,20,20,0.62)",
            inset: 0,
            padding: "24px",
            position: "fixed",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#f7f7f5",
              display: "grid",
              gap: "18px",
              height: "calc(100vh - 48px)",
              margin: "0 auto",
              maxWidth: "1200px",
              overflow: "hidden",
              padding: "24px",
            }}
          >
            <header
              style={{
                alignItems: "center",
                display: "flex",
                gap: "16px",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Choose media</h2>
                <p style={{ margin: "6px 0 0" }}>
                  Reuse one asset across artists, artworks, exhibitions, and projects.
                </p>
              </div>

              <button onClick={() => setOpen(false)} type="button">
                Close
              </button>
            </header>

            <input
              aria-label="Search media"
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search by alt text, ID, file type, or storage path"
              type="search"
              value={query}
            />

            <div
              style={{
                display: "grid",
                gap: "16px",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {filteredMedia.map((item) => {
                const selected = draftId === item.id;
                const isImage =
                  item.type === "image" || item.mime_type.startsWith("image/");

                return (
                  <button
                    aria-pressed={selected}
                    key={item.id}
                    onClick={() => setDraftId(item.id)}
                    type="button"
                    style={{
                      background: "#fff",
                      border: selected
                        ? "2px solid #111"
                        : "1px solid #d8d8d8",
                      cursor: "pointer",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {isImage ? (
                      <img
                        alt={item.alt_en || item.alt_ar || "Media preview"}
                        loading="lazy"
                        src={item.url}
                        style={{
                          aspectRatio: "1 / 1",
                          background: "#f4f1ec",
                          display: "block",
                          objectFit: "cover",
                          width: "100%",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          alignItems: "center",
                          aspectRatio: "1 / 1",
                          background: "#f4f1ec",
                          display: "flex",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        {item.mime_type}
                      </div>
                    )}

                    <strong
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginTop: "8px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.alt_en || item.id}
                    </strong>
                  </button>
                );
              })}
            </div>

            <footer
              style={{
                alignItems: "center",
                borderTop: "1px solid #d8d8d8",
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "16px",
              }}
            >
              <span>{filteredMedia.length} assets</span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setOpen(false)} type="button">
                  Cancel
                </button>
                <button
                  disabled={!draftId}
                  onClick={confirmSelection}
                  type="button"
                >
                  Use selected
                </button>
              </div>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
