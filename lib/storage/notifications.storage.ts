import { AppNotification } from "../types/notification.types";
import { initializeRecordStorage, saveRecordToStorage } from "./utils";

import { notifications as mockNotifications } from "@/lib/mock-data/notifications.mock";

// 👇 Уведомления: Record<userId, AppNotification[]>
export function getNotifications(): Record<number, AppNotification[]> {
  return initializeRecordStorage("notifications", mockNotifications);
}

export function saveNotifications(
  notifications: Record<number, AppNotification[]>,
): void {
  saveRecordToStorage("notifications", notifications);
}

export function getNotificationsByUserId(userId: number): AppNotification[] {
  return getNotifications()[userId] ?? [];
}

export function addNotification(
  userId: number,
  notification: AppNotification,
): void {
  const all = getNotifications();
  const updated = {
    ...all,
    [userId]: [notification, ...(all[userId] ?? [])],
  };
  saveNotifications(updated);
}

export function markNotificationRead(
  userId: number,
  notificationId: number,
): void {
  const all = getNotifications();
  const updated = {
    ...all,
    [userId]: (all[userId] ?? []).map((n) =>
      n.id === notificationId ? { ...n, read: true } : n,
    ),
  };
  saveNotifications(updated);
}

export function markAllRead(userId: number): void {
  const all = getNotifications();
  const updated = {
    ...all,
    [userId]: (all[userId] ?? []).map((n) => ({ ...n, read: true })),
  };
  saveNotifications(updated);
}

export function deleteNotification(
  userId: number,
  notificationId: number,
): void {
  const all = getNotifications();
  const updated = {
    ...all,
    [userId]: (all[userId] ?? []).filter((n) => n.id !== notificationId),
  };
  saveNotifications(updated);
}
