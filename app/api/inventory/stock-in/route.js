import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    await prisma.$transaction(async (tx) => {

      const existingInventory = await tx.inventory.findFirst({
        where: {
          storeId: body.storeId,
          productId: body.productId,
        },
      });

      if (existingInventory) {
        await tx.inventory.update({
          where: {
            id: existingInventory.id,
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
            storeId: body.storeId,
            productId: body.productId,
            quantity: Number(body.quantity),
          },
        });
      }

      await tx.inventoryMovement.create({
        data: {
          storeId: body.storeId,
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