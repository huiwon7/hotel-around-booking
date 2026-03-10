import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateInventoryOnBooking } from "@/lib/reservation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      guest: true,
      roomType: true,
      package: true,
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(reservation);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If cancelling, release inventory
  if (
    status === "CANCELLED" &&
    reservation.status !== "CANCELLED"
  ) {
    await updateInventoryOnBooking(
      reservation.roomTypeId,
      reservation.checkIn,
      reservation.checkOut,
      -1
    );
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status },
    include: {
      guest: true,
      roomType: { select: { nameKo: true } },
      package: { select: { nameKo: true } },
    },
  });

  return NextResponse.json(updated);
}
