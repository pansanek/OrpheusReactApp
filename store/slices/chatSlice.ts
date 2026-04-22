import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chat, ChatState, ChatType, Message } from "../types/chat.types";
import { musicians, venues } from "@/lib/mock-data";
import { RootState } from "../store";
import { useAuth } from "@/contexts/auth-context";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
const mockChats: Chat[] = [
  {
    id: "chat-1",
    type: ChatType.DIRECT,
    name: musicians[1].name,
    avatar: musicians[1].avatar || getInitials(musicians[1].name),
    participants: [musicians[0].id.toString(), musicians[1].id.toString()],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
    unreadCount: 2,
    lastMessage: {
      id: "msg-1",
      chatId: "chat-1",
      senderId: musicians[1].id.toString(),
      senderName: musicians[1].name,
      content: "Давай встретимся завтра?",
      timestamp: Date.now() - 3600000,
      type: "text",
      read: false,
      status: "delivered",
      senderAvatar: musicians[1].avatar,
    },
  },
];

const mockMessages: Record<string, Message[]> = {
  "chat-1": [
    {
      id: "msg-1",
      chatId: "chat-1",
      senderId: musicians[0].id.toString(),
      senderName: "Вы",
      content: "Привет! Как дела?",
      timestamp: Date.now() - 7200000,
      type: "text",
      read: true,
      status: "read",
      senderAvatar: null,
    },
    {
      id: "msg-2",
      chatId: "chat-1",
      senderId: musicians[1].id.toString(),
      senderName: musicians[1].name,
      content: "Привет! Всё хорошо, спасибо.",
      timestamp: Date.now() - 6900000,
      type: "text",
      read: true,
      status: "read",
      senderAvatar: musicians[1].avatar,
    },
    {
      id: "msg-3",
      chatId: "chat-1",
      senderId: musicians[1].id.toString(),
      senderName: musicians[1].name,
      content: "Давай встретимся завтра?",
      timestamp: Date.now() - 3600000,
      type: "text",
      read: false,
      status: "delivered",
      senderAvatar: musicians[1].avatar,
    },
  ],
};

const initialState: ChatState = {
  chats: mockChats,
  messages: mockMessages,
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
        participantAvatar?: string;
        currentUserId: string;
      }>,
    ) => {
      const {
        participantId,
        participantName,
        participantAvatar,
        currentUserId,
      } = action.payload;

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
        avatar: participantAvatar,
        participants: [currentUserId, participantId],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        unreadCount: 0,
        participantUser: {
          id: participantId,
          name: participantName,
          avatar: participantAvatar,
        },
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
        description,
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
        type?: string;
        currentUserId: string;
      }>,
    ) => {
      const { venueId, venueName, venueLogo, type, venueAdmin, currentUserId } =
        action.payload;

      // Проверить, существует ли уже такой чат
      const existingChat = state.chats.find(
        (c) => c.type === ChatType.VENUE && c.Venue?.id === venueId,
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
        Venue: {
          id: venueId,
          name: venueName,
          logo: venueLogo,
          type,
        },
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
});

export const addParticipantToChat = createAsyncThunk(
  "chat/addParticipant",
  async (payload: { chatId: string; userId: number }) => payload,
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
} = chatSlice.actions;

export default chatSlice.reducer;

export const selectCurrentChatId = (state: RootState) =>
  state.chats.currentChatId;
