export type JsonEntityName =
  | "artists"
  | "artworks"
  | "collections"
  | "exhibitions"
  | "projects"
  | "services"
  | "certificates"
  | "news"
  | "publications"
  | "media"
  | "settings";

export type JsonFileWriteMode = "read_only" | "development_write_disabled";

export interface JsonFileTarget {
  entity: JsonEntityName;
  fileName: `${JsonEntityName}.json`;
  relativePath: `data/${JsonEntityName}.json`;
  writeMode: JsonFileWriteMode;
  description: string;
}

export interface JsonWriteTarget<TRecord = Record<string, unknown>> {
  file: JsonFileTarget;
  idField: keyof TRecord & string;
  slugField?: keyof TRecord & string;
}

export const jsonFileTargets: Record<JsonEntityName, JsonFileTarget> = {
  artists: {
    entity: "artists",
    fileName: "artists.json",
    relativePath: "data/artists.json",
    writeMode: "development_write_disabled",
    description: "Artist records prepared for future development-only create, edit, and delete proof.",
  },
  artworks: {
    entity: "artworks",
    fileName: "artworks.json",
    relativePath: "data/artworks.json",
    writeMode: "read_only",
    description: "Artwork records remain read-only until a future write patch explicitly enables them.",
  },
  collections: {
    entity: "collections",
    fileName: "collections.json",
    relativePath: "data/collections.json",
    writeMode: "read_only",
    description: "Collection records remain read-only until a future write patch explicitly enables them.",
  },
  exhibitions: {
    entity: "exhibitions",
    fileName: "exhibitions.json",
    relativePath: "data/exhibitions.json",
    writeMode: "read_only",
    description: "Exhibition records remain read-only until a future write patch explicitly enables them.",
  },
  projects: {
    entity: "projects",
    fileName: "projects.json",
    relativePath: "data/projects.json",
    writeMode: "read_only",
    description: "Project records remain read-only until a future write patch explicitly enables them.",
  },
  services: {
    entity: "services",
    fileName: "services.json",
    relativePath: "data/services.json",
    writeMode: "read_only",
    description: "Service records remain read-only until a future write patch explicitly enables them.",
  },
  certificates: {
    entity: "certificates",
    fileName: "certificates.json",
    relativePath: "data/certificates.json",
    writeMode: "read_only",
    description: "Certificate records remain read-only until a future write patch explicitly enables them.",
  },
  news: {
    entity: "news",
    fileName: "news.json",
    relativePath: "data/news.json",
    writeMode: "read_only",
    description: "News records remain read-only until a future write patch explicitly enables them.",
  },
  publications: {
    entity: "publications",
    fileName: "publications.json",
    relativePath: "data/publications.json",
    writeMode: "read_only",
    description: "Publication records remain read-only until a future write patch explicitly enables them.",
  },
  media: {
    entity: "media",
    fileName: "media.json",
    relativePath: "data/media.json",
    writeMode: "read_only",
    description: "Media records remain read-only until a future write patch explicitly enables them.",
  },
  settings: {
    entity: "settings",
    fileName: "settings.json",
    relativePath: "data/settings.json",
    writeMode: "read_only",
    description: "Settings records remain read-only until a future write patch explicitly enables them.",
  },
};

export const artistsJsonWriteTarget: JsonWriteTarget = {
  file: jsonFileTargets.artists,
  idField: "id",
  slugField: "slug",
};