"use client";

import React, { useState } from "react";
import {
  useFilteredChats,
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";
import { selectChat, deleteChat, setFilter } from "@/store/slices/chatSlice";
import { ChatType } from "@/store/types/chat.types";
import { Search, Edit, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChatListItem } from "./ChatListItem";

interface ChatListProps {
  onNewChat?: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onNewChat }) => {
  const dispatch = useAppDispatch();
  const filteredChats = useFilteredChats();
  const currentChatId = useAppSelector((state) => state.chats.currentChatId);
  const filter = useAppSelector((state) => state.chats.filter);
  const [searchInput, setSearchInput] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const handleSelectChat = (chatId: string) => {
    dispatch(selectChat(chatId));
  };

  const handleDeleteChat = (chatId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот чат?")) {
      dispatch(deleteChat(chatId));
    }
  };

  const handleSearch = (query: string) => {
    setSearchInput(query);
    dispatch(setFilter({ searchQuery: query }));
  };

  // Фильтрация по непрочитанным
  const displayChats = showUnreadOnly
    ? filteredChats.filter((chat) => (chat.unreadCount || 0) > 0)
    : filteredChats;

  // Избранные чаты (первые 3 для демо)
  const favoriteChats = filteredChats.slice(0, 3);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Чаты</h2>
          {onNewChat && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onNewChat}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск чатов..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* Избранное */}
      {!searchInput && favoriteChats.length > 0 && (
        <>
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Избранное
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {favoriteChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className="flex flex-col items-center gap-1.5 min-w-[60px] group"
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      {chat.avatar ? (
                        <img
                          src={chat.avatar || "/placeholder.svg"}
                          alt={chat.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-primary">
                          {chat.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {(chat.unreadCount || 0) > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-foreground truncate w-full text-center">
                    {chat.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {displayChats.length > 0 ? (
          <div className="divide-y divide-border">
            {displayChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={currentChatId === chat.id}
                onClick={() => handleSelectChat(chat.id)}
                onDelete={handleDeleteChat}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            {searchInput
              ? "Чаты не найдены"
              : showUnreadOnly
              ? "Нет непрочитанных чатов"
              : "У вас нет чатов"}
          </div>
        )}
      </div>

      {/* Только непрочитанные */}
      <Separator />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="unread-filter" className="text-sm cursor-pointer">
            Только непрочитанные
          </Label>
          <Switch
            id="unread-filter"
            checked={showUnreadOnly}
            onCheckedChange={setShowUnreadOnly}
          />
        </div>
      </div>
    </div>
  );
};
