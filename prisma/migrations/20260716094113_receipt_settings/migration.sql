-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "autoPrint" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "printDuplicate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showCashier" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showCustomer" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showLogo" BOOLEAN NOT NULL DEFAULT false;
