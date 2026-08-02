import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStoreId } from "@/lib/store";

export async function GET() {
  try {
    const storeId = await getCurrentStoreId();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's Sales
    const todaySales = await prisma.sale.aggregate({
      _sum: {
        total: true,
      },
      where: {
        storeId,
        createdAt: {
          gte: today,
        },
      },
    });

    // Today's Transactions
    const todayTransactions = await prisma.sale.count({
      where: {
        storeId,
        createdAt: {
          gte: today,
        },
      },
    });

    // Products in current store
    const totalProducts = await prisma.inventory.count({
      where: {
        storeId,
      },
    });

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
      where: {
        storeId,
      },
      include: {
        product: true,
      },
    });

    const inventoryValue = inventory.reduce(
      (sum, item) =>
        sum + item.quantity * Number(item.product.price),
      0
    );

    // Store Settings
    const settings =
      await prisma.storeSettings.findUnique({
        where: {
          storeId,
        },
      });

    // Low Stock
    const lowStock =
      await prisma.inventory.findMany({
        where: {
          storeId,
          quantity: {
            lte: settings?.lowStockAlert ?? 5,
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
        where: {
          storeId,
        },
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
          sale: {
            storeId,
          },
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

    // Weekly Sales
    const weeklySales = [];

    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const sales = await prisma.sale.aggregate({
        _sum: {
          total: true,
        },
        where: {
          storeId,
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      });

      weeklySales.push({
        day: start.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        sales: Number(sales._sum.total) || 0,
      });
    }

    // Top Products
    const groupedProducts =
      await prisma.saleItem.groupBy({
        by: ["productId"],
        where: {
          sale: {
            storeId,
          },
        },
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

    const topProducts = await Promise.all(
      groupedProducts.map(async (item) => {
        const product =
          await prisma.product.findUnique({
            where: {
              id: item.productId,
            },
          });

        return {
          productId: item.productId,
          quantity: item._sum.quantity || 0,
          product,
        };
      })
    );

    return NextResponse.json({
      todaySales: Number(todaySales._sum.total) || 0,
      todayTransactions,
      totalProducts,
      totalCustomers,
      outstandingCredit:
        Number(outstandingCredit._sum.balance) || 0,
      inventoryValue,
      cashSales,
      mpesaSales,
      creditSales,
      recentSales,
      lowStock,
      topProducts,
      weeklySales,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}