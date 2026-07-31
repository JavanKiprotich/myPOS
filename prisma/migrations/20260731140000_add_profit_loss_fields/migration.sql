-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "RunningBillItem" ADD COLUMN     "unitCost" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "unitCost" DECIMAL(10,2);

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
