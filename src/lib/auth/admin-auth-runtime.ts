import type { AdminRole, AdminUser } from "./auth-types";

export const ADMIN_SESSION_COOKIE = "gallery015_admin_session";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;
export const ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
export const ADMIN_LOGIN_RATE_LIMIT_MAX_FAILURES = 5;

export interface AdminSessionPayload {
  readonly user: AdminUser & {
    readonly organizationId: string;
  };
  readonly issuedAt: string;
  readonly expiresAt: string;
}

export interface AdminCredentials {
  readonly email: string;
  readonly password: string;
}

export interface AdminLoginAttemptContext {
  readonly identifier?: string;
}

export interface AdminAuthConfig {
  readonly email: string;
  readonly password: string;
  readonly sessionSecret: string;
  readonly organizationId: string;
  readonly role: AdminRole;
  readonly name?: string;
}

export interface SessionCookieOptions {
  readonly name: string;
  readonly value: string;
  readonly httpOnly: true;
  readonly sameSite: "lax";
  readonly secure: boolean;
  readonly path: string;
  readonly maxAge: number;
}

export interface ClearedSessionCookieOptions {
  readonly name: string;
  readonly value: "";
  readonly httpOnly: true;
  readonly sameSite: "lax";
  readonly secure: boolean;
  readonly path: string;
  readonly maxAge: 0;
}

export type AdminSecurityEventType =
  | "login_success"
  | "login_failure"
  | "login_rate_limited"
  | "logout"
  | "admin_action_authorized"
  | "admin_action_rejected"
  | "repository_write_rejected";

export interface AdminSecurityEvent {
  readonly type: AdminSecurityEventType;
  readonly outcome: "success" | "failure";
  readonly email?: string;
  readonly identifier?: string;
  readonly role?: AdminRole;
  readonly organizationId?: string;
  readonly operation?: string;
  readonly reason?: string;
}

interface LoginRateLimitBucket {
  failures: number;
  windowStartedAt: number;
  blockedUntil?: number;
}

const encoder = new TextEncoder();

const ALLOWED_ADMIN_ROLES: readonly AdminRole[] = ["owner", "director", "editor", "viewer"];
const ADMIN_ROLE_RANK: Readonly<Record<AdminRole, number>> = {
  viewer: 1,
  editor: 2,
  director: 3,
  owner: 4,
};

const loginRateLimitBuckets = new Map<string, LoginRateLimitBucket>();

