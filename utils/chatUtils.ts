import { Chat, ChatType, Message } from "@/store/types/chat.types";

/**
 * Форматирует название чата в зависимости от типа
 */
export const formatChatName = (chat: Chat): string => {
  switch (chat.type) {
    case ChatType.DIRECT:
      return chat.participantUser?.name || chat.name;
    case ChatType.GROUP:
      return `${chat.name} (${chat.membersCount} участников)`;
    case ChatType.VENUE:
      return `${chat.Venue?.name || chat.name}${chat.Venue?.type ? ` - ${chat.Venue?.type}` : ""}`;
    default:
      return chat.name;
  }
};

/**
 * Определяет иконку чата в зависимости от типа
 */
export const getChatIcon = (chat: Chat): string => {
  switch (chat.type) {
    case ChatType.DIRECT:
      return "👤";
    case ChatType.GROUP:
      return "👥";
    case ChatType.VENUE:
      return "🏛️";
    default:
      return "💬";
  }
};

/**
 * Получает цвет фона для аватара чата
 */
export const getChatAvatarColor = (chatType: ChatType): string => {
  switch (chatType) {
    case ChatType.DIRECT:
      return "from-blue-400 to-cyan-400";
    case ChatType.GROUP:
      return "from-purple-400 to-pink-400";
    case ChatType.VENUE:
      return "from-amber-400 to-orange-400";
    default:
      return "from-gray-400 to-gray-500";
  }
};

/**
 * Форматирует время последнего сообщения
 */
export const formatMessageTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Сейчас";
  if (minutes < 60) return `${minutes}м назад`;
  if (hours < 24) return `${hours}ч назад`;
  if (days < 7) return `${days}д назад`;

  const date = new Date(timestamp);
  return date.toLocaleDateString("ru-RU", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Получает статус "Печатает..."
 */
export const getTypingIndicator = (names: string[]): string => {
  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} печатает...`;
  if (names.length === 2) return `${names[0]} и ${names[1]} печатают...`;
  return `${names.slice(0, -1).join(", ")} и ${names[names.length - 1]} печатают...`;
};

/**
 * Группирует сообщения по датам для отображения разделителей дат
 */
export const groupMessagesByDate = (
  messages: Message[],
): { date: string; messages: Message[] }[] => {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  messages.forEach((msg) => {
    const msgDate = new Date(msg.timestamp).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ date: msgDate, messages: [] });
    }

    groups[groups.length - 1].messages.push(msg);
  });

  return groups;
};

/**
 * Выполняет поиск в сообщениях
 */
export const searchMessages = (
  messages: Message[],
  query: string,
): Message[] => {
  const lowerQuery = query.toLowerCase();
  return messages.filter((msg) =>
    msg.content.toLowerCase().includes(lowerQuery),
  );
};

/**
 * Проверяет, прочитаны ли все сообщения в чате
 */
export const areAllMessagesRead = (messages: Message[]): boolean => {
  return messages.every((msg) => msg.read !== false);
};

/**
 * Считает количество непрочитанных сообщений
 */
export const countUnreadMessages = (messages: Message[]): number => {
  return messages.filter((msg) => msg.read === false).length;
};

/**
 * Получает инициалы для аватара
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Определяет, нужно ли показывать аватар (разные отправители)
 */
export const shouldShowAvatar = (
  messages: Message[],
  index: number,
): boolean => {
  if (index === 0) return true;

  const currentMsg = messages[index];
  const prevMsg = messages[index - 1];

  // Показать если отправитель отличается
  if (currentMsg.senderId !== prevMsg.senderId) return true;

  // Показать если прошло больше 5 минут
  const timeDiff = currentMsg.timestamp - prevMsg.timestamp;
  if (timeDiff > 5 * 60 * 1000) return true;

  return false;
};

/**
 * Определяет, нужно ли показывать имя отправителя (для групповых чатов)
 */
export const shouldShowSenderName = (
  messages: Message[],
  index: number,
  isGroupChat: boolean,
): boolean => {
  if (!isGroupChat || index === 0) return isGroupChat;

  const currentMsg = messages[index];
  const prevMsg = messages[index - 1];

  // Показать если отправитель отличается
  return currentMsg.senderId !== prevMsg.senderId;
};

/**
 * Генерирует уникальный ID для новой сущности
 */
export const generateId = (prefix: string = "id"): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Валидирует содержимое сообщения
 */
export const validateMessage = (
  content: string,
): { valid: boolean; error?: string } => {
  if (!content || !content.trim()) {
    return { valid: false, error: "Сообщение не может быть пустым" };
  }

  if (content.length > 4000) {
    return {
      valid: false,
      error: "Сообщение слишком длинное (максимум 4000 символов)",
    };
  }

  return { valid: true };
};

/**
 * Получает сокращённый текст сообщения для превью
 */
export const getMessagePreview = (
  content: string,
  maxLength: number = 50,
): string => {
  if (content.length <= maxLength) return content;
  return `${content.substring(0, maxLength)}...`;
};
