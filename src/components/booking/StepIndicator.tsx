"use client";

import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "날짜" },
  { number: 2, label: "객실" },
  { number: 3, label: "정보" },
  { number: 4, label: "확인" },
];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 py-6">
      {steps.map((step, idx) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                currentStep > step.number
                  ? "bg-primary text-primary-foreground"
                  : currentStep === step.number
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > step.number ? "✓" : step.number}
            </div>
            <span
              className={cn(
                "text-xs mt-1.5",
                currentStep >= step.number
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                "w-12 h-0.5 mx-1 mt-[-1rem]",
                currentStep > step.number ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
