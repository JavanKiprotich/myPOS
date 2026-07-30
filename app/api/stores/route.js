import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const stores = await prisma.store.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Failed to fetch stores:", error);

    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}