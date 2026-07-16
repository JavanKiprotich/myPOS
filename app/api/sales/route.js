import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const sale = await prisma.$transaction(async (tx) => {
      let total = 0;

      for (const item of body.items) {
        total += Number(item.price) * item.quantity;
      }

      const createdSale = await tx.sale.create({
        data: {
          storeId: body.storeId,
          customerId: body.customerId || null,
          cashierId: body.cashierId,
          total,
          status: "COMPLETED",
        },
      });

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

      // CREDIT SALE LOGIC
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
            creditAccountId:
              creditAccount.id,
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

    return NextResponse.json(
      {
        error: "Failed to create sale",
      },
      {
        status: 500,
      }
    );
  }
}