import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const todaySales = await prisma.sale.aggregate({
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const totalProducts = await prisma.product.count();

    const totalCustomers = await prisma.customer.count();

    const outstandingCredit =
      await prisma.creditAccount.aggregate({
        _sum: {
          balance: true,
        },
      });

    const lowStock = await prisma.inventory.findMany({
      where: {
        quantity: {
          lt: 5,
        },
      },
      include: {
        product: true,
      },
    });

    const recentSales = await prisma.sale.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        customer: true,
      },
    });

    return NextResponse.json({
      todaySales:
        Number(todaySales._sum.total) || 0,

      totalProducts,

      totalCustomers,

      outstandingCredit:
        Number(
          outstandingCredit._sum.balance
        ) || 0,

      lowStock,

      recentSales,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load dashboard",
      },
      {
        status: 500,
      }
    );
  }
}