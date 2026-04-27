// store/hooks.ts

import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { useMemo } from "react";
import type { RootState, AppDispatch } from "./store";
import { useAuth } from "@/contexts/auth-context";
import { ChatWithDisplay, ChatType } from "@/lib/types/chat.types";

// 🔹 Селекторы
import {
  selectChatsWithDisplay,
  selectCurrentChatWithDisplay,
  selectFilteredChatsWithDisplay,
  selectUnreadChatsCount,
  selectCurrentChatId,
} from "@/store/slices/chat.selectors";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Возвращает отфильтрованные чаты с вычисленными полями
 * Мемоизация на уровне селектора + useMemo для безопасности
 */
export const useFilteredChatsWithDisplay = (): ChatWithDisplay[] => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id?.toString() || "";

  // 🔹 Передаём currentUserId как второй аргумент селектору:
  return useAppSelector((state) =>
    selectFilteredChatsWithDisplay(state, currentUserId),
  );
};

export const useCurrentChatMessages = () => {
  const currentChatId = useAppSelector((state) => state.chats.currentChatId);
  const messages = useAppSelector((state) => state.chats.messages);

  return useMemo(
    () => (currentChatId ? messages[currentChatId] || [] : []),
    [messages, currentChatId],
  );
};
/**
 * Возвращает активный чат с вычисленными полями
 */
export const useCurrentChatWithDisplay = (): ChatWithDisplay | null => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id?.toString() || "";

  return useAppSelector(
    (state) => selectCurrentChatWithDisplay(state, currentUserId), // ← передаём параметр
  );
};

/**
 * Возвращает все чаты с вычисленными полями (без фильтрации)
 */
export const useChatsWithDisplay = (): ChatWithDisplay[] => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id?.toString() || "";

  return useAppSelector(
    (state) => selectChatsWithDisplay(state, currentUserId), // ← передаём параметр
  );
};

/**
 * Возвращает количество непрочитанных сообщений
 */
export const useUnreadChatsCount = (): number => {
  return useAppSelector(selectUnreadChatsCount);
};

/**
 * Возвращает только текущий чат (без вычисленных полей, если не нужно)
 */
export const useCurrentChatId = (): string | null => {
  return useAppSelector(selectCurrentChatId);
};

/**
 * @deprecated Используйте useFilteredChatsWithDisplay вместо этого
 * Оставлен для постепенного миграции компонентов
 */
export const useFilteredChats = () => {
  const chatsWithDisplay = useFilteredChatsWithDisplay();

  // Возвращаем в старом формате для совместимости
  return useMemo(
    () =>
      chatsWithDisplay.map(({ displayName, displayAvatar, ...chat }) => ({
        ...chat,
        name: displayName,
        avatar: displayAvatar,
      })),
    [chatsWithDisplay],
  );
};

/**
 * @deprecated Используйте useCurrentChatWithDisplay
 */
export const useCurrentChat = () => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id?.toString() || "";
  return useAppSelector((state) =>
    selectCurrentChatWithDisplay(state, currentUserId),
  );
};
