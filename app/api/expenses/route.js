import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error(error);

    return NextResponse.json([], {
      status: 200,
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const expense = await prisma.expense.create({
      data: {
        category: body.category,
        description: body.description,
        amount: Number(body.amount),
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to save expense",
      },
      {
        status: 500,
      }
    );
  }
}