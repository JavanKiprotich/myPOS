import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request,
  { params }
) {
  try {
    const { checkoutRequestId } = await params;

    console.log(
      "========== PAYMENT STATUS CHECK =========="
    );

    console.log(
      "CheckoutRequestID:",
      checkoutRequestId
    );

    const session =
      await prisma.paymentSession.findFirst({
        where: {
          checkoutRequestId,
        },

        select: {
          status: true,
          receipt: true,
          phone: true,
          amount: true,
          saleId: true,
          updatedAt: true,
        },
      });

    if (!session) {
      console.log(
        "Payment session not found."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Payment session not found.",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "Payment session status:",
      session.status
    );

    return NextResponse.json({
      success: true,

      status: session.status,

      verified:
        session.status === "VERIFIED",

      failed:
        session.status === "FAILED",

      saleId: session.saleId,

      receipt: session.receipt,

      phone: session.phone,

      amount: Number(session.amount),

      updatedAt: session.updatedAt,
    });

  } catch (error) {

    console.error(
      "Payment status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch payment status.",
      },
      {
        status: 500,
      }
    );
  }
}