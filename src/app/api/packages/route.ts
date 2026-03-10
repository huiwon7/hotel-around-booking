import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      code: true,
      nameKo: true,
      nameEn: true,
      description: true,
      nights: true,
      basePrice: true,
      perNight: true,
      discountPct: true,
      features: true,
    },
  });

  return NextResponse.json(packages);
}
