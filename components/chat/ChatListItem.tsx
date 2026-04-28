"use client";

import React from "react";

// import { formatDistanceToNow } from "date-fns";
// import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils/utils";
import { Users, Building2, CheckCheck, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Chat, ChatType, ChatWithDisplay } from "@/lib/types/chat.types";
// import { getChatDisplayData } from "@/lib/utils/chat-display";

interface ChatListItemProps {
  chat: ChatWithDisplay;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (chatId: string) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isActive,
  onClick,
  onDelete,
}) => {
  const getTimeString = () => {
    if (!chat.lastMessage?.timestamp) return "";

    // Конвертируем строку в число (Unary + или Number())
    const timestamp = Number(chat.lastMessage.timestamp);

    // Защита от невалидных значений
    if (isNaN(timestamp)) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  const isUnread = (chat.unreadCount || 0) > 0;
  const isGroupOrVenue =
    chat.type === ChatType.GROUP || chat.type === ChatType.VENUE;
  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50 group",
        isActive && "bg-accent",
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          {/* Используем вычисленные поля */}
          <AvatarImage
            src={chat.displayAvatar ?? undefined}
            alt={chat.displayName}
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {isGroupOrVenue ? (
              chat.type === ChatType.GROUP ? (
                <Users className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )
            ) : (
              // Для DIRECT: первые 2 буквы имени
              chat.displayName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            )}
          </AvatarFallback>
        </Avatar>

        {/* 🔹 Онлайн-индикатор через вычисленное поле */}
        {chat.type === ChatType.DIRECT && chat.isOnline && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
        )}
      </div>

      {/* Chat info */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Name and time */}
        <div className="flex items-baseline justify-between gap-2">
          <h3
            className={cn(
              "text-sm truncate",
              isUnread
                ? "font-semibold text-foreground"
                : "font-medium text-foreground",
            )}
          >
            {chat.displayName}
          </h3>
          <time className="text-xs text-muted-foreground flex-shrink-0">
            {getTimeString()}
          </time>
        </div>

        {/* Last message preview */}
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm truncate flex-1",
              isUnread
                ? "text-foreground font-medium"
                : "text-muted-foreground",
            )}
          >
            {chat.lastMessage ? (
              <>
                {chat.lastMessage.senderId === "user-current" && (
                  <span className="inline-flex items-center gap-1 mr-1">
                    {chat.lastMessage.read ? (
                      <CheckCheck className="h-3 w-3 text-primary" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </span>
                )}
                {chat.lastMessage.content}
              </>
            ) : (
              <span className="italic">{"Нет сообщений"}</span>
            )}
          </p>

          {/* Unread badge */}
          {isUnread && (
            <Badge
              variant="default"
              className="h-5 min-w-[20px] px-1.5 text-xs"
            >
              {chat.unreadCount! > 99 ? "99+" : chat.unreadCount}
            </Badge>
          )}
        </div>

        {/* Additional info for groups/institutions */}
        {chat.type === ChatType.GROUP && chat.membersCount && (
          <p className="text-xs text-muted-foreground">
            {chat.membersCount} {"участников"}
          </p>
        )}
      </div>
    </div>
  );
};
