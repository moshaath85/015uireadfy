import type { Tex7SchemaFieldDefinition } from "./schema-field";

export interface Tex7SchemaIndexDefinition {
  readonly name: string;
  readonly fields: readonly string[];
  readonly unique: boolean;
  readonly description?: string;
}

export interface Tex7SchemaEntityDefinition {
  readonly name: string;
  readonly sourceName?: string;
  readonly description?: string;
  readonly fields: readonly Tex7SchemaFieldDefinition[];
  readonly indexes?: readonly Tex7SchemaIndexDefinition[];
  readonly uniqueKeys?: readonly (readonly string[])[];
  readonly softDelete?: {
    readonly enabled: boolean;
    readonly deletedAtField?: string;
    readonly deletedByField?: string;
  };
  readonly audit?: {
    readonly enabled: boolean;
    readonly createdAtField?: string;
    readonly updatedAtField?: string;
    readonly createdByField?: string;
    readonly updatedByField?: string;
  };
}

export function tex7Entity(
  definition: Tex7SchemaEntityDefinition,
): Tex7SchemaEntityDefinition {
  return definition;
}