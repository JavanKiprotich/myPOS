import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(logs);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch audit logs.",
      },
      {
        status: 500,
      }
    );
  }
}