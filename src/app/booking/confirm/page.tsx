"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { useBookingStore } from "@/stores/booking-store";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function BookingConfirmPage() {
  const router = useRouter();
  const store = useBookingStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!store.roomTypeId || !store.guestName) {
      router.push("/booking");
    }
  }, [store.roomTypeId, store.guestName, router]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ko-KR").format(price);

  const handleSubmit = async () => {
    if (!store.checkIn || !store.checkOut) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomTypeId: store.roomTypeId,
          packageId: store.packageId || undefined,
          checkIn: format(store.checkIn, "yyyy-MM-dd"),
          checkOut: format(store.checkOut, "yyyy-MM-dd"),
          guestsCount: store.guestsCount,
          guestName: store.guestName,
          guestEmail: store.guestEmail,
          guestPhone: store.guestPhone,
          guestCompany: store.guestCompany || undefined,
          specialRequests: store.specialRequests || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "예약 처리 중 오류가 발생했습니다.");
      }

      const data = await res.json();

      // Navigate to complete page with reservation number
      router.push(
        `/booking/complete?no=${data.reservationNo}&price=${data.totalPrice}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  if (!store.checkIn || !store.checkOut) return null;

  return (
    <div className="max-w-3xl mx-auto px-4">
      <StepIndicator currentStep={4} />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">예약 내용을 확인해주세요</h1>
        <p className="text-muted-foreground">
          아래 내용을 확인하고 예약을 완료해주세요
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">예약 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">예약자</span>
              <p className="font-medium">{store.guestName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">연락처</span>
              <p className="font-medium">{store.guestPhone}</p>
            </div>
            <div>
              <span className="text-muted-foreground">이메일</span>
              <p className="font-medium">{store.guestEmail}</p>
            </div>
            {store.guestCompany && (
              <div>
                <span className="text-muted-foreground">회사/소속</span>
                <p className="font-medium">{store.guestCompany}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">체크인</span>
              <p className="font-medium">
                {format(store.checkIn, "yyyy년 M월 d일 (EEE) 15:00", {
                  locale: ko,
                })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">체크아웃</span>
              <p className="font-medium">
                {format(store.checkOut, "yyyy년 M월 d일 (EEE) 11:00", {
                  locale: ko,
                })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">숙박</span>
              <p className="font-medium">{store.nights}박</p>
            </div>
            <div>
              <span className="text-muted-foreground">인원</span>
              <p className="font-medium">{store.guestsCount}명</p>
            </div>
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
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

          {store.specialRequests && (
            <>
              <Separator />
              <div className="text-sm">
                <span className="text-muted-foreground">특별 요청사항</span>
                <p className="font-medium mt-1">{store.specialRequests}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>
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
            <div className="flex justify-between text-lg font-bold pt-1">
              <span>총 결제 예정 금액</span>
              <span>₩{formatPrice(store.totalPrice)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              * 결제는 체크인 시 현장 결제 또는 추후 안내됩니다
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            store.setStep(3);
            router.push("/booking/guest-info");
          }}
          disabled={submitting}
        >
          ← 수정하기
        </Button>
        <Button size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "예약 처리 중..." : "예약 요청하기"}
        </Button>
      </div>
    </div>
  );
}
