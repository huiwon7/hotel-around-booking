"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { useBookingStore } from "@/stores/booking-store";
import { useEffect } from "react";

export default function BookingGuestInfoPage() {
  const router = useRouter();
  const store = useBookingStore();

  useEffect(() => {
    if (!store.roomTypeId) {
      router.push("/booking");
    }
  }, [store.roomTypeId, router]);

  const isValid =
    store.guestName.trim().length > 0 &&
    store.guestEmail.trim().length > 0 &&
    store.guestPhone.trim().length > 0 &&
    store.privacyAgreed;

  const handleNext = () => {
    if (!isValid) return;
    store.setStep(4);
    router.push("/booking/confirm");
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <StepIndicator currentStep={3} />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">고객 정보를 입력하세요</h1>
        <p className="text-muted-foreground">
          예약자 정보를 입력해주세요
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">예약자 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    이름 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="홍길동"
                    value={store.guestName}
                    onChange={(e) =>
                      store.setGuestInfo({ guestName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">회사/소속</Label>
                  <Input
                    id="company"
                    placeholder="(선택)"
                    value={store.guestCompany}
                    onChange={(e) =>
                      store.setGuestInfo({ guestCompany: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    이메일 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={store.guestEmail}
                    onChange={(e) =>
                      store.setGuestInfo({ guestEmail: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    연락처 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="010-1234-5678"
                    value={store.guestPhone}
                    onChange={(e) =>
                      store.setGuestInfo({ guestPhone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requests">특별 요청사항</Label>
                <Textarea
                  id="requests"
                  placeholder="예: 고층 객실 희망, 늦은 체크인 등"
                  rows={3}
                  value={store.specialRequests}
                  onChange={(e) =>
                    store.setGuestInfo({ specialRequests: e.target.value })
                  }
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-[var(--primary)]"
                    checked={store.privacyAgreed}
                    onChange={(e) =>
                      store.setGuestInfo({ privacyAgreed: e.target.checked })
                    }
                  />
                  <span className="text-sm">
                    개인정보 처리방침에 동의합니다{" "}
                    <span className="text-destructive">(필수)</span>
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-[var(--primary)]"
                    checked={store.marketingAgreed}
                    onChange={(e) =>
                      store.setGuestInfo({ marketingAgreed: e.target.checked })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <BookingSummary />
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => {
            store.setStep(2);
            router.push("/booking/rooms");
          }}
        >
          ← 이전
        </Button>
        <Button size="lg" onClick={handleNext} disabled={!isValid}>
          예약 확인 →
        </Button>
      </div>
    </div>
  );
}
