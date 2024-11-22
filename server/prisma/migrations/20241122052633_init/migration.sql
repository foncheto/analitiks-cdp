-- DropIndex
DROP INDEX "Lead_email_key";

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "email" DROP NOT NULL;
