export type Tex7SchemaRelationKind =
  | "one-to-one"
  | "one-to-many"
  | "many-to-one"
  | "many-to-many";

export interface Tex7SchemaRelationDefinition {
  readonly name: string;
  readonly kind: Tex7SchemaRelationKind;
  readonly sourceEntity: string;
  readonly targetEntity: string;
  readonly sourceField: string;
  readonly targetField: string;
  readonly junctionEntity?: string;
  readonly required: boolean;
  readonly cascadeDelete: false;
  readonly description?: string;
}

export interface Tex7SchemaRelationIntegrityRule {
  readonly relationName: string;
  readonly rule:
    | "target-exists"
    | "source-exists"
    | "junction-unique-pair"
    | "no-orphan-records";
  readonly severity: "blocker" | "warning";
}