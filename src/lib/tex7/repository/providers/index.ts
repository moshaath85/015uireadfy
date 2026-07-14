export {
  prismaArtistRepository,
  prismaArtworkRepository,
  prismaCertificateRepository,
  prismaCollectionRepository,
  prismaExhibitionRepository,
  prismaNewsRepository,
  prismaProjectRepository,
  prismaPublicationRepository,
  prismaServiceRepository,
} from "./prisma-gallery-core-repositories";
export { prismaMediaRepository } from "./prisma-media-repository";
export type {
  Tex7PrismaArtistEntity,
  Tex7PrismaArtworkEntity,
  Tex7PrismaCertificateEntity,
  Tex7PrismaCollectionEntity,
  Tex7PrismaExhibitionEntity,
  Tex7PrismaNewsEntity,
  Tex7PrismaProjectEntity,
  Tex7PrismaPublicationEntity,
  Tex7PrismaServiceEntity,
} from "@/lib/tex7/database/providers/prisma-gallery-core-mapper";
export type { Tex7PrismaMediaEntity } from "@/lib/tex7/database/providers/prisma-media-mapper";