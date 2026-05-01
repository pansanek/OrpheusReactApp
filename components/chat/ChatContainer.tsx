// components/chat/ChatContainer.tsx
"use client";

import { useState } from "react";
import { ChatList } from "./ChatList";
import { ChatMessagesArea } from "./ChatMessagesArea";
import { ChatInputArea } from "./ChatInputArea";
import { CreateChatModal } from "./CreateChatModal";
import { useCurrentChatWithDisplay } from "@/store/hooks";
import { MessageSquare, X } from "lucide-react";

export const ChatContainer: React.FC = () => {
  const currentChat = useCurrentChatWithDisplay();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFloatingPanelOpen, setIsFloatingPanelOpen] = useState(true);
  const HEADER_HEIGHT = 64;
  return (
    <div
      className="relative w-full"
      style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
    >
      {/* Фоновый контент (если нужно показать что-то под чатом) */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
        {/* Здесь можно разместить декоративные элементы или "заглушку" */}
      </div>

      {/* Плавающая панель чата */}
      {isFloatingPanelOpen ? (
        <div className="relative z-10 flex h-full w-full p-4 gap-4">
          {/* Список чатов - плавающая панель */}
          <div
            className={`
            w-[320px] flex-shrink-0 
            rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl 
            shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] 
            overflow-hidden flex flex-col
            transition-all duration-300
          `}
          >
            <ChatList onNewChat={() => setIsCreateModalOpen(true)} />
          </div>

          {/* Область переписки - плавающая панель */}
          <div
            className={`
            flex-1 min-w-0 
            rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl 
            shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] 
            overflow-hidden flex flex-col
            transition-all duration-300
            ${!currentChat ? "items-center justify-center" : ""}
          `}
          >
            {currentChat ? (
              <>
                {/* Кнопка сворачивания в правом верхнем углу */}
                <button
                  onClick={() => setIsFloatingPanelOpen(false)}
                  className="absolute top-4 right-4 z-20 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>

                <div className="flex flex-col h-full overflow-hidden">
                  <ChatMessagesArea />
                  <ChatInputArea />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="p-6 rounded-2xl bg-muted/30 border border-border/30">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    Выберите чат
                  </h3>
                  <p className="text-sm mt-1">или создайте новый диалог</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Кнопка раскрытия (когда панель свернута) */
        <div className="absolute bottom-6 right-6 z-20">
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium">Чаты</span>
          {/* Бейдж непрочитанных */}
          <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
            2
          </span>
        </div>
      )}

      {/* Модальное окно создания чата */}
      {isCreateModalOpen && (
        <CreateChatModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};
