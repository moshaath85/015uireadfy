export interface Tex7SchemaVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly label?: string;
}

export interface Tex7SchemaVersionCompatibility {
  readonly current: Tex7SchemaVersion;
  readonly compatibleFrom: Tex7SchemaVersion;
  readonly breakingChanges: readonly string[];
  readonly migrationRequired: boolean;
}

export const TEX7_SCHEMA_MAPPING_VERSION: Tex7SchemaVersionCompatibility = {
  current: {
    major: 1,
    minor: 0,
    patch: 0,
    label: "sprint-66-phase-3",
  },
  compatibleFrom: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  breakingChanges: [],
  migrationRequired: false,
};