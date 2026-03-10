"use client";

import { useBookingStore } from "@/stores/booking-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function BookingSummary() {
  const store = useBookingStore();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ko-KR").format(price);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">예약 요약</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {store.checkIn && store.checkOut && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">체크인</span>
              <span className="font-medium">
                {format(store.checkIn, "yyyy.MM.dd (EEE)", { locale: ko })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">체크아웃</span>
              <span className="font-medium">
                {format(store.checkOut, "yyyy.MM.dd (EEE)", { locale: ko })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">숙박</span>
              <span className="font-medium">{store.nights}박</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">인원</span>
              <span className="font-medium">{store.guestsCount}명</span>
            </div>
          </>
        )}

        {store.roomTypeName && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">객실</span>
              <span className="font-medium">{store.roomTypeName}</span>
            </div>
          </>
        )}

        {store.packageName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">패키지</span>
            <span className="font-medium">{store.packageName}</span>
          </div>
        )}

        {store.totalPrice > 0 && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {store.roomTypeName} x {store.nights}박
              </span>
              <span>₩{formatPrice(store.roomTotal)}</span>
            </div>
            {store.packageDiscount > 0 && (
              <div className="flex justify-between text-primary">
                <span>패키지 할인</span>
                <span>-₩{formatPrice(store.packageDiscount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>합계</span>
              <span>₩{formatPrice(store.totalPrice)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
