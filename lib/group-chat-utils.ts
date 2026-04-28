import { AppDispatch } from "@/store/store";
import {
  addMessage,
  createGroupChat,
  addParticipantToChat,
} from "@/store/slices/chatSlice";

// import { normalizeImagePath } from "@/lib/utils/utils";
import { getInitials } from "@/utils/chatUtils";
// import { useAuth } from "../contexts/auth-context";
import { Group } from "./types";
import { Message } from "./types/chat.types";

/**
 * Создаёт групповой чат при создании группы
 */
export function initGroupChat(
  group: Group,
  dispatch: AppDispatch,
  currentUserId: string,
) {
  const chatId = `group-${group.id}`;
  const membersIds = group.members.map((memberId) => memberId.toString());
  // 1. Создаём или обновляем чат
  dispatch(
    createGroupChat({
      id: chatId,
      name: group.name,
      avatar: group.avatar || getInitials(group.name),
      participantIds: membersIds,
      currentUserId: currentUserId || "",
      groupId: group.id.toString(),
    }),
  );

  // 2. Системное сообщение о создании
  const creationMsg: Message = {
    id: `msg-sys-${Date.now()}`,
    chatId,
    senderId: "system",
    content: `Группа "${group.name}" создана. Добро пожаловать в чат проекта!`,
    type: "system",
    timestamp: Date.now(),
    status: "sent",
    read: false,
  };
  dispatch(addMessage({ chatId, message: creationMsg }));
}

/**
 * Добавляет нового участника в чат группы и отправляет уведомление
 */
export function addMemberToGroupChat(
  groupId: string,
  userId: string,
  userName: string,
  chatId: string,
  dispatch: AppDispatch,
) {
  // 1. Добавляем участника в чат (если ещё не добавлен)
  dispatch(addParticipantToChat({ chatId, userId }));
  console.log("chatID", chatId);
  // 2. Системное сообщение о вступлении
  const joinMsg: Message = {
    id: `msg-sys-${Date.now()}`,
    chatId,
    senderId: "system",
    content: `${userName} присоединился к группе`,
    type: "system",
    timestamp: Date.now(),
    status: "sent",
    read: false,
  };
  dispatch(addMessage({ chatId, message: joinMsg }));
}
