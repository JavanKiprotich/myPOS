import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStoreId } from "@/lib/store";

export async function GET() {
  try {
    const storeId = await getCurrentStoreId();

    const inventory = await prisma.inventory.findMany({
      where: {
        storeId,
      },

      include: {
        product: true,
      },
    });

    let totalValue = 0;

    const items = inventory.map((item) => {
      const value =
        Number(item.product.price) *
        item.quantity;

      totalValue += value;

      return {
        ...item,
        value,
      };
    });

    return NextResponse.json({
      totalValue,
      items,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to calculate valuation",
      },
      {
        status: 500,
      }
    );
  }
}