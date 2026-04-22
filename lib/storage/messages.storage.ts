import {
  initializeRecordStorage,
  saveRecordToStorage,
  getRecordFromStorage,
} from "./utils";
import { STORAGE_KEYS } from "./keys";

import { messages as mockMessages } from "@/lib/mock-data/messages.mock";
import { Message } from "../types/chat.types";

export function getMessages(): Record<string, Message[]> {
  return initializeRecordStorage("messages", mockMessages);
}

export function saveMessages(messages: Record<string, Message[]>): void {
  saveRecordToStorage("messages", messages);
}

export function getMessagesRaw(): Record<string, Message[]> | null {
  return getRecordFromStorage("messages");
}

export function getMessagesByChatId(chatId: string): Message[] {
  return getMessages()[chatId] ?? [];
}

export function addMessage(chatId: string, message: Message): void {
  const all = getMessages();
  const updated = {
    ...all,
    [chatId]: [...(all[chatId] ?? []), message],
  };
  saveMessages(updated);
}

export function removeMessage(chatId: string, messageId: number): void {
  const all = getMessages();
  const updated = {
    ...all,
    [chatId]: (all[chatId] ?? []).filter((m) => m.id !== messageId),
  };
  saveMessages(updated);
}

export function markMessagesRead(chatId: string, userId: number): void {
  const all = getMessages();
  const updated = {
    ...all,
    [chatId]: (all[chatId] ?? []).map((m) =>
      m.senderId !== userId ? { ...m, read: true } : m,
    ),
  };
  saveMessages(updated);
}

export function clearChatMessages(chatId: string): void {
  const all = getMessages();
  const updated = { ...all, [chatId]: [] };
  saveMessages(updated);
}
