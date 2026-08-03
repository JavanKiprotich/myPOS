import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStoreId } from "@/lib/store";

export async function GET() {
  try {
    const storeId = await getCurrentStoreId();

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        storeId,
      },

      include: {
        product: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch inventory movements.",
      },
      {
        status: 500,
      }
    );
  }
}