// Chat Types
export enum ChatType {
  DIRECT = "direct", // 1-1 чат между пользователями
  GROUP = "group", // Групповой чат
  VENUE = "venue", // Чат с учреждением
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  status?: "online" | "offline" | "away";
}

export interface Venue {
  id: string;
  name: string;
  logo?: string;
  email?: string;
  type?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: number;
  type: "text"; // Для будущего расширения: 'image', 'video', 'audio'
  read?: boolean;
}

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  description?: string;
  avatar?: string;
  participants: string[]; // IDs пользователей
  createdAt: number;
  updatedAt: number;
  lastMessage?: Message;
  unreadCount?: number;

  // Специфичные поля для разных типов
  // Для DIRECT
  participantUser?: User; // Второй участник (для удобства)

  // Для GROUP
  admin?: string; // ID администратора группы
  membersCount?: number;

  // Для Venue
  Venue?: Venue; // Данные учреждения
}

export interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>; // chatId -> messages
  currentChatId: string | null;
  loading: boolean;
  error: string | null;
  filter: {
    type: ChatType | "all";
    searchQuery: string;
  };
}
