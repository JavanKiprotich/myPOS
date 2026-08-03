import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function POST(request) {
  try {
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

    const body = await request.json();

    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: "Enter a valid repayment amount.",
        },
        {
          status: 400,
        }
      );
    }

    // Make sure the customer belongs to this store
    const customer = await prisma.customer.findFirst({
      where: {
        id: body.customerId,
        storeId,
      },
      include: {
        creditAccount: true,
      },
    });

    if (!customer || !customer.creditAccount) {
      return NextResponse.json(
        {
          error: "Credit account not found.",
        },
        {
          status: 404,
        }
      );
    }

    const currentBalance = Number(
      customer.creditAccount.balance
    );

    if (amount > currentBalance) {
      return NextResponse.json(
        {
          error:
            "Repayment amount cannot exceed outstanding balance.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.creditAccount.update({
        where: {
          id: customer.creditAccount.id,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      await tx.creditTransaction.create({
        data: {
          creditAccountId:
            customer.creditAccount.id,
          amount,
          type: "REPAYMENT",
        },
      });
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process repayment.",
      },
      {
        status: 500,
      }
    );
  }
}