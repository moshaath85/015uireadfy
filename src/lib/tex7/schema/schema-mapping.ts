import { tex7Entity } from "./schema-entity";
import { tex7Field } from "./schema-field";
import type { Tex7SchemaEntityDefinition } from "./schema-entity";
import type { Tex7SchemaRelationDefinition } from "./schema-relation";
import type { Tex7SchemaMetadata } from "./schema-types";

const idField = tex7Field({
  name: "id",
  type: "id",
  required: true,
  nullable: false,
  unique: true,
  indexed: true,
  defaultValue: { kind: "none" },
});

const slugField = tex7Field({
  name: "slug",
  type: "string",
  required: false,
  nullable: true,
  unique: true,
  indexed: true,
});

const titleField = tex7Field({
  name: "title",
  type: "string",
  required: true,
  nullable: false,
});

const nameField = tex7Field({
  name: "name",
  type: "string",
  required: true,
  nullable: false,
});

const statusField = tex7Field({
  name: "status",
  type: "enum",
  required: false,
  nullable: true,
  indexed: true,
  enumOptions: [
    { value: "draft" },
    { value: "published" },
    { value: "archived" },
    { value: "active" },
    { value: "inactive" },
  ],
});

const sortOrderField = tex7Field({
  name: "sortOrder",
  type: "integer",
  required: false,
  nullable: true,
  indexed: true,
});

const createdAtField = tex7Field({
  name: "createdAt",
  type: "datetime",
  required: false,
  nullable: true,
  defaultValue: { kind: "now" },
});

const updatedAtField = tex7Field({
  name: "updatedAt",
  type: "datetime",
  required: false,
  nullable: true,
  defaultValue: { kind: "now" },
});

const jsonPayloadField = tex7Field({
  name: "payload",
  type: "json",
  required: false,
  nullable: true,
});

function contentEntity(
  name: string,
  sourceName: string,
  extraFields: Tex7SchemaEntityDefinition["fields"] = [],
): Tex7SchemaEntityDefinition {
  return tex7Entity({
    name,
    sourceName,
    fields: [
      idField,
      slugField,
      titleField,
      statusField,
      sortOrderField,
      ...extraFields,
      createdAtField,
      updatedAtField,
    ],
    indexes: [
      { name: `${name}.slug`, fields: ["slug"], unique: true },
      { name: `${name}.status`, fields: ["status"], unique: false },
    ],
    uniqueKeys: [["id"], ["slug"]],
    softDelete: { enabled: true, deletedAtField: "deletedAt" },
    audit: { enabled: true, createdAtField: "createdAt", updatedAtField: "updatedAt" },
  });
}

function junctionEntity(
  name: string,
  sourceName: string,
  leftField: string,
  rightField: string,
): Tex7SchemaEntityDefinition {
  return tex7Entity({
    name,
    sourceName,
    fields: [
      idField,
      tex7Field({ name: leftField, type: "id", required: true, nullable: false, indexed: true }),
      tex7Field({ name: rightField, type: "id", required: true, nullable: false, indexed: true }),
      sortOrderField,
      createdAtField,
      updatedAtField,
    ],
    indexes: [
      { name: `${name}.${leftField}`, fields: [leftField], unique: false },
      { name: `${name}.${rightField}`, fields: [rightField], unique: false },
      { name: `${name}.pair`, fields: [leftField, rightField], unique: true },
    ],
    uniqueKeys: [["id"], [leftField, rightField]],
    audit: { enabled: true, createdAtField: "createdAt", updatedAtField: "updatedAt" },
  });
}

export const TEX7_GALLERY015_SCHEMA_METADATA: Tex7SchemaMetadata = {
  schemaId: "tex7-gallery-015-schema-map-v1",
  productId: "gallery-015",
  target: "provider-neutral",
  executionEnabled: false,
  description: "Provider-neutral schema mapping for planning only. No import or write execution is enabled.",
};

