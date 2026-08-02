import { type NextRequest, NextResponse } from "next/server";
import { getTex7PrismaClient } from "@/lib/tex7/database/providers/prisma-client";
import {
  normalizeWhitespace,
  hashIp,
  checkSubmissionTimestamp,
  checkPayloadSize,
  extractHoneypot,
  checkContent,
  generateReference,
  isDuplicateSubmission,
  hashMessage,
} from "@/lib/security/spam";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getEmailProvider } from "@/lib/email/provider";

const ALLOWED_FIELDS = [
  "name",
  "email",
  "phone",
  "company",
  "subject",
  "message",
  "language",
  "sourcePage",
  "consent",
  "gallery_website",
  "_startedAt",
] as const;

const ALLOWED_LANGUAGES = ["en", "ar"] as const;

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 40;
const MAX_COMPANY_LENGTH = 200;
const MAX_SUBJECT_LENGTH = 300;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_SOURCE_PAGE_LENGTH = 500;

interface ContactInput {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string;
  message: string;
  language: string;
  sourcePage: string | null;
  consent: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

function jsonResponse(body: Record<string, unknown>, status: number): NextResponse {
  return NextResponse.json(body, { status });
}

function successResponse(reference: string): NextResponse {
  return jsonResponse({ success: true, reference }, 201);
}

function errorResponse(code: string, status: number): NextResponse {
  return jsonResponse({ success: false, code }, status);
}

function normalize(input: ContactInput): ContactInput {
  return {
    name: normalizeWhitespace(input.name),
    email: normalizeWhitespace(input.email).toLowerCase(),
    phone: input.phone ? normalizeWhitespace(input.phone) : null,
    company: input.company ? normalizeWhitespace(input.company) : null,
    subject: normalizeWhitespace(input.subject),
    message: normalizeWhitespace(input.message),
    language: input.language,
    sourcePage: input.sourcePage ? normalizeWhitespace(input.sourcePage) : null,
    consent: input.consent,
  };
}

function validate(input: ContactInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (input.name.length > MAX_NAME_LENGTH) {
    errors.push({ field: "name", message: `Name must be ${MAX_NAME_LENGTH} characters or fewer` });
  } else if (input.name.length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters" });
  }

  if (!input.email || input.email.length === 0) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (input.email.length > MAX_EMAIL_LENGTH) {
    errors.push({ field: "email", message: "Email is too long" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push({ field: "email", message: "Email is invalid" });
  }

  if (input.phone && input.phone.length > MAX_PHONE_LENGTH) {
    errors.push({ field: "phone", message: `Phone must be ${MAX_PHONE_LENGTH} characters or fewer` });
  }

  if (input.company && input.company.length > MAX_COMPANY_LENGTH) {
    errors.push({ field: "company", message: `Company must be ${MAX_COMPANY_LENGTH} characters or fewer` });
  }

  if (!input.subject || input.subject.length === 0) {
    errors.push({ field: "subject", message: "Subject is required" });
  } else if (input.subject.length > MAX_SUBJECT_LENGTH) {
    errors.push({ field: "subject", message: `Subject must be ${MAX_SUBJECT_LENGTH} characters or fewer` });
  }

  if (!input.message || input.message.length === 0) {
    errors.push({ field: "message", message: "Message is required" });
  } else if (input.message.length < 10) {
    errors.push({ field: "message", message: "Message must be at least 10 characters" });
  } else if (input.message.length > MAX_MESSAGE_LENGTH) {
    errors.push({ field: "message", message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` });
  }

  if (!ALLOWED_LANGUAGES.includes(input.language as "en" | "ar")) {
    errors.push({ field: "language", message: "Invalid language" });
  }

  if (input.sourcePage && input.sourcePage.length > MAX_SOURCE_PAGE_LENGTH) {
    errors.push({ field: "sourcePage", message: "Source page is too long" });
  }

  if (!input.consent) {
    errors.push({ field: "consent", message: "Consent is required" });
  }

  const contentCheck = checkContent(input.message);
  if (!contentCheck.passed) {
    errors.push({ field: "message", message: "Message contains invalid content" });
  }

  const subjectCheck = checkContent(input.subject);
  if (!subjectCheck.passed) {
    errors.push({ field: "subject", message: "Subject contains invalid content" });
  }

  return errors;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "0.0.0.0";
}

function getClientUserAgent(request: NextRequest): string | null {
  return request.headers.get("user-agent") ?? null;
}

function formatNotificationEmail(input: ContactInput, reference: string): string {
  return [
    `New Inquiry — ${reference}`,
    "",
    `Reference: ${reference}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone ?? "—"}`,
    `Company: ${input.company ?? "—"}`,
    `Subject: ${input.subject}`,
    `Language: ${input.language}`,
    `Source Page: ${input.sourcePage ?? "—"}`,
    `Submitted: ${new Date().toISOString()}`,
    "",
    "Message:",
    input.message,
  ].join("\n");
}

function formatVisitorConfirmationEn(name: string, reference: string): { subject: string; text: string } {
  return {
    subject: "We received your inquiry — Gallery 015",
    text: [
      `Dear ${name},`,
      "",
      `Thank you for contacting Gallery 015. We have received your inquiry (${reference}) and our team will review it.`,
      "",
      "Gallery 015",
      "Riyadh · Saudi Arabia",
      "info@gallery015.com",
    ].join("\n"),
  };
}

function formatVisitorConfirmationAr(name: string, reference: string): { subject: string; text: string } {
  return {
    subject: "تم استلام استفسارك — غاليري 015",
    text: [
      `عزيزي ${name}،`,
      "",
      `شكراً لتواصلك مع غاليري 015. لقد استلمنا استفسارك (${reference}) وسيراجعه فريقنا.`,
      "",
      "غاليري 015",
      "الرياض · المملكة العربية السعودية",
      "info@gallery015.com",
    ].join("\n"),
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const bodyText = await request.clone().text();
    const sizeCheck = checkPayloadSize(bodyText);
    if (!sizeCheck.passed) {
      return errorResponse("VALIDATION_ERROR", 400);
    }
  } catch {
    return errorResponse("VALIDATION_ERROR", 400);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("VALIDATION_ERROR", 400);
  }

  const honeypot = extractHoneypot(formData);
  if (honeypot) {
    return jsonResponse({ success: true, reference: "G015-0000-000000" }, 201);
  }

  const startedAtRaw = formData.get("_startedAt");
  if (startedAtRaw) {
    const startedAt = parseInt(String(startedAtRaw), 10);
    if (!isNaN(startedAt)) {
      const timingCheck = checkSubmissionTimestamp(startedAt);
      if (!timingCheck.passed) {
        return jsonResponse({ success: true, reference: "G015-0000-000000" }, 201);
      }
    }
  }

  const raw: Record<string, string> = {};
  for (const field of ALLOWED_FIELDS) {
    const value = formData.get(field);
    if (value !== null && typeof value === "string") {
      raw[field] = value;
    }
  }

  const input = normalize({
    name: raw.name ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? null,
    company: raw.company ?? null,
    subject: raw.subject ?? "",
    message: raw.message ?? "",
    language: raw.language ?? "en",
    sourcePage: raw.sourcePage ?? null,
    consent: raw.consent === "true",
  });

  const errors = validate(input);
  if (errors.length > 0) {
    return jsonResponse({ success: false, code: "VALIDATION_ERROR", errors }, 400);
  }

  const clientIp = getClientIp(request);
  const userAgent = getClientUserAgent(request);
  const ipHash = hashIp(clientIp);

  const rateLimitResult = checkRateLimit(ipHash);
  if (!rateLimitResult.allowed) {
    const emailRateLimit = checkRateLimit(`email:${input.email}`, { maxRequests: 5, windowMs: 3600000, prefix: "contact-email" });
    if (!emailRateLimit.allowed || !rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", 429);
    }
  }

  const msgHash = hashMessage(input.message);
  if (isDuplicateSubmission(input.email, ipHash, msgHash)) {
    return jsonResponse({ success: true, reference: "G015-0000-000000" }, 201);
  }

  const reference = generateReference();

  try {
    const prisma = getTex7PrismaClient();
    await prisma.contactInquiry.create({
      data: {
        reference,
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        subject: input.subject,
        message: input.message,
        language: input.language,
        sourcePage: input.sourcePage,
        status: "new",
        consent: input.consent,
        ipHash,
        userAgent,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown database error";
    console.error("Contact inquiry persistence failed:", msg);
    return errorResponse("SUBMISSION_FAILED", 500);
  }

  const emailProvider = getEmailProvider();
  const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? notificationEmail;

  if (emailProvider && notificationEmail && fromEmail) {
    try {
      await emailProvider.send({
        to: notificationEmail,
        from: fromEmail,
        subject: `New Inquiry — ${reference} — ${input.name}`,
        text: formatNotificationEmail(input, reference),
      });

      const confirmation =
        input.language === "ar"
          ? formatVisitorConfirmationAr(input.name, reference)
          : formatVisitorConfirmationEn(input.name, reference);

      await emailProvider.send({
        to: input.email,
        from: fromEmail,
        subject: confirmation.subject,
        text: confirmation.text,
      });
    } catch (emailError) {
      const msg = emailError instanceof Error ? emailError.message : "Unknown email error";
      console.error("Contact email notification failed:", msg);

      try {
        const prisma = getTex7PrismaClient();
        await prisma.contactInquiry.update({
          where: { reference },
          data: { emailError: msg },
        });
      } catch {
        // non-critical
      }
    }
  }

  return successResponse(reference);
}
