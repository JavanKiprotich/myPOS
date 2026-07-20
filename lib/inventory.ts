import { Prisma } from "@prisma/client";

export async function validateStock(
  tx: Prisma.TransactionClient,
  storeId: string,
  productId: string,
  quantity: number,
  allowNegativeStock: boolean
) {
  const inventory = await tx.inventory.findUnique({
    where: {
      storeId_productId: {
        storeId,
        productId,
      },
    },
  });

  const currentStock = inventory?.quantity ?? 0;

  if (!allowNegativeStock && currentStock < quantity) {
    throw new Error(
      `Insufficient stock. Available: ${currentStock}`
    );
  }

  return inventory;
}