export const TEX7_GALLERY015_SCHEMA_ENTITIES: readonly Tex7SchemaEntityDefinition[] = [
  tex7Entity({
    name: "Artist",
    sourceName: "artists",
    fields: [
      idField,
      slugField,
      nameField,
      statusField,
      tex7Field({ name: "bio", type: "text", required: false, nullable: true }),
      tex7Field({ name: "profileMediaId", type: "id", required: false, nullable: true, indexed: true }),
      sortOrderField,
      createdAtField,
      updatedAtField,
    ],
    indexes: [
      { name: "Artist.slug", fields: ["slug"], unique: true },
      { name: "Artist.profileMediaId", fields: ["profileMediaId"], unique: false },
    ],
    uniqueKeys: [["id"], ["slug"]],
    softDelete: { enabled: true, deletedAtField: "deletedAt" },
    audit: { enabled: true, createdAtField: "createdAt", updatedAtField: "updatedAt" },
  }),
  contentEntity("Artwork", "artworks", [
    tex7Field({ name: "artistId", type: "id", required: false, nullable: true, indexed: true }),
    tex7Field({ name: "primaryImageId", type: "id", required: false, nullable: true, indexed: true }),
    tex7Field({ name: "year", type: "string", required: false, nullable: true }),
    tex7Field({ name: "medium", type: "string", required: false, nullable: true }),
  ]),
  contentEntity("Collection", "collections"),
  contentEntity("Exhibition", "exhibitions", [
    tex7Field({ name: "startDate", type: "datetime", required: false, nullable: true, indexed: true }),
    tex7Field({ name: "endDate", type: "datetime", required: false, nullable: true, indexed: true }),
  ]),
  junctionEntity("ExhibitionArtist", "exhibition_artists", "exhibitionId", "artistId"),
  junctionEntity("ExhibitionArtwork", "exhibition_artworks", "exhibitionId", "artworkId"),
  contentEntity("Project", "projects"),
  junctionEntity("ProjectArtist", "project_artists", "projectId", "artistId"),
  junctionEntity("ProjectArtwork", "project_artworks", "projectId", "artworkId"),
  contentEntity("Service", "services"),
  contentEntity("News", "news", [
    tex7Field({ name: "publishedAt", type: "datetime", required: false, nullable: true, indexed: true }),
  ]),
  contentEntity("Publication", "publications", [
    tex7Field({ name: "publishedAt", type: "datetime", required: false, nullable: true, indexed: true }),
    tex7Field({ name: "isbn", type: "string", required: false, nullable: true, unique: true }),
  ]),
  tex7Entity({
    name: "Media",
    sourceName: "media",
    fields: [
      idField,
      tex7Field({ name: "url", type: "string", required: true, nullable: false }),
      tex7Field({ name: "alt", type: "string", required: false, nullable: true }),
      tex7Field({ name: "mimeType", type: "string", required: false, nullable: true, indexed: true }),
      tex7Field({
        name: "visibility",
        type: "enum",
        required: false,
        nullable: true,
        indexed: true,
        enumOptions: [{ value: "public" }, { value: "private" }, { value: "vip" }],
      }),
      createdAtField,
      updatedAtField,
    ],
    indexes: [
      { name: "Media.mimeType", fields: ["mimeType"], unique: false },
      { name: "Media.visibility", fields: ["visibility"], unique: false },
    ],
    uniqueKeys: [["id"]],
    audit: { enabled: true, createdAtField: "createdAt", updatedAtField: "updatedAt" },
  }),
  tex7Entity({
    name: "Settings",
    sourceName: "settings",
    fields: [
      idField,
      tex7Field({ name: "key", type: "string", required: true, nullable: false, unique: true }),
      jsonPayloadField,
      updatedAtField,
    ],
    uniqueKeys: [["id"], ["key"]],
  }),
  contentEntity("Certificate", "certificates", [
    tex7Field({ name: "certificateTemplateId", type: "id", required: false, nullable: true, indexed: true }),
  ]),
  contentEntity("CertificateTemplate", "certificate-templates"),
  contentEntity("Inquiry", "inquiries", [
    tex7Field({ name: "email", type: "string", required: true, nullable: false, indexed: true }),
  ]),
  contentEntity("Appointment", "appointments", [
    tex7Field({ name: "scheduledAt", type: "datetime", required: false, nullable: true, indexed: true }),
  ]),
  tex7Entity({
    name: "NewsletterSubscriber",
    sourceName: "newsletter-subscribers",
    fields: [
      idField,
      tex7Field({ name: "email", type: "string", required: true, nullable: false, unique: true, indexed: true }),
      statusField,
      createdAtField,
      updatedAtField,
    ],
    uniqueKeys: [["id"], ["email"]],
  }),
  contentEntity("AIKnowledge", "ai-knowledge"),
  tex7Entity({
    name: "AILog",
    sourceName: "ai-logs",
    fields: [
      idField,
      tex7Field({ name: "eventType", type: "string", required: true, nullable: false, indexed: true }),
      jsonPayloadField,
      createdAtField,
    ],
    uniqueKeys: [["id"]],
  }),
  tex7Entity({
    name: "AuditLog",
    sourceName: "audit_logs",
    fields: [
      idField,
      tex7Field({ name: "actorId", type: "string", required: false, nullable: true, indexed: true }),
      tex7Field({ name: "action", type: "string", required: true, nullable: false, indexed: true }),
      jsonPayloadField,
      createdAtField,
    ],
    uniqueKeys: [["id"]],
  }),
];

export const TEX7_GALLERY015_SCHEMA_RELATIONS: readonly Tex7SchemaRelationDefinition[] = [
  { name: "Artist.profileMedia", kind: "many-to-one", sourceEntity: "Artist", targetEntity: "Media", sourceField: "profileMediaId", targetField: "id", required: false, cascadeDelete: false },
  { name: "Artwork.artist", kind: "many-to-one", sourceEntity: "Artwork", targetEntity: "Artist", sourceField: "artistId", targetField: "id", required: false, cascadeDelete: false },
  { name: "Artwork.primaryImage", kind: "many-to-one", sourceEntity: "Artwork", targetEntity: "Media", sourceField: "primaryImageId", targetField: "id", required: false, cascadeDelete: false },
  { name: "Exhibition.artists", kind: "many-to-many", sourceEntity: "Exhibition", targetEntity: "Artist", sourceField: "id", targetField: "id", junctionEntity: "ExhibitionArtist", required: false, cascadeDelete: false },
  { name: "Exhibition.artworks", kind: "many-to-many", sourceEntity: "Exhibition", targetEntity: "Artwork", sourceField: "id", targetField: "id", junctionEntity: "ExhibitionArtwork", required: false, cascadeDelete: false },
  { name: "Project.artists", kind: "many-to-many", sourceEntity: "Project", targetEntity: "Artist", sourceField: "id", targetField: "id", junctionEntity: "ProjectArtist", required: false, cascadeDelete: false },
  { name: "Project.artworks", kind: "many-to-many", sourceEntity: "Project", targetEntity: "Artwork", sourceField: "id", targetField: "id", junctionEntity: "ProjectArtwork", required: false, cascadeDelete: false },
  { name: "Certificate.template", kind: "many-to-one", sourceEntity: "Certificate", targetEntity: "CertificateTemplate", sourceField: "certificateTemplateId", targetField: "id", required: false, cascadeDelete: false },
];