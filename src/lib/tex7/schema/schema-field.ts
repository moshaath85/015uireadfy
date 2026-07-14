import type { Tex7SchemaDefaultValue, Tex7SchemaScalarType } from "./schema-types";

export interface Tex7SchemaEnumOption {
  readonly value: string;
  readonly label?: string;
}

export interface Tex7SchemaFieldConstraint {
  readonly required?: boolean;
  readonly unique?: boolean;
  readonly nullable?: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
}

export interface Tex7SchemaFieldDefinition {
  readonly name: string;
  readonly type: Tex7SchemaScalarType;
  readonly label?: string;
  readonly description?: string;
  readonly sourcePath?: string;
  readonly required: boolean;
  readonly nullable: boolean;
  readonly unique?: boolean;
  readonly indexed?: boolean;
  readonly defaultValue?: Tex7SchemaDefaultValue;
  readonly enumOptions?: readonly Tex7SchemaEnumOption[];
  readonly constraints?: Tex7SchemaFieldConstraint;
}

export function tex7Field(
  definition: Tex7SchemaFieldDefinition,
): Tex7SchemaFieldDefinition {
  return definition;
}