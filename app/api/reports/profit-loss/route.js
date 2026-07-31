import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function GET(request) {
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

    if (!session?.storeId) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    const now = new Date();

    const start = startParam
      ? new Date(`${startParam}T00:00:00.000`)
      : new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );

    const end = endParam
      ? new Date(`${endParam}T23:59:59.999`)
      : new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date range." },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: "Start date cannot be after end date." },
        { status: 400 }
      );
    }

    const storeId = String(session.storeId);

    const sales = await prisma.sale.findMany({
      where: {
        storeId,
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "COMPLETED",
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        storeId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    let revenue = 0;
    let cogs = 0;

    for (const sale of sales) {
      revenue += Number(sale.total);

      for (const item of sale.items) {
        cogs +=
          Number(item.unitCost) * item.quantity;
      }
    }

    const expenseTotal = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount),
      0
    );

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenseTotal;

    const grossMargin =
      revenue > 0
        ? (grossProfit / revenue) * 100
        : 0;

    const netMargin =
      revenue > 0
        ? (netProfit / revenue) * 100
        : 0;

    return NextResponse.json({
      period: {
        start,
        end,
      },

      revenue,
      cogs,
      grossProfit,
      expenses: expenseTotal,
      netProfit,

      grossMargin,
      netMargin,

      salesCount: sales.length,
      expenseCount: expenses.length,

      storeId,
    });
  } catch (error) {
    console.error(
      "Profit & Loss report error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate Profit & Loss report.",
      },
      {
        status: 500,
      }
    );
  }
}