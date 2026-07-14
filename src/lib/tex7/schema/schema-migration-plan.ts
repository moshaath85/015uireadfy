export type Tex7SchemaMigrationStepKind =
  | "validate-source"
  | "prepare-target"
  | "import-independent"
  | "import-dependent"
  | "verify-relations"
  | "verify-counts"
  | "cutover-gate"
  | "rollback-gate";

export interface Tex7SchemaMigrationStep {
  readonly order: number;
  readonly kind: Tex7SchemaMigrationStepKind;
  readonly entity?: string;
  readonly dependsOn?: readonly string[];
  readonly executionEnabled: false;
  readonly description: string;
}

export interface Tex7SchemaMigrationPlan {
  readonly planId: string;
  readonly executionEnabled: false;
  readonly idempotencyRequired: true;
  readonly rollbackRequired: true;
  readonly steps: readonly Tex7SchemaMigrationStep[];
  readonly blockers: readonly string[];
}

export const TEX7_GALLERY015_SCHEMA_MIGRATION_PLAN: Tex7SchemaMigrationPlan = {
  planId: "tex7-gallery-015-schema-migration-plan-v1",
  executionEnabled: false,
  idempotencyRequired: true,
  rollbackRequired: true,
  steps: [
    { order: 1, kind: "validate-source", executionEnabled: false, description: "Validate JSON shape, stable ids, required fields, enum values, slugs, timestamps, and duplicate keys." },
    { order: 2, kind: "prepare-target", executionEnabled: false, description: "Prepare provider schema only after Prisma or SQL design is separately approved." },
    { order: 3, kind: "import-independent", entity: "Media", executionEnabled: false, description: "Import media first so content entities can resolve media references." },
    { order: 4, kind: "import-independent", entity: "Artist", dependsOn: ["Media"], executionEnabled: false, description: "Import artists after media profile references are validated." },
    { order: 5, kind: "import-independent", entity: "Settings", executionEnabled: false, description: "Import platform settings as key-value records after key uniqueness checks." },
    { order: 6, kind: "import-dependent", entity: "Artwork", dependsOn: ["Artist", "Media"], executionEnabled: false, description: "Import artworks after artist and primary image references are available." },
    { order: 7, kind: "import-independent", entity: "Collection", dependsOn: ["Artwork", "Media"], executionEnabled: false, description: "Import collections after artwork/media references are validated." },
    { order: 8, kind: "import-dependent", entity: "Exhibition", dependsOn: ["Artist", "Artwork", "Media"], executionEnabled: false, description: "Import exhibitions before exhibition junction entities." },
    { order: 9, kind: "import-dependent", entity: "Project", dependsOn: ["Artist", "Artwork", "Media"], executionEnabled: false, description: "Import projects before project junction entities." },
    { order: 10, kind: "import-dependent", entity: "ExhibitionArtist", dependsOn: ["Exhibition", "Artist"], executionEnabled: false, description: "Import unique exhibition-to-artist pairs." },
    { order: 11, kind: "import-dependent", entity: "ExhibitionArtwork", dependsOn: ["Exhibition", "Artwork"], executionEnabled: false, description: "Import unique exhibition-to-artwork pairs." },
    { order: 12, kind: "import-dependent", entity: "ProjectArtist", dependsOn: ["Project", "Artist"], executionEnabled: false, description: "Import unique project-to-artist pairs." },
    { order: 13, kind: "import-dependent", entity: "ProjectArtwork", dependsOn: ["Project", "Artwork"], executionEnabled: false, description: "Import unique project-to-artwork pairs." },
    { order: 14, kind: "import-independent", entity: "Service", executionEnabled: false, description: "Import service content after shared enum and slug checks." },
    { order: 15, kind: "import-independent", entity: "News", executionEnabled: false, description: "Import news content after publication date normalization." },
    { order: 16, kind: "import-independent", entity: "Publication", executionEnabled: false, description: "Import publication content after ISBN and slug checks." },
    { order: 17, kind: "import-independent", entity: "CertificateTemplate", executionEnabled: false, description: "Import certificate templates before certificates." },
    { order: 18, kind: "import-dependent", entity: "Certificate", dependsOn: ["CertificateTemplate"], executionEnabled: false, description: "Import certificates after template references are validated." },
    { order: 19, kind: "import-independent", entity: "Inquiry", executionEnabled: false, description: "Import inquiry records after privacy and retention policy approval." },
    { order: 20, kind: "import-independent", entity: "Appointment", executionEnabled: false, description: "Import appointments after scheduling timestamp normalization." },
    { order: 21, kind: "import-independent", entity: "NewsletterSubscriber", executionEnabled: false, description: "Import subscribers after email uniqueness and consent fields are validated." },
    { order: 22, kind: "import-independent", entity: "AIKnowledge", executionEnabled: false, description: "Import AI knowledge records after data classification approval." },
    { order: 23, kind: "import-independent", entity: "AILog", executionEnabled: false, description: "Import AI logs only after retention and privacy review." },
    { order: 24, kind: "import-independent", entity: "AuditLog", executionEnabled: false, description: "Import audit logs after actor/action normalization." },
    { order: 25, kind: "verify-relations", executionEnabled: false, description: "Verify all relation targets and junction uniqueness after import dry run." },
    { order: 26, kind: "verify-counts", executionEnabled: false, description: "Verify source and target record counts by entity." },
    { order: 27, kind: "cutover-gate", executionEnabled: false, description: "Require explicit approval before any runtime cutover or production writes." },
    { order: 28, kind: "rollback-gate", executionEnabled: false, description: "Require tested rollback path before enabling migration execution." },
  ],
  blockers: [
    "No Prisma or SQL schema has been approved.",
    "Authentication and authorization are not implemented for production writes.",
    "Media privacy and VIP visibility policy must be finalized.",
    "PII retention policy is required for inquiries, appointments, newsletter subscribers, AI logs, and audit logs.",
    "All relation references must be validated against existing target ids before import.",
  ],
};