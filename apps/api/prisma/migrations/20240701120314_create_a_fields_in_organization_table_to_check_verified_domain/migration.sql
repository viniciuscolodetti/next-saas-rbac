-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "domain_token" TEXT,
ADD COLUMN     "verified_domain" BOOLEAN NOT NULL DEFAULT false;
