import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  getAccessToken,
  generatePassword,
} from "@/lib/mpesa";

const BASE_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      saleId,
      phone,
      amount,
    } = body;

    if (!saleId || !phone || !amount) {
      return NextResponse.json(
        {
          error: "saleId, phone and amount are required.",
        },
        {
          status: 400,
        }
      );
    }

    const accessToken = await getAccessToken();

    const { password, timestamp } =
      generatePassword();

    const response = await fetch(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          BusinessShortCode:
            process.env.MPESA_SHORTCODE,

          Password: password,

          Timestamp: timestamp,

          TransactionType:
            "CustomerPayBillOnline",

          Amount: Number(amount),

          PartyA: phone,

          PartyB:
            process.env.MPESA_SHORTCODE,

          PhoneNumber: phone,

          CallBackURL:
            process.env.MPESA_CALLBACK_URL,

          AccountReference: saleId,

          TransactionDesc:
            "Liquor POS Payment",
        }),
      }
    );

    const data = await response.json();

    if (data.ResponseCode !== "0") {
      return NextResponse.json(
        {
          success: false,
          message: data.ResponseDescription,
        },
        {
          status: 400,
        }
      );
    }

    await prisma.payment.create({
      data: {
        saleId,

        method: "MPESA",

        amount: Number(amount),

        status: "PENDING",

        phone,

        checkoutRequestId:
          data.CheckoutRequestID,

        merchantRequestId:
          data.MerchantRequestID,
      },
    });

    return NextResponse.json({
      success: true,

      checkoutRequestId:
        data.CheckoutRequestID,

      customerMessage:
        data.CustomerMessage,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "STK Push failed.",
      },
      {
        status: 500,
      }
    );
  }
}