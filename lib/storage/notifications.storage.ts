import { AppNotification } from "../types/notification.types";
import { initializeRecordStorage, saveRecordToStorage } from "./utils";

import { notifications as mockNotifications } from "@/lib/mock-data/notifications.mock";

// Уведомления: Record<userId, AppNotification[]>
export function getNotifications(): Record<string, AppNotification[]> {
  return initializeRecordStorage("notifications", mockNotifications);
}

export function saveNotifications(
  notifications: Record<number, AppNotification[]>,
): void {
  saveRecordToStorage("notifications", notifications);
}

export function getNotificationsByUserId(userId: string): AppNotification[] {
  const allNotifRecord = getNotifications();

  const allNotifs = Object.values(allNotifRecord).flat();

  return allNotifs.filter((notif) => notif.toUserId === userId);
}

export function addNotification(
  userId: string,
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
  userId: string,
  notificationId: string,
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

export function markAllRead(userId: string): void {
  const all = getNotifications();
  const updated = {
    ...all,
    [userId]: (all[userId] ?? []).map((n) => ({ ...n, read: true })),
  };
  saveNotifications(updated);
}

export function deleteNotification(
  userId: string,
  notificationId: string,
): void {
  const all = getNotifications();
  const updated = {
    ...all,
    [userId]: (all[userId] ?? []).filter((n) => n.id !== notificationId),
  };
  saveNotifications(updated);
}
