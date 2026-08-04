import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request,
  { params }
) {
  try {
    const payment =
      await prisma.payment.findFirst({
        where: {
          checkoutRequestId:
            params.checkoutRequestId,
        },

        select: {
          status: true,
          mpesaReceipt: true,
          saleId: true,
        },
      });

    if (!payment) {
      return NextResponse.json(
        {
          error: "Payment not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(payment);

  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed",
      },
      {
        status: 500,
      }
    );
  }
}