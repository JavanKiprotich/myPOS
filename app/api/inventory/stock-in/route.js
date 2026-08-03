import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStoreId } from "@/lib/store";

export async function POST(request) {
  try {
    const storeId = await getCurrentStoreId();

    const body = await request.json();

    await prisma.$transaction(async (tx) => {
      const existingInventory = await tx.inventory.findUnique({
        where: {
          storeId_productId: {
            storeId,
            productId: body.productId,
          },
        },
      });

      if (existingInventory) {
        await tx.inventory.update({
          where: {
            storeId_productId: {
              storeId,
              productId: body.productId,
            },
          },
          data: {
            quantity: {
              increment: Number(body.quantity),
            },
          },
        });
      } else {
        await tx.inventory.create({
          data: {
            storeId,
            productId: body.productId,
            quantity: Number(body.quantity),
          },
        });
      }

      await tx.inventoryMovement.create({
        data: {
          storeId,
          productId: body.productId,
          quantity: Number(body.quantity),
          type: "STOCK_IN",
          reason: body.reason || "Stock received",
        },
      });
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Stock in failed",
      },
      {
        status: 500,
      }
    );
  }
}