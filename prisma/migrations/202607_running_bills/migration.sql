-- CreateEnum
CREATE TYPE "RunningBillStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "RunningBill" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "status" "RunningBillStatus" NOT NULL DEFAULT 'OPEN',
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RunningBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunningBillItem" (
    "id" TEXT NOT NULL,
    "runningBillId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RunningBillItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunningBillPayment" (
    "id" TEXT NOT NULL,
    "runningBillId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'VERIFIED',
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RunningBillPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RunningBill"
ADD CONSTRAINT "RunningBill_storeId_fkey"
FOREIGN KEY ("storeId") REFERENCES "Store"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunningBill"
ADD CONSTRAINT "RunningBill_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunningBillItem"
ADD CONSTRAINT "RunningBillItem_runningBillId_fkey"
FOREIGN KEY ("runningBillId") REFERENCES "RunningBill"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunningBillItem"
ADD CONSTRAINT "RunningBillItem_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunningBillPayment"
ADD CONSTRAINT "RunningBillPayment_runningBillId_fkey"
FOREIGN KEY ("runningBillId") REFERENCES "RunningBill"("id")
ON DELETE CASCADE ON UPDATE CASCADE;