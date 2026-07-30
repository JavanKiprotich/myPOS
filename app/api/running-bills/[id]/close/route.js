import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const STORE_ID = "cmrj98gz70000mneof8jfrrlv";

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

    const result = await prisma.$transaction(async (tx) => {
      const bill = await tx.runningBill.findFirst({
        where: {
          id,
          storeId: STORE_ID,
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

      const total = new Prisma.Decimal(bill.total);
      const paid = new Prisma.Decimal(bill.paid);
      const balance = total.minus(paid);

      if (balance.lessThanOrEqualTo(0)) {
        throw new Error("This bill is already fully paid.");
      }

      // For now, closing a bill requires full payment.
      const paymentAmount = balance;

      if (method === "CREDIT" && !bill.customerId) {
        throw new Error(
          "A customer is required for a credit bill."
        );
      }

      const sale = await tx.sale.create({
        data: {
          storeId: STORE_ID,
          customerId: bill.customerId,
          cashierId,
          total,
          status: "COMPLETED",
          syncStatus: "PENDING",

          items: {
            create: bill.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      const payment = await tx.payment.create({
        data: {
          saleId: sale.id,
          method,
          amount: paymentAmount,
          status: method === "MPESA"
            ? "PENDING"
            : "VERIFIED",
        },
      });

      // Credit sale
      if (method === "CREDIT") {
        const creditAccount =
          await tx.creditAccount.upsert({
            where: {
              customerId: bill.customerId,
            },
            update: {
              balance: {
                increment: paymentAmount,
              },
            },
            create: {
              customerId: bill.customerId,
              balance: paymentAmount,
            },
          });

        await tx.creditTransaction.create({
          data: {
            creditAccountId: creditAccount.id,
            saleId: sale.id,
            amount: paymentAmount,
            type: "SALE",
          },
        });
      }

      // MPesa is still pending until Daraja confirms it.
      // We don't want to mark the running bill CLOSED yet.
      if (method === "MPESA") {
        return {
          sale,
          payment,
          closed: false,
          message:
            "M-Pesa payment initiated and is pending verification.",
        };
      }

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
        message: "Running bill closed successfully.",
      };
    });

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