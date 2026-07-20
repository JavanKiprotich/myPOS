import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { pin } = await request.json();

    const user = await prisma.user.findFirst({
      where: {
        pin,
        role: {
          in: ["ADMIN", "MANAGER"],
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          valid: false,
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      valid: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        valid: false,
      },
      {
        status: 500,
      }
    );
  }
}