import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  const session = await verifySession(token);

  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json();

    const name = String(body.name || "").trim();
    const location = String(
      body.location || ""
    ).trim();

    if (!name) {
      return NextResponse.json(
        {
          error: "Store name is required.",
        },
        { status: 400 }
      );
    }

    const existingStore =
      await prisma.store.findUnique({
        where: { id },
      });

    if (!existingStore) {
      return NextResponse.json(
        {
          error: "Store not found.",
        },
        { status: 404 }
      );
    }

    const duplicate =
      await prisma.store.findFirst({
        where: {
          id: { not: id },
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "Another store already uses this name.",
        },
        { status: 400 }
      );
    }

    const store =
      await prisma.store.update({
        where: { id },
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

    return NextResponse.json(store);
  } catch (error) {
    console.error("Store PUT error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update store.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json();

    if (typeof body.active !== "boolean") {
      return NextResponse.json(
        {
          error: "Active status is required.",
        },
        { status: 400 }
      );
    }

    const store =
      await prisma.store.findUnique({
        where: { id },
        include: {
          users: {
            where: {
              active: true,
            },
            select: {
              id: true,
              name: true,
            },
          },
          runningBills: {
            where: {
              status: "OPEN",
            },
            select: {
              id: true,
            },
          },
        },
      });

    if (!store) {
      return NextResponse.json(
        {
          error: "Store not found.",
        },
        { status: 404 }
      );
    }

    // Don't deactivate a store that still
    // has open running bills.
    if (
      body.active === false &&
      store.runningBills.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot deactivate a store with open running bills.",
        },
        { status: 400 }
      );
    }

    const updatedStore =
      await prisma.store.update({
        where: { id },
        data: {
          active: body.active,
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
      updatedStore
    );
  } catch (error) {
    console.error(
      "Store PATCH error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update store status.",
      },
      { status: 500 }
    );
  }
}