import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STORE_ID = "cmrj98gz70000mneof8jfrrlv";

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: {
        storeId: STORE_ID,
      },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          storeId: STORE_ID,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }

  
}

export async function PUT(request) {
  try {
    const body = await request.json();

    const settings = await prisma.storeSettings.upsert({
      where: {
        storeId: STORE_ID,
      },
      update: body,
      create: {
        storeId: STORE_ID,
        ...body,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}