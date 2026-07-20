-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "autoDeductStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lowStockAlert" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "requireBarcode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stockValuation" TEXT NOT NULL DEFAULT 'AVERAGE',
ADD COLUMN     "trackInventory" BOOLEAN NOT NULL DEFAULT true;
