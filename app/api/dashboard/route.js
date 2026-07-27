import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's Sales
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

    // Today's Transactions
    const todayTransactions = await prisma.sale.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Products
    const totalProducts = await prisma.product.count();

    // Customers
    const totalCustomers = await prisma.customer.count();

    // Outstanding Credit
    const outstandingCredit =
      await prisma.creditAccount.aggregate({
        _sum: {
          balance: true,
        },
      });

    // Inventory Value
    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
      },
    });

    const inventoryValue = inventory.reduce(
      (sum, item) =>
        sum +
        item.quantity *
          Number(item.product.price),
      0
    );

    // Store Settings
    const settings =
      await prisma.storeSettings.findFirst();

    // Low Stock
    const lowStock =
      await prisma.inventory.findMany({
        where: {
          quantity: {
            lte:
              settings?.lowStockAlert ??
              5,
          },
        },
        include: {
          product: true,
        },
        orderBy: {
          quantity: "asc",
        },
      });

    // Recent Sales
    const recentSales =
      await prisma.sale.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          customer: true,
          payments: true,
        },
      });

    // Payment Breakdown
    const paymentTotals =
      await prisma.payment.groupBy({
        by: ["method"],
        _sum: {
          amount: true,
        },
        where: {
          createdAt: {
            gte: today,
          },
        },
      });

    const cashSales =
      Number(
        paymentTotals.find(
          (p) => p.method === "CASH"
        )?._sum.amount
      ) || 0;

    const mpesaSales =
      Number(
        paymentTotals.find(
          (p) => p.method === "MPESA"
        )?._sum.amount
      ) || 0;

    const creditSales =
      Number(
        paymentTotals.find(
          (p) => p.method === "CREDIT"
        )?._sum.amount
      ) || 0;

    // Top Selling Products
    const groupedProducts =
      await prisma.saleItem.groupBy({
        by: ["productId"],
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      });

    const topProducts =
      await Promise.all(
        groupedProducts.map(async (item) => {
          const product =
            await prisma.product.findUnique({
              where: {
                id: item.productId,
              },
            });

          return {
            productId: item.productId,
            quantity:
              item._sum.quantity || 0,
            product,
          };
        })
      );

    return NextResponse.json({
      todaySales:
        Number(todaySales._sum.total) || 0,

      todayTransactions,

      totalProducts,

      totalCustomers,

      outstandingCredit:
        Number(
          outstandingCredit._sum.balance
        ) || 0,

      inventoryValue,

      cashSales,

      mpesaSales,

      creditSales,

      recentSales,

      lowStock,

      topProducts,
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