export const cmsModuleKeys = [
  "artists",
  "artworks",
  "collections",
  "exhibitions",
  "projects",
  "services",
  "news",
  "publications",
  "media",
  "certificates",
  "settings",
] as const;

export type CmsModuleKey = (typeof cmsModuleKeys)[number];

export const cmsOperationalStates = [
  "operational",
  "partial",
  "prepared_only",
  "read_only",
] as const;

export type CmsOperationalState = (typeof cmsOperationalStates)[number];

export interface CmsSearchCapability {
  readonly enabled: boolean;
  readonly urlBased: boolean;
  readonly queryParam: "q";
}

export interface CmsModuleCapabilitySet {
  readonly read: boolean;
  readonly create: boolean;
  readonly update: boolean;
  readonly archive: boolean;
  readonly bulk: boolean;
  readonly mediaLink: boolean;
  readonly relationshipManagement: boolean;
  readonly search: CmsSearchCapability;
}

export interface CmsModuleMessaging {
  readonly listDescription: string;
  readonly createDescription?: string;
  readonly editDescription?: string;
  readonly helperText?: string;
}

export interface CmsModuleCapabilityDefinition {
  readonly key: CmsModuleKey;
  readonly label: string;
  readonly state: CmsOperationalState;
  readonly capabilities: CmsModuleCapabilitySet;
  readonly messaging: CmsModuleMessaging;
}

export type CmsCapabilityFlag = Exclude<keyof CmsModuleCapabilitySet, "search">;
