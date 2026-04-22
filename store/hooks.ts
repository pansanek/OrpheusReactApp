"use client";

import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";
import type { RootState, AppDispatch } from "./store";
import { Chat, ChatType } from "./types/chat.types";
import { useAuth } from "@/contexts/auth-context";
import { selectChatsForUser } from "@/utils/chatSelectors";
import { getChatDisplayInfo } from "@/utils/getChatDisplayInfo";
import { getInitials } from "@/utils/chatUtils";

// Типизированные версии useDispatch и useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected,
) => useSelector<RootState, TSelected>(selector);

// Хук для получения всех чатов с фильтром
export const useFilteredChats = () => {
  const filter = useAppSelector((state) => state.chats.filter);
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id.toString();
  const chats = useAppSelector((state) =>
    selectChatsForUser(state, currentUserId),
  );

  return useMemo(() => {
    const filtered = chats.filter((chat) => {
      if (
        !currentUserId ||
        !chat.participants?.includes(currentUserId.toString())
      ) {
        return false;
      }

      if (filter.type !== "all" && chat.type !== filter.type) {
        return false;
      }

      if (filter.searchQuery) {
        const { displayName } = getChatDisplayInfo(
          chat,
          currentUserId.toString(),
        );
        const query = filter.searchQuery.toLowerCase();
        return displayName.toLowerCase().includes(query);
      }

      return true;
    });

    return filtered.map((chat) => {
      const { displayName, displayAvatar } = getChatDisplayInfo(
        chat,
        currentUserId?.toString(),
      );

      return {
        ...chat,
        name: displayName,
        avatar: displayAvatar || getInitials(displayName),
      };
    });
  }, [chats, filter, currentUserId]);
};

// Хук для получения текущего чата
export const useCurrentChat = () => {
  const currentChatId = useAppSelector((state) => state.chats.currentChatId);
  const chats = useAppSelector((state) => state.chats.chats);

  return useMemo(
    () => chats.find((c) => c.id === currentChatId),
    [chats, currentChatId],
  );
};

// Хук для получения сообщений текущего чата
export const useCurrentChatMessages = () => {
  const currentChatId = useAppSelector((state) => state.chats.currentChatId);
  const messages = useAppSelector((state) => state.chats.messages);

  return useMemo(
    () => (currentChatId ? messages[currentChatId] || [] : []),
    [messages, currentChatId],
  );
};

// Хук для получения чатов по типу
export const useChatsByType = (type: ChatType) => {
  const chats = useAppSelector((state) => state.chats.chats);

  return useMemo(
    () => chats.filter((chat) => chat.type === type),
    [chats, type],
  );
};

// Хук для получения количества непрочитанных сообщений
export const useUnreadCount = () => {
  const chats = useAppSelector((state) => state.chats.chats);

  return useMemo(
    () => chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0),
    [chats],
  );
};

// Хук для получения прямых чатов (1-1)
export const useDirectChats = () => {
  return useChatsByType(ChatType.DIRECT);
};

// Хук для получения групповых чатов
export const useGroupChats = () => {
  return useChatsByType(ChatType.GROUP);
};

// Хук для получения чатов с учреждениями
export const useInstitutionChats = () => {
  return useChatsByType(ChatType.VENUE);
};
