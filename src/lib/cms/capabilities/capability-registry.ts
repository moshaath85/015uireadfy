import {
  cmsModuleKeys,
  type CmsCapabilityFlag,
  type CmsModuleCapabilityDefinition,
  type CmsModuleKey,
  type CmsOperationalState,
} from "./capability-types";

type CmsCapabilityRegistry = Record<CmsModuleKey, CmsModuleCapabilityDefinition>;

const cmsCapabilityRegistry: CmsCapabilityRegistry = {
  artists: {
    key: "artists",
    label: "Artists",
    state: "operational",
    capabilities: {
      read: true,
      create: true,
      update: true,
      archive: true,
      bulk: true,
      mediaLink: true,
      relationshipManagement: false,
      search: {
        enabled: false,
        urlBased: false,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "Artist records are operational in PostgreSQL.",
      createDescription: "Create a new artist record for the active organization.",
      editDescription: "Update artist details and save changes to PostgreSQL.",
      helperText: "Changes are persisted when save succeeds.",
    },
  },
  artworks: {
    key: "artworks",
    label: "Artworks",
    state: "operational",
    capabilities: {
      read: true,
      create: true,
      update: true,
      archive: true,
      bulk: true,
      mediaLink: true,
      relationshipManagement: false,
      search: {
        enabled: false,
        urlBased: false,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "Artwork records are operational in PostgreSQL.",
      createDescription: "Create a new artwork record for the active organization.",
      editDescription: "Update artwork details and save changes to PostgreSQL.",
      helperText: "Changes are persisted when save succeeds.",
    },
  },
  collections: {
    key: "collections",
    label: "Collections",
    state: "operational",
    capabilities: {
      read: true,
      create: true,
      update: true,
      archive: true,
      bulk: true,
      mediaLink: true,
      relationshipManagement: false,
      search: {
        enabled: false,
        urlBased: false,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "Collection records are operational in PostgreSQL.",
      createDescription: "Create a new collection record for the active organization.",
      editDescription: "Update collection details and save changes to PostgreSQL.",
      helperText: "Changes are persisted when save succeeds.",
    },
  },
  exhibitions: {
    key: "exhibitions",
    label: "Exhibitions",
    state: "operational",
    capabilities: {
      read: true,
      create: true,
      update: true,
      archive: true,
      bulk: true,
      mediaLink: true,
      relationshipManagement: false,
      search: {
        enabled: false,
        urlBased: false,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "Exhibition records are operational in PostgreSQL.",
      createDescription: "Create a new exhibition record for the active organization.",
      editDescription: "Update exhibition details and save changes to PostgreSQL.",
      helperText: "Changes are persisted when save succeeds.",
    },
  },
  projects: {
    key: "projects",
    label: "Projects",
    state: "operational",
    capabilities: {
      read: true,
      create: true,
      update: true,
      archive: true,
      bulk: true,
      mediaLink: true,
      relationshipManagement: false,
      search: {
        enabled: false,
        urlBased: false,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "Project records are operational in PostgreSQL.",
      createDescription: "Create a new project record for the active organization.",
      editDescription: "Update project details and save changes to PostgreSQL.",
      helperText: "Changes are persisted when save succeeds.",
    },
  },
  services: {
    key: "services",
    label: "Services",
    state: "operational",
    capabilities: {
      read: true,
      create: true,
      update: true,
      archive: true,
      bulk: true,
      mediaLink: true,
      relationshipManagement: false,
      search: {
        enabled: false,
        urlBased: false,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "Service records are operational in PostgreSQL.",
      createDescription: "Create a new service record for the active organization.",
      editDescription: "Update service details and save changes to PostgreSQL.",
      helperText: "Changes are persisted when save succeeds.",
    },
  },
  news: {
    key: "news",
    label: "News",
    state: "operational",
    capabilities: {
      read: true,
      create: true,
      update: true,
      archive: true,
      bulk: true,
      mediaLink: true,
      relationshipManagement: false,
      search: {
        enabled: false,
        urlBased: false,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "News records are operational in PostgreSQL.",
      createDescription: "Create a new news record for the active organization.",
      editDescription: "Update news details and save changes to PostgreSQL.",
      helperText: "Changes are persisted when save succeeds.",
    },
  },
  publications: {
    key: "publications",
    label: "Publications",
    state: "operational",
    capabilities: {
      read: true,
      create: true,
      update: true,
      archive: true,
      bulk: true,
      mediaLink: true,
      relationshipManagement: false,
      search: {
        enabled: false,
        urlBased: false,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "Publication records are operational in PostgreSQL.",
      createDescription: "Create a new publication record for the active organization.",
      editDescription: "Update publication details and save changes to PostgreSQL.",
      helperText: "Changes are persisted when save succeeds.",
    },
  },
  media: {
    key: "media",
    label: "Media",
    state: "partial",
    capabilities: {
      read: true,
      create: true,
      update: false,
      archive: false,
      bulk: false,
      mediaLink: false,
      relationshipManagement: false,
      search: {
        enabled: true,
        urlBased: true,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "Media library operations are partially enabled in production mode.",
      createDescription: "Upload media assets and persist metadata to PostgreSQL.",
      helperText: "Upload and search are active. Replace/archive lifecycle controls remain limited.",
    },
  },
  certificates: {
    key: "certificates",
    label: "Certificates",
    state: "prepared_only",
    capabilities: {
      read: true,
      create: false,
      update: false,
      archive: false,
      bulk: false,
      mediaLink: false,
      relationshipManagement: false,
      search: {
        enabled: false,
        urlBased: false,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "Certificate records are visible. Create and update remain preparation-only.",
      createDescription: "Input can be validated, but creation does not persist in current mode.",
      editDescription: "Input can be validated, but updates do not persist in current mode.",
      helperText: "Use this screen for validation and workflow preparation only.",
    },
  },
  settings: {
    key: "settings",
    label: "Settings",
    state: "read_only",
    capabilities: {
      read: true,
      create: false,
      update: false,
      archive: false,
      bulk: false,
      mediaLink: false,
      relationshipManagement: false,
      search: {
        enabled: false,
        urlBased: false,
        queryParam: "q",
      },
    },
    messaging: {
      listDescription: "Gallery settings are currently view-only in the admin workspace.",
      helperText: "Editing is not available in this module yet.",
    },
  },
};

const orderedModuleKeys: readonly CmsModuleKey[] = cmsModuleKeys;

const operationalStateLabels: Record<CmsOperationalState, string> = {
  operational: "Operational",
  partial: "Partially Operational",
  prepared_only: "Prepared Only",
  read_only: "Read Only",
};

export function getCmsCapabilityRegistry(): CmsCapabilityRegistry {
  return cmsCapabilityRegistry;
}

export function listCmsModuleCapabilities(): readonly CmsModuleCapabilityDefinition[] {
  return orderedModuleKeys.map((key) => cmsCapabilityRegistry[key]);
}

export function getCmsModuleCapability(moduleKey: CmsModuleKey): CmsModuleCapabilityDefinition {
  return cmsCapabilityRegistry[moduleKey];
}

export function moduleSupportsCapability(moduleKey: CmsModuleKey, capability: CmsCapabilityFlag): boolean {
  return cmsCapabilityRegistry[moduleKey].capabilities[capability];
}

export function moduleHasSearch(moduleKey: CmsModuleKey): boolean {
  return cmsCapabilityRegistry[moduleKey].capabilities.search.enabled;
}

export function moduleUsesUrlBasedSearch(moduleKey: CmsModuleKey): boolean {
  const search = cmsCapabilityRegistry[moduleKey].capabilities.search;
  return search.enabled && search.urlBased;
}

export function getCmsOperationalStateLabel(state: CmsOperationalState): string {
  return operationalStateLabels[state];
}
