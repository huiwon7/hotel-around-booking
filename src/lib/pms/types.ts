export interface PmsRoomAvailability {
  roomTypeId: string;
  date: string; // YYYY-MM-DD
  available: number;
  price: number;
}

export interface PmsRoomType {
  id: string;
  code: string;
  name: string;
  maxGuests: number;
  totalCount: number;
  basePrice: number;
}

export interface PmsReservation {
  id: string;
  guestName: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  status: "confirmed" | "cancelled" | "pending";
}

export interface CreatePmsReservationDto {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  specialRequests?: string;
}
