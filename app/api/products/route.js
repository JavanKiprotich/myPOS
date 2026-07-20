import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STORE_ID = "cmrj98gz70000mneof8jfrrlv"; // replace later with logged-in user's store

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        unit: true,
        price: true,

        inventory: {
          where: {
            storeId: STORE_ID,
          },

          select: {
            quantity: true,
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        category: body.category,
        unit: body.unit,
        price: Number(body.price),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}