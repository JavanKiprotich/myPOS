-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedByApi" BOOLEAN NOT NULL DEFAULT false;
