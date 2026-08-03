import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStoreId } from "@/lib/store";

export async function GET(request, { params }) {
  try {
    const storeId = await getCurrentStoreId();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        inventory: {
          where: {
            storeId,
          },
          select: {
            quantity: true,
            updatedAt: true,
          },
        },
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

    return NextResponse.json({
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      unit: product.unit,

      costPrice: Number(product.costPrice),
      sellingPrice: Number(product.price),

      stock: product.inventory[0]?.quantity ?? 0,

      inventory: product.inventory,

      createdAt: product.createdAt,
    });
  } catch (error) {
    console.error("Product GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch product.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await getCurrentStoreId();

    const { id } = await params;
    const body = await request.json();

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    const duplicateSku = await prisma.product.findFirst({
      where: {
        sku: body.sku,
        NOT: {
          id,
        },
      },
    });

    if (duplicateSku) {
      return NextResponse.json(
        {
          error: "SKU already exists.",
        },
        {
          status: 400,
        }
      );
    }

    if (body.barcode) {
      const duplicateBarcode = await prisma.product.findFirst({
        where: {
          barcode: body.barcode,
          NOT: {
            id,
          },
        },
      });

      if (duplicateBarcode) {
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

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },

      data: {
        name: body.name,
        sku: body.sku,
        barcode: body.barcode || null,
        category: body.category,
        unit: body.unit,
        costPrice: Number(body.costPrice),
        price: Number(body.sellingPrice),
      },
    });

    return NextResponse.json({
      id: updatedProduct.id,
      name: updatedProduct.name,
      sku: updatedProduct.sku,
      barcode: updatedProduct.barcode,
      category: updatedProduct.category,
      unit: updatedProduct.unit,
      costPrice: Number(updatedProduct.costPrice),
      sellingPrice: Number(updatedProduct.price),
    });
  } catch (error) {
    console.error("Product PUT error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update product.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const storeId = await getCurrentStoreId();
    const { id } = await params;

    // Prevent deleting products with sales
    const saleItem = await prisma.saleItem.findFirst({
      where: {
        productId: id,
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

    // Remove THIS STORE'S inventory only
    await prisma.inventory.deleteMany({
      where: {
        productId: id,
        storeId,
      },
    });

    // Remove THIS STORE'S inventory movements only
    await prisma.inventoryMovement.deleteMany({
      where: {
        productId: id,
        storeId,
      },
    });

    // Check whether another store still has this product
    const remainingInventory = await prisma.inventory.count({
      where: {
        productId: id,
      },
    });

    // Delete shared product only if no store uses it anymore
    if (remainingInventory === 0) {
      await prisma.product.delete({
        where: {
          id,
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Product DELETE error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete product.",
      },
      {
        status: 500,
      }
    );
  }
}