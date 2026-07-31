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
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    const stores = await prisma.store.findMany({

 where: {
    active: true,
  },

      orderBy: {
        name: "asc",
      },
      select: {
  id: true,
  name: true,
  location: true,
  active: true,
  createdAt: true,
},
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load stores.",
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
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Only administrators can create stores.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const name = String(
      body.name || ""
    ).trim();

    const location = String(
      body.location || ""
    ).trim();

    if (!name) {
      return NextResponse.json(
        {
          error: "Store name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingStore =
      await prisma.store.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
      });

    if (existingStore) {
      return NextResponse.json(
        {
          error:
            "A store with this name already exists.",
        },
        {
          status: 400,
        }
      );
    }

    const store =
      await prisma.store.create({
        data: {
          name,
          location: location || null,
        },
        select: {
  id: true,
  name: true,
  location: true,
  active: true,
  createdAt: true,
},
      });

    return NextResponse.json(
      store,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create store.",
      },
      {
        status: 500,
      }
    );
  }
}