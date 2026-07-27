import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STORE_ID = "cmrj98gz70000mneof8jfrrlv"; // Replace later with logged-in user's store

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: "asc",
      },

      include: {
        inventory: {
          where: {
            storeId: STORE_ID,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      unit: product.unit,

      costPrice: Number(product.costPrice),
      sellingPrice: Number(product.price),

      stock: product.inventory[0]?.quantity ?? 0,

      createdAt: product.createdAt,
    }));

    return NextResponse.json(formattedProducts);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Check duplicate SKU
    const existingSku = await prisma.product.findUnique({
      where: {
        sku: body.sku,
      },
    });

    if (existingSku) {
      return NextResponse.json(
        {
          error: "SKU already exists.",
        },
        {
          status: 400,
        }
      );
    }

    // Check duplicate barcode
    if (body.barcode) {
      const existingBarcode =
        await prisma.product.findUnique({
          where: {
            barcode: body.barcode,
          },
        });

      if (existingBarcode) {
        return NextResponse.json(
          {
            error: "Barcode already exists.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        barcode: body.barcode || null,
        category: body.category,
        unit: body.unit,

        costPrice: Number(body.costPrice),
        price: Number(body.sellingPrice),

        inventory: {
          create: {
            storeId: STORE_ID,
            quantity: 0,
          },
        },
      },

      include: {
        inventory: true,
      },
    });

    return NextResponse.json(product, {
      status: 201,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create product.",
      },
      {
        status: 500,
      }
    );
  }
}