import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(null, {
        status: 401,
      });
    }

    const session = await verifySession(token);

    if (
      !session ||
      !session.id ||
      !session.storeId
    ) {
      return NextResponse.json(null, {
        status: 401,
      });
    }

    const store = await prisma.store.findUnique({
      where: {
        id: String(session.storeId),
      },
      select: {
        id: true,
        name: true,
        location: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        {
          error: "Store not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      id: String(session.id),
      name: String(session.name || ""),
      email: String(session.email || ""),
      role: String(session.role || ""),
      storeId: String(session.storeId),

      store: {
        id: store.id,
        name: store.name,
        location: store.location,
      },
    });
  } catch (error) {
    console.error("Auth/me error:", error);

    return NextResponse.json(null, {
      status: 401,
    });
  }
}