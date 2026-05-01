// components/chat/ChatMessage.tsx

"use client";

import React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck, Check, MoreHorizontal } from "lucide-react";
import { Message } from "@/lib/types/chat.types";
import { getMusicianById } from "@/lib/storage";
import { cn } from "@/lib/utils/utils";
import { ReportButton } from "../report-button";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
  showSenderName = false,
}) => {
  const timeString = format(new Date(message.timestamp), "HH:mm", {
    locale: ru,
  });
  console.log("isOwnMessage", isOwnMessage);
  const sender = getMusicianById(message.senderId);
  const { currentUser } = useAuth();
  if (!sender) return null;
  if (!currentUser) return null;
  // Формируем инициалы для фолбэка аватара
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[80%]",
        isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={sender.avatar || undefined} alt={sender.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(sender.name)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message container */}
      <div
        className={cn(
          "flex flex-col gap-1",
          isOwnMessage ? "items-end" : "items-start",
        )}
      >
        {/* Sender name (for group chats) */}
        {showSenderName && !isOwnMessage && (
          <p className="text-xs font-medium text-muted-foreground px-1 truncate max-w-[200px]">
            {sender.name}
          </p>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "px-3 py-2 rounded-2xl break-words shadow-sm",
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md",
          )}
        >
          {/*  Поддержка вложений (если есть) */}
          {message.attachments?.map((attachment, idx) => (
            <div key={idx} className="mb-2">
              {attachment.type === "image" ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="rounded-lg max-w-full h-auto"
                />
              ) : (
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm flex items-center gap-1"
                >
                  📎 {attachment.name}
                </a>
              )}
            </div>
          ))}

          {/* Текст сообщения */}
          {message.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>
        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ReportButton
            iconOnly
            options={{
              reporterId: currentUser.id,
              targetId: message.id,
              targetType: "message",
            }}
          />
        </div>
        {/* Time and read status */}
        <div
          className={cn(
            "flex items-center gap-1 text-xs text-muted-foreground px-1",
            isOwnMessage && "flex-row-reverse",
          )}
        >
          <time dateTime={message.timestamp.toString()}>{timeString}</time>
          {!isOwnMessage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="opacity-100 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted-foreground/10 rounded">
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <ReportButton
                  iconOnly
                  options={{
                    reporterId: currentUser.id,
                    reporterName: currentUser.name,
                    targetId: message.id,
                    targetType: "message",
                  }}
                  className="w-full justify-start text-destructive focus:text-destructive"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isOwnMessage && (
            <span
              className={cn(
                "flex items-center",
                message.read ? "text-primary" : "text-muted-foreground",
              )}
              aria-label={message.read ? "Прочитано" : "Отправлено"}
            >
              {message.read ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
