-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "autoLogoutMinutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "enableAuditLog" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minimumPasswordLength" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "requirePinCashDrawer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requirePinDiscount" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requirePinRefund" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requirePinVoidSale" BOOLEAN NOT NULL DEFAULT true;
