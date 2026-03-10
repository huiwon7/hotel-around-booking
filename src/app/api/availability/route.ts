import { NextRequest, NextResponse } from "next/server";
import { createPmsProvider } from "@/lib/pms/pms-factory";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const checkInStr = searchParams.get("checkIn");
  const checkOutStr = searchParams.get("checkOut");
  const roomTypeId = searchParams.get("roomTypeId");

  if (!checkInStr || !checkOutStr) {
    return NextResponse.json(
      { error: "checkIn and checkOut are required" },
      { status: 400 }
    );
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return NextResponse.json(
      { error: "Invalid date format" },
      { status: 400 }
    );
  }

  if (checkIn >= checkOut) {
    return NextResponse.json(
      { error: "checkOut must be after checkIn" },
      { status: 400 }
    );
  }

  const pms = createPmsProvider();
  const availability = await pms.getAvailability(
    checkIn,
    checkOut,
    roomTypeId || undefined
  );

  // Group by room type and find minimum availability across all dates
  const grouped: Record<string, { minAvailable: number; prices: number[] }> = {};

  for (const item of availability) {
    if (!grouped[item.roomTypeId]) {
      grouped[item.roomTypeId] = { minAvailable: Infinity, prices: [] };
    }
    grouped[item.roomTypeId].minAvailable = Math.min(
      grouped[item.roomTypeId].minAvailable,
      item.available
    );
    grouped[item.roomTypeId].prices.push(item.price);
  }

  const summary = Object.entries(grouped).map(([roomTypeId, data]) => ({
    roomTypeId,
    available: data.minAvailable === Infinity ? 0 : data.minAvailable,
    avgPrice: Math.round(
      data.prices.reduce((a, b) => a + b, 0) / data.prices.length
    ),
    minPrice: Math.min(...data.prices),
    maxPrice: Math.max(...data.prices),
  }));

  return NextResponse.json({
    checkIn: checkInStr,
    checkOut: checkOutStr,
    availability: summary,
    details: availability,
  });
}
