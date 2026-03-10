import { prisma } from "@/lib/db";

interface PriceCalculationResult {
  perNight: number;
  nights: number;
  roomTotal: number;
  packageDiscount: number;
  totalPrice: number;
}

export async function calculatePrice(params: {
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
  packageId?: string;
}): Promise<PriceCalculationResult> {
  const { roomTypeId, checkIn, checkOut, packageId } = params;

  // Get room type base price
  const roomType = await prisma.roomType.findUniqueOrThrow({
    where: { id: roomTypeId },
  });

  // Calculate nights
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check for date-specific price overrides in inventory
  const inventoryItems = await prisma.roomInventory.findMany({
    where: {
      roomTypeId,
      date: { gte: checkIn, lt: checkOut },
    },
    orderBy: { date: "asc" },
  });

  // Sum up daily prices (use override if exists, otherwise base price)
  let roomTotal = 0;
  const datesCovered = new Set<string>();

  for (const inv of inventoryItems) {
    const dateKey = inv.date.toISOString().split("T")[0];
    datesCovered.add(dateKey);
    roomTotal += inv.priceOverride ?? roomType.basePrice;
  }

  // For any dates without inventory records, use base price
  const current = new Date(checkIn);
  while (current < checkOut) {
    const dateKey = current.toISOString().split("T")[0];
    if (!datesCovered.has(dateKey)) {
      roomTotal += roomType.basePrice;
    }
    current.setDate(current.getDate() + 1);
  }

  const perNight = Math.round(roomTotal / nights);

  // Apply package discount if applicable
  let packageDiscount = 0;
  if (packageId) {
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });
    if (pkg && pkg.discountPct > 0) {
      packageDiscount = Math.round(roomTotal * (pkg.discountPct / 100));
    }
  }

  return {
    perNight,
    nights,
    roomTotal,
    packageDiscount,
    totalPrice: roomTotal - packageDiscount,
  };
}
