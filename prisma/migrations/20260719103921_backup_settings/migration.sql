-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "autoBackup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "backupCustomers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "backupFrequency" TEXT NOT NULL DEFAULT 'DAILY',
ADD COLUMN     "backupInventory" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "backupSales" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "backupSettings" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "retainBackups" INTEGER NOT NULL DEFAULT 30;
