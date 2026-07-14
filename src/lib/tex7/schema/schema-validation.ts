export type Tex7SchemaValidationSeverity = "blocker" | "warning" | "info";

export interface Tex7SchemaValidationRule {
  readonly id: string;
  readonly entity?: string;
  readonly field?: string;
  readonly severity: Tex7SchemaValidationSeverity;
  readonly description: string;
  readonly requiredBeforeImport: boolean;
}

export interface Tex7SchemaValidationPlan {
  readonly executionEnabled: false;
  readonly rules: readonly Tex7SchemaValidationRule[];
}

export const TEX7_SCHEMA_IMPORT_VALIDATION_PLAN: Tex7SchemaValidationPlan = {
  executionEnabled: false,
  rules: [
    {
      id: "required-primary-id",
      severity: "blocker",
      description: "Every record must have a stable unique id before import.",
      requiredBeforeImport: true,
    },
    {
      id: "relation-targets-exist",
      severity: "blocker",
      description: "Every relation reference must resolve to an existing target record.",
      requiredBeforeImport: true,
    },
    {
      id: "slug-uniqueness",
      field: "slug",
      severity: "blocker",
      description: "Slug values must be unique within each routable entity.",
      requiredBeforeImport: true,
    },
    {
      id: "enum-normalization",
      severity: "warning",
      description: "Status, visibility, role, category, and type values must match approved enum values.",
      requiredBeforeImport: true,
    },
    {
      id: "timestamp-normalization",
      severity: "warning",
      description: "Date and datetime values must be normalized before provider import.",
      requiredBeforeImport: true,
    },
  ],
};