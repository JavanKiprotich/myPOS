-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "defaultPaymentMethod" TEXT NOT NULL DEFAULT 'CASH',
ADD COLUMN     "mpesaAutoVerify" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mpesaCallbackUrl" TEXT,
ADD COLUMN     "mpesaConsumerKey" TEXT,
ADD COLUMN     "mpesaConsumerSecret" TEXT,
ADD COLUMN     "mpesaEnvironment" TEXT NOT NULL DEFAULT 'sandbox',
ADD COLUMN     "mpesaPasskey" TEXT,
ADD COLUMN     "mpesaShortcode" TEXT,
ADD COLUMN     "mpesaTillNumber" TEXT,
ADD COLUMN     "requireFullPayment" BOOLEAN NOT NULL DEFAULT true;
