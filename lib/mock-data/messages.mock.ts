import { Message } from "../types/chat.types";

export const messages: Record<string, Message[]> = {
  "group:1": [
    {
      id: 1,
      chatId: "group:1",
      senderId: 1,
      content: "Всем привет! Репетиция в субботу в 19:00, все придут?",
      timestamp: "2024-03-15T12:00:00Z",
      read: true,
    },
    {
      id: 2,
      chatId: "group:1",
      senderId: 2,
      content: "Я буду! 🎤",
      timestamp: "2024-03-15T12:15:00Z",
      read: true,
    },
    {
      id: 3,
      chatId: "group:1",
      senderId: 2,
      content: "Отлично, до встречи в субботу!",
      timestamp: "2024-03-15T14:30:00Z",
      read: true,
    },
  ],
  "dm:1-3": [
    {
      id: 4,
      chatId: "dm:1-3",
      senderId: 1,
      content: "Дмитрий, привет! Есть вопрос по студии",
      timestamp: "2024-03-14T17:30:00Z",
      read: true,
    },
    {
      id: 5,
      chatId: "dm:1-3",
      senderId: 3,
      content: "Привет! Насчёт репетиции...",
      timestamp: "2024-03-14T18:00:00Z",
      read: false,
    },
  ],
};
