import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STORE_ID = "cmrj98gz70000mneof8jfrrlv";

export async function GET(request, { params }) {
  try {
    const { barcode } = await params;

    const product = await prisma.product.findFirst({
      where: {
        barcode,
      },
      include: {
        inventory: {
          where: {
            storeId: STORE_ID,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: Number(product.price),

 costPrice: Number(product.costPrice),
      sellingPrice: Number(product.sellingPrice),

      inventory: product.inventory,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to find product." },
      { status: 500 }
    );
  }
}
