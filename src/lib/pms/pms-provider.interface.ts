import {
  PmsRoomAvailability,
  PmsRoomType,
  PmsReservation,
  CreatePmsReservationDto,
} from "./types";

export interface IPmsProvider {
  getAvailability(
    checkIn: Date,
    checkOut: Date,
    roomTypeId?: string
  ): Promise<PmsRoomAvailability[]>;

  createReservation(data: CreatePmsReservationDto): Promise<PmsReservation>;

  cancelReservation(reservationId: string): Promise<boolean>;

  getReservation(reservationId: string): Promise<PmsReservation | null>;

  syncRoomTypes(): Promise<PmsRoomType[]>;

  syncInventory(dateFrom: Date, dateTo: Date): Promise<void>;
}
