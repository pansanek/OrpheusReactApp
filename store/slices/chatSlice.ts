import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, ChatState, ChatType, Message } from '../types/chat.types';

// Mock данные для инициализации
const mockChats: Chat[] = [
  {
    id: 'chat-1',
    type: ChatType.DIRECT,
    name: 'Иван Петров',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ivan',
    participants: ['user-current', 'user-1'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
    unreadCount: 2,
    lastMessage: {
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'user-1',
      senderName: 'Иван Петров',
      content: 'Давай встретимся завтра?',
      timestamp: Date.now() - 3600000,
      type: 'text',
      read: false,
    },
  },
  {
    id: 'chat-2',
    type: ChatType.GROUP,
    name: 'Квартет скрипачей',
    description: 'Группа для координации репетиций',
    participants: ['user-current', 'user-2', 'user-3', 'user-4'],
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 1800000,
    admin: 'user-2',
    membersCount: 4,
    unreadCount: 0,
  },
  {
    id: 'chat-3',
    type: ChatType.INSTITUTION,
    name: 'Московская консерватория',
    participants: ['user-current'],
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 7200000,
    institution: {
      id: 'inst-1',
      name: 'Московская консерватория',
      category: 'Образование',
    },
    unreadCount: 1,
  },
];

const mockMessages: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'user-current',
      senderName: 'Вы',
      content: 'Привет! Как дела?',
      timestamp: Date.now() - 7200000,
      type: 'text',
      read: true,
    },
    {
      id: 'msg-2',
      chatId: 'chat-1',
      senderId: 'user-1',
      senderName: 'Иван Петров',
      content: 'Привет! Всё хорошо, спасибо.',
      timestamp: Date.now() - 6900000,
      type: 'text',
      read: true,
    },
    {
      id: 'msg-3',
      chatId: 'chat-1',
      senderId: 'user-1',
      senderName: 'Иван Петров',
      content: 'Давай встретимся завтра?',
      timestamp: Date.now() - 3600000,
      type: 'text',
      read: false,
    },
  ],
  'chat-2': [
    {
      id: 'msg-4',
      chatId: 'chat-2',
      senderId: 'user-3',
      senderName: 'Мария Сидорова',
      content: 'Репетиция в 19:00?',
      timestamp: Date.now() - 5400000,
      type: 'text',
      read: true,
    },
    {
      id: 'msg-5',
      chatId: 'chat-2',
      senderId: 'user-2',
      senderName: 'Петр Иванов',
      content: 'Согласен, зал забронирован',
      timestamp: Date.now() - 5100000,
      type: 'text',
      read: true,
    },
  ],
  'chat-3': [
    {
      id: 'msg-6',
      chatId: 'chat-3',
      senderId: 'inst-1',
      senderName: 'Московская консерватория',
      content: 'Объявляется набор на новый курс по скрипке',
      timestamp: Date.now() - 7200000,
      type: 'text',
      read: true,
    },
    {
      id: 'msg-7',
      chatId: 'chat-3',
      senderId: 'inst-1',
      senderName: 'Московская консерватория',
      content: 'Регистрация открыта на нашем сайте',
      timestamp: Date.now() - 7200000,
      type: 'text',
      read: false,
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
    type: 'all',
    searchQuery: '',
  },
};

const chatSlice = createSlice({
  name: 'chats',
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
      action: PayloadAction<{ chatId: string; message: Message }>
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
      }>
    ) => {
      const { participantId, participantName, participantAvatar } =
        action.payload;

      // Проверить, существует ли уже такой чат
      const existingChat = state.chats.find(
        (c) =>
          c.type === ChatType.DIRECT &&
          c.participants.includes(participantId) &&
          c.participants.includes('user-current')
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
        participants: ['user-current', participantId],
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
        name: string;
        description?: string;
        participantIds: string[];
      }>
    ) => {
      const { name, description, participantIds } = action.payload;

      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        type: ChatType.GROUP,
        name,
        description,
        participants: ['user-current', ...participantIds],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        admin: 'user-current',
        membersCount: participantIds.length + 1,
        unreadCount: 0,
      };

      state.chats.unshift(newChat);
      state.messages[newChat.id] = [];
      state.currentChatId = newChat.id;
    },

    // Создать чат с учреждением
    createInstitutionChat: (
      state,
      action: PayloadAction<{
        institutionId: string;
        institutionName: string;
        institutionLogo?: string;
        category?: string;
      }>
    ) => {
      const { institutionId, institutionName, institutionLogo, category } =
        action.payload;

      // Проверить, существует ли уже такой чат
      const existingChat = state.chats.find(
        (c) =>
          c.type === ChatType.INSTITUTION &&
          c.institution?.id === institutionId
      );

      if (existingChat) {
        state.currentChatId = existingChat.id;
        return;
      }

      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        type: ChatType.INSTITUTION,
        name: institutionName,
        avatar: institutionLogo,
        participants: ['user-current'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        unreadCount: 0,
        institution: {
          id: institutionId,
          name: institutionName,
          logo: institutionLogo,
          category,
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
        type?: ChatType | 'all';
        searchQuery?: string;
      }>
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

export const {
  selectChat,
  addMessage,
  createDirectChat,
  createGroupChat,
  createInstitutionChat,
  deleteChat,
  setFilter,
  clearError,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;
