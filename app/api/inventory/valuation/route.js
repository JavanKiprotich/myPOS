import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const inventory =
      await prisma.inventory.findMany({
        include: {
          product: true,
        },
      });

    let totalValue = 0;

    const items = inventory.map(
      (item) => {
        const value =
          Number(item.product.price) *
          item.quantity;

        totalValue += value;

        return {
          ...item,
          value,
        };
      }
    );

    return NextResponse.json({
      totalValue,
      items,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to calculate valuation",
      },
      {
        status: 500,
      }
    );
  }
}