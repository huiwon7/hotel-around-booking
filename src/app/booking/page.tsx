"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { useBookingStore } from "@/stores/booking-store";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { ko } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export default function BookingDatePage() {
  const router = useRouter();
  const { setDates, setGuestsCount, guestsCount, setStep } = useBookingStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const today = startOfDay(new Date());

  const handleNext = () => {
    if (!dateRange?.from || !dateRange?.to) return;
    setDates(dateRange.from, dateRange.to);
    setStep(2);
    router.push("/booking/rooms");
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <StepIndicator currentStep={1} />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">날짜를 선택하세요</h1>
        <p className="text-muted-foreground">
          체크인 / 체크아웃 날짜를 선택해주세요
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 flex justify-center">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            locale={ko}
            disabled={(date) => isBefore(date, today)}
            fromDate={today}
            toDate={addDays(today, 365)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-6 text-sm">
          {dateRange?.from && (
            <div>
              <span className="text-muted-foreground mr-2">체크인:</span>
              <span className="font-medium">
                {format(dateRange.from, "yyyy.MM.dd (EEE)", { locale: ko })}
              </span>
            </div>
          )}
          {dateRange?.to && (
            <div>
              <span className="text-muted-foreground mr-2">체크아웃:</span>
              <span className="font-medium">
                {format(dateRange.to, "yyyy.MM.dd (EEE)", { locale: ko })}
              </span>
            </div>
          )}
          {dateRange?.from && dateRange?.to && (
            <div className="font-bold text-primary">
              {Math.ceil(
                (dateRange.to.getTime() - dateRange.from.getTime()) /
                  (1000 * 60 * 60 * 24)
              )}
              박
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">인원:</label>
          <Select
            value={String(guestsCount)}
            onValueChange={(v) => v && setGuestsCount(Number(v))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}명
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!dateRange?.from || !dateRange?.to}
        >
          객실 검색하기 →
        </Button>
      </div>
    </div>
  );
}
