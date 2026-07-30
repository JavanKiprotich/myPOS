import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/mpesa";

export async function POST() {
  try {
    const token = await getAccessToken();

    return NextResponse.json({
      success: true,
      token,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}