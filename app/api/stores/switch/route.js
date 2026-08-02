import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession, createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can switch stores." },
        { status: 403 }
      );
    }

    const { storeId } = await request.json();

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 }
      );
    }

    const newToken = await createSession({
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      storeId: store.id,
    });

    cookieStore.set("session", newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to switch store.",
      },
      {
        status: 500,
      }
    );
  }
}