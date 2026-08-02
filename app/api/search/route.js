import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getCurrentStoreId } from "@/lib/store";

export async function GET(request) {
  try {
const storeId = await getCurrentStoreId();

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({
        products: [],
        customers: [],
        sales: [],
      });
    }

    const search = q.toLowerCase();

    const [products, customers, sales] =
      await Promise.all([
        prisma.product.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                sku: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                barcode: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          },

          orderBy: {
            name: "asc",
          },

          take: 8,

          select: {
            id: true,
            name: true,
            sku: true,
            barcode: true,
            category: true,
            unit: true,
            price: true,
            costPrice: true,

            inventory: {
              where: {
                storeId,
              },

              select: {
                quantity: true,
              },
            },
          },
        }),

        prisma.customer.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                phone: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          },

          orderBy: {
            name: "asc",
          },

          take: 8,

          select: {
            id: true,
            name: true,
            phone: true,

            creditAccount: {
              select: {
                balance: true,
              },
            },
          },
        }),

        prisma.sale.findMany({
          where: {
            storeId,

            OR: [
              {
                id: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                customer: {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 8,

          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,

            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      ]);

    return NextResponse.json({
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        unit: product.unit,
        sellingPrice: Number(product.price),
        costPrice: Number(product.costPrice),
        stock:
          product.inventory[0]?.quantity ?? 0,
      })),

      customers: customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        balance: Number(
          customer.creditAccount?.balance ?? 0
        ),
      })),

      sales: sales.map((sale) => ({
        id: sale.id,
        total: Number(sale.total),
        status: sale.status,
        createdAt: sale.createdAt,
        customer: sale.customer,
      })),
    });
  } catch (error) {
    console.error("Global search error:", error);

    return NextResponse.json(
      {
        error: "Search failed.",
        products: [],
        customers: [],
        sales: [],
      },
      {
        status: 500,
      }
    );
  }
}