"use client";

import React, { useEffect, useRef } from "react";
import { useCurrentChatMessages, useCurrentChat } from "@/store/hooks";
import { ChatType } from "@/store/types/chat.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Phone, Video, Users, Building2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "./ChatMessage";

export const ChatMessagesArea: React.FC = () => {
  const messages = useCurrentChatMessages();
  const currentChat = useCurrentChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentChat) {
    return null;
  }

  const isGroupChat = currentChat.type === ChatType.GROUP;
  const showAvatars = isGroupChat;

  const getChatIcon = () => {
    if (currentChat.type === ChatType.GROUP) {
      return <Users className="h-5 w-5" />;
    }
    if (currentChat.type === ChatType.INSTITUTION) {
      return <Building2 className="h-5 w-5" />;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={currentChat.avatar || "/placeholder.svg"}
                alt={currentChat.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {currentChat.type === ChatType.DIRECT
                  ? currentChat.name.charAt(0).toUpperCase()
                  : getChatIcon()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="font-semibold text-foreground text-sm truncate">
                {currentChat.name}
              </h2>
              {currentChat.type === ChatType.GROUP &&
                currentChat.membersCount && (
                  <p className="text-xs text-muted-foreground">
                    {currentChat.membersCount} {"участников"}
                  </p>
                )}
              {currentChat.type === ChatType.INSTITUTION &&
                currentChat.institution && (
                  <p className="text-xs text-muted-foreground">
                    {currentChat.institution.category}
                  </p>
                )}
              {currentChat.type === ChatType.DIRECT &&
                currentChat.participantUser?.status === "online" && (
                  <p className="text-xs text-green-600">{"онлайн"}</p>
                )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
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
      <ScrollArea className="flex-1 px-4">
        {messages.length > 0 ? (
          <div className="py-4 space-y-3">
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
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
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
                          }
                        )}
                      </span>
                      <Separator className="flex-1" />
                    </div>
                  )}
                  <ChatMessage
                    message={message}
                    isOwnMessage={message.senderId === "user-current"}
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
