"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Users,
  Building2,
  MessageCircle,
  CheckCheck,
  UserPlus,
} from "lucide-react";
import { AppNotification } from "@/lib/types/notification.types";
import { useAuth } from "@/contexts/auth-context";
import { getNotificationsByUserId } from "@/lib/storage";

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} д. назад`;
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  if (notification.type === "group_invite") {
    return (
      <div
        className={`px-4 py-3 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-primary/5" : ""}`}
        onClick={() => onRead(notification.id)}
      >
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-snug">
              <Link
                href={`/profile/${notification.fromUserId}`}
                className="font-semibold hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.fromUserName}
              </Link>{" "}
              приглашает вас в группу{" "}
              <Link
                href={`/groups/${notification.groupId}`}
                className="font-semibold hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.groupName}
              </Link>{" "}
              на позицию{" "}
              <span className="font-semibold">{notification.position}</span>
            </p>
            {notification.message && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                "{notification.message}"
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {timeAgo(notification.createdAt)}
            </p>
          </div>
          {!notification.read && (
            <div className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary" />
          )}
        </div>
      </div>
    );
  }
  if (notification.type === "group_join_request") {
    return (
      <div
        className={`px-4 py-3 hover:bg-muted/50 transition-colors ${
          !notification.read ? "bg-primary/5" : ""
        }`}
        onClick={() => onRead(notification.id)}
      >
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-[var(--genre-rock)]/20 flex items-center justify-center">
            <UserPlus className="h-4 w-4 text-[var(--genre-rock)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-snug">
              <Link
                href={`/profile/${notification.fromUserId}`}
                className="font-semibold hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.fromUserName}
              </Link>{" "}
              запросил вступление в вашу группу{" "}
              <Link
                href={`/groups/${notification.groupId}`}
                className="font-semibold hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.groupName}
              </Link>{" "}
              на позицию{" "}
              <span className="font-semibold">{notification.position}</span>
            </p>
            {notification.message && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                "{notification.message}"
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {timeAgo(notification.createdAt)}
            </p>
          </div>
          {!notification.read && (
            <div className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary" />
          )}
        </div>
      </div>
    );
  }
  if (notification.type === "booking_request") {
    const dateStr = notification.date
      ? new Date(notification.date).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
        })
      : "";
    return (
      <div
        className={`px-4 py-3 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-primary/5" : ""}`}
        onClick={() => onRead(notification.id)}
      >
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-[var(--genre-jazz)]/20 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-[var(--genre-jazz)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-snug">
              <Link
                href={`/profile/${notification.fromUserId}`}
                className="font-semibold hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.fromUserName}
              </Link>{" "}
              оставил заявку на бронирование{" "}
              <span className="font-semibold">{notification.venueName}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {dateStr} в {notification.time} &middot; {notification.hours} ч.
              &middot; {notification.totalPrice.toLocaleString("ru-RU")} руб.
            </p>
            {notification.message && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 italic">
                "{notification.message}"
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {timeAgo(notification.createdAt)}
            </p>
          </div>
          {!notification.read && (
            <div className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary" />
          )}
        </div>
      </div>
    );
  }

  return null;
}

export function NotificationsPanel() {
  const { unreadCount, markAllRead, markRead, currentUser } = useAuth();
  if (!currentUser) return;
  const notifications = getNotificationsByUserId(currentUser.id);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] font-bold bg-warning text-warning-foreground border-0 rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Уведомления</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} новых
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground gap-1 h-7"
              onClick={markAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Прочитать все
            </Button>
          )}
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">Нет уведомлений</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[420px]">
            <div className="divide-y divide-border">
              {notifications.map((n, idx) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markRead}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
