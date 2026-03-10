import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const roomTypes = await prisma.roomType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      code: true,
      nameKo: true,
      nameEn: true,
      description: true,
      maxGuests: true,
      basePrice: true,
      totalCount: true,
      amenities: true,
      images: true,
    },
  });

  return NextResponse.json(roomTypes);
}
