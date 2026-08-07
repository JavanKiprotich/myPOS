import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("========== MPESA CALLBACK RECEIVED ==========");
    console.log(JSON.stringify(body, null, 2));

    const callback = body?.Body?.stkCallback;

    if (!callback) {
      console.log("NO STK CALLBACK");

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    const {
      CheckoutRequestID,
      MerchantRequestID,
      ResultCode,
      ResultDesc,
    } = callback;

    console.log("CheckoutRequestID:", CheckoutRequestID);
    console.log("ResultCode:", ResultCode);
    console.log("ResultDesc:", ResultDesc);

    // Find the PaymentSession
    const session =
      await prisma.paymentSession.findFirst({
        where: {
          checkoutRequestId: CheckoutRequestID,
        },
      });

    console.log(
      "SESSION:",
      session
        ? {
            id: session.id,
            saleId: session.saleId,
            checkoutRequestId:
              session.checkoutRequestId,
            status: session.status,
          }
        : "NOT FOUND"
    );

    if (!session) {
      console.log(
        "❌ PAYMENT SESSION NOT FOUND"
      );

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    // ==========================================
    // FAILED / CANCELLED
    // ==========================================

    if (ResultCode !== 0) {
      console.log(
        "❌ CUSTOMER DID NOT COMPLETE PAYMENT"
      );

      const updated =
        await prisma.paymentSession.update({
          where: {
            id: session.id,
          },

          data: {
            status: "FAILED",
          },
        });

      console.log(
        "UPDATED SESSION:",
        updated.status
      );

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    const items =
      callback.CallbackMetadata?.Item || [];

    const metadata = {};

    for (const item of items) {
      metadata[item.Name] = item.Value;
    }

    console.log(
      "PAYMENT METADATA:",
      metadata
    );

    const updatedSession =
      await prisma.paymentSession.update({
        where: {
          id: session.id,
        },

        data: {
          status: "VERIFIED",

          receipt:
            metadata.MpesaReceiptNumber
              ? String(
                  metadata.MpesaReceiptNumber
                )
              : null,
        },
      });

    console.log(
      "SESSION VERIFIED:",
      updatedSession.status
    );

    // Prevent duplicate Payment records
    const existingPayment =
      await prisma.payment.findFirst({
        where: {
          checkoutRequestId:
            CheckoutRequestID,
        },
      });

    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          saleId: session.saleId,

          method: "MPESA",

          amount: Number(
            metadata.Amount ?? session.amount
          ),

          status: "VERIFIED",

          phone:
            metadata.PhoneNumber
              ? String(
                  metadata.PhoneNumber
                )
              : session.phone,

          checkoutRequestId:
            CheckoutRequestID,

          merchantRequestId:
            MerchantRequestID,

          mpesaReceipt:
            metadata.MpesaReceiptNumber
              ? String(
                  metadata.MpesaReceiptNumber
                )
              : null,
        },
      });

      console.log(
        "✅ PAYMENT RECORD CREATED"
      );
    }

    await prisma.sale.update({
      where: {
        id: session.saleId,
      },

      data: {
        status: "COMPLETED",
      },
    });

    console.log(
      "========== PAYMENT VERIFIED =========="
    );

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });

  } catch (error) {
    console.error(
      "========== CALLBACK ERROR =========="
    );

    console.error(error);

    // Always acknowledge Safaricom
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  }
}