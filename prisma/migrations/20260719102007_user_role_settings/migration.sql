-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "cashierChangePrice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cashierDeleteSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cashierPrintReceipt" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cashierSell" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "managerCancelSale" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "managerPriceOverride" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "managerRefund" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sessionTimeout" INTEGER NOT NULL DEFAULT 30;
