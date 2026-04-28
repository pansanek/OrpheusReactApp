// store/slices/chat.selectors.ts

import { createSelector } from "@reduxjs/toolkit";

import { ChatWithDisplay } from "@/lib/types/chat.types";
import { enrichChatWithDisplay } from "@/lib/utils/chat-enricher";
import { RootState } from "../store";
import { useAuth } from "@/contexts/auth-context";

export const selectChatsState = (state: RootState) => state.chats;
export const selectChats = (state: RootState) => state.chats.chats;
export const selectCurrentChatId = (state: RootState) =>
  state.chats.currentChatId;
export const selectChatFilter = (state: RootState) => state.chats.filter;

export const selectMusiciansFromChats = (state: RootState) =>
  (state.chats as any).musicians || [];
export const selectVenuesFromChats = (state: RootState) =>
  (state.chats as any).venues || [];
const selectCurrentUserIdParam = (_: RootState, currentUserId: string) =>
  currentUserId;

export const selectChatsWithDisplay = createSelector(
  [
    selectChats,
    selectMusiciansFromChats,
    selectVenuesFromChats,
    (state: RootState) => state.chats.currentUser?.venueAdminOf || [],
    selectCurrentUserIdParam, // ← прокидываем currentUserId
  ],
  // Комбайнер получает результаты всех 5 селекторов:
  (
    chats,
    musicians,
    venues,
    venueAdminOf,
    currentUserId,
  ): ChatWithDisplay[] => {
    return chats.map((chat) =>
      enrichChatWithDisplay(chat, {
        currentUserId,
        musicians,
        venues,
        venueAdminOf,
      }),
    );
  },
);

// ─────────────────────────────────────────────────────────────
// 🔹 Вспомогательные селекторы
// ─────────────────────────────────────────────────────────────

// Активный чат с вычисленными данными
export const selectCurrentChatWithDisplay = createSelector(
  [selectChatsWithDisplay, selectCurrentChatId],
  (chatsWithDisplay, currentChatId): ChatWithDisplay | null => {
    return chatsWithDisplay.find((chat) => chat.id === currentChatId) || null;
  },
);

// Количество непрочитанных (для бейджа в меню)
export const selectUnreadChatsCount = createSelector(
  [selectChats],
  (chats): number =>
    chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0),
);

// Фильтрация + поиск + обогащение
export const selectFilteredChatsWithDisplay = createSelector(
  [
    selectChatsWithDisplay,
    (state: RootState) => state.chats.filter,
    selectCurrentUserIdParam, // ← нужен для фильтрации по participants
  ],
  // chats — это уже массив ChatWithDisplay[], а не функция:
  (chats, filter, currentUserId): ChatWithDisplay[] => {
    let result = chats; // ← Просто массив, ничего не вызываем!

    // Фильтр по участнику
    if (currentUserId) {
      result = result.filter((chat) =>
        chat.participants.includes(currentUserId),
      );
    }

    // Фильтр по типу
    if (filter.type !== "all") {
      result = result.filter((chat) => chat.type === filter.type);
    }

    // Поиск по displayName (уже вычисленному!)
    if (filter.searchQuery?.trim()) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter((chat) =>
        chat.displayName.toLowerCase().includes(query),
      );
    }

    return result;
  },
);
