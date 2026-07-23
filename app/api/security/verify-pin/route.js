import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.id,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    if (!currentUser.active) {
      return NextResponse.json(
        { error: "User account is disabled." },
        { status: 403 }
      );
    }

    if (
      currentUser.role !== "ADMIN" &&
      currentUser.role !== "MANAGER"
    ) {
      return NextResponse.json(
        { error: "Permission denied." },
        { status: 403 }
      );
    }

    if (!currentUser.pin) {
      return NextResponse.json(
        { error: "No PIN has been configured for this account." },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(
      body.pin,
      currentUser.pin
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect PIN." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "PIN verification failed." },
      { status: 500 }
    );
  }
}