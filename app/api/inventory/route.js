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

      orderBy: {
        product: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Inventory GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch inventory.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const storeId = await getCurrentStoreId();

    const body = await request.json();

    const existing = await prisma.inventory.findUnique({
      where: {
        storeId_productId: {
          storeId,
          productId: body.productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Inventory already exists for this product.",
        },
        {
          status: 400,
        }
      );
    }

    const inventory = await prisma.inventory.create({
      data: {
        storeId,
        productId: body.productId,
        quantity: Number(body.quantity) || 0,
      },

      include: {
        product: true,
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Inventory POST error:", error);

    return NextResponse.json(
      {
        error: "Failed to create inventory.",
      },
      {
        status: 500,
      }
    );
  }
}