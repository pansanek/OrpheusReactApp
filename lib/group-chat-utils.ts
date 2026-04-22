import { AppDispatch } from "@/store/store";
import {
  addMessage,
  createGroupChat,
  addParticipantToChat,
} from "@/store/slices/chatSlice";
import { ChatType, Message } from "@/store/types/chat.types";
import { normalizeImagePath } from "@/lib/utils";
import { getInitials } from "@/utils/chatUtils";
import { useAuth } from "../contexts/auth-context";
import { Group } from "./types";

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
    senderName: "Система",
    content: `Группа "${group.name}" создана. Добро пожаловать в чат проекта!`,
    type: "system",
    timestamp: Date.now(),
    status: "sent",
    senderAvatar: null,
  };
  dispatch(addMessage({ chatId, message: creationMsg }));
}

/**
 * Добавляет нового участника в чат группы и отправляет уведомление
 */
export function addMemberToGroupChat(
  groupId: number,
  userId: number,
  userName: string,
  dispatch: AppDispatch,
) {
  const chatId = `group-${groupId}`;

  // 1. Добавляем участника в чат (если ещё не добавлен)
  dispatch(addParticipantToChat({ chatId, userId }));

  // 2. Системное сообщение о вступлении
  const joinMsg: Message = {
    id: `msg-sys-${Date.now()}`,
    chatId,
    senderId: "system",
    senderName: "Система",
    content: `${userName} присоединился к группе`,
    type: "system",
    timestamp: Date.now(),
    status: "sent",
    senderAvatar: null,
  };
  dispatch(addMessage({ chatId, message: joinMsg }));
}
