import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getCurrentStoreId } from "@/lib/store";

export async function GET() {
  try {


    const storeId = await getCurrentStoreId();

    const bills = await prisma.runningBill.findMany({
      where: {
        storeId,
        status: "OPEN",
      },
      orderBy: {
        updatedAt: "desc",
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
                unit: true,
                price: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    const formattedBills = bills.map((bill) => ({
      id: bill.id,
      name: bill.name,
      phone: bill.phone,
      notes: bill.notes,
      status: bill.status,
      total: Number(bill.total),
      paid: Number(bill.paid),
      balance: Number(bill.total) - Number(bill.paid),
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
      })),
    }));

    return NextResponse.json(formattedBills);
  } catch (error) {
    console.error("Running bills GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to load running bills.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {

const storeId = await getCurrentStoreId();

    const body = await request.json();

    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json(
        {
          error: "Bill name is required.",
        },
        {
          status: 400,
        }
      );
    }

    let customerId = body.customerId || null;

    // Optional customer creation/linking by phone
    if (!customerId && body.phone) {
      const phone = String(body.phone).trim();

      const existingCustomer =
        await prisma.customer.findFirst({
          where: {
            storeId,
            phone,
            
          },
        });

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const customer =
          await prisma.customer.create({
            data: {
              name,
              phone,
              storeId,
            },
          });

        customerId = customer.id;
      }
    }

    const bill = await prisma.runningBill.create({
      data: {
        storeId,
        customerId,
        name,
        phone: body.phone
          ? String(body.phone).trim()
          : null,
        notes: body.notes
          ? String(body.notes).trim()
          : null,
      },

      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(
      {
        id: bill.id,
        name: bill.name,
        phone: bill.phone,
        notes: bill.notes,
        status: bill.status,
        total: Number(bill.total),
        paid: Number(bill.paid),
        balance: Number(bill.total) - Number(bill.paid),
        openedAt: bill.openedAt,
        customer: bill.customer,
        items: [],
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Running bill POST error:", error);

    return NextResponse.json(
      {
        error: "Failed to create running bill.",
      },
      {
        status: 500,
      }
    );
  }
}