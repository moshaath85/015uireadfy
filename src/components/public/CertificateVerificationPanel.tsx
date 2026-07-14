import type { CSSProperties } from "react";
import PageContainer, {
  PublicCTASection,
  PublicDetailSection,
  PublicHero,
  PublicMetadataSection,
} from "@/components/public/PageContainer";
import type { Artwork, Certificate } from "@/types";
import { CertificateStatus } from "@/types";

export interface CertificateVerificationPanelProps {
  readonly certificate?: Certificate;
  readonly artwork?: Artwork;
  readonly lookupValue?: string;
}

const qrGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(9, 1fr)",
  gap: "3px",
  width: "162px",
  height: "162px",
  padding: "12px",
  background: "#fff",
  border: "1px solid #d8d8d8",
};

const qrCellStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1",
  background: "#151515",
};

const qrEmptyCellStyle: CSSProperties = {
  ...qrCellStyle,
  background: "#f6f2ea",
};

const statusPanelStyle: CSSProperties = {
  border: "1px solid #d8d8d8",
  display: "grid",
  gap: "16px",
  padding: "24px",
};

const lookupFormStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  marginTop: "16px",
  maxWidth: "560px",
};

const lookupInputStyle: CSSProperties = {
  border: "1px solid #b8b0a2",
  font: "inherit",
  padding: "12px 14px",
};

const lookupButtonStyle: CSSProperties = {
  background: "#151515",
  border: "1px solid #151515",
  color: "#fff",
  cursor: "pointer",
  font: "inherit",
  padding: "12px 16px",
};

function formatStatus(value: CertificateStatus): string {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function statusOutcome(certificate: Certificate): {
  readonly title: string;
  readonly description: string;
} {
  if (certificate.status === CertificateStatus.Issued || certificate.status === CertificateStatus.Reissued) {
    return {
      title: "Certificate verified",
      description: "This certificate record matches the Gallery 015 verification registry.",
    };
  }

  if (certificate.status === CertificateStatus.Revoked) {
    return {
      title: "Certificate revoked",
      description: "This certificate exists in the registry but is no longer valid for verification.",
    };
  }

  return {
    title: "Certificate pending",
    description: "This certificate exists in the registry but has not been issued for public verification.",
  };
}

function qrCells(value: string): boolean[] {
  const source = value || "certificate";
  return Array.from({ length: 81 }, (_, index) => {
    const charCode = source.charCodeAt(index % source.length);
    const finderPattern =
      (index < 21 && index % 9 < 3) ||
      (index < 27 && index % 9 > 5) ||
      (index > 53 && index % 9 < 3);

    return finderPattern || (charCode + index * 7) % 3 === 0;
  });
}

function VerificationLookupForm({ lookupValue }: { readonly lookupValue?: string }) {
  return (
    <form action="/verify" method="get" style={lookupFormStyle}>
      <label htmlFor="certificate-lookup">Certificate number, verification URL, QR value, or token</label>
      <input
        id="certificate-lookup"
        name="q"
        placeholder="Enter certificate lookup value"
        defaultValue={lookupValue}
        style={lookupInputStyle}
      />
      <button type="submit" style={lookupButtonStyle}>
        Verify Certificate
      </button>
    </form>
  );
}

function CertificateQr({ value }: { readonly value: string }) {
  return (
    <div aria-label={`QR verification value ${value}`} style={qrGridStyle}>
      {qrCells(value).map((filled, index) => (
        <span key={`${value}-${index}`} style={filled ? qrCellStyle : qrEmptyCellStyle} />
      ))}
    </div>
  );
}

export function CertificateVerificationPanel({
  certificate,
  artwork,
  lookupValue,
}: CertificateVerificationPanelProps) {
  if (!certificate) {
    return (
      <PageContainer>
        <PublicHero
          title="Certificate Verification"
          subtitle="Enter a certificate number, verification URL, QR value, or token to confirm a Gallery 015 certificate."
          eyebrow="Verification"
        />
        <PublicDetailSection title={lookupValue ? "No matching certificate" : "Lookup"}>
          <div style={statusPanelStyle}>
            <p>
              {lookupValue
                ? "No certificate record matched the submitted lookup value."
                : "Use the lookup below to verify a certificate against the current registry."}
            </p>
            <VerificationLookupForm lookupValue={lookupValue} />
          </div>
        </PublicDetailSection>
      </PageContainer>
    );
  }

  const outcome = statusOutcome(certificate);

  return (
    <PageContainer>
      <PublicHero
        title={outcome.title}
        subtitle={outcome.description}
        eyebrow="Certificate Verification"
      />
      <PublicMetadataSection
        items={[
          { label: "Certificate number", value: certificate.certificate_number },
          { label: "Status", value: formatStatus(certificate.status) },
          { label: "Issued date", value: certificate.issued_date },
          { label: "Artwork", value: artwork ? `${artwork.title_en} (${artwork.year})` : certificate.artwork_id },
          { label: "Medium", value: artwork?.medium_en },
          { label: "Dimensions", value: artwork?.dimensions },
          { label: "Issued by", value: certificate.issued_by },
          { label: "Approved by", value: certificate.approved_by },
          { label: "Version", value: certificate.issued_version },
        ]}
      />
      <PublicDetailSection title="QR Verification">
        <div style={statusPanelStyle}>
          <CertificateQr value={certificate.qr_code} />
          <p>
            QR value: <code>{certificate.qr_code}</code>
          </p>
          <p>
            Verification URL: <code>{certificate.verification_url}</code>
          </p>
        </div>
      </PublicDetailSection>
      {artwork ? (
        <PublicCTASection
          title="Artwork record"
          description="Review the artwork record associated with this certificate."
          href={`/artworks/${artwork.slug}`}
          label="View artwork"
        />
      ) : null}
    </PageContainer>
  );
}