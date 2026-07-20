import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    return NextResponse.json({
      id,
      body,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 }
    );
  }
}