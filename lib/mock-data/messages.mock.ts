import { Message } from "../types/chat.types";

export const messages: Record<string, Message[]> = {
  "group:1": [
    {
      id: "1",
      chatId: "group:1",
      senderId: "1",
      content: "Всем привет! Репетиция в субботу в 19:00, все придут?",
      timestamp: new Date("2024-03-15T12:00:00Z").getTime(),
      read: true,
      status: "read",
      type: "direct",
    },
    {
      id: "2",
      chatId: "group:1",
      senderId: "2",
      content: "Я буду! 🎤",
      timestamp: new Date("2024-03-15T12:15:00Z").getTime(),
      read: true,
      status: "read",
      type: "direct",
    },
    {
      id: "3",
      chatId: "group:1",
      senderId: "1",
      content: "Отлично, до встречи в субботу!",
      timestamp: new Date("2024-03-15T14:30:00Z").getTime(),
      read: false,
      type: "direct",
      status: "delivered",
    },
  ],
  "dm:1-3": [
    {
      id: "4",
      chatId: "dm:1-3",
      senderId: "1",
      content: "Дмитрий, привет! Есть вопрос по студии",
      timestamp: new Date("2024-03-14T17:30:00Z").getTime(),
      read: true,
      status: "read",
      type: "venue",
    },
    {
      id: "5",
      chatId: "dm:1-3",
      senderId: "3",
      content: "Привет! Насчёт репетиции...",
      timestamp: new Date("2024-03-14T18:00:00Z").getTime(),
      read: false,
      type: "venue",
      status: "delivered",
    },
  ],
};
