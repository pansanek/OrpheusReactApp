// store/middleware/localStorageMiddleware.ts
import { saveChats, saveMessages } from "@/lib/storage";
import { Middleware } from "@reduxjs/toolkit";

export const localStorageMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    try {
      // Безопасное извлечение состояния чатов
      const state = store.getState() as any;
      const chatsSlice = state.chats;

      if (chatsSlice?.chats) {
        saveChats(chatsSlice.chats);
      }
      if (chatsSlice?.messages) {
        saveMessages(chatsSlice.messages);
      }
    } catch (error) {
      console.error("localStorageMiddleware sync error:", error);
    }

    return result;
  };
