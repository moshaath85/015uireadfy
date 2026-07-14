-- CreateEnum
CREATE TYPE "SystemConfigurationScope" AS ENUM ('PLATFORM', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "SystemConfigurationValueType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ENUM', 'URL', 'EMAIL', 'LOCALE', 'TIMEZONE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'VIP', 'HIDDEN');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "legalName" TEXT,
    "description" TEXT,
    "websiteUrl" TEXT,
    "contactEmail" TEXT,
    "locale" TEXT,
    "timezone" TEXT,
    "archivedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfiguration" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scope" "SystemConfigurationScope" NOT NULL,
    "organizationId" TEXT,
    "valueType" "SystemConfigurationValueType" NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "validationSchema" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "storage_path" TEXT NOT NULL,
    "alt_text" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "file_size" INTEGER NOT NULL,
    "visibility" "MediaVisibility" NOT NULL DEFAULT 'PRIVATE',
    "checksum" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "bio_en" TEXT NOT NULL,
    "bio_ar" TEXT NOT NULL,
    "birth_year" INTEGER NOT NULL,
    "nationality_en" TEXT NOT NULL,
    "nationality_ar" TEXT NOT NULL,
    "website" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "profile_image_id" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "representation_status" TEXT NOT NULL,
    "visibility_status" TEXT NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "cover_media_id" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visibility_status" TEXT NOT NULL DEFAULT 'private',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artwork" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "collection_id" TEXT,
    "primary_media_id" TEXT NOT NULL,
    "year_created" INTEGER NOT NULL,
    "medium" TEXT NOT NULL,
    "dimensions" TEXT NOT NULL,
    "price_visibility" TEXT NOT NULL,
    "availability_status" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "visibility_status" TEXT NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "SystemConfiguration_key_idx" ON "SystemConfiguration"("key");

-- CreateIndex
CREATE INDEX "SystemConfiguration_scope_key_idx" ON "SystemConfiguration"("scope", "key");

-- CreateIndex
CREATE INDEX "SystemConfiguration_organizationId_key_idx" ON "SystemConfiguration"("organizationId", "key");

-- CreateIndex
CREATE INDEX "SystemConfiguration_organizationId_scope_key_idx" ON "SystemConfiguration"("organizationId", "scope", "key");

-- CreateIndex
CREATE INDEX "SystemConfiguration_isActive_key_idx" ON "SystemConfiguration"("isActive", "key");

-- CreateIndex
CREATE INDEX "SystemConfiguration_updatedAt_idx" ON "SystemConfiguration"("updatedAt");

-- CreateIndex
CREATE INDEX "SystemConfiguration_archivedAt_idx" ON "SystemConfiguration"("archivedAt");

-- CreateIndex
CREATE INDEX "Media_organization_id_idx" ON "Media"("organization_id");

-- CreateIndex
CREATE INDEX "Media_media_type_idx" ON "Media"("media_type");

-- CreateIndex
CREATE INDEX "Media_mime_type_idx" ON "Media"("mime_type");

-- CreateIndex
CREATE INDEX "Media_visibility_idx" ON "Media"("visibility");

-- CreateIndex
CREATE INDEX "Media_archived_at_idx" ON "Media"("archived_at");

-- CreateIndex
CREATE INDEX "Media_updated_at_idx" ON "Media"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "Media_organization_id_id_key" ON "Media"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Artist_organization_id_idx" ON "Artist"("organization_id");

-- CreateIndex
CREATE INDEX "Artist_visibility_status_idx" ON "Artist"("visibility_status");

-- CreateIndex
CREATE INDEX "Artist_featured_idx" ON "Artist"("featured");

-- CreateIndex
CREATE INDEX "Artist_display_order_idx" ON "Artist"("display_order");

-- CreateIndex
CREATE INDEX "Artist_organization_id_profile_image_id_idx" ON "Artist"("organization_id", "profile_image_id");

-- CreateIndex
CREATE INDEX "Artist_archived_at_idx" ON "Artist"("archived_at");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_organization_id_id_key" ON "Artist"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_organization_id_slug_key" ON "Artist"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "Collection_organization_id_idx" ON "Collection"("organization_id");

-- CreateIndex
CREATE INDEX "Collection_visibility_status_idx" ON "Collection"("visibility_status");

-- CreateIndex
CREATE INDEX "Collection_featured_idx" ON "Collection"("featured");

-- CreateIndex
CREATE INDEX "Collection_display_order_idx" ON "Collection"("display_order");

-- CreateIndex
CREATE INDEX "Collection_organization_id_cover_media_id_idx" ON "Collection"("organization_id", "cover_media_id");

-- CreateIndex
CREATE INDEX "Collection_archived_at_idx" ON "Collection"("archived_at");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_organization_id_id_key" ON "Collection"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_organization_id_slug_key" ON "Collection"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "Artwork_organization_id_idx" ON "Artwork"("organization_id");

-- CreateIndex
CREATE INDEX "Artwork_artist_id_idx" ON "Artwork"("artist_id");

-- CreateIndex
CREATE INDEX "Artwork_collection_id_idx" ON "Artwork"("collection_id");

-- CreateIndex
CREATE INDEX "Artwork_primary_media_id_idx" ON "Artwork"("primary_media_id");

-- CreateIndex
CREATE INDEX "Artwork_price_visibility_idx" ON "Artwork"("price_visibility");

-- CreateIndex
CREATE INDEX "Artwork_availability_status_idx" ON "Artwork"("availability_status");

-- CreateIndex
CREATE INDEX "Artwork_visibility_status_idx" ON "Artwork"("visibility_status");

-- CreateIndex
CREATE INDEX "Artwork_featured_idx" ON "Artwork"("featured");

-- CreateIndex
CREATE INDEX "Artwork_display_order_idx" ON "Artwork"("display_order");

-- CreateIndex
CREATE INDEX "Artwork_archived_at_idx" ON "Artwork"("archived_at");

-- CreateIndex
CREATE UNIQUE INDEX "Artwork_organization_id_slug_key" ON "Artwork"("organization_id", "slug");

-- AddForeignKey
ALTER TABLE "SystemConfiguration" ADD CONSTRAINT "SystemConfiguration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_organization_id_profile_image_id_fkey" FOREIGN KEY ("organization_id", "profile_image_id") REFERENCES "Media"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_organization_id_cover_media_id_fkey" FOREIGN KEY ("organization_id", "cover_media_id") REFERENCES "Media"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_organization_id_artist_id_fkey" FOREIGN KEY ("organization_id", "artist_id") REFERENCES "Artist"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_organization_id_collection_id_fkey" FOREIGN KEY ("organization_id", "collection_id") REFERENCES "Collection"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_organization_id_primary_media_id_fkey" FOREIGN KEY ("organization_id", "primary_media_id") REFERENCES "Media"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

