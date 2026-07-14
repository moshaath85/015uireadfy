import { CertificateVerificationPanel } from "@/components/public/CertificateVerificationPanel";
import { artworksRepository } from "@/lib/repositories/artworks";
import { certificatesRepository } from "@/lib/repositories/certificates";

interface VerifyTokenPageProps {
  readonly params: {
    readonly token: string;
  };
}

export const dynamic = "force-dynamic";

export default async function VerifyTokenPage({ params }: VerifyTokenPageProps) {
  const certificate = await certificatesRepository.findByVerificationValue(params.token);
  const artwork = certificate
    ? (await artworksRepository.getAll()).find((item) => item.id === certificate.artwork_id)
    : undefined;

  return (
    <CertificateVerificationPanel
      certificate={certificate ?? undefined}
      artwork={artwork}
      lookupValue={params.token}
    />
  );
}