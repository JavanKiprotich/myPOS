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

    if (!session?.storeId) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const expenses = await prisma.expense.findMany({
      where: {
        storeId: String(session.storeId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Expenses GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch expenses.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
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

    if (!session?.storeId) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const category = String(
      body.category || ""
    ).trim();

    const description = String(
      body.description || ""
    ).trim();

    const amount = Number(body.amount);

    if (!category) {
      return NextResponse.json(
        {
          error: "Expense category is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          error: "Expense description is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: "Enter a valid expense amount.",
        },
        {
          status: 400,
        }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        storeId: String(session.storeId),
        category,
        description,
        amount,
      },
    });

    return NextResponse.json(
      expense,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Expenses POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save expense.",
      },
      {
        status: 500,
      }
    );
  }
}