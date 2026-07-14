export type EntityId = string;
export type ISODateTime = string;
export type Slug = string;

export interface EntityBase {
  readonly id: EntityId;
  readonly created_at?: ISODateTime;
  readonly updated_at?: ISODateTime;
}

export interface SluggedEntityBase extends EntityBase {
  readonly slug: Slug;
}

export interface OrderedEntity {
  readonly display_order?: number;
}

export interface FeaturedEntity {
  readonly featured?: boolean;
}

export interface AuditableEntity {
  readonly created_by?: EntityId;
  readonly updated_by?: EntityId;
}