import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
      },

      include: {
        inventory: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch product.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request, { params }) {
  try {

    // Prevent deleting sold products

    const saleItem = await prisma.saleItem.findFirst({
      where: {
        productId: params.id,
      },
    });

    if (saleItem) {
      return NextResponse.json(
        {
          error:
            "This product has sales and cannot be deleted.",
        },
        {
          status: 400,
        }
      );
    }

    // Delete inventory first

    await prisma.inventory.deleteMany({
      where: {
        productId: params.id,
      },
    });

    // Delete movements

    await prisma.inventoryMovement.deleteMany({
      where: {
        productId: params.id,
      },
    });

    // Delete product

    await prisma.product.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to delete product.",
      },
      {
        status: 500,
      }
    );
  }
}