/**
 * Статус заявки на бронирование учреждения
 */
export type BookingStatus = "pending" | "approved" | "declined";

export interface BookingRequest {
  id: string;

  venueId: string;

  venueName: string;

  venueAdminId: string;

  musicianId: string;

  date: string;

  time: string;

  hours: number;

  totalPrice: number;

  message?: string;

  status: BookingStatus;

  createdAt: string;

  updatedAt?: string;
}
