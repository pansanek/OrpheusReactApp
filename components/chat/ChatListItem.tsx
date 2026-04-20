"use client";

import React from "react";
import { Chat, ChatType } from "@/store/types/chat.types";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Users, Building2, CheckCheck, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ChatListItemProps {
  chat: Chat;
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
  const getChatIcon = () => {
    switch (chat.type) {
      case ChatType.GROUP:
        return <Users className="h-5 w-5" />;
      case ChatType.VENUE:
        return <Building2 className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTimeString = () => {
    if (!chat.lastMessage) return "";
    const date = new Date(chat.lastMessage.timestamp);
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
          <AvatarImage src={chat.avatar ?? undefined} alt={chat.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {chat.type === ChatType.DIRECT
              ? chat.name.charAt(0).toUpperCase()
              : getChatIcon()}
          </AvatarFallback>
        </Avatar>
        {/* Online status for direct chats */}
        {chat.type === ChatType.DIRECT &&
          chat.participantUser?.status === "online" && (
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
            {chat.name}
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
