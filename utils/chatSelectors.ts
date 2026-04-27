import { Chat } from "@/lib/types/chat.types";
import { RootState } from "@/store/store";

import { createSelector } from "@reduxjs/toolkit";

// Простой селектор: чаты, в которых состоит пользователь
// Передаём currentUserId как аргумент через мемоизацию
export const selectChatsForUser = createSelector(
  [
    (state: RootState) => state.chats.chats,
    (_: RootState, currentUserId: string | undefined) => currentUserId,
  ],
  (chats, currentUserId): Chat[] => {
    if (!currentUserId) return [];

    return chats.filter((chat: Chat) =>
      chat.participants?.includes(currentUserId),
    );
  },
);
