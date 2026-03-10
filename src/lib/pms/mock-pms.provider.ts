import { prisma } from "@/lib/db";
import { IPmsProvider } from "./pms-provider.interface";
import {
  PmsRoomAvailability,
  PmsRoomType,
  PmsReservation,
  CreatePmsReservationDto,
} from "./types";

export class MockPmsProvider implements IPmsProvider {
  async getAvailability(
    checkIn: Date,
    checkOut: Date,
    roomTypeId?: string
  ): Promise<PmsRoomAvailability[]> {
    const where: Record<string, unknown> = {
      date: { gte: checkIn, lt: checkOut },
      isClosed: false,
    };
    if (roomTypeId) where.roomTypeId = roomTypeId;

    const inventory = await prisma.roomInventory.findMany({
      where,
      include: { roomType: true },
      orderBy: [{ roomTypeId: "asc" }, { date: "asc" }],
    });

    return inventory.map((inv) => ({
      roomTypeId: inv.roomTypeId,
      date: inv.date.toISOString().split("T")[0],
      available: inv.totalRooms - inv.bookedRooms,
      price: inv.priceOverride ?? inv.roomType.basePrice,
    }));
  }

  async createReservation(
    data: CreatePmsReservationDto
  ): Promise<PmsReservation> {
    // Mock PMS: just return a confirmation with a generated ID
    return {
      id: `MOCK-${Date.now()}`,
      guestName: data.guestName,
      roomTypeId: data.roomTypeId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestsCount: data.guestsCount,
      status: "confirmed",
    };
  }

  async cancelReservation(_reservationId: string): Promise<boolean> {
    return true;
  }

  async getReservation(
    reservationId: string
  ): Promise<PmsReservation | null> {
    const reservation = await prisma.reservation.findFirst({
      where: { pmsReservationId: reservationId },
      include: { guest: true },
    });

    if (!reservation) return null;

    return {
      id: reservationId,
      guestName: reservation.guest.name,
      roomTypeId: reservation.roomTypeId,
      checkIn: reservation.checkIn.toISOString().split("T")[0],
      checkOut: reservation.checkOut.toISOString().split("T")[0],
      guestsCount: reservation.guestsCount,
      status: reservation.status === "CANCELLED" ? "cancelled" : "confirmed",
    };
  }

  async syncRoomTypes(): Promise<PmsRoomType[]> {
    const roomTypes = await prisma.roomType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return roomTypes.map((rt) => ({
      id: rt.id,
      code: rt.code,
      name: rt.nameKo,
      maxGuests: rt.maxGuests,
      totalCount: rt.totalCount,
      basePrice: rt.basePrice,
    }));
  }

  async syncInventory(dateFrom: Date, dateTo: Date): Promise<void> {
    // Mock PMS: ensure inventory records exist for all room types and dates
    const roomTypes = await prisma.roomType.findMany({
      where: { isActive: true },
    });

    const dates: Date[] = [];
    const current = new Date(dateFrom);
    while (current < dateTo) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    for (const rt of roomTypes) {
      for (const date of dates) {
        await prisma.roomInventory.upsert({
          where: {
            roomTypeId_date: { roomTypeId: rt.id, date },
          },
          update: {},
          create: {
            roomTypeId: rt.id,
            date,
            totalRooms: rt.totalCount,
            bookedRooms: 0,
          },
        });
      }
    }
  }
}
