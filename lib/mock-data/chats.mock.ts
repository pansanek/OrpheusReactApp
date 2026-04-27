import { Chat, ChatType } from "../types/chat.types";

export const chats: Chat[] = [
  {
    id: "group:1",
    type: ChatType.GROUP,
    name: "Echoes — общий чат",
    avatar: "band-1.png",
    participants: ["1", "2"],
    unreadCount: 0,
    createdAt: new Date("2024-01-15T10:00:00Z").getTime(),
    updatedAt: new Date("2024-03-15T14:30:00Z").getTime(),
    lastMessage: {
      id: "3",
      chatId: "group:1",
      senderId: "1",
      content: "Отлично, до встречи в субботу!",
      timestamp: new Date("2024-03-15T14:30:00Z").getTime(),
      read: false,
      type: "direct",
      status: "delivered",
    },
  },
  {
    id: "dm:1-3",
    type: ChatType.DIRECT,
    participants: ["1", "3"],
    unreadCount: 1,
    createdAt: new Date("2024-02-01T12:00:00Z").getTime(),
    updatedAt: new Date("2024-03-14T18:00:00Z").getTime(),
    lastMessage: {
      id: "5",
      chatId: "dm:1-3",
      senderId: "3",
      content: "Привет! Насчёт репетиции...",
      timestamp: new Date("2024-03-14T18:00:00Z").getTime(),
      read: false,
      type: "venue",
      status: "delivered",
    },
  },
];
