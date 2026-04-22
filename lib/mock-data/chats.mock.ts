import { Chat } from "../types/chat.types";

export const chats: Chat[] = [
  {
    id: "group:1",
    type: "group",
    name: "Echoes — общий чат",
    avatar: "band-1.png",
    participants: [1, 2],
    unreadCount: 0,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-03-15T14:30:00Z",
    lastMessage: {
      id: 3,
      chatId: "group:1",
      senderId: 2,
      content: "Отлично, до встречи в субботу!",
      timestamp: "2024-03-15T14:30:00Z",
      read: true,
    },
  },
  {
    id: "dm:1-3",
    type: "dm",
    participants: [1, 3],
    unreadCount: 1,
    createdAt: "2024-02-01T12:00:00Z",
    updatedAt: "2024-03-14T18:00:00Z",
    lastMessage: {
      id: 5,
      chatId: "dm:1-3",
      senderId: 3,
      content: "Привет! Насчёт репетиции...",
      timestamp: "2024-03-14T18:00:00Z",
      read: false,
    },
  },
];
