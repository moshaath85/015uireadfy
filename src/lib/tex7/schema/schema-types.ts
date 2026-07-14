export type Tex7SchemaScalarType =
  | "string"
  | "text"
  | "integer"
  | "decimal"
  | "boolean"
  | "datetime"
  | "json"
  | "enum"
  | "id";

export type Tex7SchemaDefaultKind =
  | "none"
  | "generated-id"
  | "now"
  | "literal"
  | "computed";

export interface Tex7SchemaDefaultValue {
  readonly kind: Tex7SchemaDefaultKind;
  readonly value?: string | number | boolean | null;
  readonly expression?: string;
}

export type Tex7SchemaProviderTarget =
  | "json"
  | "postgresql"
  | "sqlite"
  | "enterprise"
  | "provider-neutral";

export interface Tex7SchemaMetadata {
  readonly schemaId: string;
  readonly productId: string;
  readonly target: Tex7SchemaProviderTarget;
  readonly executionEnabled: false;
  readonly description?: string;
}