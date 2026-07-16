import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { customerId } = await params;

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
      include: {
        creditAccount: {
          include: {
            transactions: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load statement" },
      { status: 500 }
    );
  }
}