function toBase64Url(value: ArrayBuffer | Uint8Array | string): string {
  const bytes =
    typeof value === "string"
      ? encoder.encode(value)
      : value instanceof Uint8Array
        ? value
        : new Uint8Array(value);

  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function timingSafeEqual(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let result = leftBytes.length === rightBytes.length ? 0 : 1;

  for (let index = 0; index < length; index += 1) {
    result |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return result === 0;
}

async function createSignature(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return toBase64Url(signature);
}

function normalizeRole(value: string | undefined): AdminRole {
  const normalizedValue = value?.trim().toLowerCase();

  if (ALLOWED_ADMIN_ROLES.includes(normalizedValue as AdminRole)) {
    return normalizedValue as AdminRole;
  }

  return "owner";
}

function normalizeRateLimitKey(credentials: AdminCredentials, context?: AdminLoginAttemptContext): string {
  const identifier = context?.identifier?.trim().toLowerCase();
  const email = credentials.email.trim().toLowerCase();

  return `${identifier || "unknown"}:${email || "unknown"}`;
}

function getActiveRateLimitBucket(key: string, now: number): LoginRateLimitBucket {
  const existing = loginRateLimitBuckets.get(key);
  const windowMs = ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS * 1000;

  if (existing && now - existing.windowStartedAt < windowMs) {
    return existing;
  }

  const bucket: LoginRateLimitBucket = {
    failures: 0,
    windowStartedAt: now,
  };

  loginRateLimitBuckets.set(key, bucket);

  return bucket;
}

function isRateLimited(key: string, now: number): boolean {
  const bucket = getActiveRateLimitBucket(key, now);

  return Boolean(bucket.blockedUntil && bucket.blockedUntil > now);
}

function recordLoginFailure(key: string, now: number): void {
  const bucket = getActiveRateLimitBucket(key, now);
  bucket.failures += 1;

  if (bucket.failures >= ADMIN_LOGIN_RATE_LIMIT_MAX_FAILURES) {
    bucket.blockedUntil = now + ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS * 1000;
  }

  loginRateLimitBuckets.set(key, bucket);
}

function clearLoginFailures(key: string): void {
  loginRateLimitBuckets.delete(key);
}

export function getAdminRoleRank(role: AdminRole): number {
  return ADMIN_ROLE_RANK[role];
}

export function recordAdminSecurityEvent(event: AdminSecurityEvent): void {
  const entry = {
    timestamp: new Date().toISOString(),
    system: "gallery015_admin_auth",
    ...event,
  };

  console.info("[Gallery015SecurityEvent]", JSON.stringify(entry));
}

export function getAdminAuthConfig(): AdminAuthConfig | null {
  const email = process.env.GALLERY015_ADMIN_EMAIL?.trim();
  const password = process.env.GALLERY015_ADMIN_PASSWORD?.trim();
  const sessionSecret = process.env.GALLERY015_ADMIN_SESSION_SECRET?.trim();
  const organizationId = process.env.GALLERY015_ADMIN_ORGANIZATION_ID?.trim();
  const name = process.env.GALLERY015_ADMIN_NAME?.trim();

  if (!email || !password || !sessionSecret || !organizationId) {
    return null;
  }

  return {
    email,
    password,
    sessionSecret,
    organizationId,
    role: normalizeRole(process.env.GALLERY015_ADMIN_ROLE),
    name: name || undefined,
  };
}

export function isAdminAuthConfigured(): boolean {
  return getAdminAuthConfig() !== null;
}

export function isSecureCookieRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function createExpiredAdminSessionCookie(): ClearedSessionCookieOptions {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookieRuntime(),
    path: "/",
    maxAge: 0,
  };
}

export async function verifyAdminCredentials(
  credentials: AdminCredentials,
  context?: AdminLoginAttemptContext,
): Promise<AdminSessionPayload | null> {
  const config = getAdminAuthConfig();
  const rateLimitKey = normalizeRateLimitKey(credentials, context);
  const now = Date.now();

  if (isRateLimited(rateLimitKey, now)) {
    recordAdminSecurityEvent({
      type: "login_rate_limited",
      outcome: "failure",
      email: credentials.email.trim().toLowerCase(),
      identifier: context?.identifier,
      reason: "too_many_failed_attempts",
    });

    return null;
  }

  if (!config) {
    recordLoginFailure(rateLimitKey, now);
    recordAdminSecurityEvent({
      type: "login_failure",
      outcome: "failure",
      email: credentials.email.trim().toLowerCase(),
      identifier: context?.identifier,
      reason: "auth_not_configured",
    });

    return null;
  }

  const emailMatches = timingSafeEqual(
    credentials.email.trim().toLowerCase(),
    config.email.trim().toLowerCase(),
  );
  const passwordMatches = timingSafeEqual(credentials.password, config.password);

  if (!emailMatches || !passwordMatches) {
    recordLoginFailure(rateLimitKey, now);
    recordAdminSecurityEvent({
      type: "login_failure",
      outcome: "failure",
      email: credentials.email.trim().toLowerCase(),
      identifier: context?.identifier,
      reason: "invalid_credentials",
    });

    return null;
  }

  clearLoginFailures(rateLimitKey);

  const issuedAtDate = new Date();
  const expiresAtDate = new Date(issuedAtDate.getTime() + ADMIN_SESSION_TTL_SECONDS * 1000);
  const session = {
    user: {
      id: `${config.organizationId}:${config.email.toLowerCase()}`,
      email: config.email,
      name: config.name,
      role: config.role,
      active: true,
      organizationId: config.organizationId,
    },
    issuedAt: issuedAtDate.toISOString(),
    expiresAt: expiresAtDate.toISOString(),
  };

  recordAdminSecurityEvent({
    type: "login_success",
    outcome: "success",
    email: session.user.email,
    identifier: context?.identifier,
    role: session.user.role,
    organizationId: session.user.organizationId,
  });

  return session;
}

export async function createAdminSessionToken(payload: AdminSessionPayload): Promise<string> {
  const config = getAdminAuthConfig();

  if (!config) {
    throw new Error("Admin authentication is not configured.");
  }

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await createSignature(encodedPayload, config.sessionSecret);

  return `${encodedPayload}.${signature}`;
}

export async function createAdminSessionCookie(
  payload: AdminSessionPayload,
): Promise<SessionCookieOptions> {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: await createAdminSessionToken(payload),
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookieRuntime(),
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  };
}

export async function readAdminSessionToken(token: string | undefined): Promise<AdminSessionPayload | null> {
  if (!token) {
    return null;
  }

  const config = getAdminAuthConfig();

  if (!config) {
    return null;
  }

  const [encodedPayload, signature, ...extra] = token.split(".");

  if (!encodedPayload || !signature || extra.length > 0) {
    return null;
  }

  const expectedSignature = await createSignature(encodedPayload, config.sessionSecret);

  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AdminSessionPayload;
    const expiresAt = Date.parse(payload.expiresAt);

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return null;
    }

    if (!payload.user.active || payload.user.organizationId !== config.organizationId) {
      return null;
    }

    if (!ALLOWED_ADMIN_ROLES.includes(payload.user.role)) {
      return null;
    }

    if (getAdminRoleRank(payload.user.role) < getAdminRoleRank("viewer")) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function canAccessAdminPath(token: string | undefined): Promise<boolean> {
  const session = await readAdminSessionToken(token);

  return session !== null && getAdminRoleRank(session.user.role) >= getAdminRoleRank("viewer");
}