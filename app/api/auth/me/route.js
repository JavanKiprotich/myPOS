import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(null, {
        status: 401,
      });
    }

    const user = await verifySession(token);

    if (!user) {
      return NextResponse.json(null, {
        status: 401,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);

    return NextResponse.json(null, {
      status: 401,
    });
  }
}