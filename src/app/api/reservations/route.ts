import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateReservationNo, updateInventoryOnBooking } from "@/lib/reservation";
import { calculatePrice } from "@/lib/pricing";
import { createPmsProvider } from "@/lib/pms/pms-factory";
import { sendTelegramNotification } from "@/lib/notifications/telegram";
import { z } from "zod";

const createReservationSchema = z.object({
  roomTypeId: z.string().uuid(),
  packageId: z.string().uuid().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestsCount: z.number().int().min(1).max(20),
  guestName: z.string().min(1).max(100),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(1).max(20),
  guestCompany: z.string().optional(),
  specialRequests: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: {
        guest: true,
        roomType: { select: { nameKo: true, code: true } },
        package: { select: { nameKo: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.reservation.count({ where }),
  ]);

  return NextResponse.json({
    data: reservations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = createReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);

  // Verify availability
  const pms = createPmsProvider();
  const availability = await pms.getAvailability(checkIn, checkOut, data.roomTypeId);

  const allAvailable = availability.every((a) => a.available > 0);
  if (!allAvailable) {
    return NextResponse.json(
      { error: "선택하신 날짜에 이용 가능한 객실이 없습니다." },
      { status: 409 }
    );
  }

  // Calculate price
  const pricing = await calculatePrice({
    roomTypeId: data.roomTypeId,
    checkIn,
    checkOut,
    packageId: data.packageId,
  });

  // Create guest
  const guest = await prisma.guest.create({
    data: {
      name: data.guestName,
      email: data.guestEmail,
      phone: data.guestPhone,
      company: data.guestCompany || null,
    },
  });

  // Generate reservation number
  const reservationNo = await generateReservationNo();

  // Create reservation
  const reservation = await prisma.reservation.create({
    data: {
      reservationNo,
      guestId: guest.id,
      roomTypeId: data.roomTypeId,
      packageId: data.packageId || null,
      checkIn,
      checkOut,
      nights: pricing.nights,
      guestsCount: data.guestsCount,
      totalPrice: pricing.totalPrice,
      specialRequests: data.specialRequests || null,
      source: "WEBSITE",
    },
    include: {
      roomType: { select: { nameKo: true } },
      package: { select: { nameKo: true } },
    },
  });

  // Update inventory
  await updateInventoryOnBooking(data.roomTypeId, checkIn, checkOut, 1);

  // Send PMS notification
  try {
    await pms.createReservation({
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      roomTypeId: data.roomTypeId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestsCount: data.guestsCount,
      specialRequests: data.specialRequests,
    });
  } catch (e) {
    console.error("PMS notification failed:", e);
  }

  // Send Telegram notification
  try {
    const sent = await sendTelegramNotification({
      reservationNo,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      roomType: reservation.roomType.nameKo,
      packageName: reservation.package?.nameKo,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      nights: pricing.nights,
      guestsCount: data.guestsCount,
      totalPrice: pricing.totalPrice,
    });

    if (sent) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { telegramNotified: true },
      });
    }
  } catch (e) {
    console.error("Telegram notification failed:", e);
  }

  return NextResponse.json(
    {
      reservationNo,
      id: reservation.id,
      status: reservation.status,
      totalPrice: pricing.totalPrice,
      pricing,
    },
    { status: 201 }
  );
}
