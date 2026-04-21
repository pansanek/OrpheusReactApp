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
    <div className="flex h-full w-full">
      <div
        className={`w-[300px] flex-shrink-0 border-r bg-background ${currentChatId ? "hidden md:flex" : "flex"}`}
      >
        <ChatList onNewChat={() => setIsCreateModalOpen(true)} />
      </div>

      <div
        className={`flex-1 min-w-0 flex flex-col bg-background ${currentChatId ? "flex" : "hidden md:flex"}`}
      >
        {currentChatId ? (
          <>
            <ChatMessagesArea />
            <ChatInputArea />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-muted/20">
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
      </div>

      <CreateChatModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
