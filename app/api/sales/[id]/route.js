import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const sale = await prisma.sale.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,
        cashier: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch sale" },
      { status: 500 }
    );
  }
}