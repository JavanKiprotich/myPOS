import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log(
      "========== MPESA CALLBACK =========="
    );
    console.log(JSON.stringify(body, null, 2));

    const callback = body?.Body?.stkCallback;

    if (!callback) {
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

    // -----------------------------
    // PAYMENT FAILED OR CANCELLED
    // -----------------------------
    if (ResultCode !== 0) {
      await prisma.payment.updateMany({
        where: {
          checkoutRequestId: CheckoutRequestID,
        },
        data: {
          status: "FAILED",
          resultCode: ResultCode,
          resultDesc: ResultDesc,
        },
      });

      console.log("Payment Failed:", {
        CheckoutRequestID,
        ResultCode,
        ResultDesc,
      });

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      });
    }

    // -----------------------------
    // SUCCESSFUL PAYMENT
    // -----------------------------
    const items =
      callback.CallbackMetadata?.Item || [];

    const metadata = {};

    for (const item of items) {
      metadata[item.Name] = item.Value;
    }

    const payment = await prisma.payment.update({
      where: {
        checkoutRequestId: CheckoutRequestID,
      },
      data: {
        status: "VERIFIED",
        phone: String(metadata.PhoneNumber),
        mpesaReceipt: metadata.MpesaReceiptNumber,
        amount: Number(metadata.Amount),
        merchantRequestId: MerchantRequestID,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
      },
    });

    await prisma.sale.update({
      where: {
        id: payment.saleId,
      },
      data: {
        status: "COMPLETED",
      },
    });

    console.log("Payment Verified");
    console.log({
      receipt: metadata.MpesaReceiptNumber,
      amount: metadata.Amount,
      phone: metadata.PhoneNumber,
    });

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });

  } catch (error) {
    console.error("Callback Error:", error);

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  }
}