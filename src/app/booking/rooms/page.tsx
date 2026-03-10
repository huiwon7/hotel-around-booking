"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { useBookingStore } from "@/stores/booking-store";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RoomType {
  id: string;
  code: string;
  nameKo: string;
  description: string;
  maxGuests: number;
  basePrice: number;
  amenities: string[];
}

interface AvailabilityItem {
  roomTypeId: string;
  available: number;
  avgPrice: number;
}

interface PackageItem {
  id: string;
  code: string;
  nameKo: string;
  description: string;
  nights: number;
  basePrice: number;
  perNight: number;
  discountPct: number;
  features: string[];
}

export default function BookingRoomsPage() {
  const router = useRouter();
  const store = useBookingStore();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(store.roomTypeId);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(store.packageId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store.checkIn || !store.checkOut) {
      router.push("/booking");
      return;
    }

    const checkIn = format(store.checkIn, "yyyy-MM-dd");
    const checkOut = format(store.checkOut, "yyyy-MM-dd");

    Promise.all([
      fetch("/api/rooms").then((r) => r.json()),
      fetch(`/api/availability?checkIn=${checkIn}&checkOut=${checkOut}`).then(
        (r) => r.json()
      ),
      fetch("/api/packages").then((r) => r.json()),
    ]).then(([roomData, availData, pkgData]) => {
      setRooms(roomData);
      setAvailability(availData.availability || []);
      setPackages(pkgData.filter((p: PackageItem) => p.code !== "custom"));
      setLoading(false);
    });
  }, [store.checkIn, store.checkOut, router]);

  const getAvailability = (roomTypeId: string) =>
    availability.find((a) => a.roomTypeId === roomTypeId);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ko-KR").format(price);

  const handleSelectRoom = (room: RoomType) => {
    setSelectedRoom(room.id);
    store.setRoom(room.id, room.nameKo);
  };

  const handleSelectPackage = (pkg: PackageItem | null) => {
    if (pkg) {
      setSelectedPkg(pkg.id);
      store.setPackage(pkg.id, pkg.nameKo);
    } else {
      setSelectedPkg(null);
      store.setPackage(null, null);
    }
  };

  const handleNext = async () => {
    if (!selectedRoom || !store.checkIn || !store.checkOut) return;

    // Fetch calculated price
    const res = await fetch("/api/availability?checkIn=" +
      format(store.checkIn, "yyyy-MM-dd") +
      "&checkOut=" +
      format(store.checkOut, "yyyy-MM-dd") +
      "&roomTypeId=" + selectedRoom
    );
    const data = await res.json();

    const avail = data.availability?.[0];
    if (avail) {
      const roomTotal = avail.avgPrice * store.nights;
      const selectedPkgData = packages.find((p) => p.id === selectedPkg);
      const discount = selectedPkgData
        ? Math.round(roomTotal * (selectedPkgData.discountPct / 100))
        : 0;

      store.setPricing({
        perNight: avail.avgPrice,
        nights: store.nights,
        roomTotal,
        packageDiscount: discount,
        totalPrice: roomTotal - discount,
      });
    }

    store.setStep(3);
    router.push("/booking/guest-info");
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <StepIndicator currentStep={2} />
        <div className="text-center py-20 text-muted-foreground">
          객실 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <StepIndicator currentStep={2} />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">객실과 패키지를 선택하세요</h1>
        <p className="text-muted-foreground">
          {store.checkIn &&
            format(store.checkIn, "M.dd(EEE)", { locale: undefined })}
          {" ~ "}
          {store.checkOut &&
            format(store.checkOut, "M.dd(EEE)", { locale: undefined })}
          {" · "}
          {store.nights}박 · {store.guestsCount}명
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Room Types */}
          <div>
            <h2 className="text-lg font-semibold mb-4">객실 타입</h2>
            <div className="space-y-4">
              {rooms.map((room) => {
                const avail = getAvailability(room.id);
                const isAvailable = avail && avail.available > 0;
                const isSelected = selectedRoom === room.id;

                return (
                  <Card
                    key={room.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      isSelected && "ring-2 ring-primary",
                      !isAvailable && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => isAvailable && handleSelectRoom(room)}
                  >
                    <CardContent className="flex items-center gap-6 p-5">
                      <div className="w-28 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs shrink-0">
                        {room.nameKo}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{room.nameKo}</h3>
                          <span className="text-xs text-muted-foreground">
                            ({room.nameKo === "호텔룸" ? "Hotel Room" : room.nameKo === "테라스룸" ? "Terrace Room" : "Villa"})
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          최대 {room.maxGuests}인 · {room.description?.slice(0, 40)}...
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold">
                            ₩{formatPrice(avail?.avgPrice || room.basePrice)}
                          </span>
                          <span className="text-sm text-muted-foreground">/박</span>
                          {isAvailable ? (
                            <Badge variant="secondary">잔여 {avail.available}실</Badge>
                          ) : (
                            <Badge variant="destructive">매진</Badge>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                          ✓
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Packages */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              패키지 선택 <span className="text-sm font-normal text-muted-foreground">(선택사항)</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {packages.map((pkg) => {
                const isApplicable = store.nights >= pkg.nights;
                const isSelected = selectedPkg === pkg.id;

                return (
                  <Card
                    key={pkg.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      isSelected && "ring-2 ring-primary",
                      !isApplicable && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() =>
                      isApplicable &&
                      handleSelectPackage(isSelected ? null : pkg)
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{pkg.nameKo}</h3>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pkg.nights}박 · ₩{formatPrice(pkg.basePrice)}
                      </p>
                      {pkg.discountPct > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {pkg.discountPct}% 할인
                        </Badge>
                      )}
                      {!isApplicable && (
                        <p className="text-xs text-destructive mt-1">
                          {pkg.nights}박 이상 체류 시 적용 가능
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <BookingSummary />
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => { store.setStep(1); router.push("/booking"); }}>
          ← 이전
        </Button>
        <Button size="lg" onClick={handleNext} disabled={!selectedRoom}>
          고객 정보 입력 →
        </Button>
      </div>
    </div>
  );
}
