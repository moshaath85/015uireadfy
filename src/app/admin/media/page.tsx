import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { MediaGrid } from "@/components/admin/MediaGrid";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { SearchBar } from "@/components/admin/SearchBar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { getCmsModuleCapability } from "@/lib/cms/capabilities/capability-registry";
import { uploadMediaFile } from "@/lib/cms/media/media-upload-service";
import { mediaRepository } from "@/lib/repositories/media";
import type { Media } from "@/types";

interface AdminMediaPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
    readonly type?: string;
    readonly provider?: string;
    readonly sort?: string;
    readonly view?: string;
    readonly duplicates?: string;
    readonly upload?: string;
    readonly message?: string;
  }>;
}

function formatValue(value?: string | number | null): string {
  return value === undefined || value === null || value === "" ? "Not configured" : String(value);
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Not configured";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDimensions(width?: number, height?: number): string {
  if (!width || !height) {
    return "Not configured";
  }

  return `${width} × ${height}`;
}

function normalize(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function includesSearch(media: Media, query: string): boolean {
  if (!query) {
    return true;
  }

  return [
    media.id,
    media.url,
    media.alt_en,
    media.alt_ar,
    media.type,
    media.mime_type,
    media.checksum,
    media.storage_provider,
    media.storage_path,
    media.copyright,
    media.photographer,
    media.license,
  ].some((value) => normalize(value).includes(query));
}

function duplicateKeys(media: Media): readonly string[] {
  const keys = [`storage:${media.storage_path}`, `checksum:${media.checksum}`];

  if (media.file_size && media.width && media.height) {
    keys.push(`dimensions:${media.file_size}:${media.width}:${media.height}`);
  }

  return keys;
}

function buildDuplicateReasons(media: readonly Media[]): ReadonlyMap<string, string> {
  const grouped = new Map<string, Media[]>();

  for (const item of media) {
    for (const key of duplicateKeys(item)) {
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    }
  }

  const reasons = new Map<string, string>();

  Array.from(grouped.entries()).forEach(([key, items]) => {
    if (items.length < 2) {
      return;
    }

    const label = key.startsWith("storage:")
      ? "matching storage path"
      : key.startsWith("checksum:")
        ? "matching checksum"
        : "matching file size and dimensions";

    items.forEach((item) => {
      reasons.set(item.id, label);
    });
  });

  return reasons;
}

function sortMedia(media: readonly Media[], sort: string): Media[] {
  const sorted = [...media];

  if (sort === "oldest") {
    return sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  if (sort === "largest") {
    return sorted.sort((a, b) => b.file_size - a.file_size);
  }

  if (sort === "smallest") {
    return sorted.sort((a, b) => a.file_size - b.file_size);
  }

  return sorted.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}


async function uploadMediaAction(formData: FormData): Promise<void> {
  "use server";

  const adminContext = await requireAdminServerAction("media.create");
  const file = formData.get("file");
  const altText = String(formData.get("altText") ?? "").trim();
  const visibilityValue = String(formData.get("visibility") ?? "PRIVATE");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/media?upload=error&message=Please%20select%20a%20file.");
  }

  if (!altText) {
    redirect("/admin/media?upload=error&message=Alt%20text%20is%20required.");
  }

  const visibility =
    visibilityValue === "PUBLIC" ||
    visibilityValue === "VIP" ||
    visibilityValue === "HIDDEN"
      ? visibilityValue
      : "PRIVATE";

  try {
    await uploadMediaFile(file, {
      organizationId: adminContext.organizationId,
      altText,
      visibility,
      keyPrefix: "gallery-015/media",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Media upload failed.";

    redirect(
      `/admin/media?upload=error&message=${encodeURIComponent(message)}`,
    );
  }

  revalidatePath("/admin/media");
  redirect("/admin/media?upload=success");
}

const mediaColumns: readonly DataTableColumn<Media>[] = [
  {
    key: "media",
    header: "Media",
    render: (media) => (
      <div>
        <strong>{media.id}</strong>
        <br />
        <span>{media.type}</span>
      </div>
    )
  },
  {
    key: "url",
    header: "URL",
    render: (media) => formatValue(media.url)
  },
  {
    key: "mime_type",
    header: "MIME type",
    render: (media) => formatValue(media.mime_type)
  },
  {
    key: "file_size",
    header: "File size",
    render: (media) => formatFileSize(media.file_size)
  },
  {
    key: "dimensions",
    header: "Dimensions",
    render: (media) => formatDimensions(media.width, media.height)
  },
  {
    key: "alt_en",
    header: "Alt text, English",
    render: (media) => formatValue(media.alt_en)
  },
  {
    key: "alt_ar",
    header: "Alt text, Arabic",
    render: (media) => <span dir="rtl">{formatValue(media.alt_ar)}</span>
  },
  {
    key: "storage_path",
    header: "Storage path",
    render: (media) => formatValue(media.storage_path)
  }
];

export default async function AdminMediaPage({ searchParams }: AdminMediaPageProps) {
  const resolvedSearchParams = await searchParams;
  const capability = getCmsModuleCapability("media");
  const allMedia = await mediaRepository.getAll();
  const query = normalize(resolvedSearchParams?.q);
  const selectedType = normalize(resolvedSearchParams?.type);
  const selectedProvider = normalize(resolvedSearchParams?.provider);
  const sort = resolvedSearchParams?.sort ?? "updated";
  const duplicateReasons = buildDuplicateReasons(allMedia);
  const duplicateOnly = resolvedSearchParams?.duplicates === "true";

  const media = sortMedia(
    allMedia.filter((item) => {
      const matchesQuery = includesSearch(item, query);
      const matchesType = !selectedType || normalize(item.type) === selectedType;
      const matchesProvider = !selectedProvider || normalize(item.storage_provider) === selectedProvider;
      const matchesDuplicate = !duplicateOnly || duplicateReasons.has(item.id);

      return matchesQuery && matchesType && matchesProvider && matchesDuplicate;
    }),
    sort,
  );

  const mediaTypes = Array.from(new Set(allMedia.map((item) => item.type))).sort();
  const storageProviders = Array.from(new Set(allMedia.map((item) => item.storage_provider))).sort();
  const totalSize = allMedia.reduce((sum, item) => sum + item.file_size, 0);

  return (
    <AdminShell
      title="Media Library"
      description={capability.messaging.listDescription}
    >
      <PageToolbar
        title="Media Library"
        capability={capability}
        description={capability.messaging.listDescription}
        search={<SearchBar label="Search media" placeholder="Search by alt text, checksum, URL, or storage path" defaultValue={resolvedSearchParams?.q ?? ""} queryParam="q" />}
      />

      {resolvedSearchParams?.upload === "success" ? (
        <p
          role="status"
          style={{
            background: "#eef7ef",
            border: "1px solid #9fc5a3",
            marginBottom: "20px",
            padding: "14px 16px",
          }}
        >
          Media uploaded successfully.
        </p>
      ) : null}

      {resolvedSearchParams?.upload === "error" ? (
        <p
          role="alert"
          style={{
            background: "#fff3f2",
            border: "1px solid #d9aaa5",
            marginBottom: "20px",
            padding: "14px 16px",
          }}
        >
          {resolvedSearchParams?.message ?? "Media upload failed."}
        </p>
      ) : null}

      <form
        action={uploadMediaAction}
        style={{
          alignItems: "end",
          background: "#ffffff",
          border: "1px solid #d8d8d8",
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          marginBottom: "20px",
          padding: "20px",
        }}
      >
        <label>
          File
          <input
            accept="image/*,video/*,audio/*,application/pdf"
            name="file"
            required
            style={{ display: "block", marginTop: "6px", width: "100%" }}
            type="file"
          />
        </label>

        <label>
          Alt text
          <input
            name="altText"
            placeholder="Describe the image or file"
            required
            style={{ display: "block", marginTop: "6px", width: "100%" }}
            type="text"
          />
        </label>

        <label>
          Visibility
          <select
            defaultValue="PRIVATE"
            name="visibility"
            style={{ display: "block", marginTop: "6px", width: "100%" }}
          >
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
            <option value="VIP">VIP</option>
            <option value="HIDDEN">Hidden</option>
          </select>
        </label>

        <button type="submit">Upload media</button>
      </form>

      <section
        aria-label="Media management summary"
        style={{
          background: "#ffffff",
          border: "1px solid #d8d8d8",
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: "20px",
          padding: "20px"
        }}
      >
        <div><strong>{allMedia.length}</strong><br />records</div>
        <div><strong>{formatFileSize(totalSize)}</strong><br />managed size</div>
        <div><strong>{duplicateReasons.size}</strong><br />duplicate candidates</div>
        <div><strong>Enabled</strong><br />R2 production uploads</div>
      </section>

      <form
        action="/admin/media"
        style={{
          alignItems: "end",
          background: "#ffffff",
          border: "1px solid #d8d8d8",
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: "20px",
          padding: "20px"
        }}
      >
        <label>
          Type
          <select name="type" defaultValue={selectedType} style={{ display: "block", marginTop: "6px", width: "100%" }}>
            <option value="">All types</option>
            {mediaTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Storage provider
          <select name="provider" defaultValue={selectedProvider} style={{ display: "block", marginTop: "6px", width: "100%" }}>
            <option value="">All providers</option>
            {storageProviders.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select name="sort" defaultValue={sort} style={{ display: "block", marginTop: "6px", width: "100%" }}>
            <option value="updated">Recently updated</option>
            <option value="oldest">Oldest created</option>
            <option value="largest">Largest file</option>
            <option value="smallest">Smallest file</option>
          </select>
        </label>
        <label>
          Review
          <select name="duplicates" defaultValue={duplicateOnly ? "true" : ""} style={{ display: "block", marginTop: "6px", width: "100%" }}>
            <option value="">All records</option>
            <option value="true">Duplicate candidates</option>
          </select>
        </label>
        <button type="submit">Apply media filters</button>
      </form>

      {resolvedSearchParams?.view === "table" ? (
        <DataTable
          caption="Media library"
          columns={mediaColumns}
          rows={media}
          getRowKey={(item) => item.id}
          emptyTitle="No media records match the current filters."
          emptyDescription="Adjust search, type, provider, sort, or duplicate review filters."
        />
      ) : (
        <MediaGrid media={media} duplicateReasons={duplicateReasons} />
      )}
    </AdminShell>
  );
}
