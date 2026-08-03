import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { customerId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
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

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId,
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
        {
          error: "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(customer);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load statement.",
      },
      {
        status: 500,
      }
    );
  }
}