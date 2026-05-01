import { initializeStorage, saveToStorage, getFromStorage } from "./utils";
import { STORAGE_KEYS } from "./keys";
import { chats as mockChats } from "@/lib/mock-data/chats.mock";
import { Chat } from "../types/chat.types";

export function getChats(): Chat[] {
  return initializeStorage("chats", mockChats);
}

export function saveChats(chats: Chat[]): void {
  saveToStorage("chats", chats);
}

export function getChatsRaw(): Chat[] | null {
  return getFromStorage("chats");
}

export function getChatById(id: string): Chat | undefined {
  return getChats().find((c) => c.id === id);
}

export function getChatsByUserId(userId: string): Chat[] {
  return getChats().filter((c) => c.participants.includes(userId));
}

export function getChatByGroupId(groupId: string): Chat | undefined {
  console.log("getChatByGroupId", groupId);
  return getChats().find((c) => c.groupId === groupId);
}

export function addChat(chat: Chat): void {
  const chats = getChats();
  saveChats([...chats, chat]);
}

export function removeChat(id: string): void {
  const chats = getChats();
  saveChats(chats.filter((c) => c.id !== id));
}
