import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } =
      await request.json();

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      await createSession(user);

    const response =
      NextResponse.json({
        success: true,
      });

    response.cookies.set(
      "session",
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge:
          60 * 60 * 24 * 7,
      }
    );

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Login failed",
      },
      {
        status: 500,
      }
    );
  }
}