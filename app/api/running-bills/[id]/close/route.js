import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const cashierId = body.cashierId;
    const method = body.method;

    if (!cashierId) {
      return NextResponse.json(
        { error: "Cashier is required." },
        { status: 400 }
      );
    }

    if (!["CASH", "MPESA", "CREDIT"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid payment method." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Get authenticated user's store
    // --------------------------------------------------
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

    // --------------------------------------------------
    // Make sure cashier belongs to this store
    // --------------------------------------------------
    const cashier = await prisma.user.findFirst({
      where: {
        id: cashierId,
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
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // ----------------------------------------------
        // Find open bill
        // ----------------------------------------------
        const bill =
          await tx.runningBill.findFirst({
            where: {
              id,
              storeId,
              status: "OPEN",
            },

            include: {
              items: true,
              customer: true,
            },
          });

        if (!bill) {
          throw new Error(
            "Running bill not found or already closed."
          );
        }

        if (bill.items.length === 0) {
          throw new Error(
            "Cannot close an empty running bill."
          );
        }

        // ----------------------------------------------
        // Calculate balance
        // ----------------------------------------------
        const total =
          new Prisma.Decimal(bill.total);

        const paid =
          new Prisma.Decimal(bill.paid);

        const balance =
          total.minus(paid);

        if (balance.lessThanOrEqualTo(0)) {
          throw new Error(
            "This bill is already fully paid."
          );
        }

        const paymentAmount = balance;

        // ----------------------------------------------
        // Credit requires customer
        // ----------------------------------------------
        if (
          method === "CREDIT" &&
          !bill.customerId
        ) {
          throw new Error(
            "A customer is required for a credit bill."
          );
        }

        // ----------------------------------------------
        // Create normal Sale
        // ----------------------------------------------
        const sale = await tx.sale.create({
          data: {
            storeId,
            customerId:
              bill.customerId || null,
            cashierId,
            total,
            status: "COMPLETED",
            syncStatus: "PENDING",

            items: {
              create: bill.items.map(
                (item) => ({
                  productId:
                    item.productId,

                  quantity:
                    item.quantity,

                  unitPrice:
                    item.unitPrice,

                  // Historical cost captured
                  // when the item entered the bill.
                  unitCost:
                    item.unitCost ??
                    new Prisma.Decimal(0),

                  subtotal:
                    item.subtotal,
                })
              ),
            },
          },

          include: {
            items: true,
          },
        });

        // ----------------------------------------------
        // Create payment
        // ----------------------------------------------
        const payment =
          await tx.payment.create({
            data: {
              saleId: sale.id,
              method,
              amount: paymentAmount,

              status:
                method === "MPESA"
                  ? "PENDING"
                  : "VERIFIED",
            },
          });

        // ----------------------------------------------
        // Credit sale
        // ----------------------------------------------
        if (method === "CREDIT") {
          const creditAccount =
            await tx.creditAccount.upsert({
              where: {
                customerId:
                  bill.customerId,
              },

              update: {
                balance: {
                  increment:
                    paymentAmount,
                },
              },

              create: {
                customerId:
                  bill.customerId,
                balance:
                  paymentAmount,
              },
            });

          await tx.creditTransaction.create({
            data: {
              creditAccountId:
                creditAccount.id,

              saleId: sale.id,

              amount:
                paymentAmount,

              type: "SALE",
            },
          });
        }

        // ----------------------------------------------
        // M-Pesa remains pending
        // ----------------------------------------------
        if (method === "MPESA") {
          return {
            sale,
            payment,
            closed: false,
            message:
              "M-Pesa payment initiated and is pending verification.",
          };
        }

        // ----------------------------------------------
        // Close bill for cash/credit
        // ----------------------------------------------
        await tx.runningBill.update({
          where: {
            id: bill.id,
          },

          data: {
            status: "CLOSED",
            paid: total,
            closedAt: new Date(),
          },
        });

        return {
          sale,
          payment,
          closed: true,
          message:
            "Running bill closed successfully.",
        };
      }
    );

    return NextResponse.json({
      success: true,
      saleId: result.sale.id,
      paymentId: result.payment.id,
      closed: result.closed,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "Close running bill error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to close running bill.",
      },
      {
        status: 400,
      }
    );
  }
}