import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const amount = Number(body.amount);

    const creditAccount =
      await prisma.creditAccount.findUnique({
        where: {
          customerId: body.customerId,
        },
      });

    if (!creditAccount) {
      return NextResponse.json(
        {
          error: "Credit account not found",
        },
        {
          status: 404,
        }
      );
    }

    const currentBalance = Number(
      creditAccount.balance
    );

    if (amount > currentBalance) {
      return NextResponse.json(
        {
          error:
            "Repayment amount cannot exceed outstanding balance",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.creditAccount.update({
        where: {
          id: creditAccount.id,
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
            creditAccount.id,
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
          "Failed to process repayment",
      },
      {
        status: 500,
      }
    );
  }
}