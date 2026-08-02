import Link from "next/link";

export type FormFeedbackStatus = "success" | "error" | "warning" | "validation";

export interface FormActionsProps {
  readonly cancelHref: string;
  readonly cancelLabel: string;
  readonly submitLabel: string;
  readonly submitDisabled?: boolean;
  readonly helperText?: string;
  readonly feedbackStatus?: FormFeedbackStatus;
  readonly feedbackMessage?: string;
  readonly feedbackDetails?: readonly string[];
}

function feedbackStyles(status: FormFeedbackStatus): { readonly background: string; readonly border: string; readonly color: string } {
  if (status === "success") {
    return {
      background: "#eef7ef",
      border: "1px solid #9fc5a3",
      color: "#1f4a25",
    };
  }

  if (status === "error") {
    return {
      background: "#fff3f2",
      border: "1px solid #d9aaa5",
      color: "#6f1f14",
    };
  }

  if (status === "warning") {
    return {
      background: "#fff8e1",
      border: "1px solid #dfc17d",
      color: "#5f4300",
    };
  }

  return {
    background: "#f6f2ff",
    border: "1px solid #c7b8e8",
    color: "#332057",
  };
}

export function FormActions({
  cancelHref,
  cancelLabel,
  submitLabel,
  submitDisabled = true,
  helperText,
  feedbackStatus,
  feedbackMessage,
  feedbackDetails,
}: FormActionsProps) {
  const shouldRenderFeedback = Boolean(feedbackStatus && (feedbackMessage || (feedbackDetails && feedbackDetails.length > 0)));
  const feedbackRole = feedbackStatus === "error" || feedbackStatus === "validation" ? "alert" : "status";
  const styles = feedbackStatus ? feedbackStyles(feedbackStatus) : undefined;

  return (
    <div className="admin-form-actions">
      {shouldRenderFeedback && feedbackStatus && styles ? (
        <div
          aria-live="polite"
          role={feedbackRole}
          style={{
            background: styles.background,
            border: styles.border,
            color: styles.color,
            marginBottom: "12px",
            padding: "10px 12px",
          }}
        >
          {feedbackMessage ? <p style={{ margin: 0 }}>{feedbackMessage}</p> : null}
          {feedbackDetails && feedbackDetails.length > 0 ? (
            <ul style={{ margin: "8px 0 0", paddingLeft: "18px" }}>
              {feedbackDetails.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
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
