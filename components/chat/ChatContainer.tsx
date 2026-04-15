"use client";

import React, { useState } from "react";
import { ChatList } from "./ChatList";
import { ChatMessagesArea } from "./ChatMessagesArea";
import { ChatInputArea } from "./ChatInputArea";
import { CreateChatModal } from "./CreateChatModal";
import { useAppSelector } from "@/store/hooks";

export const ChatContainer: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const currentChatId = useAppSelector((state) => state.chats.currentChatId);

  return (
    <div className="flex h-screen bg-background">
      {/* Left sidebar - Chat list */}
      <div className="w-80 flex-shrink-0 border-r border-border">
        <ChatList onNewChat={() => setIsCreateModalOpen(true)} />
      </div>

      {/* Right side - Chat window */}
      {currentChatId ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages area */}
          <ChatMessagesArea />

          {/* Input area */}
          <ChatInputArea />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center space-y-4">
            <div className="text-6xl text-muted-foreground">💬</div>
            <h3 className="text-xl font-medium text-foreground">
              Выберите чат
            </h3>
            <p className="text-sm text-muted-foreground">
              Выберите беседу из списка или создайте новую
            </p>
          </div>
        </div>
      )}

      {/* Create chat modal */}
      <CreateChatModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
