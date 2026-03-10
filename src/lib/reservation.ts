import { prisma } from "@/lib/db";

export async function generateReservationNo(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");

  // Count today's reservations
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await prisma.reservation.count({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `HA-${dateStr}-${seq}`;
}

export async function updateInventoryOnBooking(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  increment: number // +1 for booking, -1 for cancellation
): Promise<void> {
  const current = new Date(checkIn);
  while (current < checkOut) {
    await prisma.roomInventory.updateMany({
      where: {
        roomTypeId,
        date: new Date(current),
      },
      data: {
        bookedRooms: { increment },
      },
    });
    current.setDate(current.getDate() + 1);
  }
}
