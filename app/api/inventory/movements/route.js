import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const movements =
      await prisma.inventoryMovement.findMany({
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      movements
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json([], {
      status: 200,
    });
  }
}