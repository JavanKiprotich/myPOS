import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated." },
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

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const updateData = {
      name: body.name,
      email: body.email,
      role: body.role,
      active: body.active,
    };

    if (body.password) {
      updateData.password = await bcrypt.hash(
        body.password,
        10
      );
    }

    if (body.pin) {
      updateData.pin = await bcrypt.hash(
        body.pin,
        10
      );
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
    });

    await logAudit({
      userId: session.id,
      action: "USER_UPDATED",
      target: user.name,
      details: `Updated user details (Role: ${user.role})`,
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated." },
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

    // Prevent changing your own status
    if (session.id === id) {
      return NextResponse.json(
        {
          error: "You cannot deactivate or activate your own account.",
        },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Prevent disabling the last active administrator
    if (
      targetUser.role === "ADMIN" &&
      targetUser.active
    ) {
      const adminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          active: true,
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "Cannot deactivate the last active administrator.",
          },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        active: !targetUser.active,
      },
    });

    await logAudit({
      userId: session.id,
      action: updatedUser.active
        ? "USER_ACTIVATED"
        : "USER_DEACTIVATED",
      target: targetUser.name,
      details: `Status changed to ${
        updatedUser.active ? "Active" : "Disabled"
      }`,
    });

    return NextResponse.json({
      success: true,
      active: updatedUser.active,
      message: updatedUser.active
        ? "User activated successfully."
        : "User deactivated successfully.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update user status.",
      },
      {
        status: 500,
      }
    );
  }
}