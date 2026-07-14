import type {
  Tex7LocalizedEntityIdentity,
  Tex7TranslationIdentity,
} from "./localization-types";

export interface Tex7LocalizedSlugIdentity extends Tex7TranslationIdentity {
  slug: string;
}

export interface Tex7LocalizedSlugUniquenessScope {
  entityType: string;
  localeCode: string;
}

export interface Tex7LocalizedSlugUniquenessRule {
  scope: Tex7LocalizedSlugUniquenessScope;
  uniqueWithinLocaleAndEntityType: true;
  allowDuplicateSlugAcrossLocales: boolean;
  allowDuplicateSlugAcrossEntityTypes: boolean;
}

export interface Tex7LocalizedRouteDescriptor {
  localeCode: string;
  entityType: string;
  entityId: string;
  slug: string;
  path: string;
}

export interface Tex7EquivalentPageResolutionRequest {
  source: Tex7LocalizedRouteDescriptor;
  targetLocaleCode: string;
}

export interface Tex7LanguageSwitchTargetRequest {
  entity: Tex7LocalizedEntityIdentity;
  fromLocaleCode: string;
  toLocaleCode: string;
}

export type Tex7RouteResolutionStatus =
  | "resolved"
  | "missing_translation"
  | "missing_slug"
  | "unpublished"
  | "unavailable";

export interface Tex7EquivalentPageResolutionResult {
  status: Tex7RouteResolutionStatus;
  source: Tex7LocalizedRouteDescriptor;
  target?: Tex7LocalizedRouteDescriptor;
  targetLocaleCode: string;
  reason?: string;
}

export interface Tex7LanguageSwitchTarget {
  status: Tex7RouteResolutionStatus;
  entity: Tex7LocalizedEntityIdentity;
  fromLocaleCode: string;
  toLocaleCode: string;
  target?: Tex7LocalizedRouteDescriptor;
  reason?: string;
}

export interface Tex7LocalizedSlugRegistry {
  assertUniqueSlug(slug: Tex7LocalizedSlugIdentity): Promise<boolean>;
  resolveBySlug(
    scope: Tex7LocalizedSlugUniquenessScope,
    slug: string,
  ): Promise<Tex7LocalizedRouteDescriptor | undefined>;
  resolveEquivalentPage(
    request: Tex7EquivalentPageResolutionRequest,
  ): Promise<Tex7EquivalentPageResolutionResult>;
  resolveLanguageSwitchTarget(
    request: Tex7LanguageSwitchTargetRequest,
  ): Promise<Tex7LanguageSwitchTarget>;
}

export const TEX7_LOCALIZED_SLUG_UNIQUENESS_POLICY = {
  uniqueWithinLocaleAndEntityType: true,
  allowDuplicateSlugAcrossLocales: true,
  allowDuplicateSlugAcrossEntityTypes: true,
} as const;

export function createTex7LocalizedSlugKey(
  scope: Tex7LocalizedSlugUniquenessScope,
  slug: string,
): string {
  return `${scope.entityType}:${scope.localeCode}:${slug}`;
}

export function isTex7ResolvedRoute(
  result: Tex7EquivalentPageResolutionResult | Tex7LanguageSwitchTarget,
): boolean {
  return result.status === "resolved" && Boolean(result.target);
}