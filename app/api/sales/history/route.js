import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStoreId } from "@/lib/store";

export async function GET() {
  try {
    const storeId = await getCurrentStoreId();

    const sales = await prisma.sale.findMany({
      where: {
        storeId,
      },

      include: {
        customer: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sales);

  } catch (error) {
    console.error(error);

    return NextResponse.json([], {
      status: 200,
    });
  }
}