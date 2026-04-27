// components/chat/ChatMessage.tsx

"use client";

import React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck, Check } from "lucide-react";
import { Message } from "@/lib/types/chat.types";
import { getMusicianById } from "@/lib/storage";
import { cn } from "@/lib/utils/utils";

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

  const sender = getMusicianById(message.senderId);
  if (!sender) return null;
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

        {/* Time and read status */}
        <div
          className={cn(
            "flex items-center gap-1 text-xs text-muted-foreground px-1",
            isOwnMessage && "flex-row-reverse",
          )}
        >
          <time dateTime={message.timestamp.toString()}>{timeString}</time>
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
