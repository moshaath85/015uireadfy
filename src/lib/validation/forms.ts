import {
  collectIssue,
  compactIssues,
  isEmail,
  maxLength,
  minLength,
  required,
  type ValidationIssue
} from "./rules";

export interface ContactFormInput {
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly message?: string;
}

export interface AppointmentFormInput extends ContactFormInput {
  readonly preferred_date?: string;
  readonly preferred_time?: string;
  readonly appointment_type?: string;
}

export interface FormValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

export function validateContactForm(input: ContactFormInput): FormValidationResult {
  const issues = compactIssues([
    collectIssue("name", required(input.name)),
    collectIssue("name", minLength(input.name, 2)),
    collectIssue("name", maxLength(input.name, 120)),
    collectIssue("email", required(input.email)),
    collectIssue("email", isEmail(input.email)),
    collectIssue("phone", maxLength(input.phone, 40)),
    collectIssue("message", required(input.message)),
    collectIssue("message", minLength(input.message, 10)),
    collectIssue("message", maxLength(input.message, 2000))
  ]);

  return {
    valid: issues.length === 0,
    issues
  };
}

export function validateAppointmentForm(input: AppointmentFormInput): FormValidationResult {
  const baseResult = validateContactForm(input);
  const appointmentIssues = compactIssues([
    collectIssue("preferred_date", required(input.preferred_date)),
    collectIssue("preferred_time", required(input.preferred_time)),
    collectIssue("appointment_type", required(input.appointment_type))
  ]);
  const issues = [...baseResult.issues, ...appointmentIssues];

  return {
    valid: issues.length === 0,
    issues
  };
}