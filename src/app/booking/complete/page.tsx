"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBookingStore } from "@/stores/booking-store";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { Suspense } from "react";

function CompleteContent() {
  const searchParams = useSearchParams();
  const store = useBookingStore();
  const reservationNo = searchParams.get("no") || "";
  const totalPrice = Number(searchParams.get("price") || "0");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ko-KR").format(price);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-primary">✓</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">예약이 접수되었습니다</h1>
        <p className="text-lg font-mono text-primary font-bold">
          {reservationNo}
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            {store.guestEmail && (
              <>
                예약 확인 내용이{" "}
                <span className="font-medium text-foreground">
                  {store.guestEmail}
                </span>
                으로 발송되었습니다.
              </>
            )}
          </p>
          <p className="text-sm text-center text-muted-foreground">
            담당자가 확인 후 연락드리겠습니다.
            <br />
            (영업시간 내 1시간 이내 회신)
          </p>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            {store.checkIn && (
              <div>
                <span className="text-muted-foreground">체크인</span>
                <p className="font-medium">
                  {format(store.checkIn, "yyyy.MM.dd (EEE) 15:00", {
                    locale: ko,
                  })}
                </p>
              </div>
            )}
            {store.checkOut && (
              <div>
                <span className="text-muted-foreground">체크아웃</span>
                <p className="font-medium">
                  {format(store.checkOut, "yyyy.MM.dd (EEE) 11:00", {
                    locale: ko,
                  })}
                </p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">객실</span>
              <p className="font-medium">{store.roomTypeName}</p>
            </div>
            {store.packageName && (
              <div>
                <span className="text-muted-foreground">패키지</span>
                <p className="font-medium">{store.packageName}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>금액</span>
            <span>₩{formatPrice(totalPrice)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" asChild>
          <Link
            href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://aroundpartners.co.kr"}
          >
            호텔 사이트로 돌아가기
          </Link>
        </Button>
        <Button
          asChild
          onClick={() => store.reset()}
        >
          <Link href="/booking">새 예약하기</Link>
        </Button>
      </div>
    </div>
  );
}

export default function BookingCompletePage() {
  return (
    <Suspense fallback={<div className="text-center py-20">로딩 중...</div>}>
      <CompleteContent />
    </Suspense>
  );
}
