// lib/storage/moderation.helpers.ts
import { getPosts, getMessages, getMusicians } from ".";
import { Musician } from "../types";
import { Message } from "../types/chat.types";
import { Post } from "../types/post.types";

export function getPostPreview(postId: string): Post | undefined {
  return getPosts().find((p) => p.id === postId);
}

export function getMessagePreview(messageId: string): Message | undefined {
  const messagesByChat = getMessages(); // Record<string, Message[]>

  // Перебираем все массивы сообщений из всех чатов
  for (const chatMessages of Object.values(messagesByChat)) {
    const found = chatMessages.find((m) => m.id === messageId);
    if (found) return found;
  }

  return undefined;
}

export function getUserPreview(userId: string): Musician | undefined {
  return getMusicians().find((u) => u.id === userId);
}

// Утилита для обрезки текста
export function truncateText(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

// Форматирование даты
export function formatTimestamp(timestamp: string | number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
