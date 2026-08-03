/*
  Warnings:

  - You are about to drop the column `reference` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "reference",
ADD COLUMN     "checkoutRequestId" TEXT,
ADD COLUMN     "merchantRequestId" TEXT,
ADD COLUMN     "mpesaReceipt" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "status" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Payment_checkoutRequestId_idx" ON "Payment"("checkoutRequestId");
