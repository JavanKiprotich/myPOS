import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getCurrentStoreId } from "@/lib/store";

export async function GET(request, { params }) {
  try {
    const storeId = await getCurrentStoreId();
    const { id } = await params;

    const bill = await prisma.runningBill.findFirst({
      where: {
        id,
        storeId,
      },

      include: {
        customer: true,

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                barcode: true,
                unit: true,
                price: true,

  inventory: {
          where: {
            storeId,
          },
          select: {
            quantity: true,
          },
        },

              },
            },
          },

          orderBy: {
            createdAt: "asc",
          },
        },

        payments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!bill) {
      return NextResponse.json(
        {
          error: "Running bill not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      id: bill.id,
      name: bill.name,
      phone: bill.phone,
      notes: bill.notes,
      status: bill.status,
      total: Number(bill.total),
      paid: Number(bill.paid),
      balance:
        Number(bill.total) - Number(bill.paid),
      openedAt: bill.openedAt,
      updatedAt: bill.updatedAt,

      customer: bill.customer
        ? {
            id: bill.customer.id,
            name: bill.customer.name,
            phone: bill.customer.phone,
          }
        : null,

      items: bill.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        unit: item.product.unit,
         stock: item.product.inventory[0]?.quantity ?? 0,
      })),

      payments: bill.payments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        method: payment.method,
        status: payment.status,
        reference: payment.reference,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error) {
    console.error("Running bill GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch running bill.",
      },
      {
        status: 500,
      }
    );
  }
}