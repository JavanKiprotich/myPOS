import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getCurrentStoreId } from "@/lib/store";

export async function GET() {
  try {

const storeId = await getCurrentStoreId();

    let settings = await prisma.storeSettings.findUnique({
      where: {
        storeId,
      },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          storeId,
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

const storeId = await getCurrentStoreId();

    const body = await request.json();

    const settings = await prisma.storeSettings.upsert({
      where: {
        storeId,
      },
      update: body,
      create: {
        storeId,
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