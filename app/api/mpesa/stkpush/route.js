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

    const { password, timestamp } = generatePassword();

console.log("========== STK REQUEST ==========");
console.log("Shortcode:", process.env.MPESA_SHORTCODE);
console.log("Timestamp:", timestamp);
console.log("Passkey length:", process.env.MPESA_PASSKEY?.length);
console.log("Password length:", password.length);
console.log("Phone:", phone);
console.log("Amount:", amount);
console.log("Callback URL:", process.env.MPESA_CALLBACK_URL);






const payload = {
  BusinessShortCode: process.env.MPESA_SHORTCODE,
  Password: password,
  Timestamp: timestamp,
  TransactionType: "CustomerPayBillOnline",
  Amount: Number(amount),
  PartyA: phone,
  PartyB: process.env.MPESA_SHORTCODE,
  PhoneNumber: phone,
  CallBackURL: process.env.MPESA_CALLBACK_URL,
  AccountReference: saleId,
  TransactionDesc: "Liquor POS Payment",
};

console.log("Payload:", payload);



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
console.log("HTTP STATUS:", response.status);
console.log("SAFARICOM RESPONSE:", JSON.stringify(data, null, 2));


   if (data.ResponseCode !== "0") {
  console.log("STK FAILED:", data);

  return NextResponse.json(
    {
      success: false,
      data,
    },
    {
      status: 400,
    }
  );
}

   await prisma.paymentSession.create({
  data: {
    saleId,

    method: "MPESA",

    amount: Number(amount),

    status: "PENDING",

    phone,

    checkoutRequestId: data.CheckoutRequestID,

    merchantRequestId: data.MerchantRequestID,

    attempts: 1,

    expiresAt: new Date(
      Date.now() + 5 * 60 * 1000 // 5 minutes
    ),
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