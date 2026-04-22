export interface Message {
  id: number;
  chatId: string; // "${chatType}:${chatId}" например "group:1" или "dm:5"
  senderId: number;
  content: string;
  timestamp: string; // ISO
  read: boolean;
  attachments?: { type: "image" | "file"; url: string; name: string }[];
}

export interface Chat {
  id: string; // "${chatType}:${chatId}"
  type: "group" | "dm";
  name?: string; // для групп
  avatar?: string | null;
  participants: number[]; // массив userId
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
