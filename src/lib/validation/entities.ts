import type { EntityBase, SluggedEntityBase } from "../domain";
import { collectIssue, compactIssues, isSlug, required, type ValidationIssue } from "./rules";

export interface EntityValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

export function validateEntityBase(entity: Partial<EntityBase>): EntityValidationResult {
  const issues = compactIssues([
    collectIssue("id", required(entity.id))
  ]);

  return {
    valid: issues.length === 0,
    issues
  };
}

export function validateSluggedEntityBase(entity: Partial<SluggedEntityBase>): EntityValidationResult {
  const issues = compactIssues([
    collectIssue("id", required(entity.id)),
    collectIssue("slug", required(entity.slug)),
    collectIssue("slug", isSlug(entity.slug))
  ]);

  return {
    valid: issues.length === 0,
    issues
  };
}

export function validateBilingualFields(
  entity: Record<string, unknown>,
  fields: readonly string[]
): EntityValidationResult {
  const issues = compactIssues(
    fields.map((field) => collectIssue(field, required(entity[field])))
  );

  return {
    valid: issues.length === 0,
    issues
  };
}

export function mergeEntityValidationResults(
  results: readonly EntityValidationResult[]
): EntityValidationResult {
  const issues = results.flatMap((result) => result.issues);

  return {
    valid: issues.length === 0,
    issues
  };
}