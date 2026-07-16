import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    await prisma.$transaction(async (tx) => {
      await tx.inventory.updateMany({
        where: {
          storeId: body.storeId,
          productId: body.productId,
        },
        data: {
          quantity: {
            increment: Number(body.quantity),
          },
        },
      });

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