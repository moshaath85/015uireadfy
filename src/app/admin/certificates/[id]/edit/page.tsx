import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { FormActions } from "@/components/admin/FormActions";
import { PageToolbar } from "@/components/admin/PageToolbar";
import { requireAdminServerAction } from "@/lib/auth/admin-action-security";
import { prepareUpdateCertificateAction } from "@/lib/cms/certificates/certificates-actions";
import { artworksRepository } from "@/lib/repositories/artworks";
import { certificatesRepository } from "@/lib/repositories/certificates";
import { CertificateStatus } from "@/types";

export interface EditCertificatePageProps {
  readonly params: {
    readonly id: string;
  };
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

export async function generateStaticParams() {
  const certificates = await certificatesRepository.getAll();

  return certificates.map((certificate) => ({
    id: certificate.id,
  }));
}

async function updateCertificateAction(certificateId: string, formData: FormData) {
  "use server";

  await requireAdminServerAction("certificates.update");

  const result = prepareUpdateCertificateAction(certificateId, formData, {
    existingCertificateId: certificateId,
    mutationEnabled: false,
    environment: process.env.NODE_ENV,
  });

  if (!result.ok) {
    redirect(`/admin/certificates/${certificateId}/edit?status=error&message=${encodeURIComponent(result.message)}`);
  }

  redirect(
    `/admin/certificates/${certificateId}/edit?status=success&message=${encodeURIComponent(
      result.message || "Certificate was prepared.",
    )}`,
  );
}

export default async function EditCertificatePage({ params, searchParams }: EditCertificatePageProps) {
  const certificates = await certificatesRepository.getAll();
  const certificate = certificates.find((item) => item.id === params.id);

  if (!certificate) {
    notFound();
  }

  const artworks = await artworksRepository.getAll();
  const status = searchParams?.status === "success" || searchParams?.status === "error"
    ? searchParams.status
    : undefined;
  const message = searchParams?.message;
  const updateCurrentCertificateAction = updateCertificateAction.bind(null, certificate.id);

  return (
    <AdminShell
      title="Edit Certificate"
      description="Foundation screen for the guarded certificate update workflow."
    >
      <PageToolbar
        title="Edit Certificate"
        description={`Prepare updates for ${certificate.certificate_number} without enabling production writes.`}
      />
      <form action={updateCurrentCertificateAction} className="admin-form" aria-label="Edit Certificate">
        <div className="admin-form__intro">
          <h2 className="admin-form__title">Edit Certificate</h2>
          <p className="admin-form__description">Configuration for the guarded Certificates update workflow.</p>
        </div>
        <div aria-live="polite" role={status === "error" ? "alert" : "status"}>
          <p className="admin-form__description">
            {message ?? "Certificate persistence remains disabled until a future approved write patch."}
          </p>
        </div>

        <section className="admin-form-section" aria-labelledby="certificate-section-identity">
          <div className="admin-form-section__heading">
            <h3 className="admin-form-section__title" id="certificate-section-identity">Identity</h3>
          </div>
          <div className="admin-form-section__fields">
            <label className="admin-form-field">
              <span className="admin-form-field__label">Certificate Number *</span>
              <input className="admin-form-field__control" name="certificate_number" required defaultValue={certificate.certificate_number} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Artwork *</span>
              <select className="admin-form-field__control admin-form-field__control--select" name="artwork_id" required defaultValue={certificate.artwork_id}>
                {artworks.map((artwork) => (
                  <option key={artwork.id} value={artwork.id}>
                    {artwork.title_en} ({artwork.year})
                  </option>
                ))}
                {!artworks.some((artwork) => artwork.id === certificate.artwork_id) ? (
                  <option value={certificate.artwork_id}>{certificate.artwork_id}</option>
                ) : null}
              </select>
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Template ID *</span>
              <input className="admin-form-field__control" name="template_id" required defaultValue={certificate.template_id} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Status *</span>
              <select className="admin-form-field__control admin-form-field__control--select" name="status" required defaultValue={certificate.status}>
                {certificateStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="admin-form-section" aria-labelledby="certificate-section-verification">
          <div className="admin-form-section__heading">
            <h3 className="admin-form-section__title" id="certificate-section-verification">Verification</h3>
          </div>
          <div className="admin-form-section__fields">
            <label className="admin-form-field">
              <span className="admin-form-field__label">QR Code Value *</span>
              <input className="admin-form-field__control" name="qr_code" required defaultValue={certificate.qr_code} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Verification URL *</span>
              <input className="admin-form-field__control" name="verification_url" required type="url" defaultValue={certificate.verification_url} />
            </label>
          </div>
        </section>

        <section className="admin-form-section" aria-labelledby="certificate-section-issuance">
          <div className="admin-form-section__heading">
            <h3 className="admin-form-section__title" id="certificate-section-issuance">Issuance</h3>
          </div>
          <div className="admin-form-section__fields">
            <label className="admin-form-field">
              <span className="admin-form-field__label">Issued Date *</span>
              <input className="admin-form-field__control" name="issued_date" required type="date" defaultValue={certificate.issued_date} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Issued By *</span>
              <input className="admin-form-field__control" name="issued_by" required defaultValue={certificate.issued_by} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Approved By *</span>
              <input className="admin-form-field__control" name="approved_by" required defaultValue={certificate.approved_by} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Issued Version *</span>
              <input className="admin-form-field__control" name="issued_version" required min={1} type="number" defaultValue={certificate.issued_version} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Issued At *</span>
              <input className="admin-form-field__control" name="issued_at" required defaultValue={certificate.issued_at} />
            </label>
            <label className="admin-form-field">
              <span className="admin-form-field__label">Last Updated *</span>
              <input className="admin-form-field__control" name="last_updated" required defaultValue={certificate.last_updated} />
            </label>
          </div>
        </section>

        <FormActions
          cancelHref="/admin/certificates"
          cancelLabel="Cancel"
          helperText="Certificate writes remain disabled; this screen validates and prepares input only."
          submitDisabled={false}
          submitLabel="Prepare Certificate"
        />
      </form>
    </AdminShell>
  );
}