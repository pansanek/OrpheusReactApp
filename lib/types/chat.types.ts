import { Musician } from "./user.types";
import { Venue } from "./venue.types";

export enum ChatType {
  DIRECT = "direct", // 1-1 чат между пользователями
  GROUP = "group", // Групповой чат
  VENUE = "venue", // Чат с учреждением
}

export interface Message {
  id: string;
  chatId: string; // "${chatType}:${chatId}" например "group:1" или "dm:5"
  senderId: string;
  content: string;
  timestamp: number; // ISO
  status: "pending" | "sent" | "delivered" | "read" | "error";
  read: boolean;
  type: string;
  attachments?: { type: "image" | "file"; url: string; name: string }[];
}

export interface Chat {
  id: string; // "${chatType}:${chatId}"
  type: ChatType;
  name?: string; // для групп
  avatar?: string | null;
  participants: string[]; // массив userId
  lastMessage?: Message;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;

  // Для GROUP
  admin?: string; // ID администратора группы
  membersCount?: number;
  groupId?: string;
  // Для Venue
  venue?: string;
}

export interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>; // chatId -> messages
  currentChatId: string | null;
  loading: boolean;
  currentUser?: {
    id: string;
    venueAdminOf?: string[]; // ID учреждений, где пользователь — админ
  };
  musicians?: Musician[]; // lookup по userId
  venues?: Venue[];
  error: string | null;
  filter: {
    type: ChatType | "all";
    searchQuery: string;
  };
}

export interface ChatDisplayData {
  displayName: string; // Имя для показа в списке
  displayAvatar: string | null; // URL аватара для показа
  displayIcon?: React.ReactNode; // Иконка для GROUP/VENUE (опционально)

  // Дополнительные данные для логики компонента
  participantUser?: Musician; // Собеседник в DIRECT-чате
  isOnline?: boolean; // Статус онлайн (для DIRECT)
  venueInfo?: Venue; // Данные учреждения (для VENUE)
  membersCount?: number; // Количество участников (для GROUP)
}

// Объединённый тип: базовый Chat + вычисляемые поля
export type ChatWithDisplay = Chat & ChatDisplayData;
