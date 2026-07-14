export interface Tex7DatabaseVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly label?: string;
}

export interface Tex7DatabaseVersionMetadata {
  readonly foundationName: "TEX7 Database Foundation";
  readonly contractVersion: Tex7DatabaseVersion;
  readonly providerVersion?: Tex7DatabaseVersion;
  readonly schemaVersion?: Tex7DatabaseVersion;
  readonly productId?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export const TEX7_DATABASE_FOUNDATION_VERSION: Tex7DatabaseVersionMetadata = {
  foundationName: "TEX7 Database Foundation",
  contractVersion: {
    major: 1,
    minor: 0,
    patch: 0,
    label: "sprint-64-phase-1",
  },
};
