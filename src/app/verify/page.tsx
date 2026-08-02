import { CertificateVerificationPanel } from "@/components/public/CertificateVerificationPanel";
import { artworksRepository } from "@/lib/repositories/artworks";
import { certificatesRepository } from "@/lib/repositories/certificates";

interface VerifyPageProps {
  readonly searchParams?: Promise<{
    readonly q?: string;
  }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const resolvedSearchParams = await searchParams;
  const lookupValue = resolvedSearchParams?.q?.trim();
  const certificate = lookupValue ? await certificatesRepository.findByVerificationValue(lookupValue) : null;
  const artwork = certificate
    ? (await artworksRepository.getAll()).find((item) => item.id === certificate.artwork_id)
    : undefined;

  return (
    <CertificateVerificationPanel
      certificate={certificate ?? undefined}
      artwork={artwork}
      lookupValue={lookupValue}
    />
  );
}