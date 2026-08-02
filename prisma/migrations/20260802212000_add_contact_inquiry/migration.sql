CREATE TABLE "ContactInquiry" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "source_page" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "consent" BOOLEAN NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "email_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInquiry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContactInquiry_reference_key" ON "ContactInquiry"("reference");

CREATE INDEX "ContactInquiry_reference_idx" ON "ContactInquiry"("reference");
CREATE INDEX "ContactInquiry_status_idx" ON "ContactInquiry"("status");
CREATE INDEX "ContactInquiry_email_idx" ON "ContactInquiry"("email");
CREATE INDEX "ContactInquiry_ip_hash_created_at_idx" ON "ContactInquiry"("ip_hash", "created_at");
CREATE INDEX "ContactInquiry_created_at_idx" ON "ContactInquiry"("created_at");
