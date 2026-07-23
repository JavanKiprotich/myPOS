import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const sale = await prisma.$transaction(async (tx) => {
      let total = 0;

      // Calculate total
      for (const item of body.items) {
        total += Number(item.price) * item.quantity;
      }

      // Verify stock before creating the sale
      for (const item of body.items) {

        console.log("Checking item:", item);
console.log("Store:", body.storeId);

        const inventory = await tx.inventory.findFirst({
          where: {
            storeId: body.storeId,
            productId: item.productId,
          },
          include: {
            product: true,
          },
        });
        console.log("Inventory:", inventory);

        if (!inventory) {
          throw new Error(
            `Inventory not found for product ${item.productId}.`
          );
        }

        if (inventory.quantity < item.quantity) {
          throw new Error(
            `Only ${inventory.quantity} ${inventory.product.name} available in stock.`
          );
        }
      }

      // Create sale
      const createdSale = await tx.sale.create({
        data: {
          storeId: body.storeId,
          customerId: body.customerId || null,
          cashierId: body.cashierId,
          total,
          status: "COMPLETED",
        },
      });

      // Create sale items and deduct stock
      for (const item of body.items) {
        const subtotal =
          Number(item.price) * item.quantity;

        await tx.saleItem.create({
          data: {
            saleId: createdSale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            subtotal,
          },
        });

        await tx.inventory.updateMany({
          where: {
            storeId: body.storeId,
            productId: item.productId,
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create payment
      await tx.payment.create({
        data: {
          saleId: createdSale.id,
          method: body.paymentMethod,
          amount: total,
          status:
            body.paymentMethod === "MPESA"
              ? "PENDING"
              : "VERIFIED",
        },
      });

      // Credit sale
      if (
        body.paymentMethod === "CREDIT" &&
        body.customerId
      ) {
        const creditAccount =
          await tx.creditAccount.upsert({
            where: {
              customerId: body.customerId,
            },
            update: {
              balance: {
                increment: total,
              },
            },
            create: {
              customerId: body.customerId,
              balance: total,
            },
          });

        await tx.creditTransaction.create({
          data: {
            creditAccountId: creditAccount.id,
            saleId: createdSale.id,
            amount: total,
            type: "SALE",
          },
        });
      }

      return createdSale;
    });

    return NextResponse.json(sale);

  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create sale";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}