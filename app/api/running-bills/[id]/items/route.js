import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STORE_ID = "cmrj98gz70000mneof8jfrrlv";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const productId = body.productId;
    const quantity = Number(body.quantity || 1);

    if (!productId || quantity <= 0) {
      return NextResponse.json(
        {
          error: "Product and valid quantity are required.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const bill =
          await tx.runningBill.findFirst({
            where: {
              id,
              storeId: STORE_ID,
              status: "OPEN",
            },
          });

        if (!bill) {
          throw new Error(
            "Running bill not found or already closed."
          );
        }

        const product =
          await tx.product.findUnique({
            where: {
              id: productId,
            },
          });

        if (!product) {
          throw new Error("Product not found.");
        }

        const settings =
          await tx.storeSettings.findUnique({
            where: {
              storeId: STORE_ID,
            },
          });

        const inventory =
          await tx.inventory.findUnique({
            where: {
              storeId_productId: {
                storeId: STORE_ID,
                productId,
              },
            },
          });

        const currentStock = inventory?.quantity ?? 0;

        if (
          settings?.trackInventory !== false &&
          settings?.autoDeductStock !== false &&
          !settings?.allowNegativeStock &&
          currentStock < quantity
        ) {
          throw new Error(
            `Only ${currentStock} ${product.unit} available.`
          );
        }

        const unitPrice = Number(product.price);
        const subtotal = unitPrice * quantity;

        const existingItem =
          await tx.runningBillItem.findFirst({
            where: {
              runningBillId: id,
              productId,
            },
          });

        let item;

        if (existingItem) {
          item =
            await tx.runningBillItem.update({
              where: {
                id: existingItem.id,
              },

              data: {
                quantity:
                  existingItem.quantity + quantity,

                subtotal:
                  Number(existingItem.unitPrice) *
                  (existingItem.quantity + quantity),
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
                subtotal,
              },
            });
        }

        if (
          settings?.trackInventory !== false &&
          settings?.autoDeductStock !== false
        ) {
          await tx.inventory.update({
            where: {
              storeId_productId: {
                storeId: STORE_ID,
                productId,
              },
            },
            data: {
              quantity: {
                decrement: quantity,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              storeId: STORE_ID,
              productId,
              type: "RUNNING_BILL",
              quantity: -quantity,
              reason: `Added to running bill ${id}`,
            },
          });
        }

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
          Number(aggregate._sum.subtotal || 0);

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
      {
        status: 400,
      }
    );
  }
}