import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        creditAccount: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Customers GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch customers.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();

    if (!name) {
      return NextResponse.json(
        {
          error: "Customer name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error: "Phone number is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingCustomer =
      await prisma.customer.findUnique({
        where: {
          phone,
        },
      });

    if (existingCustomer) {
      return NextResponse.json(
        {
          error:
            "A customer with this phone number already exists.",
        },
        {
          status: 400,
        }
      );
    }

    const customer =
      await prisma.customer.create({
        data: {
          name,
          phone,
        },

        include: {
          creditAccount: true,
        },
      });

    return NextResponse.json(
      customer,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Customers POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create customer.",
      },
      {
        status: 500,
      }
    );
  }
}