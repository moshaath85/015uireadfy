import type { CSSProperties } from "react";
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
  border: "1px solid var(--g-hair)",
};

const qrCellStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1",
  background: "var(--g-ink)",
};

const qrEmptyCellStyle: CSSProperties = {
  ...qrCellStyle,
  background: "transparent",
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
      <main className="g-page">
        <div className="g-page__grid">
          <header className="g-page__header">
            <p className="g-page__kicker">Verification</p>
            <h1>Certificate verification</h1>
          </header>
          <div className="g-page__body">
            <p>
              {lookupValue
                ? "No certificate record matched the submitted lookup value."
                : "Use the lookup below to verify a certificate against the current registry."}
            </p>
            <form action="/verify" method="get" className="g-verify-form">
              <label htmlFor="certificate-lookup">Certificate number, verification URL, QR value, or token</label>
              <input
                id="certificate-lookup"
                name="q"
                placeholder="Enter certificate lookup value"
                defaultValue={lookupValue}
                autoComplete="off"
              />
              <button type="submit">Verify certificate</button>
            </form>
            <div className="g-page__links">
              <a href="/contact">Private viewing</a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const outcome = statusOutcome(certificate);

  return (
    <main className="g-page">
      <div className="g-page__grid">
        <header className="g-page__header">
          <p className="g-page__kicker">Certificate verification</p>
          <h1>{outcome.title}</h1>
        </header>
        <div className="g-page__body">
          <p>{outcome.description}</p>
          <div className="g-page__section">
            <h2>Record</h2>
            <p>Certificate number — {certificate.certificate_number}</p>
            <p>Status — {formatStatus(certificate.status)}</p>
            <p>Issued date — {certificate.issued_date}</p>
            <p>Artwork — {artwork ? `${artwork.title_en} (${artwork.year})` : certificate.artwork_id}</p>
            {artwork?.medium_en ? <p>Medium — {artwork.medium_en}</p> : null}
            {artwork?.dimensions ? <p>Dimensions — {artwork.dimensions}</p> : null}
            <p>Issued by — {certificate.issued_by}</p>
            {certificate.approved_by ? <p>Approved by — {certificate.approved_by}</p> : null}
            <p>Version — {certificate.issued_version}</p>
          </div>
          <div className="g-page__section">
            <h2>QR verification</h2>
            <CertificateQr value={certificate.qr_code} />
            <p>QR value: <code>{certificate.qr_code}</code></p>
            <p>Verification URL: <code>{certificate.verification_url}</code></p>
          </div>
          <div className="g-page__links">
            {artwork ? <a href={`/artworks/${artwork.slug}`}>View artwork record</a> : null}
            <a href="/verify">Verify another certificate</a>
          </div>
        </div>
      </div>
    </main>
  );
}
