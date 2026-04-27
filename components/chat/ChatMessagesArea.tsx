// components/chat/ChatMessagesArea.tsx

"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  useCurrentChatMessages,
  useCurrentChatWithDisplay,
} from "@/store/hooks";
import { ChatType } from "@/lib/types/chat.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Phone, Video, Users, Building2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "./ChatMessage";

export const ChatMessagesArea: React.FC = () => {
  const { currentUser } = useAuth();
  const messages = useCurrentChatMessages();

  // 🔹 Используем новый хук с вычисленными данными
  const currentChat = useCurrentChatWithDisplay();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Пока чат не загружен — показываем заглушку
  if (!currentChat) {
    return (
      <div className="flex flex-col flex-1 min-h-0 items-center justify-center bg-muted/30">
        <div className="text-center space-y-2">
          <div className="text-4xl text-muted-foreground">💬</div>
          <p className="text-sm text-muted-foreground">{"Выберите чат"}</p>
          <p className="text-xs text-muted-foreground">
            {"или начните новый диалог"}
          </p>
        </div>
      </div>
    );
  }

  // 🔹 Вычисляемые значения теперь в одном месте
  const isGroupChat = currentChat.type === ChatType.GROUP;
  const showAvatars = isGroupChat;

  const getChatIcon = () => {
    switch (currentChat.type) {
      case ChatType.GROUP:
        return <Users className="h-5 w-5" />;
      case ChatType.VENUE:
        return <Building2 className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // 🔹 Статус онлайн через вычисленное поле
  const statusText =
    currentChat.type === ChatType.DIRECT && currentChat.isOnline
      ? "онлайн"
      : undefined;

  // 🔹 Доп. информация о чате
  const subtitle =
    currentChat.type === ChatType.GROUP && currentChat.membersCount
      ? `${currentChat.membersCount} участников`
      : currentChat.type === ChatType.VENUE && currentChat.venueInfo?.name
        ? currentChat.venueInfo.name
        : undefined;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Chat header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* 🔹 Аватар через вычисленное поле */}
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage
                src={currentChat.displayAvatar || undefined}
                alt={currentChat.displayName}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {currentChat.type === ChatType.DIRECT ||
                currentChat.type === ChatType.VENUE
                  ? // Для DIRECT/VENUE: первые 2 буквы имени
                    currentChat.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : // Для GROUP: иконка
                    getChatIcon()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              {/* 🔹 Имя через вычисленное поле */}
              <h2 className="font-semibold text-foreground text-sm truncate">
                {currentChat.displayName}
              </h2>

              {/* 🔹 Подзаголовок через вычисленные данные */}
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}

              {/* 🔹 Статус онлайн через вычисленное поле */}
              {statusText && (
                <p className="text-xs text-green-600">{statusText}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
              <Video className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 h-0">
        {messages.length > 0 ? (
          <div className="py-4 space-y-3 px-4">
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const showDateSeparator =
                !prevMessage ||
                new Date(message.timestamp).toDateString() !==
                  new Date(prevMessage.timestamp).toDateString();

              return (
                <React.Fragment key={message.id}>
                  {showDateSeparator && (
                    <div className="flex items-center gap-3 my-6">
                      <Separator className="flex-1" />
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full whitespace-nowrap">
                        {new Date(message.timestamp).toLocaleDateString(
                          "ru-RU",
                          {
                            day: "numeric",
                            month: "long",
                            year:
                              new Date(message.timestamp).getFullYear() !==
                              new Date().getFullYear()
                                ? "numeric"
                                : undefined,
                          },
                        )}
                      </span>
                      <Separator className="flex-1" />
                    </div>
                  )}
                  <ChatMessage
                    message={message}
                    isOwnMessage={
                      message.senderId === currentUser?.id.toString()
                    }
                    showAvatar={showAvatars}
                    showSenderName={isGroupChat}
                  />
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="text-4xl text-muted-foreground">💬</div>
              <p className="text-sm text-muted-foreground">{"Нет сообщений"}</p>
              <p className="text-xs text-muted-foreground">
                {"Начните разговор"}
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
