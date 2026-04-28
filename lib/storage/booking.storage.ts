import { bookings } from "../mock-data/bookings.mock";
import { BookingRequest, BookingStatus } from "../types";
import { STORAGE_KEYS } from "./keys";
import { initializeStorage, saveToStorage } from "./utils";
/**
 * Получить все заявки на бронирование (с инициализацией из моков)
 */
export function getBookingRequests(): BookingRequest[] {
  return initializeStorage<BookingRequest>("bookings", bookings, false);
  // mergeById = false, т.к. каждая заявка уникальна по id (Date.now())
}

/**
 * Сохранить все заявки в localStorage
 */
export function saveBookingRequests(requests: BookingRequest[]): void {
  saveToStorage<BookingRequest>("bookings", requests);
}

/**
 * Получить заявки для конкретного учреждения (для панели админа)
 */
export function getRequestsByVenueId(
  venueId: string,
  includeDeclined: boolean = false,
): BookingRequest[] {
  const all = getBookingRequests();

  return all
    .filter(
      (req) =>
        req.venueId === venueId &&
        (includeDeclined || req.status !== "declined"),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

/**
 * Получить подтверждённые брони для музыканта (для календаря в сайдбаре)
 */
export function getApprovedRequestsByMusicianId(
  musicianId: string,
  futureOnly: boolean = true,
): BookingRequest[] {
  const all = getBookingRequests();
  const today = new Date().toISOString().split("T")[0];

  return all
    .filter(
      (req) =>
        req.musicianId === musicianId &&
        req.status === "approved" &&
        (!futureOnly || req.date >= today),
    )
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
}

/**
 * Обновить статус заявки (атомарная операция: чтение → изменение → сохранение)
 */
export function updateBookingRequestStatus(
  requestId: string,
  newStatus: BookingStatus,
): BookingRequest | undefined {
  const requests = getBookingRequests();
  const index = requests.findIndex((r) => r.id === requestId);

  if (index === -1) return undefined;

  const updated: BookingRequest = {
    ...requests[index],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  requests[index] = updated;
  saveBookingRequests(requests);

  return updated;
}

/**
 * Проверить, есть ли пересечение по времени для нового бронирования
 * (базовая валидация для предотвращения дублей)
 */
export function hasTimeConflict(
  venueId: string,
  date: string,
  startTime: string,
  hours: number,
  excludeRequestId?: string,
): boolean {
  const requests = getBookingRequests();
  const [startHour, startMin] = startTime.split(":").map(Number);
  const newEnd = startHour + hours + startMin / 60;

  return requests.some((req) => {
    if (
      req.venueId !== venueId ||
      req.date !== date ||
      req.status !== "approved" ||
      (excludeRequestId && req.id === excludeRequestId)
    ) {
      return false;
    }

    const [reqHour, reqMin] = req.time.split(":").map(Number);
    const reqStart = reqHour + reqMin / 60;
    const reqEnd = reqStart + req.hours;

    // Проверка пересечения временных интервалов
    return newEnd > reqStart && startHour + startMin / 60 < reqEnd;
  });
}

/**
 * Утилита для очистки хранилища (для разработки)
 */
export function clearBookingStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.bookings);
}

/**
 * Статистика по заявкам для админа
 */
export function getVenueBookingStats(venueId: string): {
  pending: number;
  approved: number;
  declined: number;
  total: number;
} {
  const requests = getBookingRequests().filter((r) => r.venueId === venueId);

  return {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    declined: requests.filter((r) => r.status === "declined").length,
    total: requests.length,
  };
}
export function getApprovedRequestsByVenueAdminId(
  adminId: string,
  futureOnly: boolean = true,
): BookingRequest[] {
  const all = getBookingRequests();
  const today = new Date().toISOString().split("T")[0];

  return all
    .filter(
      (req) =>
        req.venueAdminId === adminId &&
        req.status === "approved" &&
        (!futureOnly || req.date >= today) &&
        req.musicianId !== adminId, //Исключаем собственные брони
    )
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
}
