import {
  findCertificateByVerificationValue,
  listCertificateRecords,
  getProductionOrganizationId,
} from "@/lib/cms/production-prisma";
import type { Certificate } from "@/types";

async function getOrganizationCertificates(): Promise<readonly Certificate[]> {
  const organizationId = await getProductionOrganizationId();
  return organizationId ? listCertificateRecords(organizationId) : [];
}

async function getCertificateByNumber(certificateNumber: string): Promise<Certificate | null> {
  const lookup = certificateNumber.trim().toLowerCase();
  if (!lookup) return null;

  const certificates = await getOrganizationCertificates();
  return certificates.find((certificate) => certificate.certificate_number.toLowerCase() === lookup) ?? null;
}

async function getCertificateByVerificationUrl(verificationUrl: string): Promise<Certificate | null> {
  const lookup = verificationUrl.trim();
  if (!lookup) return null;

  const certificates = await getOrganizationCertificates();
  return certificates.find((certificate) => certificate.verification_url === lookup) ?? null;
}

export const certificatesRepository = {
  getAll: getOrganizationCertificates,
  getByNumber: getCertificateByNumber,
  getByVerificationUrl: getCertificateByVerificationUrl,
  findByVerificationValue: findCertificateByVerificationValue,
};
