import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        store: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

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

    const existing = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      body.password,
      10
    );

    const hashedPin = body.pin
      ? await bcrypt.hash(body.pin, 10)
      : null;

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        pin: hashedPin,
        role: body.role,
        active: true,
        storeId: session.storeId,
      },
    });

  await logAudit({
  userId: session.id,
  action: "USER_CREATED",
  target: user.name,
  details: `Created ${user.role} account`,
});



    return NextResponse.json(user, {
      status: 201,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}