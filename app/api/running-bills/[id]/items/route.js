import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const productId = String(body.productId || "");
    const quantity = Number(body.quantity || 1);

    if (
      !productId ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Product and valid quantity are required.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // Authenticated user's store
    // ----------------------------------------------------
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session?.storeId) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const storeId = String(session.storeId);

    const result = await prisma.$transaction(
      async (tx) => {
        // ------------------------------------------------
        // Find open running bill
        // ------------------------------------------------
        const bill =
          await tx.runningBill.findFirst({
            where: {
              id,
              storeId,
              status: "OPEN",
            },
          });

        if (!bill) {
          throw new Error(
            "Running bill not found or already closed."
          );
        }

        // ------------------------------------------------
        // Find product
        // ------------------------------------------------
        const product =
          await tx.product.findUnique({
            where: {
              id: productId,
            },
          });

        if (!product) {
          throw new Error("Product not found.");
        }

        // ------------------------------------------------
        // Store settings
        // ------------------------------------------------
        const settings =
          await tx.storeSettings.findUnique({
            where: {
              storeId,
            },
          });

        const shouldDeductStock =
          settings?.trackInventory !== false &&
          settings?.autoDeductStock !== false;

        const allowNegative =
          settings?.allowNegativeStock === true;

        // ------------------------------------------------
        // Inventory
        // ------------------------------------------------
        const inventory =
          await tx.inventory.findUnique({
            where: {
              storeId_productId: {
                storeId,
                productId,
              },
            },
          });

        if (
          shouldDeductStock &&
          !inventory
        ) {
          throw new Error(
            `Inventory not found for ${product.name}.`
          );
        }

        const currentStock =
          inventory?.quantity ?? 0;

        // ------------------------------------------------
        // ATOMIC STOCK DECREMENT
        // ------------------------------------------------
        if (shouldDeductStock) {
          if (!allowNegative) {
            const updatedInventory =
              await tx.inventory.updateMany({
                where: {
                  storeId,
                  productId,
                  quantity: {
                    gte: quantity,
                  },
                },

                data: {
                  quantity: {
                    decrement: quantity,
                  },
                },
              });

            if (updatedInventory.count !== 1) {
              throw new Error(
                `Only ${currentStock} ${product.unit} ` +
                `${product.name} available in stock.`
              );
            }
          } else {
            await tx.inventory.update({
              where: {
                storeId_productId: {
                  storeId,
                  productId,
                },
              },

              data: {
                quantity: {
                  decrement: quantity,
                },
              },
            });
          }
        }

        // ------------------------------------------------
        // Prices
        // ------------------------------------------------
        const unitPrice =
          Number(product.price);

        const unitCost =
          Number(product.costPrice);

        // ------------------------------------------------
        // Existing running-bill item
        // ------------------------------------------------
        const existingItem =
          await tx.runningBillItem.findFirst({
            where: {
              runningBillId: id,
              productId,
            },
          });

        let item;

        if (existingItem) {
          const newQuantity =
            existingItem.quantity +
            quantity;

          item =
            await tx.runningBillItem.update({
              where: {
                id: existingItem.id,
              },

              data: {
                quantity: newQuantity,

                // Keep historical unit cost
                // from when the item was first added.
                subtotal:
                  Number(
                    existingItem.unitPrice
                  ) * newQuantity,
              },
            });
        } else {
          item =
            await tx.runningBillItem.create({
              data: {
                runningBillId: id,
                productId,
                quantity,
                unitPrice,
                unitCost,
                subtotal:
                  unitPrice * quantity,
              },
            });
        }

        // ------------------------------------------------
        // Record inventory movement
        // ------------------------------------------------
        if (shouldDeductStock) {
          await tx.inventoryMovement.create({
            data: {
              storeId,
              productId,
              type: "RUNNING_BILL",
              quantity: -quantity,
              reason:
                `Added ${quantity} ${product.name} ` +
                `to running bill ${id}`,
            },
          });
        }

        // ------------------------------------------------
        // Recalculate running-bill total
        // ------------------------------------------------
        const aggregate =
          await tx.runningBillItem.aggregate({
            where: {
              runningBillId: id,
            },

            _sum: {
              subtotal: true,
            },
          });

        const total =
          Number(
            aggregate._sum.subtotal || 0
          );

        await tx.runningBill.update({
          where: {
            id,
          },

          data: {
            total,
          },
        });

        return {
          itemId: item.id,
          total,
        };
      }
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "Running bill item error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add item.",
      },
      { status: 400 }
    );
  }
}