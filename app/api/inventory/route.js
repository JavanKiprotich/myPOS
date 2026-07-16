import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const inventory = await prisma.inventory.findMany({
    include: {
      product: true,
      store: true,
    },
  });

  return NextResponse.json(inventory);
}

export async function POST(request) {
  try {
    const body = await request.json();

    const inventory = await prisma.inventory.create({
      data: {
        storeId: body.storeId,
        productId: body.productId,
        quantity: body.quantity,
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create inventory" },
      { status: 500 }
    );
  }
}