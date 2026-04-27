import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { musicians, venues } from "@/lib/mock-data";
import { RootState } from "../store";
import { useAuth } from "@/contexts/auth-context";
import { getChats, getMessages, getMusicians, getVenues } from "@/lib/storage";
import { Chat, ChatState, ChatType, Message } from "@/lib/types/chat.types";
import { Musician, Venue } from "@/lib/types";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const initialState: ChatState = {
  chats: getChats(),
  messages: getMessages(),
  musicians: getMusicians(),
  venues: getVenues(),
  currentChatId: null,
  loading: false,
  error: null,
  filter: {
    type: "all",
    searchQuery: "",
  },
};

const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    // Установить текущий чат
    selectChat: (state, action: PayloadAction<string>) => {
      state.currentChatId = action.payload;
      // Отметить сообщения как прочитанные
      const chat = state.chats.find((c) => c.id === action.payload);
      if (chat) {
        chat.unreadCount = 0;
      }
      if (state.messages[action.payload]) {
        state.messages[action.payload].forEach((msg) => {
          msg.read = true;
        });
      }
    },
    setMusicians: (state, action: PayloadAction<Musician[]>) => {
      state.musicians = action.payload;
    },
    setVenues: (state, action: PayloadAction<Venue[]>) => {
      state.venues = action.payload;
    },
    // Добавить новое сообщение
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>,
    ) => {
      const { chatId, message } = action.payload;

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      state.messages[chatId].push(message);

      // Обновить lastMessage в чате
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.lastMessage = message;
        chat.updatedAt = message.timestamp;
      }
    },

    // Создать новый прямой чат
    createDirectChat: (
      state,
      action: PayloadAction<{
        participantId: string;
        participantName: string;
        currentUserId: string;
      }>,
    ) => {
      const { participantId, participantName, currentUserId } = action.payload;

      // Проверить, существует ли уже такой чат
      const existingChat = state.chats.find(
        (c) =>
          c.type === ChatType.DIRECT &&
          c.participants.includes(participantId) &&
          c.participants.includes(currentUserId),
      );

      if (existingChat) {
        state.currentChatId = existingChat.id;
        return;
      }

      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        type: ChatType.DIRECT,
        name: participantName,
        participants: [currentUserId, participantId],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        unreadCount: 0,
      };

      state.chats.unshift(newChat);
      state.messages[newChat.id] = [];
      state.currentChatId = newChat.id;
    },

    // Создать групповой чат
    createGroupChat: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        avatar?: string;
        description?: string;
        participantIds: string[];
        currentUserId: string;
        groupId?: string;
      }>,
    ) => {
      const {
        id,
        name,
        description,
        avatar,
        participantIds,
        currentUserId,
        groupId,
      } = action.payload;

      const newChat: Chat = {
        id: id,
        type: ChatType.GROUP,
        name,
        participants: [currentUserId, ...participantIds],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        admin: currentUserId,
        membersCount: participantIds.length + 1,
        unreadCount: 0,
        avatar: avatar,
      };

      state.chats.unshift(newChat);
      state.messages[newChat.id] = [];
      state.currentChatId = newChat.id;
    },

    // Создать чат с учреждением
    createVenueChat: (
      state,
      action: PayloadAction<{
        venueId: string;
        venueName: string;
        venueLogo: string;
        venueAdmin: string;
        type: string;
        currentUserId: string;
      }>,
    ) => {
      const { venueId, venueName, venueLogo, type, venueAdmin, currentUserId } =
        action.payload;

      // Проверить, существует ли уже такой чат
      const existingChat = state.chats.find(
        (c) => c.type === ChatType.VENUE && c.venue === venueId,
      );

      if (existingChat) {
        state.currentChatId = existingChat.id;
        return;
      }

      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        type: ChatType.VENUE,
        name: venueName,
        avatar: venueLogo,
        participants: [currentUserId, venueAdmin],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        unreadCount: 0,
        venue: venueId,
      };

      state.chats.unshift(newChat);
      state.messages[newChat.id] = [];
      state.currentChatId = newChat.id;
    },

    // Удалить чат
    deleteChat: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      state.chats = state.chats.filter((c) => c.id !== chatId);
      delete state.messages[chatId];

      if (state.currentChatId === chatId) {
        state.currentChatId = state.chats[0]?.id || null;
      }
    },
    setCurrentUser: (
      state,
      action: PayloadAction<{ id: string; venueAdminOf?: string[] }>,
    ) => {
      state.currentUser = action.payload; // ← теперь селектор увидит currentUserId
    },
    // Установить фильтр
    setFilter: (
      state,
      action: PayloadAction<{
        type?: ChatType | "all";
        searchQuery?: string;
      }>,
    ) => {
      if (action.payload.type !== undefined) {
        state.filter.type = action.payload.type;
      }
      if (action.payload.searchQuery !== undefined) {
        state.filter.searchQuery = action.payload.searchQuery;
      }
    },

    // Очистить ошибку
    clearError: (state) => {
      state.error = null;
    },

    // Установить ошибку
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addParticipantToChat.fulfilled, (state, action) => {
        const { chatId, userId, chatType } = action.payload;

        const chat = state.chats.find((c) => c.id === chatId);
        if (!chat) return;

        if (!chat.participants.includes(userId)) {
          chat.participants.push(String(userId));
          chat.updatedAt = new Date().getTime();
        }

        if (chatType === ChatType.GROUP && chat.membersCount) {
          chat.membersCount += 1;
        }
      })
      .addCase(addParticipantToChat.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(addParticipantToChat.pending, (state) => {
        state.loading = true;
      });
  },
});

export const addParticipantToChat = createAsyncThunk(
  "chat/addParticipant",
  async (
    payload: { chatId: string; userId: string },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    const { chatId, userId } = payload;

    // Валидация 1: чат существует?
    const chat = state.chats.chats.find((c) => c.id === chatId);
    if (!chat) {
      return rejectWithValue("Чат не найден");
    }

    // Валидация 2: пользователь уже в чате?
    if (chat.participants.includes(userId)) {
      return rejectWithValue("Пользователь уже в чате");
    }

    //  Валидация 3: пользователь существует в справочнике?
    const musicianExists = state.chats.musicians?.some(
      (m) => String(m.id) === String(userId),
    );
    if (!musicianExists && chat.type !== ChatType.VENUE) {
      // Для VENUE-чатов участник может быть админом учреждения, которого нет в musicians
      return rejectWithValue("Пользователь не найден");
    }

    // Если всё ок — возвращаем данные для обновления стейта
    return { chatId, userId, chatType: chat.type };
  },
);

export const {
  selectChat,
  addMessage,
  createDirectChat,
  createGroupChat,
  createVenueChat,
  deleteChat,
  setFilter,
  clearError,
  setError,
  setMusicians,
  setVenues,
} = chatSlice.actions;

export default chatSlice.reducer;
export const selectCurrentChatId = (state: RootState) =>
  state.chats.currentChatId;
