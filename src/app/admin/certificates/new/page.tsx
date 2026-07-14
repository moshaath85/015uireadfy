import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { FormActions } from "@/components/admin/FormActions";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { prepareCreateCertificateAction } from "@/lib/cms/certificates/certificates-actions";
import { artworksRepository } from "@/lib/repositories/artworks";
import { CertificateStatus } from "@/types";

interface NewCertificatePageProps {
  readonly searchParams?: {
    readonly status?: string;
    readonly message?: string;
  };
}

const certificateStatusOptions = Object.values(CertificateStatus).map((value) => ({
  value,
  label: value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" "),
}));

function createGeneratedCertificateValues() {
  const now = new Date();
  const timestamp = now.toISOString();
  const token = `cert-${now.getTime().toString(36)}`;
  const certificateNumber = `G015-${now.getUTCFullYear()}-${now.getTime().toString().slice(-6)}`;
  const verificationUrl = `/verify/${token}`;

  return {
    certificateNumber,
    issuedAt: timestamp,
    issuedVersion: "1",
    lastUpdated: timestamp,
    qrCode: verificationUrl,
    templateId: "certificate-default",
    verificationUrl,
  };
}

async function createCertificateAction(formData: FormData) {
  "use server";

  await requireAdminServerAction("certificates.create");

  const result = prepareCreateCertificateAction(formData, {
    mutationEnabled: false,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/certificates/new?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(
    `/admin/certificates/new?status=success&message=${encodeURIComponent(
      result.message || "Certificate was prepared.",
    )}`,
  );
}

async function CertificateFields() {
  const artworks = await artworksRepository.getAll();
  const defaultDate = new Date().toISOString().slice(0, 10);
  const generated = createGeneratedCertificateValues();

  return (
    <>
      <input name="certificate_number" type="hidden" value={generated.certificateNumber} />
      <input name="template_id" type="hidden" value={generated.templateId} />
      <input name="qr_code" type="hidden" value={generated.qrCode} />
      <input name="verification_url" type="hidden" value={generated.verificationUrl} />
      <input name="issued_by" type="hidden" value="Gallery 015" />
      <input name="issued_version" type="hidden" value={generated.issuedVersion} />
      <input name="issued_at" type="hidden" value={generated.issuedAt} />
      <input name="last_updated" type="hidden" value={generated.lastUpdated} />

      <section className="admin-form-section" aria-labelledby="certificate-section-main">
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title" id="certificate-section-main">Certificate Details</h3>
          <p className="admin-form-section__description">
            Choose the artwork and approval information. Certificate number, verification link, QR value, version, and timestamps are generated automatically.
          </p>
        </div>
        <div className="admin-form-section__fields">
          <label className="admin-form-field">
            <span className="admin-form-field__label">Artwork *</span>
            <select className="admin-form-field__control admin-form-field__control--select" name="artwork_id" required>
              <option value="">Select artwork</option>
              {artworks.map((artwork) => (
                <option key={artwork.id} value={artwork.id}>
                  {artwork.title_en} ({artwork.year})
                </option>
              ))}
            </select>
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Certificate Status *</span>
            <select className="admin-form-field__control admin-form-field__control--select" name="status" required defaultValue={CertificateStatus.Draft}>
              {certificateStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Issued Date *</span>
            <input className="admin-form-field__control" name="issued_date" required type="date" defaultValue={defaultDate} />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Approved By *</span>
            <input className="admin-form-field__control" name="approved_by" required />
          </label>
          <label className="admin-form-field">
            <span className="admin-form-field__label">Optional Note</span>
            <textarea className="admin-form-field__control admin-form-field__control--textarea" name="note" rows={4} />
          </label>
        </div>
      </section>

      <details className="admin-form-section">
        <summary className="admin-form-section__title" style={{ cursor: "pointer" }}>
          Generated values
        </summary>
        <p className="admin-form-section__description">
          These values will be prepared by the system and are not editable during normal certificate creation.
        </p>
        <dl style={{ display: "grid", gap: "10px", margin: 0 }}>
          <div><dt>Certificate Number</dt><dd>{generated.certificateNumber}</dd></div>
          <div><dt>Verification URL</dt><dd>{generated.verificationUrl}</dd></div>
          <div><dt>QR Code Value</dt><dd>{generated.qrCode}</dd></div>
          <div><dt>Issued Version</dt><dd>{generated.issuedVersion}</dd></div>
        </dl>
      </details>
    </>
  );
}

export default function NewCertificatePage({ searchParams }: NewCertificatePageProps) {
  const status = searchParams?.status === "success" || searchParams?.status === "error"
    ? searchParams.status
    : undefined;
  const message = searchParams?.message;

  return (
    <AdminShell
      title="Create Certificate"
      description="Prepare a certificate for an artwork."
    >
      <PageToolbar
        title="Create Certificate"
        description="Enter the artwork and approval details. Verification values are generated automatically."
      />
      <form action={createCertificateAction} className="admin-form" aria-label="Create Certificate">
        <div className="admin-form__intro">
          <h2 className="admin-form__title">Create Certificate</h2>
          <p className="admin-form__description">Only editor-facing certificate details are required here.</p>
        </div>
        <div aria-live="polite" role={status === "error" ? "alert" : "status"}>
          <p className="admin-form__description">
            {message ?? "Prepare the certificate details below."}
          </p>
        </div>
        <CertificateFields />
        <FormActions
          cancelHref="/admin/certificates"
          cancelLabel="Cancel"
          helperText="Generated certificate values are shown after preparation and remain protected from normal editing."
          submitDisabled={false}
          submitLabel="Prepare Certificate"
        />
      </form>
    </AdminShell>
  );
}
