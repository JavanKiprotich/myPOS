import { prisma } from "@/lib/prisma";
import { validateStock } from "./inventory";

export interface CheckoutItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CheckoutData {
  customerId?: string | null;
  paymentMethod: "CASH" | "MPESA" | "CREDIT";
  cashierId: string;
  storeId: string;
  items: CheckoutItem[];
}

export async function checkout(data: CheckoutData) {
  if (data.items.length === 0) {
    throw new Error("Cart is empty.");
  }

  return prisma.$transaction(async (tx) => {
    // Step 1: Load settings
    const settings = await tx.storeSettings.findFirst({
      where: {
        storeId: data.storeId,
      },
    });

    if (!settings) {
      throw new Error("Store settings not found.");
    }

    for (const item of data.items) {
  await validateStock(
    tx,
    data.storeId,
    item.productId,
    item.quantity,
    settings.allowNegativeStock
  );
}
// Step 2: Validate stock (only if inventory tracking is enabled)
if (settings.trackInventory) {
  for (const item of data.items) {
    await validateStock(
      tx,
      data.storeId,
      item.productId,
      item.quantity,
      settings.allowNegativeStock
    );
  }
}
    // (Next step)
// Step 3: Calculate totals
const subtotal = data.items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);

const discount = 0;
const tax = 0;

const total = subtotal - discount + tax;
    // Step 3: Create sale
    // Step 4: Create Sale
const sale = await tx.sale.create({
  data: {
    storeId: data.storeId,
    customerId: data.customerId || null,
    cashierId: data.cashierId,
    total,
    status: "COMPLETED",
  },
});
// Step 5: Create Sale Items
await tx.saleItem.createMany({
  data: data.items.map((item) => ({
    saleId: sale.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.price,
    subtotal: item.price * item.quantity,
  })),
});
    // (Next step)

    // Step 4: Create payment
    // Step 6: Create Payment
await tx.payment.create({
  data: {
    saleId: sale.id,
    method: data.paymentMethod,
    amount: total,

    status:
  data.paymentMethod === "MPESA"
    ? "PENDING"
    : "VERIFIED",
  },
});
    // (Next step)

    // Step 5: Deduct inventory
    // (Next step)

    return {
      success: true,
      settings,
    };
  });
}