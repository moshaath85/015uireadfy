import Link from "next/link";

export interface FormActionsProps {
  readonly cancelHref: string;
  readonly cancelLabel: string;
  readonly submitLabel: string;
  readonly submitDisabled?: boolean;
  readonly helperText?: string;
}

export function FormActions({
  cancelHref,
  cancelLabel,
  submitLabel,
  submitDisabled = true,
  helperText,
}: FormActionsProps) {
  return (
    <div className="admin-form-actions">
      {helperText ? <p className="admin-form-actions__helper">{helperText}</p> : null}
      <div className="admin-form-actions__controls">
        <Link className="admin-button admin-button--secondary" href={cancelHref}>
          {cancelLabel}
        </Link>
        <button className="admin-button admin-button--primary" type="submit" disabled={submitDisabled}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}