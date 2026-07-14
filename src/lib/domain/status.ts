export type VisibilityStatus = "public" | "private" | "vip" | "hidden";

export type AvailabilityStatus =
  | "available"
  | "reserved"
  | "sold"
  | "on_loan"
  | "not_for_sale";

export type PriceStatus =
  | "price_visible"
  | "price_upon_request"
  | "private_quote";

export type CertificateStatus =
  | "draft"
  | "issued"
  | "revoked"
  | "reissued";

export type RepresentationStatus =
  | "represented"
  | "collaborating"
  | "guest"
  | "archived";

export type ContentLifecycleStatus =
  | "draft"
  | "review"
  | "published"
  | "archived";

export type InquiryStatus =
  | "new"
  | "in_review"
  | "responded"
  | "closed";

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "cancelled"
  | "completed";