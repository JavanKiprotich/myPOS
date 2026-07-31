import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Sale must contain at least one item.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.cashierId) {
      return NextResponse.json(
        {
          error: "Cashier is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !["CASH", "MPESA", "CREDIT"].includes(
        body.paymentMethod
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid payment method.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------------
    // Get authenticated user's store
    // ----------------------------------------------------
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const session = await verifySession(token);

    if (!session?.storeId) {
      return NextResponse.json(
        {
          error: "Invalid session.",
        },
        {
          status: 401,
        }
      );
    }

    const storeId = String(session.storeId);

    // ----------------------------------------------------
    // Make sure cashier belongs to this store
    // ----------------------------------------------------
    const cashier = await prisma.user.findFirst({
      where: {
        id: body.cashierId,
        storeId,
        active: true,
      },
    });

    if (!cashier) {
      return NextResponse.json(
        {
          error:
            "Cashier is not authorized for this store.",
        },
        {
          status: 403,
        }
      );
    }

    const sale = await prisma.$transaction(
      async (tx) => {
        let total = 0;
        const saleItems = [];

        // ------------------------------------------------
        // Validate products + atomically reserve stock
        // ------------------------------------------------
        for (const item of body.items) {
          const productId = String(
            item.productId || ""
          );

          const quantity = Number(item.quantity);

          if (
            !productId ||
            !Number.isInteger(quantity) ||
            quantity <= 0
          ) {
            throw new Error(
              "Invalid sale item."
            );
          }

          const inventory =
            await tx.inventory.findUnique({
              where: {
                storeId_productId: {
                  storeId,
                  productId,
                },
              },
              include: {
                product: true,
              },
            });

          if (!inventory) {
            throw new Error(
              `Inventory not found for product ${productId}.`
            );
          }

          const settings =
            await tx.storeSettings.findUnique({
              where: {
                storeId,
              },
            });

          const allowNegative =
            settings?.allowNegativeStock === true;

          // ------------------------------------------------
          // Atomic stock protection
          // ------------------------------------------------
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
                `Only ${inventory.quantity} ` +
                `${inventory.product.unit} ` +
                `${inventory.product.name} ` +
                `available in stock.`
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

          // ------------------------------------------------
          // Snapshot financial values
          // ------------------------------------------------
          const unitPrice =
            Number(inventory.product.price);

          const unitCost =
            Number(inventory.product.costPrice);

          const subtotal =
            unitPrice * quantity;

          total += subtotal;

          saleItems.push({
            productId,
            quantity,
            unitPrice,
            unitCost,
            subtotal,
          });

          // ------------------------------------------------
          // Inventory movement
          // ------------------------------------------------
          await tx.inventoryMovement.create({
            data: {
              storeId,
              productId,
              type: "SALE",
              quantity: -quantity,
              reason: "Sale",
            },
          });
        }

        // ------------------------------------------------
        // Create sale
        // ------------------------------------------------
        const createdSale =
          await tx.sale.create({
            data: {
              storeId,
              customerId:
                body.customerId || null,
              cashierId: body.cashierId,
              total,
              status: "COMPLETED",
              syncStatus: "PENDING",
            },
          });

        // ------------------------------------------------
        // Create sale items
        // ------------------------------------------------
        for (const item of saleItems) {
          await tx.saleItem.create({
            data: {
              saleId: createdSale.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unitCost: item.unitCost,
              subtotal: item.subtotal,
            },
          });
        }

        // ------------------------------------------------
        // Payment
        // ------------------------------------------------
        await tx.payment.create({
          data: {
            saleId: createdSale.id,
            method: body.paymentMethod,
            amount: total,
            status:
              body.paymentMethod === "MPESA"
                ? "PENDING"
                : "VERIFIED",
          },
        });

        // ------------------------------------------------
        // Credit sale
        // ------------------------------------------------
        if (
          body.paymentMethod === "CREDIT" &&
          body.customerId
        ) {
          const creditAccount =
            await tx.creditAccount.upsert({
              where: {
                customerId: body.customerId,
              },

              update: {
                balance: {
                  increment: total,
                },
              },

              create: {
                customerId: body.customerId,
                balance: total,
              },
            });

          await tx.creditTransaction.create({
            data: {
              creditAccountId:
                creditAccount.id,
              saleId: createdSale.id,
              amount: total,
              type: "SALE",
            },
          });
        }

        return createdSale;
      }
    );

    return NextResponse.json(sale);
  } catch (error) {
    console.error(
      "Create sale error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create sale.",
      },
      {
        status: 400,
      }
    );
  }
}