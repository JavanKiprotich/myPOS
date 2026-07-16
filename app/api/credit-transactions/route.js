import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const transaction = await prisma.$transaction(
      async (tx) => {
        const creditTransaction =
          await tx.creditTransaction.create({
            data: {
              accountId: body.accountId,
              amount: body.amount,
              type: body.type,
              notes: body.notes,
            },
          });

        const account =
          await tx.creditAccount.update({
            where: {
              id: body.accountId,
            },
            data: {
              balance:
                body.type === "SALE"
                  ? { increment: body.amount }
                  : { decrement: body.amount },
            },
          });

        return {
          creditTransaction,
          account,
        };
      }
    );

    return NextResponse.json(transaction);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}