import { createHash } from "crypto";

export interface SpamCheckResult {
  readonly passed: boolean;
  readonly reason?: string;
}

const MIN_COMPLETION_MS = 3000;
const MAX_MESSAGE_LENGTH = 20000;

const HTML_PATTERN = /<[a-zA-Z/][^>]*>/;
const SCRIPT_PATTERN = /<script[\s>]/i;
const URL_PATTERN_COUNT_MAX = 3;

function getIpHashSecret(): string {
  return process.env.CONTACT_IP_HASH_SECRET ?? "g015-default-hash-secret";
}

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${ip}:${getIpHashSecret()}`)
    .digest("hex");
}

export function checkSubmissionTimestamp(
  startedAt: number
): SpamCheckResult {
  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_COMPLETION_MS) {
    return { passed: false, reason: "too fast" };
  }
  return { passed: true };
}

export function checkPayloadSize(body: string): SpamCheckResult {
  if (body.length > MAX_MESSAGE_LENGTH) {
    return { passed: false, reason: "payload too large" };
  }
  return { passed: true };
}

export function extractHoneypot(formData: FormData): string | undefined {
  const value = formData.get("gallery_website");
  return value ? String(value) : undefined;
}

export function checkContent(text: string): SpamCheckResult {
  if (HTML_PATTERN.test(text) || SCRIPT_PATTERN.test(text)) {
    return { passed: false, reason: "invalid content" };
  }

  const urlMatches = text.match(/https?:\/\//g);
  if (urlMatches && urlMatches.length > URL_PATTERN_COUNT_MAX) {
    return { passed: false, reason: "too many URLs" };
  }

  return { passed: true };
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function generateReference(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `G015-${year}-${random}`;
}

const recentReferences = new Set<string>();

export function isDuplicateSubmission(
  email: string,
  ipHash: string,
  messageHash: string
): boolean {
  const key = `${email}:${ipHash}:${messageHash}`;
  if (recentReferences.has(key)) {
    return true;
  }
  recentReferences.add(key);
  if (recentReferences.size > 1000) {
    recentReferences.clear();
  }
  return false;
}

export function hashMessage(message: string): string {
  return createHash("sha256").update(message.trim().toLowerCase()).digest("hex");
}
