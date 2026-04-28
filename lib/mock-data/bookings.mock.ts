// lib/mock-data.ts — добавьте в конец:

import { BookingRequest } from "@/lib/types";

export const bookings: BookingRequest[] = [
  {
    id: "9001",
    venueId: "1",
    venueName: "Студия 'Звук'",
    venueAdminId: "3",
    musicianId: "1",
    date: new Date(Date.now() + 3 * 864e5).toISOString().split("T")[0], // +3 дня
    time: "14:00",
    hours: 2,
    totalPrice: 3000,
    message: "Запись демо-трека для нового проекта",
    status: "approved",
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
  },
  // Пример ожидающей заявки
  {
    id: "9002",
    venueId: "1",
    venueName: "Студия 'Звук'",
    venueAdminId: "3",
    musicianId: "2",
    date: new Date(Date.now() + 5 * 864e5).toISOString().split("T")[0], // +5 дней
    time: "18:00",
    hours: 3,
    totalPrice: 4500,
    message: "Репетиция перед концертом",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];
