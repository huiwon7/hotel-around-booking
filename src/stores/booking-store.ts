"use client";

import { create } from "zustand";

export interface BookingState {
  // Step 1: Dates
  checkIn: Date | null;
  checkOut: Date | null;
  guestsCount: number;

  // Step 2: Room & Package
  roomTypeId: string | null;
  roomTypeName: string | null;
  packageId: string | null;
  packageName: string | null;

  // Step 3: Guest Info
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCompany: string;
  specialRequests: string;
  privacyAgreed: boolean;
  marketingAgreed: boolean;

  // Pricing
  perNight: number;
  nights: number;
  roomTotal: number;
  packageDiscount: number;
  totalPrice: number;

  // Step tracking
  currentStep: number;

  // Actions
  setDates: (checkIn: Date, checkOut: Date) => void;
  setGuestsCount: (count: number) => void;
  setRoom: (id: string, name: string) => void;
  setPackage: (id: string | null, name: string | null) => void;
  setGuestInfo: (info: Partial<Pick<BookingState,
    "guestName" | "guestEmail" | "guestPhone" | "guestCompany" | "specialRequests" | "privacyAgreed" | "marketingAgreed"
  >>) => void;
  setPricing: (pricing: {
    perNight: number;
    nights: number;
    roomTotal: number;
    packageDiscount: number;
    totalPrice: number;
  }) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  checkIn: null,
  checkOut: null,
  guestsCount: 2,
  roomTypeId: null,
  roomTypeName: null,
  packageId: null,
  packageName: null,
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  guestCompany: "",
  specialRequests: "",
  privacyAgreed: false,
  marketingAgreed: false,
  perNight: 0,
  nights: 0,
  roomTotal: 0,
  packageDiscount: 0,
  totalPrice: 0,
  currentStep: 1,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setDates: (checkIn, checkOut) => {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    set({ checkIn, checkOut, nights });
  },

  setGuestsCount: (guestsCount) => set({ guestsCount }),

  setRoom: (id, name) => set({ roomTypeId: id, roomTypeName: name }),

  setPackage: (id, name) => set({ packageId: id, packageName: name }),

  setGuestInfo: (info) => set(info),

  setPricing: (pricing) => set(pricing),

  setStep: (currentStep) => set({ currentStep }),

  reset: () => set(initialState),
}));
