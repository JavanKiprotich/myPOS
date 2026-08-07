-- CreateTable
CREATE TABLE "PaymentSession" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "phone" TEXT,
    "receipt" TEXT,
    "checkoutRequestId" TEXT,
    "merchantRequestId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentSession_saleId_idx" ON "PaymentSession"("saleId");

-- CreateIndex
CREATE INDEX "PaymentSession_status_idx" ON "PaymentSession"("status");

-- CreateIndex
CREATE INDEX "PaymentSession_checkoutRequestId_idx" ON "PaymentSession"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "PaymentSession_receipt_idx" ON "PaymentSession"("receipt");

-- CreateIndex
CREATE INDEX "PaymentSession_phone_idx" ON "PaymentSession"("phone");

-- AddForeignKey
ALTER TABLE "PaymentSession" ADD CONSTRAINT "PaymentSession_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
