import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const inventory =
      await prisma.inventory.findFirst({
        where: {
          storeId: body.storeId,
          productId: body.productId,
        },
      });

    if (
      !inventory ||
      inventory.quantity <
        Number(body.quantity)
    ) {
      return NextResponse.json(
        {
          error:
            "Insufficient stock",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.inventory.updateMany({
        where: {
          storeId: body.storeId,
          productId: body.productId,
        },
        data: {
          quantity: {
            decrement:
              Number(body.quantity),
          },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          storeId: body.storeId,
          productId: body.productId,
          quantity: Number(body.quantity),
          type: "STOCK_OUT",
          reason:
            body.reason ||
            "Manual adjustment",
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
        error: "Stock out failed",
      },
      {
        status: 500,
      }
    );
  }
}